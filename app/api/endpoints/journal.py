# app/api/endpoints/journal.py
from fastapi import APIRouter, HTTPException, Depends, status, Request
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
from datetime import datetime, timedelta
from bson import ObjectId
from app.schemas.journal import (
    JournalEntryCreate,
    JournalEntryResponse,
    JournalEntryUpdate,
    ReflectionAnswer,
    JournalEntry
)
from app.utils.auth import get_current_user, verify_token
from app.db import Database
import logging
from app.schemas.journal import MoodTrackerResponse

logger = logging.getLogger(__name__)

router = APIRouter()

# Note: This class is defined here for backward compatibility.
# If you already have JournalEntryCreate in your schemas, ensure you use the same structure.
class JournalEntryCreate(BaseModel):
    content: str
    mood: Optional[dict] = None  # Ensure mood is optional and accepts a dictionary
    is_draft: bool

@router.post("/", response_model=JournalEntryResponse, status_code=status.HTTP_201_CREATED)
async def create_journal_entry(
    entry: JournalEntryCreate,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Create a new journal entry or update an existing draft.
    """
    logger.info(f"Received payload: {entry.dict()}")
    user_id = current_user["_id"]

    # Ensure mood is properly structured
    mood = entry.mood or {"emoji": "😐", "label": "Neutral", "value": "neutral"}

    journal_collection = Database.get_collection("journal_entries")

    # Create a new journal entry
    journal_entry = {
        "user_id": user_id,
        "content": entry.content,
        "mood": mood,
        "tags": [],
        "created_at": datetime.utcnow(),
        "updated_at": None,
        "is_draft": entry.is_draft,
        "ai_response": None,
    }
    result = await journal_collection.insert_one(journal_entry)
    journal_entry["id"] = str(result.inserted_id)
    return journal_entry

@router.get("/journal/", response_model=List[JournalEntryResponse])
async def get_user_journal_entries(
    date: Optional[str] = None,
    is_draft: Optional[bool] = None,
    skip: int = 0,
    limit: int = 10,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Get all journal entries for the authenticated user.
    
    Args:
        date: Filter entries by date
        is_draft: Filter entries by draft status
        skip: Number of entries to skip (pagination)
        limit: Maximum number of entries to return
        current_user: Current authenticated user
        
    Returns:
        List of journal entries
    """
    query = {"user_id": current_user["_id"]}
    if date:
        query["created_at"] = {
            "$gte": datetime.strptime(date, "%Y-%m-%d"),
            "$lt": datetime.strptime(date, "%Y-%m-%d") + timedelta(days=1),
        }
    if is_draft is not None:
        query["is_draft"] = is_draft

    journal_collection = Database.get_collection("journal_entries")
    entries = await journal_collection.find(query).sort("created_at", -1).skip(skip).limit(limit).to_list(100)
    
    # Convert _id to string for each entry
    for entry in entries:
        entry["id"] = str(entry.pop("_id"))
    
    return entries

@router.get("/", response_model=List[JournalEntryResponse])
async def get_user_journal_entries(
    is_draft: Optional[bool] = None,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Get journal entries for the authenticated user.
    """
    query = {"user_id": current_user["_id"]}
    if is_draft is not None:
        query["is_draft"] = is_draft

    entries = await Database.get_collection("journal_entries").find(query).to_list(100)
    for entry in entries:
        entry["id"] = str(entry.pop("_id"))  # Convert ObjectId to string
    return entries

@router.get("/mood-tracker/", response_model=List[MoodTrackerResponse])
async def get_mood_tracker_data(current_user: Dict[str, Any] = Depends(get_current_user)):
    """
    Get mood tracker data for the authenticated user.
    """
    pipeline = [
        {"$match": {"user_id": current_user["_id"]}},
        {"$group": {
            "_id": {"$dateToString": {"format": "%Y-%m-%d", "date": "$created_at"}},
            "mood": {"$first": "$mood"}
        }},
        {"$sort": {"_id": 1}},
        {"$project": {  # Rename _id to date
            "date": "$_id",
            "mood": 1,
            "_id": 0
        }}
    ]
    mood_data = await Database.get_collection("journal_entries").aggregate(pipeline).to_list(100)
    return mood_data


@router.get("/{entry_id}", response_model=JournalEntryResponse)
async def get_user_journal_entries(
    entry_id: str,
    is_draft: Optional[bool] = None,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Get a specific journal entry by ID.
    """
    try:
        object_id = ObjectId(entry_id)
    except Exception as e:
        logger.error(f"Invalid entry_id: {entry_id}, error: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid journal entry ID"
        )

    journal_collection = Database.get_collection("journal_entries")
    
    # Get entry
    entry = await journal_collection.find_one({"_id": object_id})
    
    if not entry:
        logger.error("Entry with _id %s not found.", object_id)
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Journal entry not found"
        )
    
    # Check if user owns this entry
    if entry["user_id"] != current_user["_id"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this journal entry"
        )
    
    entry["id"] = str(entry.pop("_id"))  # Convert _id to string
    return entry

@router.put("/{entry_id}", response_model=JournalEntryResponse)
async def update_journal_entry(
    entry_id: str,
    entry_update: JournalEntryUpdate,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Update a journal entry.
    
    Args:
        entry_id: Journal entry ID
        entry_update: Updated journal entry data
        current_user: Current authenticated user
        
    Returns:
        The updated journal entry
        
    Raises:
        HTTPException: If entry not found or not owned by user
    """
    try:
        object_id = ObjectId(entry_id)
    except Exception as e:
        logger.error(f"Invalid entry_id: {entry_id}, error: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid journal entry ID"
        )

    journal_collection = Database.get_collection("journal_entries")
    
    # Check if entry exists and is owned by user
    entry = await journal_collection.find_one({"_id": object_id})
    
    if not entry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Journal entry not found"
        )
    
    if entry["user_id"] != current_user["_id"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this journal entry"
        )
    
    # Prepare update data
    update_data = {k: v for k, v in entry_update.dict(exclude_unset=True).items() if v is not None}
    
    if update_data:
        update_data["updated_at"] = datetime.utcnow()
        
        # Convert mood to dict if it exists (if it's a Pydantic model)
        if "mood" in update_data and hasattr(update_data["mood"], "dict"):
            update_data["mood"] = update_data["mood"].dict()
        
        # Update entry
        await journal_collection.update_one(
            {"_id": object_id},
            {"$set": update_data}
        )
    
    # Get updated entry
    updated_entry = await journal_collection.find_one({"_id": object_id})
    updated_entry["id"] = str(updated_entry.pop("_id"))
    
    return updated_entry

@router.delete("/{entry_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_journal_entry(
    entry_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    logger.info(f"Attempting to delete entry with ID: {entry_id} for user: {current_user['_id']}")

    try:
        object_id = ObjectId(entry_id)
    except Exception as e:
        logger.error(f"Invalid entry_id: {entry_id}, error: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid journal entry ID"
        )

    logger.info(f"Querying for entry with ID: {object_id} and user_id: {str(current_user['_id'])}")

    journal_collection = Database.get_collection("journal_entries")
    entry = await journal_collection.find_one({"_id": object_id, "user_id": str(current_user["_id"])})
    if not entry:
        logger.error(f"Entry not found for ID: {object_id} and user_id: {current_user['_id']}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Journal entry not found"
        )

    result = await journal_collection.delete_one({"_id": object_id})
    if result.deleted_count == 0:
        logger.error(f"Failed to delete entry with ID: {object_id}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete journal entry"
        )

    logger.info(f"Successfully deleted entry with ID: {object_id}")

@router.post("/reflection/")
async def save_reflection_answers(answers: List[ReflectionAnswer], current_user: dict = Depends(get_current_user)):
    for answer in answers:
        await Database.get_collection("reflection_answers").update_one(
            {"user_id": current_user["_id"], "question": answer.question},
            {"$set": {"answer": answer.answer, "updated_at": datetime.utcnow()}},
            upsert=True,
        )
    return {"message": "Reflection answers saved"}

@router.post("/reflection-answers", status_code=status.HTTP_200_OK)
async def save_reflection_answers(
    answers: List[ReflectionAnswer],
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Save reflection answers for the authenticated user.
    """
    reflection_collection = Database.get_collection("reflection_answers")
    for answer in answers:
        await reflection_collection.update_one(
            {"user_id": current_user["_id"], "question": answer.question},
            {"$set": {"answer": answer.answer, "updated_at": datetime.utcnow()}},
            upsert=True,
        )
    return {"message": "Reflection answers saved successfully"}

@router.post("/analyze-journal/")
async def analyze_journal(entry: JournalEntry, current_user: dict = Depends(get_current_user)):
    # Example: Use an AI model to analyze the journal entry
    # Replace this with your actual AI model logic
    analysis = {
        "sentiment": "positive",
        "emotions": ["happiness", "gratitude"],
        "suggestions": "Keep focusing on the positive aspects of your day."
    }
    return {"analysis": analysis}

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
import jwt

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

SECRET_KEY = "your_jwt_secret_key"
ALGORITHM = "HS256"
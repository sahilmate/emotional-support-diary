from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import OAuth2PasswordRequestForm
from datetime import timedelta, datetime
from bson import ObjectId
from app.schemas.user import UserCreate, UserResponse, Token, UserLogin
from app.utils.auth import (
    get_password_hash,
    verify_password,
    create_access_token,
    get_current_user,
    ACCESS_TOKEN_EXPIRE_MINUTES,
)
from app.db import Database
from typing import Dict, Any

router = APIRouter()

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register_user(user_data: UserCreate):
    """
    Register a new user.
    """
    users_collection = Database.get_collection("users")

    # Check if email or username already exists
    if await users_collection.find_one({"email": user_data.email}):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )
    if await users_collection.find_one({"username": user_data.username}):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already taken",
        )

    # Hash the password and create the user
    hashed_password = get_password_hash(user_data.password)
    user_dict = {
        "_id": str(ObjectId()),
        "email": user_data.email,
        "username": user_data.username,
        "hashed_password": hashed_password,
        "created_at": datetime.utcnow(),
    }
    await users_collection.insert_one(user_dict)

    # Prepare the response
    user_dict["id"] = user_dict.pop("_id")
    user_dict.pop("hashed_password")
    return user_dict


@router.post("/login", response_model=Token)
async def login_user(form_data: OAuth2PasswordRequestForm = Depends()):
    """
    Authenticate a user and return a JWT token.
    """
    users_collection = Database.get_collection("users")

    # Find user by email
    user = await users_collection.find_one({"email": form_data.username})
    if not user or not verify_password(form_data.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user["_id"], "email": user["email"]},
        expires_delta=access_token_expires,
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/login/email", response_model=Token)
async def login_with_email(user_data: UserLogin):
    """
    Alternative login endpoint that accepts JSON with email and password.
    
    Args:
        user_data: Login data with email and password
        
    Returns:
        JWT access token
        
    Raises:
        HTTPException: If authentication fails
    """
    users_collection = Database.get_collection("users")
    
    # Find user by email
    user = await users_collection.find_one({"email": user_data.email})
    
    if not user or not verify_password(user_data.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user["_id"], "email": user["email"]},
        expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}
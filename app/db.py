from motor.motor_asyncio import AsyncIOMotorClient
from pymongo.errors import ConnectionFailure
from fastapi import HTTPException
import logging
import os
from typing import Optional
# Removed SONManipulator import as it is no longer available in recent PyMongo versions
from bson import ObjectId
from pydantic import BaseModel, Field
from app.core.config import settings


logger = logging.getLogger(__name__)

client = AsyncIOMotorClient(settings.MONGODB_URL)
db = client["emotional_support_db"]
journal_collection = db["journal_entries"]

class Database:
    client: Optional[AsyncIOMotorClient] = None
    db_name: str = "emotional_diary"
    mongo_url: str = os.getenv("MONGO_URL", "mongodb://localhost:27017")  # Default to localhost if not set

    @classmethod
    async def connect(cls):
        """Connect to MongoDB."""
        try:
            cls.client = AsyncIOMotorClient(cls.mongo_url)
            print("Connected to MongoDB")
        except ConnectionFailure as e:
            print(f"Failed to connect to MongoDB: {e}")

    @staticmethod
    async def disconnect():
        """Disconnect from MongoDB."""
        if Database.client:
            Database.client.close()
            print("Disconnected from MongoDB")

    @classmethod
    def get_db(cls):
        """Get database instance."""
        if not cls.client:
            raise HTTPException(status_code=500, detail="Database not initialized")
        return cls.client[cls.db_name]

    @staticmethod
    def get_collection(collection_name: str):
        """Get a MongoDB collection."""
        db_name = os.getenv("MONGO_DB_NAME", "emotional_support_db")
        return Database.client[db_name][collection_name]
    
    # Removed ID conversion hook as SONManipulator is no longer supported

class PyObjectId(ObjectId):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid objectid")
        return ObjectId(v)

    @classmethod
    def __modify_schema__(cls, field_schema):
        field_schema.update(type="string")
        
class MongoModel(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id")

    class Config:
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}            

# Removed _ObjectIdEncoder class as SONManipulator is no longer supported
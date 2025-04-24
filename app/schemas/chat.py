from pydantic import BaseModel
from typing import Dict

from dotenv import load_dotenv
import os

# Load environment variables from .env file
load_dotenv()

# Access the GitHub token
GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")
if not GITHUB_TOKEN:
    raise ValueError("GITHUB_TOKEN environment variable is not set.")

class EmotionResponse(BaseModel):
    """Response schema for emotion detection with confidence scores."""
    emotions: Dict[str, float]

class PrimaryEmotionResponse(BaseModel):
    """Response schema for primary emotion detection."""
    emotion: str
    confidence: float 
    
class ChatEntry(BaseModel):
    text: str

class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    response: str
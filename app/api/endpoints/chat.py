from fastapi import APIRouter, HTTPException
import logging
import os
from azure.ai.inference import ChatCompletionsClient
from azure.core.credentials import AzureKeyCredential
from azure.ai.inference.models import SystemMessage, UserMessage, AssistantMessage
from app.schemas.chat import ChatEntry
from pydantic import BaseModel
from fastapi.responses import StreamingResponse

# Configure logger
logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

router = APIRouter()

# Set up environment variables for authentication
GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")
if not GITHUB_TOKEN:
    raise ValueError("GITHUB_TOKEN environment variable is not set.")

# Azure AI Inference endpoint and model name
ENDPOINT = "https://models.inference.ai.azure.com"
MODEL_NAME = "Meta-Llama-3.1-8B-Instruct"

# Initialize the Azure AI Inference client
client = ChatCompletionsClient(
    endpoint=ENDPOINT,
    credential=AzureKeyCredential(GITHUB_TOKEN),
)

conversation_history = []  # Store conversation history in memory

async def generate_response(messages: list, stream: bool = False):
    """Generate a response using the Meta-Llama-3.1-8B-Instruct model."""
    try:
        if (stream):
            # Stream the response
            response = client.complete(
                stream=True,
                messages=messages,
                model_extras={'stream_options': {'include_usage': True}},
                model=MODEL_NAME,
            )
            streamed_response = ""
            usage = {}
            for update in response:
                if update.choices and update.choices[0].delta:
                    streamed_response += update.choices[0].delta.content or ""
                if update.usage:
                    usage = update.usage
            return streamed_response, usage
        else:
            # Non-streaming response
            response = client.complete(messages=messages, model=MODEL_NAME)
            return response.choices[0].message.content, None
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating response: {str(e)}")

@router.post("/chat/detect")
async def detect_emotions(entry: ChatEntry):
    """Detect emotions in a chat entry."""
    try:
        # Placeholder for emotion detection logic
        # Replace this with actual implementation if needed
        emotions = {"neutral": 1.0}  # Default response
        return {"emotions": emotions}
    except Exception as e:
        logger.error(f"Error in emotion detection endpoint: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/chat/detect/primary")
async def detect_primary_emotion(entry: ChatEntry):
    """Detect the primary emotion in a chat entry."""
    try:
        # Placeholder for primary emotion detection logic
        # Replace this with actual implementation if needed
        emotion = "neutral"
        confidence = 1.0
        return {"emotion": emotion, "confidence": confidence}
    except Exception as e:
        logger.error(f"Error in primary emotion detection endpoint: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/chat/respond")
async def respond_to_chat(entry: ChatEntry):
    """Generate a response to a chat entry."""
    try:
        # Placeholder for response generation logic
        # Replace this with actual implementation if needed
        response = f"Your message was: {entry.text}"
        return {"response": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error in /chat/respond endpoint: {str(e)}")

class ChatRequest(BaseModel):
    message: str

@router.post("")
async def chat_with_ai(request: ChatRequest):
    """Handle chat requests and generate AI responses."""
    try:
        # Extract the message from the request body
        message = request.message

        # Add user message to conversation history
        conversation_history.append(UserMessage(message))

        # Add system prompt if it's the first message
        if len(conversation_history) == 1:
            conversation_history.insert(0, SystemMessage("You are a helpful assistant."))

        # Generate response
        response, usage = await generate_response(conversation_history, stream=True)

        # Add AI response to conversation history
        conversation_history.append(AssistantMessage(response))

        return {"response": response, "usage": usage}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error in /chat endpoint: {str(e)}")

@router.post("/sentiment/")
async def analyze_message_sentiment(message: str):
    """Analyze the sentiment of a message."""
    try:
        # Placeholder for sentiment analysis logic
        # Replace this with actual implementation if needed
        sentiment = "neutral"  # Default sentiment
        return {"sentiment": sentiment}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
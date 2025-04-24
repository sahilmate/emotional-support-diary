from fastapi import APIRouter, HTTPException
from fastapi.staticfiles import StaticFiles
from TTS.api import TTS
from app.main import app  # Import the app instance

router = APIRouter()

# Load VITS model
tts = TTS(model_name="tts_models/en/ljspeech/vits", progress_bar=False, gpu=False)

# Mount static files
app.mount("/static", StaticFiles(directory="static"), name="static")

@router.post("/voice/")
async def generate_speech(message: str):
    try:
        output_path = "output.wav"
        tts.tts_to_file(text=message, file_path=output_path)
        return {"audio_file": f"http://127.0.0.1:8000/static/{output_path}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
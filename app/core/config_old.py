from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    OPENAI_API_KEY: str
    ELEVENLABS_API_KEY: str
    MONGODB_URL: str
    JWT_SECRET_KEY: str
    
    class Config:
        env_file = ".env"

settings = Settings() 
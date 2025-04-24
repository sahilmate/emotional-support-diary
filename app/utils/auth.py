from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status, Security
from fastapi.security import OAuth2PasswordBearer, HTTPBearer
from app.db import Database
import os
import logging

# Configure password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# OAuth2 scheme for token extraction
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")
security = HTTPBearer()

# JWT settings
SECRET_KEY = os.getenv("JWT_SECRET_KEY", "your-secret-key-for-development-only")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Configure logger
logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against a hash."""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """Hash a password for storing."""
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create a new JWT token."""
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def verify_token(token: str) -> dict:
    """Verify and decode a JWT token."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
        )

async def get_current_user(token: str = Security(security)):
    """Get the current user from the JWT token."""
    try:
        payload = jwt.decode(token.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            logger.error("Token is missing 'sub' field.")
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
        
        # Fetch user from the database
        user = await Database.get_collection("users").find_one({"_id": user_id})
        if user is None:
            logger.error(f"User not found for ID: {user_id}")
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
        
        logger.info(f"Authenticated user ID: {user_id}")
        return user
    except JWTError as e:
        logger.error(f"JWT error: {e}")
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

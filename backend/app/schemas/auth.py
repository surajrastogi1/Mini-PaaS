from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

# --- Request Schemas ---

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

# --- Response Schemas ---

class UserResponse(BaseModel):
    id: str
    email: EmailStr
    name: Optional[str] = None
    avatar_url: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True  # Allows SQLAlchemy model objects to be converted to JSON

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class TokenData(BaseModel):
    user_id: Optional[str] = None
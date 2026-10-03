from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.models.user import User
from app.schemas.auth import UserCreate, UserLogin, UserResponse, Token
from app.core.security import hash_password, verify_password, create_access_token
from app.api.deps import get_current_user
from app.db.models.user import User
from app.db.models.oauth import OAuthAccount  # <--- ADD THIS
from app.db.models.application import Application  # <--- ADD THIS

router = APIRouter(prefix="/auth", tags=["Authentication"])

# 1. Registration Route
@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register_user(user_in: UserCreate, db: Session = Depends(get_db)):
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == user_in.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email already exists"
        )
    
    # Hash password & create user
    hashed_pwd = hash_password(user_in.password)
    new_user = User(
        email=user_in.email,
        password_hash=hashed_pwd,
        name=user_in.name
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user


# 2. Login Route
@router.post("/login", response_model=Token)
def login_user(
    form_data: OAuth2PasswordRequestForm = Depends(), 
    db: Session = Depends(get_db)
):
    # OAuth2 form sends 'username', which holds the user's email
    user = db.query(User).filter(User.email == form_data.username).first()
    
    if not user or not user.password_hash or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )
    
    access_token = create_access_token(subject=user.id)
    return {"access_token": access_token, "token_type": "bearer"}


# 3. Protected Me Route
@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    """Returns details of the currently authenticated user."""
    return current_user
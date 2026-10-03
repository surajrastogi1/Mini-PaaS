from datetime import datetime, timedelta, timezone
from typing import Any, Union
from jose import jwt
from passlib.context import CryptContext
from app.core.config import settings 

# Setup Passlib context with Bcrypt
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# ----------------------------------------
# Password Hashing & Verification
# ----------------------------------------

def hash_password(password: str) -> str:
    """Hashes a plain text password using bcrypt."""
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifies a plain text password against its hash."""
    return pwd_context.verify(plain_password, hashed_password)


# ----------------------------------------
# JWT Token Generation
# ----------------------------------------

def create_access_token(
    subject: Union[str, Any], expires_delta: timedelta | None = None
) -> str:
    """Creates a signed JWT access token containing the user's ID/email as the subject."""
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(
            minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
        )

    to_encode = {
        "exp": expire,
        "sub": str(subject), # Subject is typically user.id
    }

    encoded_jwt = jwt.encode(
        to_encode, 
        settings.SECRET_KEY, 
        algorithm=settings.ALGORITHM
    )
    
    return encoded_jwt
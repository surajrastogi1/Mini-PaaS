from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.core.config import settings
from app.db.database import get_db
from app.services.oauth import OAuthService
from app.services.auth import process_oauth_login
from app.core.security import create_access_token

router = APIRouter(prefix="/auth", tags=["OAuth Authentication"])

class OAuthCode(BaseModel):
    code: str


@router.get("/providers")
def get_oauth_providers():
    return {
        "google": {
            "enabled": bool(settings.GOOGLE_CLIENT_ID and settings.GOOGLE_CLIENT_SECRET and settings.OAUTH_REDIRECT_URI_GOOGLE),
            "client_id": settings.GOOGLE_CLIENT_ID or None,
            "redirect_uri": settings.OAUTH_REDIRECT_URI_GOOGLE or None,
        },
        "github": {
            "enabled": bool(settings.GITHUB_CLIENT_ID and settings.GITHUB_CLIENT_SECRET and settings.OAUTH_REDIRECT_URI_GITHUB),
            "client_id": settings.GITHUB_CLIENT_ID or None,
            "redirect_uri": settings.OAUTH_REDIRECT_URI_GITHUB or None,
        },
    }


@router.post("/{provider}/callback")
async def oauth_callback(provider: str, payload: OAuthCode, db: Session = Depends(get_db)):
    code = payload.code
    if provider == "google":
        user_info = await OAuthService.get_google_user(code)
    elif provider == "github":
        user_info = await OAuthService.get_github_user(code)
    else:
        raise HTTPException(status_code=400, detail="Unsupported provider")

    # Find or create user & link account
    user = process_oauth_login(db, provider=provider, user_info=user_info)

    # Return local JWT
    access_token = create_access_token(subject=str(user.id))
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "name": user.name,
            "avatar_url": user.avatar_url,
        },
    }
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.db.models.user import User
from app.db.models.oauth import OAuthAccount

def process_oauth_login(db: Session, provider: str, user_info: dict) -> User:
    """
    Handles OAuth login/registration logic:
    1. Checks if provider + provider_user_id exists in oauth_accounts.
    2. If not found, checks if a User with the given email exists:
       - If user exists -> links the new OAuth provider to that existing user.
       - If user does not exist -> creates a new User and links the OAuth account.
    """
    provider_user_id = user_info.get("provider_user_id")
    email = user_info.get("email")
    name = user_info.get("name")
    avatar_url = user_info.get("avatar_url")

    if not provider_user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Could not retrieve user ID from {provider}"
        )

    # 1. Check if OAuth link already exists
    oauth_account = (
        db.query(OAuthAccount)
        .filter(
            OAuthAccount.provider == provider,
            OAuthAccount.provider_user_id == provider_user_id
        )
        .first()
    )

    if oauth_account:
        # OAuth account exists -> Return the linked user
        return oauth_account.user

    # 2. Check if user with matching email already exists
    if not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Email account required from {provider} to complete sign-in."
        )

    user = db.query(User).filter(User.email == email).first()

    if not user:
        # User doesn't exist -> Create new User
        user = User(
            email=email,
            name=name,
            avatar_url=avatar_url,
            # Set password_hash=None or empty string for OAuth-only users
            password_hash=None
        )
        db.add(user)
        db.flush()  # Flush to get the generated user.id

    # 3. Link the OAuth provider to the User
    new_oauth_account = OAuthAccount(
        user_id=user.id,
        provider=provider,
        provider_user_id=provider_user_id
    )
    db.add(new_oauth_account)

    # Update avatar or name if missing on existing user
    if not user.avatar_url and avatar_url:
        user.avatar_url = avatar_url
    if not user.name and name:
        user.name = name

    db.commit()
    db.refresh(user)

    return user
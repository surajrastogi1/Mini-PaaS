import httpx
from fastapi import HTTPException
from app.core.config import settings

class OAuthService:
    @staticmethod
    async def get_google_user(code: str):
        # 1. Exchange code for access token
        try:
            async with httpx.AsyncClient(timeout=15) as client:
                token_response = await client.post(
                    "https://oauth2.googleapis.com/token",
                    data={
                        "client_id": settings.GOOGLE_CLIENT_ID,
                        "client_secret": settings.GOOGLE_CLIENT_SECRET,
                        "code": code,
                        "grant_type": "authorization_code",
                        "redirect_uri": settings.OAUTH_REDIRECT_URI_GOOGLE,
                    },
                )
                token_response.raise_for_status()
                access_token = token_response.json().get("access_token")
                if not access_token:
                    raise HTTPException(status_code=502, detail="Google did not return an access token.")

                user_response = await client.get(
                    "https://www.googleapis.com/oauth2/v2/userinfo",
                    headers={"Authorization": f"Bearer {access_token}"},
                )
                user_response.raise_for_status()
                data = user_response.json()
                return {
                    "provider_user_id": str(data["id"]),
                    "email": data["email"],
                    "name": data.get("name"),
                    "avatar_url": data.get("picture"),
                }
        except httpx.HTTPError as error:
            raise HTTPException(status_code=502, detail="Google OAuth exchange failed.") from error

    @staticmethod
    async def get_github_user(code: str):
        try:
            async with httpx.AsyncClient(timeout=15) as client:
                token_response = await client.post(
                    "https://github.com/login/oauth/access_token",
                    headers={"Accept": "application/json"},
                    data={
                        "client_id": settings.GITHUB_CLIENT_ID,
                        "client_secret": settings.GITHUB_CLIENT_SECRET,
                        "code": code,
                        "redirect_uri": settings.OAUTH_REDIRECT_URI_GITHUB,
                    },
                )
                token_response.raise_for_status()
                access_token = token_response.json().get("access_token")
                if not access_token:
                    raise HTTPException(status_code=502, detail="GitHub did not return an access token.")

                user_response = await client.get(
                    "https://api.github.com/user",
                    headers={"Authorization": f"Bearer {access_token}"},
                )
                user_response.raise_for_status()
                data = user_response.json()

                email = data.get("email")
                if not email:
                    emails_res = await client.get(
                        "https://api.github.com/user/emails",
                        headers={"Authorization": f"Bearer {access_token}"},
                    )
                    emails_res.raise_for_status()
                    emails = emails_res.json()
                    primary_email = next((item for item in emails if item.get("primary") and item.get("verified")), None)
                    email = primary_email["email"] if primary_email else None

                return {
                    "provider_user_id": str(data["id"]),
                    "email": email,
                    "name": data.get("name") or data.get("login"),
                    "avatar_url": data.get("avatar_url"),
                }
        except httpx.HTTPError as error:
            raise HTTPException(status_code=502, detail="GitHub OAuth exchange failed.") from error
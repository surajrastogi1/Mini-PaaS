from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import app.db.models
from app.core.config import settings
from app.api.routes import auth
from app.api.routes.oauth import router as oauth_router
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title = "DevPulse API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(oauth_router)


@app.get("/")
def read_root():
    return {"message": "API is running.."}


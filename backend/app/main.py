from fastapi import FastAPI
import app.db.models
from app.api.routes import auth


app = FastAPI(title = "DevPulse API")

app.include_router(auth.router)

@app.get("/")
def read_root():
    return {"message": "API is running.."}


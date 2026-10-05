from datetime import datetime

from pydantic import BaseModel, ConfigDict, HttpUrl


class ApplicationCreate(BaseModel):
    name: str
    url: HttpUrl


class ApplicationUpdate(BaseModel):
    name: str | None = None
    url: HttpUrl | None = None
    monitoring_enabled: bool | None = None


class ApplicationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    url: str
    monitoring_enabled: bool
    created_at: datetime
    updated_at: datetime | None = None
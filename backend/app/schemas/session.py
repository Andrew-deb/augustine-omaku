from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

SessionStatusLiteral = str  # "open", "limited", "soldout", etc.
SessionPlatformLiteral = str  # "Zoom", "Teams", "Google Meet"


class SessionBase(BaseModel):
    code: str = Field(min_length=3, max_length=120)
    category: str = Field(min_length=2, max_length=100)
    title: str = Field(min_length=3, max_length=255)
    short_desc: str = Field(min_length=10, max_length=500)
    long_desc: str = Field(min_length=20)
    audience: str = Field(min_length=3, max_length=255)
    learn_points: list[str] = Field(default_factory=list, max_length=10)
    image_url: str = Field(min_length=8, max_length=1000)
    status: SessionStatusLiteral
    capacity: int = Field(gt=0)
    starts_at: datetime
    duration_minutes: int = Field(gt=0)
    timezone: str = Field(min_length=2, max_length=80)
    platform: SessionPlatformLiteral
    meeting_link: str | None = Field(default=None, max_length=1000)
    is_active: bool = True


class SessionCreate(SessionBase):
    pass


class SessionUpdate(BaseModel):
    category: str | None = Field(default=None, min_length=2, max_length=100)
    title: str | None = Field(default=None, min_length=3, max_length=255)
    short_desc: str | None = Field(default=None, min_length=10, max_length=500)
    long_desc: str | None = Field(default=None, min_length=20)
    audience: str | None = Field(default=None, min_length=3, max_length=255)
    learn_points: list[str] | None = None
    image_url: str | None = Field(default=None, min_length=8, max_length=1000)
    status: SessionStatusLiteral | None = None
    capacity: int | None = Field(default=None, gt=0)
    starts_at: datetime | None = None
    duration_minutes: int | None = Field(default=None, gt=0)
    timezone: str | None = Field(default=None, min_length=2, max_length=80)
    platform: SessionPlatformLiteral | None = None
    meeting_link: str | None = Field(default=None, max_length=1000)
    is_active: bool | None = None


class SessionRead(BaseModel):
    """
    The response schema sent to the frontend.

    Key differences from the database model:
    - id is serialized as a string (from UUID)
    - status/platform are lowercase strings (from Enums)
    - seats_remaining is always present (computed at query time)
    """
    model_config = ConfigDict(from_attributes=True)

    id: str
    code: str
    category: str
    title: str
    short_desc: str
    long_desc: str
    audience: str
    learn_points: list[str]
    image_url: str
    status: str
    capacity: int
    starts_at: datetime
    duration_minutes: int
    timezone: str
    platform: str
    meeting_link: str | None
    is_active: bool
    seats_remaining: int = 0

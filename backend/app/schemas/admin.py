"""
Admin-specific Pydantic schemas.

These schemas are used exclusively by the admin dashboard endpoints
and include fields not exposed in the public API (e.g. booking counts,
fill rates, analytics aggregations, notification records).
"""

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


# ── Session Schemas ──────────────────────────────────────────────────


class AdminSessionCreate(BaseModel):
    """Payload for creating a new session via the admin dashboard."""

    code: str = Field(min_length=3, max_length=120)
    category: str = Field(min_length=2, max_length=100)
    title: str = Field(min_length=3, max_length=255)
    short_desc: str = Field(min_length=10, max_length=500)
    long_desc: str = Field(min_length=20)
    audience: str = Field(min_length=3, max_length=255)
    learn_points: list[str] = Field(default_factory=list, max_length=10)
    image_url: str = Field(min_length=8, max_length=1000)
    status: str = "open"
    capacity: int = Field(gt=0)
    starts_at: datetime
    duration_minutes: int = Field(gt=0)
    timezone: str = Field(min_length=2, max_length=80)
    platform: str
    meeting_link: str | None = Field(default=None, max_length=1000)
    is_active: bool = True


class AdminSessionUpdate(BaseModel):
    """Partial-update payload for editing an existing session."""

    category: str | None = Field(default=None, min_length=2, max_length=100)
    title: str | None = Field(default=None, min_length=3, max_length=255)
    short_desc: str | None = Field(default=None, min_length=10, max_length=500)
    long_desc: str | None = Field(default=None, min_length=20)
    audience: str | None = Field(default=None, min_length=3, max_length=255)
    learn_points: list[str] | None = None
    image_url: str | None = Field(default=None, min_length=8, max_length=1000)
    status: str | None = None
    capacity: int | None = Field(default=None, gt=0)
    starts_at: datetime | None = None
    duration_minutes: int | None = Field(default=None, gt=0)
    timezone: str | None = Field(default=None, min_length=2, max_length=80)
    platform: str | None = None
    meeting_link: str | None = Field(default=None, max_length=1000)
    is_active: bool | None = None


class SessionStatusUpdate(BaseModel):
    """Payload for changing only the status of a session."""

    status: str = Field(
        ..., description="Must be a valid SessionStatus value: open, limited, soldout, comingsoon, closed, recorded"
    )


class AdminSessionRead(BaseModel):
    """Session response with booking analytics attached."""

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
    bookings_count: int = 0
    confirmed_count: int = 0
    waitlisted_count: int = 0
    fill_rate: float = 0.0


# ── Analytics Schemas ────────────────────────────────────────────────


class OverviewStats(BaseModel):
    """Top-level KPI cards for the admin dashboard."""

    total_sessions: int = 0
    active_sessions: int = 0
    total_bookings: int = 0
    confirmed_bookings: int = 0
    waitlisted_bookings: int = 0
    canceled_bookings: int = 0
    overall_fill_rate: float = 0.0


class BookingTrendPoint(BaseModel):
    """A single data point in the bookings-over-time chart."""

    date: str
    count: int


class SessionBreakdown(BaseModel):
    """Per-session breakdown for the sessions analytics chart."""

    session_code: str
    session_title: str
    confirmed: int = 0
    waitlisted: int = 0
    canceled: int = 0
    capacity: int = 0
    fill_rate: float = 0.0


# ── Notification Schemas ─────────────────────────────────────────────


class NotificationRead(BaseModel):
    """Serialized notification for the admin notification feed."""

    model_config = ConfigDict(from_attributes=True)

    id: str
    type: str
    title: str
    message: str
    is_read: bool
    metadata_json: dict | None = None
    created_at: datetime


class UnreadCount(BaseModel):
    """Simple wrapper for the unread-notification count."""

    count: int

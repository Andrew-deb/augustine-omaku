from datetime import datetime
from enum import Enum

from sqlalchemy import Boolean, CheckConstraint, DateTime, Enum as SqlEnum, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import JSONB

from app.models.base import Base, TimestampMixin, UUIDPrimaryKeyMixin

class SessionStatus(str, Enum):
    OPEN = "open"
    LIMITED = "limited"
    SOLDOUT = "soldout"
    COMINGSOON = "comingsoon"
    CLOSED = "closed"
    RECORDED = "recorded"


class SessionPlatform(str, Enum):
    ZOOM = "Zoom"
    TEAMS = "Teams"
    GOOGLE_MEET = "Google Meet"


class Session(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "sessions"
    __table_args__ = (
                CheckConstraint("capacity > 0", name="ck_sessions_capacity_positive"),
        CheckConstraint("duration_minutes > 0", name="ck_sessions_duration_positive"),
    )

    code: Mapped[str] = mapped_column(String(120), unique=True, nullable=False, index=True)
    category: Mapped[str] = mapped_column(String(100), nullable=False, index=True)

    title: Mapped[str] = mapped_column(String(255), nullable=False)
    short_desc: Mapped[str] = mapped_column(String(500), nullable=False)
    long_desc: Mapped[str] = mapped_column(Text, nullable=False)

    audience: Mapped[str] = mapped_column(String(255), nullable=False)
    learn_points: Mapped[list[str]] = mapped_column(JSONB, nullable=False, default=list)

    image_url: Mapped[str] = mapped_column(String(1000), nullable=False)

    status: Mapped[SessionStatus] = mapped_column(
        SqlEnum(SessionStatus, name="session_status"),
        nullable=False,
        default=SessionStatus.OPEN,
        index=True,
    )
    
    capacity: Mapped[int] = mapped_column(Integer, nullable=False)

    starts_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, index=True)
    duration_minutes: Mapped[int] = mapped_column(Integer, nullable=False)
    timezone: Mapped[str] = mapped_column(String(80), nullable=False, default="UTC")

    platform: Mapped[SessionPlatform] = mapped_column(
        SqlEnum(SessionPlatform, name="session_platform"),
        nullable=False,
    )
    meeting_link: Mapped[str | None] = mapped_column(String(1000), nullable=True)

    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)

    bookings = relationship("Booking", back_populates="session", cascade="all, delete-orphan")
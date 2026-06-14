from enum import Enum
from uuid import uuid4

from sqlalchemy import Boolean, Enum as SqlEnum, ForeignKey, Index, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class BookingStatus(str, Enum):
    CONFIRMED = "confirmed"
    WAITLISTED = "waitlisted"
    CANCELED = "canceled"


class Booking(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "bookings"
    __table_args__ = (
        UniqueConstraint("session_id", "email", name="uq_booking_session_email"),
        Index("ix_booking_session_created", "session_id", "created_at"),
    )

    session_id: Mapped[str] = mapped_column(
        ForeignKey("sessions.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    full_name: Mapped[str] = mapped_column(String(100), nullable=False)
    email: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    phone: Mapped[str | None] = mapped_column(String(30), nullable=True)
    company_or_profession: Mapped[str | None] = mapped_column(String(150), nullable=True)
    learning_goals: Mapped[str] = mapped_column(Text, nullable=False)

    consent: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)

    booking_reference: Mapped[str] = mapped_column(
        String(40),
        nullable=False,
        unique=True,
        default=lambda: f"BK-{uuid4().hex[:10].upper()}",
    )

    status: Mapped[BookingStatus] = mapped_column(
        SqlEnum(BookingStatus, name="booking_status"),
        nullable=False,
        default=BookingStatus.CONFIRMED,
        index=True,
    )

    session = relationship("Session", back_populates="bookings")
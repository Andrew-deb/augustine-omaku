"""
Notification model for the admin dashboard.

Stores real-time notifications triggered by system events such as
new bookings, contact form submissions, and administrative alerts.
"""

from sqlalchemy import Boolean, String, Text
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.dialects.postgresql import JSONB

from app.models.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class Notification(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    """Persisted notification for admin dashboard consumption.

    Attributes:
        type: Category of notification — 'booking', 'contact', or 'system'.
        title: Short headline shown in the notification list.
        message: Longer descriptive body text.
        is_read: Whether the admin has acknowledged this notification.
        metadata_json: Arbitrary context (e.g. session_code, booking_ref, sender_email).
    """

    __tablename__ = "notifications"

    type: Mapped[str] = mapped_column(
        String(50), nullable=False, index=True
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    is_read: Mapped[bool] = mapped_column(
        Boolean, nullable=False, default=False, index=True
    )
    metadata_json: Mapped[dict | None] = mapped_column(
        JSONB, nullable=True, default=dict
    )

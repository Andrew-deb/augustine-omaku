"""
Admin notification feed routes.

Provides endpoints for listing, reading, and bulk-marking notifications
that power the real-time notification bell in the admin dashboard.
"""

from fastapi import APIRouter, Depends, Query

from app.api.deps import DBSession
from app.core.security import require_admin
from app.schemas.admin import NotificationRead, UnreadCount
from app.services.notification_service import NotificationService

router = APIRouter(dependencies=[Depends(require_admin)])


# ── Helpers ──────────────────────────────────────────────────────────


def _notification_to_read(notification) -> NotificationRead:
    """Convert a Notification ORM object to a NotificationRead schema.

    Handles UUID → str conversion; other fields are passed through
    via ``from_attributes`` compatibility.
    """
    return NotificationRead(
        id=str(notification.id),
        type=notification.type,
        title=notification.title,
        message=notification.message,
        is_read=notification.is_read,
        metadata_json=notification.metadata_json,
        created_at=notification.created_at,
    )


# ── Routes ───────────────────────────────────────────────────────────


@router.get("", response_model=list[NotificationRead])
async def list_notifications(
    db: DBSession,
    limit: int = Query(default=20, ge=1, le=100, description="Max notifications to return"),
    unread_only: bool = Query(default=False, description="Only return unread notifications"),
):
    """List the most recent notifications.

    Optionally filter to unread-only for the notification badge dropdown.
    """
    service = NotificationService(db)
    notifications = await service.list_notifications(limit=limit, unread_only=unread_only)
    return [_notification_to_read(n) for n in notifications]


@router.get("/unread-count", response_model=UnreadCount)
async def get_unread_count(db: DBSession):
    """Return the count of unread notifications.

    Used by the frontend notification badge to show the unread count
    without fetching the full notification list.
    """
    service = NotificationService(db)
    count = await service.get_unread_count()
    return UnreadCount(count=count)


@router.patch("/{notification_id}/read", response_model=NotificationRead)
async def mark_notification_as_read(notification_id: str, db: DBSession):
    """Mark a single notification as read."""
    service = NotificationService(db)
    notification = await service.mark_as_read(notification_id)
    return _notification_to_read(notification)


@router.post("/mark-all-read")
async def mark_all_as_read(db: DBSession):
    """Mark all unread notifications as read.

    Returns the number of notifications that were updated.
    """
    service = NotificationService(db)
    updated = await service.mark_all_as_read()
    return {"updated": updated}

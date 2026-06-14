"""
Notification service for the admin dashboard.

Handles CRUD operations on the notifications table: listing,
marking as read, and counting unread notifications.
"""

from sqlalchemy import func, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import NotFoundError
from app.models.notification import Notification


class NotificationService:
    """Manages admin notification lifecycle."""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def list_notifications(
        self,
        limit: int = 20,
        unread_only: bool = False,
    ) -> list[Notification]:
        """Return the most recent notifications, optionally filtered to unread."""
        query = select(Notification).order_by(Notification.created_at.desc()).limit(limit)
        if unread_only:
            query = query.where(Notification.is_read.is_(False))
        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def get_unread_count(self) -> int:
        """Count notifications that have not been read."""
        query = (
            select(func.count())
            .select_from(Notification)
            .where(Notification.is_read.is_(False))
        )
        result = await self.db.execute(query)
        return result.scalar() or 0

    async def mark_as_read(self, notification_id: str) -> Notification:
        """Mark a single notification as read by its UUID."""
        query = select(Notification).where(Notification.id == notification_id)
        result = await self.db.execute(query)
        notification = result.scalar_one_or_none()
        if not notification:
            raise NotFoundError(f"Notification '{notification_id}' not found")

        notification.is_read = True
        await self.db.commit()
        await self.db.refresh(notification)
        return notification

    async def mark_all_as_read(self) -> int:
        """Mark every unread notification as read. Returns the count updated."""
        stmt = (
            update(Notification)
            .where(Notification.is_read.is_(False))
            .values(is_read=True)
        )
        result = await self.db.execute(stmt)
        await self.db.commit()
        return result.rowcount

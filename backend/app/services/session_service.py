from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import NotFoundError
from app.models import Booking, BookingStatus, Session
from app.schemas.session import SessionCreate, SessionUpdate


class SessionService:
    """Handles all session-related database operations."""

    def __init__(self, db: AsyncSession):
        self.db = db

    # ── Public Queries ──────────────────────────────

    async def list_sessions(self, active_only: bool = True) -> list[dict]:
        """
        Fetch all sessions with computed seats_remaining.

        Returns a list of dicts (not ORM objects) because we attach
        the computed seats_remaining field that doesn't exist on the model.
        """
        query = select(Session)
        if active_only:
            query = query.where(Session.is_active.is_(True))
        query = query.order_by(Session.starts_at.asc())

        result = await self.db.execute(query)
        sessions = result.scalars().all()

        # Compute seats_remaining for each session
        output = []
        for session in sessions:
            remaining = await self._compute_seats_remaining(session)
            output.append({"session": session, "seats_remaining": remaining})
        return output

    async def get_session_by_code(self, code: str) -> Session:
        """
        Look up a session by its unique code (e.g., 'azure-bronze-gold').
        This is the public identifier used in URLs and the frontend.
        """
        query = select(Session).where(Session.code == code)
        result = await self.db.execute(query)
        session = result.scalar_one_or_none()
        if not session:
            raise NotFoundError(f"Session '{code}' not found")
        return session

    async def get_session_by_id(self, session_id: str) -> Session:
        """Look up a session by its UUID primary key."""
        query = select(Session).where(Session.id == session_id)
        result = await self.db.execute(query)
        session = result.scalar_one_or_none()
        if not session:
            raise NotFoundError(f"Session with id '{session_id}' not found")
        return session

    # ── Admin Operations ────────────────────────────

    async def create_session(self, data: SessionCreate) -> Session:
        """Create a new session. Used by admin endpoints."""
        session = Session(**data.model_dump())
        self.db.add(session)
        await self.db.commit()
        await self.db.refresh(session)
        return session

    async def update_session(self, session_id: str, data: SessionUpdate) -> Session:
        """
        Partial update of a session. Only fields that are not None
        in the update payload are changed.
        """
        session = await self.get_session_by_id(session_id)
        update_data = data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(session, field, value)
        await self.db.commit()
        await self.db.refresh(session)
        return session

    # ── Internal Helpers ────────────────────────────

    async def _compute_seats_remaining(self, session: Session) -> int:
        """
        Count confirmed bookings and subtract from capacity.

        Only CONFIRMED bookings count toward capacity.
        WAITLISTED and CANCELED do not consume seats.
        """
        query = (
            select(func.count())
            .select_from(Booking)
            .where(
                Booking.session_id == session.id,
                Booking.status == BookingStatus.CONFIRMED,
            )
        )
        result = await self.db.execute(query)
        confirmed_count = result.scalar() or 0
        return max(0, session.capacity - confirmed_count)

import logging

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import CapacityFullError, ConflictError, NotFoundError, ValidationError
from app.models import Booking, BookingStatus, Session, SessionStatus
from app.schemas.booking import BookingCreate

logger = logging.getLogger(__name__)

# When confirmed bookings reach this fraction of capacity,
# the session status auto-transitions to 'limited'.
LIMITED_THRESHOLD = 0.8


class BookingService:
    """Handles session registration, capacity enforcement, and status transitions."""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def register(self, session_code: str, data: BookingCreate) -> Booking:
        """
        Register a user for a session.

        This is the core booking flow — validates eligibility, prevents
        duplicates, enforces capacity, creates the booking, and
        auto-updates the session status.
        """
        # 1. Look up the session
        session = await self._get_registerable_session(session_code)

        # 2. Check for duplicate registration
        await self._check_duplicate(session.id, data.email)

        # 3. Count current confirmed bookings
        confirmed_count = await self._count_confirmed(session.id)

        # 4. Determine booking status based on capacity
        if confirmed_count >= session.capacity:
            booking_status = BookingStatus.WAITLISTED
        else:
            booking_status = BookingStatus.CONFIRMED

        # 5. Create the booking
        booking = Booking(
            session_id=session.id,
            full_name=data.name,
            email=data.email,
            phone=data.phone,
            company_or_profession=data.company,
            learning_goals=data.goals,
            consent=data.consent,
            status=booking_status,
        )
        self.db.add(booking)

        # 6. Auto-update session status based on new count
        if booking_status == BookingStatus.CONFIRMED:
            new_confirmed = confirmed_count + 1
            await self._auto_update_session_status(session, new_confirmed)

        await self.db.commit()
        await self.db.refresh(booking)

        logger.info(
            "Booking created: ref=%s, session=%s, status=%s",
            booking.booking_reference, session_code, booking.status.value,
        )
        return booking

    async def get_bookings_for_session(self, session_code: str) -> list[Booking]:
        """Admin: list all bookings for a session, newest first."""
        # First, look up the session to get its ID
        query = select(Session).where(Session.code == session_code)
        result = await self.db.execute(query)
        session = result.scalar_one_or_none()
        if not session:
            raise NotFoundError(f"Session '{session_code}' not found")

        query = (
            select(Booking)
            .where(Booking.session_id == session.id)
            .order_by(Booking.created_at.desc())
        )
        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def cancel_booking(self, booking_reference: str) -> Booking:
        """
        Cancel a booking by its reference code.
        If the booking was confirmed, this may re-open the session.
        """
        query = select(Booking).where(Booking.booking_reference == booking_reference)
        result = await self.db.execute(query)
        booking = result.scalar_one_or_none()
        if not booking:
            raise NotFoundError(f"Booking '{booking_reference}' not found")

        was_confirmed = booking.status == BookingStatus.CONFIRMED
        booking.status = BookingStatus.CANCELED

        # If a confirmed booking was canceled, re-evaluate session status
        if was_confirmed:
            session = await self.db.get(Session, booking.session_id)
            if session:
                new_confirmed = await self._count_confirmed(session.id)
                await self._auto_update_session_status(session, new_confirmed)

        await self.db.commit()
        await self.db.refresh(booking)
        return booking

    # ── Private Helpers ─────────────────────────────

    async def _get_registerable_session(self, code: str) -> Session:
        """Fetch a session and validate that registration is allowed."""
        query = select(Session).where(Session.code == code)
        result = await self.db.execute(query)
        session = result.scalar_one_or_none()

        if not session:
            raise NotFoundError(f"Session '{code}' not found")

        registerable_statuses = {SessionStatus.OPEN, SessionStatus.LIMITED}
        if session.status not in registerable_statuses:
            status_messages = {
                SessionStatus.SOLDOUT: "This session is sold out.",
                SessionStatus.CLOSED: "Registration for this session is closed.",
                SessionStatus.COMINGSOON: "Registration is not yet open for this session.",
                SessionStatus.RECORDED: "This session has already been recorded.",
            }
            message = status_messages.get(session.status, "Registration is not available.")
            raise ValidationError(message)

        return session

    async def _check_duplicate(self, session_id, email: str) -> None:
        """Raise ConflictError if this email has already booked this session."""
        query = select(Booking).where(
            Booking.session_id == session_id,
            Booking.email == email,
            Booking.status != BookingStatus.CANCELED,  # Allow re-registration after cancellation
        )
        result = await self.db.execute(query)
        if result.scalar_one_or_none():
            raise ConflictError("You have already registered for this session.")

    async def _count_confirmed(self, session_id) -> int:
        """Count confirmed (non-waitlisted, non-canceled) bookings for a session."""
        query = (
            select(func.count())
            .select_from(Booking)
            .where(
                Booking.session_id == session_id,
                Booking.status == BookingStatus.CONFIRMED,
            )
        )
        result = await self.db.execute(query)
        return result.scalar() or 0

    async def _auto_update_session_status(self, session: Session, confirmed_count: int) -> None:
        """
        Automatically transition session status based on confirmed bookings.

        Rules:
        - confirmed >= capacity → soldout
        - confirmed >= 80% capacity → limited
        - confirmed < 80% capacity → open (e.g., after a cancellation)

        Only transitions from open/limited/soldout — never touches
        closed, comingsoon, or recorded.
        """
        auto_managed = {SessionStatus.OPEN, SessionStatus.LIMITED, SessionStatus.SOLDOUT}
        if session.status not in auto_managed:
            return

        if confirmed_count >= session.capacity:
            session.status = SessionStatus.SOLDOUT
        elif confirmed_count >= int(session.capacity * LIMITED_THRESHOLD):
            session.status = SessionStatus.LIMITED
        else:
            session.status = SessionStatus.OPEN

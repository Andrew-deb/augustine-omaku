"""
Admin session management routes.

Provides full CRUD for sessions including soft-delete, status changes,
and enriched responses that include per-session booking statistics
(bookings_count, confirmed_count, waitlisted_count, fill_rate).
"""

import logging

from fastapi import APIRouter, Depends

from app.api.deps import DBSession
from app.core.exceptions import NotFoundError, ValidationError
from app.core.security import require_admin
from app.models import Booking, BookingStatus, Session, SessionStatus
from app.schemas.admin import (
    AdminSessionCreate,
    AdminSessionRead,
    AdminSessionUpdate,
    SessionStatusUpdate,
)
from app.schemas.session import SessionCreate, SessionUpdate
from app.services.session_service import SessionService
from app.api.v1.routes.sessions import _invalidate_sessions_cache

from sqlalchemy import func, select

logger = logging.getLogger(__name__)

router = APIRouter(dependencies=[Depends(require_admin)])


# ── Helpers ──────────────────────────────────────────────────────────


async def _get_booking_counts(db, session_id: str) -> dict:
    """Compute booking counts and fill rate for a single session.

    Returns a dict with keys: bookings_count, confirmed_count,
    waitlisted_count, fill_rate.
    """
    query = (
        select(
            func.count(Booking.id).label("total"),
            func.count().filter(Booking.status == BookingStatus.CONFIRMED).label("confirmed"),
            func.count().filter(Booking.status == BookingStatus.WAITLISTED).label("waitlisted"),
        )
        .select_from(Booking)
        .where(Booking.session_id == session_id)
    )
    result = await db.execute(query)
    row = result.one()
    return {
        "bookings_count": row.total,
        "confirmed_count": row.confirmed,
        "waitlisted_count": row.waitlisted,
    }


def _session_to_admin_read(
    session_obj: Session,
    booking_counts: dict,
) -> AdminSessionRead:
    """Convert a SQLAlchemy Session ORM object to an AdminSessionRead schema.

    Handles:
    - UUID → str conversion for ``id``
    - Enum → ``.value`` for ``status`` and ``platform``
    - Attaching computed booking statistics
    """
    capacity = session_obj.capacity or 0
    confirmed = booking_counts.get("confirmed_count", 0)
    fill_rate = round(confirmed / capacity * 100, 1) if capacity > 0 else 0.0

    return AdminSessionRead(
        id=str(session_obj.id),
        code=session_obj.code,
        category=session_obj.category,
        title=session_obj.title,
        short_desc=session_obj.short_desc,
        long_desc=session_obj.long_desc,
        audience=session_obj.audience,
        learn_points=session_obj.learn_points or [],
        image_url=session_obj.image_url,
        status=session_obj.status.value,
        capacity=session_obj.capacity,
        starts_at=session_obj.starts_at,
        duration_minutes=session_obj.duration_minutes,
        timezone=session_obj.timezone,
        platform=session_obj.platform.value,
        meeting_link=session_obj.meeting_link,
        is_active=session_obj.is_active,
        bookings_count=booking_counts.get("bookings_count", 0),
        confirmed_count=confirmed,
        waitlisted_count=booking_counts.get("waitlisted_count", 0),
        fill_rate=fill_rate,
    )


# ── Routes ───────────────────────────────────────────────────────────


@router.get("", response_model=list[AdminSessionRead])
async def list_all_sessions(db: DBSession):
    """List ALL sessions (including inactive) with booking statistics.

    Unlike the public endpoint, this returns every session regardless
    of ``is_active`` and enriches each with booking counts and fill rate.
    """
    service = SessionService(db)
    results = await service.list_sessions(active_only=False)

    output: list[AdminSessionRead] = []
    for item in results:
        session = item["session"]
        counts = await _get_booking_counts(db, str(session.id))
        output.append(_session_to_admin_read(session, counts))
    return output


@router.get("/{session_id}", response_model=AdminSessionRead)
async def get_session_detail(session_id: str, db: DBSession):
    """Get a single session with booking statistics."""
    service = SessionService(db)
    session = await service.get_session_by_id(session_id)
    counts = await _get_booking_counts(db, str(session.id))
    return _session_to_admin_read(session, counts)


@router.post("", response_model=AdminSessionRead, status_code=201)
async def create_session(data: AdminSessionCreate, db: DBSession):
    """Create a new session.

    Accepts the admin session payload, delegates to ``SessionService``,
    and returns the created session with zeroed booking counts.
    """
    service = SessionService(db)
    # Convert AdminSessionCreate to the service's expected SessionCreate
    session_data = SessionCreate(**data.model_dump())
    session = await service.create_session(session_data)
    counts = {"bookings_count": 0, "confirmed_count": 0, "waitlisted_count": 0}
    logger.info("Session created: code=%s, id=%s", session.code, session.id)
    _invalidate_sessions_cache()
    return _session_to_admin_read(session, counts)


@router.put("/{session_id}", response_model=AdminSessionRead)
async def update_session(session_id: str, data: AdminSessionUpdate, db: DBSession):
    """Update an existing session (partial update).

    Only fields present in the request body are changed.
    """
    service = SessionService(db)
    update_data = SessionUpdate(**data.model_dump(exclude_unset=True))
    session = await service.update_session(session_id, update_data)
    counts = await _get_booking_counts(db, str(session.id))
    logger.info("Session updated: id=%s", session_id)
    _invalidate_sessions_cache()
    return _session_to_admin_read(session, counts)


@router.patch("/{session_id}/status", response_model=AdminSessionRead)
async def change_session_status(
    session_id: str,
    body: SessionStatusUpdate,
    db: DBSession,
):
    """Change only the status of a session.

    Validates that the provided status string is a valid ``SessionStatus``
    enum value before applying the change.
    """
    # Validate the status value
    valid_statuses = {s.value for s in SessionStatus}
    if body.status not in valid_statuses:
        raise ValidationError(
            f"Invalid status '{body.status}'. Must be one of: {', '.join(sorted(valid_statuses))}"
        )

    service = SessionService(db)
    session = await service.get_session_by_id(session_id)
    session.status = SessionStatus(body.status)
    await db.commit()
    await db.refresh(session)

    counts = await _get_booking_counts(db, str(session.id))
    logger.info("Session status changed: id=%s, new_status=%s", session_id, body.status)
    _invalidate_sessions_cache()
    return _session_to_admin_read(session, counts)


@router.delete("/{session_id}", status_code=200)
async def soft_delete_session(session_id: str, db: DBSession):
    """Soft-delete a session by setting ``is_active=False``.

    The session record is preserved for historical data and analytics.
    """
    service = SessionService(db)
    session = await service.get_session_by_id(session_id)
    session.is_active = False
    await db.commit()
    await db.refresh(session)
    logger.info("Session soft-deleted: id=%s", session_id)
    _invalidate_sessions_cache()
    return {"detail": "Session deactivated", "session_id": str(session.id)}

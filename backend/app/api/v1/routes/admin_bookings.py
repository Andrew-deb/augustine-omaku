"""
Admin booking management routes.

Provides listing, filtering, cancellation, and export (CSV / Excel)
of bookings for the admin dashboard.
"""

import csv
import io
import logging
from datetime import datetime

from fastapi import APIRouter, Depends, Query
from fastapi.responses import StreamingResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

from app.api.deps import DBSession
from app.core.exceptions import NotFoundError
from app.core.security import require_admin
from app.models import Booking, BookingStatus, Session
from app.schemas.booking import BookingRead
from app.services.booking_service import BookingService

logger = logging.getLogger(__name__)

router = APIRouter(dependencies=[Depends(require_admin)])

# Columns used in both CSV and Excel exports
_EXPORT_COLUMNS = [
    "booking_reference",
    "full_name",
    "email",
    "phone",
    "company_or_profession",
    "learning_goals",
    "status",
    "session_title",
    "session_code",
    "created_at",
]


# ── Helpers ──────────────────────────────────────────────────────────


def _build_booking_query(
    session_code: str | None = None,
    status: str | None = None,
    search: str | None = None,
):
    """Build a SQLAlchemy select query with optional filters.

    Filters:
    - ``session_code``: exact match on related session code.
    - ``status``: exact match on booking status string.
    - ``search``: case-insensitive ILIKE on full_name or email.

    The query eagerly loads the ``session`` relationship so we can
    access session_title and session_code without extra round-trips.
    """
    query = (
        select(Booking)
        .options(joinedload(Booking.session))
        .order_by(Booking.created_at.desc())
    )

    if session_code:
        query = query.join(Session, Booking.session_id == Session.id).where(
            Session.code == session_code
        )

    if status:
        try:
            booking_status = BookingStatus(status)
            query = query.where(Booking.status == booking_status)
        except ValueError:
            pass  # Invalid status — return unfiltered rather than 422

    if search:
        pattern = f"%{search}%"
        query = query.where(
            Booking.full_name.ilike(pattern) | Booking.email.ilike(pattern)
        )

    return query


def _booking_to_read(booking: Booking) -> BookingRead:
    """Convert a Booking ORM object to a BookingRead schema.

    Handles UUID → str and Enum → .value conversions.
    """
    return BookingRead(
        id=str(booking.id),
        session_id=str(booking.session_id),
        full_name=booking.full_name,
        email=booking.email,
        phone=booking.phone,
        company_or_profession=booking.company_or_profession,
        learning_goals=booking.learning_goals,
        consent=booking.consent,
        booking_reference=booking.booking_reference,
        status=booking.status.value,
        created_at=booking.created_at,
    )


def _booking_to_export_row(booking: Booking) -> list[str]:
    """Flatten a booking (with session loaded) into an export row."""
    session = booking.session
    return [
        booking.booking_reference,
        booking.full_name,
        booking.email,
        booking.phone or "",
        booking.company_or_profession or "",
        booking.learning_goals,
        booking.status.value,
        session.title if session else "",
        session.code if session else "",
        booking.created_at.isoformat() if booking.created_at else "",
    ]


# ── Routes ───────────────────────────────────────────────────────────


@router.get("", response_model=list[BookingRead])
async def list_bookings(
    db: DBSession,
    session_code: str | None = Query(default=None, description="Filter by session code"),
    status: str | None = Query(default=None, description="Filter by booking status"),
    search: str | None = Query(default=None, description="Search by name or email"),
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=50, ge=1, le=200),
):
    """List bookings with optional filtering and pagination.

    Supports filtering by session code, booking status, and
    free-text search across name and email fields.
    """
    query = _build_booking_query(session_code=session_code, status=status, search=search)
    query = query.offset(skip).limit(limit)
    result = await db.execute(query)
    bookings = result.scalars().unique().all()
    return [_booking_to_read(b) for b in bookings]


@router.get("/export/csv")
async def export_bookings_csv(
    db: DBSession,
    session_code: str | None = Query(default=None),
    status: str | None = Query(default=None),
    search: str | None = Query(default=None),
):
    """Export filtered bookings as a CSV file download.

    Uses the same filter logic as the list endpoint. Returns a
    ``StreamingResponse`` with ``text/csv`` content type.
    """
    query = _build_booking_query(session_code=session_code, status=status, search=search)
    result = await db.execute(query)
    bookings = result.scalars().unique().all()

    buffer = io.StringIO()
    writer = csv.writer(buffer)
    writer.writerow(_EXPORT_COLUMNS)
    for booking in bookings:
        writer.writerow(_booking_to_export_row(booking))

    buffer.seek(0)
    timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
    filename = f"bookings_export_{timestamp}.csv"

    return StreamingResponse(
        iter([buffer.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.get("/export/excel")
async def export_bookings_excel(
    db: DBSession,
    session_code: str | None = Query(default=None),
    status: str | None = Query(default=None),
    search: str | None = Query(default=None),
):
    """Export filtered bookings as an Excel (.xlsx) file download.

    Uses openpyxl to build the workbook in-memory and returns a
    ``StreamingResponse`` with the appropriate spreadsheet MIME type.
    """
    from openpyxl import Workbook

    query = _build_booking_query(session_code=session_code, status=status, search=search)
    result = await db.execute(query)
    bookings = result.scalars().unique().all()

    wb = Workbook()
    ws = wb.active
    ws.title = "Bookings"
    ws.append(_EXPORT_COLUMNS)
    for booking in bookings:
        ws.append(_booking_to_export_row(booking))

    buffer = io.BytesIO()
    wb.save(buffer)
    buffer.seek(0)

    timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
    filename = f"bookings_export_{timestamp}.xlsx"

    return StreamingResponse(
        iter([buffer.getvalue()]),
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.get("/{reference}", response_model=BookingRead)
async def get_booking_by_reference(reference: str, db: DBSession):
    """Look up a single booking by its booking reference code."""
    query = select(Booking).where(Booking.booking_reference == reference)
    result = await db.execute(query)
    booking = result.scalar_one_or_none()
    if not booking:
        raise NotFoundError(f"Booking '{reference}' not found")
    return _booking_to_read(booking)


@router.patch("/{reference}/cancel", response_model=BookingRead)
async def cancel_booking(reference: str, db: DBSession):
    """Cancel a booking by its reference code.

    Delegates to ``BookingService.cancel_booking()`` which also
    re-evaluates the session status when a confirmed booking is canceled.
    """
    service = BookingService(db)
    booking = await service.cancel_booking(reference)
    logger.info("Booking canceled via admin: ref=%s", reference)
    return _booking_to_read(booking)

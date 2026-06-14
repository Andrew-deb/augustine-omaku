import logging

from fastapi import APIRouter, Request

from app.api.deps import DBSession
from app.core.rate_limit import limiter
from app.models import Session
from app.schemas.booking import BookingCreate, BookingSubmitResponse
from app.services.booking_service import BookingService
from app.services.email_service import EmailService
from app.services.notification_service import NotificationService

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("/{code}", response_model=BookingSubmitResponse)
@limiter.limit("10/minute")
async def register_for_session(
    request: Request,
    code: str,
    data: BookingCreate,
    db: DBSession,
):
    """
    Register for a session by its code.

    Flow:
    1. Validates session is open for registration
    2. Checks for duplicate email
    3. Creates booking (confirmed or waitlisted based on capacity)
    4. Auto-updates session status if needed
    5. Sends confirmation email (fire-and-forget)
    6. Returns booking reference and status
    """
    # Create the booking
    service = BookingService(db)
    booking = await service.register(session_code=code, data=data)

    # Send confirmation email (fire-and-forget — never blocks the response)
    try:
        session = await db.get(Session, booking.session_id)
        if session:
            email_service = EmailService()
            await email_service.send_booking_confirmation(booking, session)
    except Exception as e:
        logger.error("Email send failed (booking still saved): %s", str(e))

    # Create admin notification (fire-and-forget)
    try:
        session = session if 'session' in dir() and session else await db.get(Session, booking.session_id)
        if session:
            await NotificationService.on_booking_created(db, booking, session)
    except Exception as e:
        logger.error("Notification creation failed: %s", str(e))

    # Build response
    status_messages = {
        "confirmed": f"You're registered for this session! Check {booking.email} for details.",
        "waitlisted": "Session is full. You've been added to the waitlist.",
    }

    return BookingSubmitResponse(
        booking_reference=booking.booking_reference,
        status=booking.status.value,
        message=status_messages.get(booking.status.value, "Booking processed."),
    )

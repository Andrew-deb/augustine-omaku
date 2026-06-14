import logging

from fastapi import APIRouter, Request

from app.api.deps import DBSession
from app.core.rate_limit import limiter
from app.schemas.contact import ContactCreate, ContactResponse
from app.services.contact_service import ContactService
from app.services.notification_service import NotificationService

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("", response_model=ContactResponse)
@limiter.limit("5/minute")
async def submit_contact(request: Request, data: ContactCreate, db: DBSession):
    """
    Submit a contact form message.

    The message is forwarded to the portfolio owner's email
    (CONTACT_EMAIL) via SendGrid. Reply-To is set to the
    sender's email so the owner can respond directly.

    Rate limited to 5 requests per minute per IP to prevent spam.
    """
    service = ContactService()
    await service.submit(
        name=data.name,
        email=data.email,
        subject=data.subject,
        message=data.message,
    )

    # Create admin notification (fire-and-forget)
    try:
        await NotificationService.on_contact_received(
            db, name=data.name, email=data.email, subject=data.subject
        )
    except Exception as e:
        logger.error("Notification creation failed: %s", str(e))

    return ContactResponse()

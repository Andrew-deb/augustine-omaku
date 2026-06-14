import logging

from app.core.exceptions import ExternalServiceError
from app.services.email_service import EmailService

logger = logging.getLogger(__name__)


class ContactService:
    """
    Handles contact form processing.

    Currently forwards submissions via email. Can be extended to
    store submissions in the database for a CRM/admin view later.
    """

    def __init__(self):
        self.email_service = EmailService()

    async def submit(self, name: str, email: str, subject: str, message: str) -> None:
        """
        Process a contact form submission.

        Forwards the message to CONTACT_EMAIL via SendGrid.
        Raises ExternalServiceError if the email fails to send.
        """
        try:
            await self.email_service.send_contact_notification(
                name=name,
                email=email,
                subject=subject,
                message_body=message,
            )
            logger.info("Contact form submitted by %s (%s)", name, email)
        except Exception as e:
            logger.error("Contact form email failed: %s", str(e))
            raise ExternalServiceError(
                message="Failed to send your message. Please try again later.",
                detail=str(e),
            )

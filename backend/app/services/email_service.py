import logging

from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Email, Mail, To

from app.configs import get_settings
from app.models import Booking, Session

logger = logging.getLogger(__name__)
settings = get_settings()


class EmailService:
    """Thin wrapper around SendGrid for all outbound emails."""

    def __init__(self):
        self.client = SendGridAPIClient(settings.SENDGRID_API_KEY)
        self.from_email = Email(settings.FROM_EMAIL, "Augustine Omaku")

    # ── Booking Emails ──────────────────────────────

    async def send_booking_confirmation(self, booking: Booking, session: Session) -> None:
        """
        Send a confirmation email after successful registration.

        Includes session details, booking reference, and meeting link
        (if the booking is confirmed and a link exists).
        """
        subject = f"Booking Confirmed: {session.title}"
        if booking.status.value == "waitlisted":
            subject = f"Waitlisted: {session.title}"

        html_body = self._build_booking_email_html(booking, session)

        try:
            message = Mail(
                from_email=self.from_email,
                to_emails=To(booking.email, booking.full_name),
                subject=subject,
                html_content=html_body,
            )
            self.client.send(message)
            logger.info("Booking confirmation sent to %s (ref: %s)", booking.email, booking.booking_reference)
        except Exception as e:
            # Never let email failures break the booking flow
            logger.error("Failed to send booking confirmation to %s: %s", booking.email, str(e))

    # ── Contact Emails ──────────────────────────────

    async def send_contact_notification(self, name: str, email: str, subject: str, message_body: str) -> None:
        """
        Forward a contact form submission to CONTACT_EMAIL.

        From: noreply@augustineomaku.com (SendGrid verified sender)
        To: reachout@augustineomaku.com
        Reply-To: the sender's email (so you can reply directly)
        """
        html_body = self._build_contact_email_html(name, email, subject, message_body)

        try:
            message = Mail(
                from_email=self.from_email,
                to_emails=To(settings.CONTACT_EMAIL),
                subject=f"[Portfolio Contact] {subject}",
                html_content=html_body,
            )
            # Set Reply-To so hitting "Reply" in your inbox goes to the sender
            message.reply_to = Email(email, name)
            self.client.send(message)
            logger.info("Contact form forwarded from %s (%s)", name, email)
        except Exception as e:
            logger.error("Failed to forward contact form from %s: %s", email, str(e))
            raise

    # ── HTML Builders ───────────────────────────────

    def _build_booking_email_html(self, booking: Booking, session: Session) -> str:
        """Build a clean HTML email for booking confirmations."""
        status_text = "✅ Confirmed" if booking.status.value == "confirmed" else "⏳ Waitlisted"
        meeting_section = ""
        if booking.status.value == "confirmed" and session.meeting_link:
            meeting_section = f"""
            <tr>
                <td style="padding:8px 0;color:#6b7280;font-size:14px;">Meeting Link</td>
                <td style="padding:8px 0;font-size:14px;">
                    <a href="{session.meeting_link}" style="color:#8bc63f;">{session.platform.value}</a>
                </td>
            </tr>
            """

        return f"""
        <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:600px;margin:0 auto;background:#ffffff;">
            <div style="background:#8bc63f;padding:24px 32px;">
                <h1 style="margin:0;color:#ffffff;font-size:22px;">Session Registration</h1>
            </div>
            <div style="padding:32px;">
                <p style="font-size:16px;color:#111827;">Hi {booking.full_name},</p>
                <p style="font-size:14px;color:#6b7280;line-height:1.6;">
                    Your registration for <strong>{session.title}</strong> has been received.
                </p>

                <div style="background:#f9fafb;border-radius:8px;padding:20px;margin:24px 0;">
                    <table style="width:100%;border-collapse:collapse;">
                        <tr>
                            <td style="padding:8px 0;color:#6b7280;font-size:14px;">Status</td>
                            <td style="padding:8px 0;font-size:14px;font-weight:bold;">{status_text}</td>
                        </tr>
                        <tr>
                            <td style="padding:8px 0;color:#6b7280;font-size:14px;">Reference</td>
                            <td style="padding:8px 0;font-size:14px;font-weight:bold;">{booking.booking_reference}</td>
                        </tr>
                        <tr>
                            <td style="padding:8px 0;color:#6b7280;font-size:14px;">Session</td>
                            <td style="padding:8px 0;font-size:14px;">{session.title}</td>
                        </tr>
                        <tr>
                            <td style="padding:8px 0;color:#6b7280;font-size:14px;">Date</td>
                            <td style="padding:8px 0;font-size:14px;">{session.starts_at.strftime('%B %d, %Y')}</td>
                        </tr>
                        <tr>
                            <td style="padding:8px 0;color:#6b7280;font-size:14px;">Time</td>
                            <td style="padding:8px 0;font-size:14px;">{session.starts_at.strftime('%I:%M %p')} ({session.timezone})</td>
                        </tr>
                        <tr>
                            <td style="padding:8px 0;color:#6b7280;font-size:14px;">Duration</td>
                            <td style="padding:8px 0;font-size:14px;">{session.duration_minutes} minutes</td>
                        </tr>
                        <tr>
                            <td style="padding:8px 0;color:#6b7280;font-size:14px;">Platform</td>
                            <td style="padding:8px 0;font-size:14px;">{session.platform.value}</td>
                        </tr>
                        {meeting_section}
                    </table>
                </div>

                <p style="font-size:13px;color:#9ca3af;margin-top:24px;">
                    Questions? Reply to this email or reach out at
                    <a href="mailto:reachout@augustineomaku.com" style="color:#8bc63f;">reachout@augustineomaku.com</a>
                </p>
            </div>
        </div>
        """

    def _build_contact_email_html(self, name: str, email: str, subject: str, message_body: str) -> str:
        """Build a clean HTML email for contact form submissions."""
        return f"""
        <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:600px;margin:0 auto;background:#ffffff;">
            <div style="background:#111827;padding:24px 32px;">
                <h1 style="margin:0;color:#8bc63f;font-size:20px;">New Contact Form Message</h1>
            </div>
            <div style="padding:32px;">
                <div style="background:#f9fafb;border-radius:8px;padding:20px;margin-bottom:24px;">
                    <table style="width:100%;border-collapse:collapse;">
                        <tr>
                            <td style="padding:8px 0;color:#6b7280;font-size:14px;width:100px;">From</td>
                            <td style="padding:8px 0;font-size:14px;font-weight:bold;">{name}</td>
                        </tr>
                        <tr>
                            <td style="padding:8px 0;color:#6b7280;font-size:14px;">Email</td>
                            <td style="padding:8px 0;font-size:14px;">
                                <a href="mailto:{email}" style="color:#8bc63f;">{email}</a>
                            </td>
                        </tr>
                        <tr>
                            <td style="padding:8px 0;color:#6b7280;font-size:14px;">Subject</td>
                            <td style="padding:8px 0;font-size:14px;">{subject}</td>
                        </tr>
                    </table>
                </div>
                <div style="font-size:14px;color:#374151;line-height:1.7;white-space:pre-wrap;">{message_body}</div>
                <p style="font-size:12px;color:#9ca3af;margin-top:32px;border-top:1px solid #e5e7eb;padding-top:16px;">
                    This message was sent via the contact form on augustineomaku.com.
                    Hit Reply to respond directly to {name}.
                </p>
            </div>
        </div>
        """

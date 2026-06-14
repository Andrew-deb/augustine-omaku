from pydantic import BaseModel, EmailStr, Field


class ContactCreate(BaseModel):
    """
    Validates the contact form submission from the frontend.

    Constraints:
    - name: 2-100 chars (handles most real names)
    - email: must be a valid email format
    - subject: 3-200 chars (prevents empty/spam subjects)
    - message: 10-5000 chars (ensures meaningful content)
    """
    name: str = Field(min_length=2, max_length=100)
    email: EmailStr
    subject: str = Field(min_length=3, max_length=200)
    message: str = Field(min_length=10, max_length=5000)


class ContactResponse(BaseModel):
    """Simple success response for contact form submissions."""
    success: bool = True
    message: str = "Your message has been sent successfully."

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator


class BookingCreate(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    email: EmailStr
    phone: str | None = Field(default=None, max_length=30)
    company: str | None = Field(default=None, max_length=150)
    goals: str = Field(min_length=10, max_length=1000)
    consent: bool

    @field_validator("consent")
    @classmethod
    def consent_must_be_true(cls, value: bool) -> bool:
        if not value:
            raise ValueError("Consent is required to register for a session.")
        return value


class BookingRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    session_id: str
    full_name: str
    email: EmailStr
    phone: str | None
    company_or_profession: str | None
    learning_goals: str
    consent: bool
    booking_reference: str
    status: Literal["confirmed", "waitlisted", "canceled"]
    created_at: datetime


class BookingSubmitResponse(BaseModel):
    booking_reference: str
    status: Literal["confirmed", "waitlisted", "canceled"]
    message: str
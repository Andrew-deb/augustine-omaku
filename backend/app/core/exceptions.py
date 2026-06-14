from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse


class AppException(Exception):
    """Base exception for all application errors."""

    def __init__(self, message: str = "An unexpected error occurred", detail: str | None = None):
        self.message = message
        self.detail = detail
        super().__init__(self.message)


class NotFoundError(AppException):
    """Resource not found — maps to HTTP 404."""

    def __init__(self, message: str = "Resource not found", detail: str | None = None):
        super().__init__(message, detail)


class ConflictError(AppException):
    """Duplicate or conflicting operation — maps to HTTP 409."""

    def __init__(self, message: str = "Conflict", detail: str | None = None):
        super().__init__(message, detail)


class CapacityFullError(AppException):
    """Session is at full capacity — maps to HTTP 409."""

    def __init__(self, message: str = "Session is full", detail: str | None = None):
        super().__init__(message, detail)


class ValidationError(AppException):
    """Business logic validation failure — maps to HTTP 422."""

    def __init__(self, message: str = "Validation error", detail: str | None = None):
        super().__init__(message, detail)


class ExternalServiceError(AppException):
    """External API failure (SendGrid, YouTube) — maps to HTTP 502."""

    def __init__(self, message: str = "External service error", detail: str | None = None):
        super().__init__(message, detail)


def _build_error_response(status_code: int, message: str, detail: str | None = None) -> JSONResponse:
    """Helper to construct a consistent JSON error body."""
    body = {"error": message}
    if detail:
        body["detail"] = detail
    return JSONResponse(status_code=status_code, content=body)


def register_exception_handlers(app: FastAPI) -> None:
    """Attach custom exception handlers to the FastAPI application.

    Once registered, raising any of our custom exceptions anywhere in
    the request lifecycle will automatically return the correct HTTP
    status code and a JSON body like: {"error": "...", "detail": "..."}.
    """

    @app.exception_handler(NotFoundError)
    async def not_found_handler(request: Request, exc: NotFoundError):
        return _build_error_response(404, exc.message, exc.detail)

    @app.exception_handler(ConflictError)
    async def conflict_handler(request: Request, exc: ConflictError):
        return _build_error_response(409, exc.message, exc.detail)

    @app.exception_handler(CapacityFullError)
    async def capacity_handler(request: Request, exc: CapacityFullError):
        return _build_error_response(409, exc.message, exc.detail)

    @app.exception_handler(ValidationError)
    async def validation_handler(request: Request, exc: ValidationError):
        return _build_error_response(422, exc.message, exc.detail)

    @app.exception_handler(ExternalServiceError)
    async def external_handler(request: Request, exc: ExternalServiceError):
        return _build_error_response(502, exc.message, exc.detail)

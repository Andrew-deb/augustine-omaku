import time

from fastapi import APIRouter, Request

from app.api.deps import DBSession
from app.core.rate_limit import limiter
from app.schemas.session import SessionRead
from app.services.session_service import SessionService

router = APIRouter()

# ── In-memory TTL cache for public sessions ─────────────
# Sessions rarely change, so we cache for 5 minutes to avoid
# hitting the database on every page load.
_sessions_cache: dict = {}
SESSIONS_CACHE_TTL = 300  # 5 minutes in seconds


def _invalidate_sessions_cache():
    """Call this when sessions are created/updated/deleted from admin routes."""
    _sessions_cache.clear()


def _session_to_read(session_obj, seats_remaining: int) -> SessionRead:
    """
    Convert a SQLAlchemy Session ORM object + computed seats_remaining
    into a SessionRead Pydantic model for the API response.

    We manually build the dict because:
    1. status and platform are Enums — we need .value (lowercase string)
    2. id is a UUID — we need str()
    3. seats_remaining is computed, not a column
    """
    return SessionRead(
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
        seats_remaining=seats_remaining,
    )


@router.get("", response_model=list[SessionRead])
@limiter.limit("30/minute")
async def list_sessions(request: Request, db: DBSession):
    """
    List all active sessions with computed seats remaining.

    This is the main endpoint consumed by the LiveSessions page.
    Returns sessions ordered by start date (ascending).

    Cached in-memory for 5 minutes. Cache is invalidated
    when admin creates/updates/deletes sessions.
    """
    # Check cache
    cached_at = _sessions_cache.get("timestamp", 0)
    if (time.time() - cached_at) < SESSIONS_CACHE_TTL and "data" in _sessions_cache:
        return _sessions_cache["data"]

    # Cache miss — query database
    service = SessionService(db)
    results = await service.list_sessions(active_only=True)
    sessions_list = [
        _session_to_read(item["session"], item["seats_remaining"])
        for item in results
    ]

    # Store in cache
    _sessions_cache["data"] = sessions_list
    _sessions_cache["timestamp"] = time.time()

    return sessions_list


@router.get("/{code}", response_model=SessionRead)
@limiter.limit("30/minute")
async def get_session(request: Request, code: str, db: DBSession):
    """
    Get a single session by its code (e.g., 'azure-bronze-gold').

    Also returns the computed seats_remaining.
    """
    service = SessionService(db)
    session = await service.get_session_by_code(code)
    remaining = await service._compute_seats_remaining(session)
    return _session_to_read(session, remaining)

"""
Admin authentication routes.

Provides a ``/me`` endpoint for the frontend to verify the current
admin session and retrieve the authenticated user's identity.

Note: This module intentionally does NOT apply ``require_admin`` at the
router level — the ``/me`` endpoint applies it per-route so that future
public auth endpoints (e.g. token refresh) can be added without conflict.
"""

from fastapi import APIRouter, Depends

from app.core.security import require_admin

router = APIRouter()


@router.get("/me", dependencies=[Depends(require_admin)])
async def get_current_admin(admin: dict = Depends(require_admin)):
    """Return the authenticated admin user's identity.

    The ``require_admin`` dependency validates the JWT and returns
    a dict containing at least ``email`` and ``sub`` claims.
    """
    return {
        "email": admin.get("email", ""),
        "authenticated": True,
    }

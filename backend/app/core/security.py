"""
Security dependencies for admin authentication.

The ``require_admin`` dependency will ultimately validate Supabase JWTs
and ensure the caller has admin privileges.  During development it
returns a stub payload so the protected routes can be exercised.
"""

from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

_bearer_scheme = HTTPBearer(auto_error=True)


async def require_admin(
    credentials: HTTPAuthorizationCredentials = Depends(_bearer_scheme),
) -> dict:
    """Validate the incoming JWT and return admin user info.

    TODO: Replace stub with real Supabase JWT validation using
    ``python-jose`` and ``SUPABASE_JWT_SECRET``.

    Returns a dict with at least ``{"email": ..., "sub": ...}``.
    """
    # ── Stub implementation ──────────────────────────────────────────
    # Accept any bearer token and return a placeholder admin identity.
    # This will be replaced with proper JWT decoding.
    return {
        "sub": "admin-placeholder",
        "email": "admin@example.com",
    }

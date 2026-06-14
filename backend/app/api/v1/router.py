from fastapi import APIRouter

from app.api.v1.routes import bookings, contact, sessions, youtube
from app.api.v1.routes import (
    admin_auth,
    admin_sessions,
    admin_bookings,
    admin_analytics,
    admin_notifications,
    admin_upload,
)
# from app.api.v1.routes.health import router as health_router


api_router = APIRouter()
# api_router.include_router(health_router, tags=["health"])
api_router.include_router(sessions.router, prefix="/sessions", tags=["sessions"])
api_router.include_router(bookings.router, prefix="/bookings", tags=["bookings"])
api_router.include_router(youtube.router, prefix="/youtube", tags=["youtube"])
api_router.include_router(contact.router, prefix="/contact", tags=["contact"])

# ── Admin Dashboard Routes ───────────────────────────────────────────
api_router.include_router(admin_auth.router, prefix="/admin/auth", tags=["admin-auth"])
api_router.include_router(admin_sessions.router, prefix="/admin/sessions", tags=["admin-sessions"])
api_router.include_router(admin_bookings.router, prefix="/admin/bookings", tags=["admin-bookings"])
api_router.include_router(admin_analytics.router, prefix="/admin/analytics", tags=["admin-analytics"])
api_router.include_router(admin_notifications.router, prefix="/admin/notifications", tags=["admin-notifications"])
api_router.include_router(admin_upload.router, prefix="/admin/upload", tags=["admin-upload"])
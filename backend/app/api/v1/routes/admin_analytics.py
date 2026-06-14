"""
Admin analytics routes.

Exposes dashboard analytics: overview KPIs, booking trend over time,
and per-session breakdowns. All endpoints require admin authentication.
"""

from fastapi import APIRouter, Depends, Query

from app.api.deps import DBSession
from app.core.security import require_admin
from app.schemas.admin import BookingTrendPoint, OverviewStats, SessionBreakdown
from app.services.analytics_service import AnalyticsService

router = APIRouter(dependencies=[Depends(require_admin)])


@router.get("/overview", response_model=OverviewStats)
async def get_overview(db: DBSession):
    """Return high-level KPIs for the admin dashboard overview cards.

    Includes total/active sessions, booking counts by status, and
    the overall fill rate across all active sessions.
    """
    service = AnalyticsService(db)
    return await service.get_overview()


@router.get("/bookings-trend", response_model=list[BookingTrendPoint])
async def get_bookings_trend(
    db: DBSession,
    days: int = Query(default=30, ge=1, le=365, description="Number of days to look back"),
):
    """Return daily booking counts for the specified time window.

    Produces a contiguous date series (zero-filled for days with no
    bookings) suitable for rendering as a line or bar chart.
    """
    service = AnalyticsService(db)
    return await service.get_bookings_trend(days=days)


@router.get("/sessions-breakdown", response_model=list[SessionBreakdown])
async def get_sessions_breakdown(db: DBSession):
    """Return per-session booking breakdown with fill rates.

    Each item includes confirmed, waitlisted, and canceled counts
    alongside the session capacity and computed fill rate.
    """
    service = AnalyticsService(db)
    return await service.get_sessions_breakdown()

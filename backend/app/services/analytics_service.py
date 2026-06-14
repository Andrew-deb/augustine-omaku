"""
Analytics service for the admin dashboard.

Aggregates booking and session data into the statistics consumed
by the overview cards, trend charts, and session-breakdown tables.
"""

from datetime import datetime, timedelta, timezone

from sqlalchemy import case, cast, func, select, Date
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Booking, BookingStatus, Session, SessionStatus
from app.schemas.admin import BookingTrendPoint, OverviewStats, SessionBreakdown


class AnalyticsService:
    """Computes analytics aggregations over sessions and bookings."""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_overview(self) -> OverviewStats:
        """Return high-level KPIs for the dashboard overview cards."""

        # ── Session counts ───────────────────────────────────────────
        session_q = select(
            func.count().label("total"),
            func.count().filter(Session.is_active.is_(True)).label("active"),
        ).select_from(Session)
        session_result = await self.db.execute(session_q)
        session_row = session_result.one()

        # ── Booking counts by status ─────────────────────────────────
        booking_q = select(
            func.count().label("total"),
            func.count().filter(Booking.status == BookingStatus.CONFIRMED).label("confirmed"),
            func.count().filter(Booking.status == BookingStatus.WAITLISTED).label("waitlisted"),
            func.count().filter(Booking.status == BookingStatus.CANCELED).label("canceled"),
        ).select_from(Booking)
        booking_result = await self.db.execute(booking_q)
        booking_row = booking_result.one()

        # ── Overall fill rate ────────────────────────────────────────
        capacity_q = select(func.coalesce(func.sum(Session.capacity), 0)).where(
            Session.is_active.is_(True)
        )
        capacity_result = await self.db.execute(capacity_q)
        total_capacity = capacity_result.scalar() or 0

        overall_fill_rate = 0.0
        if total_capacity > 0:
            overall_fill_rate = round(booking_row.confirmed / total_capacity * 100, 1)

        return OverviewStats(
            total_sessions=session_row.total,
            active_sessions=session_row.active,
            total_bookings=booking_row.total,
            confirmed_bookings=booking_row.confirmed,
            waitlisted_bookings=booking_row.waitlisted,
            canceled_bookings=booking_row.canceled,
            overall_fill_rate=overall_fill_rate,
        )

    async def get_bookings_trend(self, days: int = 30) -> list[BookingTrendPoint]:
        """Return daily booking counts for the last *days* days.

        Returns a contiguous date series (including days with zero bookings)
        so frontend charts render smoothly without gaps.
        """
        cutoff = datetime.now(timezone.utc) - timedelta(days=days)

        query = (
            select(
                cast(Booking.created_at, Date).label("date"),
                func.count().label("count"),
            )
            .where(Booking.created_at >= cutoff)
            .group_by(cast(Booking.created_at, Date))
            .order_by(cast(Booking.created_at, Date))
        )
        result = await self.db.execute(query)
        rows = {str(row.date): row.count for row in result.all()}

        # Build contiguous series
        trend: list[BookingTrendPoint] = []
        for i in range(days):
            date = (cutoff + timedelta(days=i + 1)).date()
            date_str = str(date)
            trend.append(BookingTrendPoint(date=date_str, count=rows.get(date_str, 0)))
        return trend

    async def get_sessions_breakdown(self) -> list[SessionBreakdown]:
        """Return per-session booking counts and fill rates."""
        query = (
            select(
                Session.code,
                Session.title,
                Session.capacity,
                func.count(Booking.id).label("total"),
                func.count(case((Booking.status == BookingStatus.CONFIRMED, 1))).label("confirmed"),
                func.count(case((Booking.status == BookingStatus.WAITLISTED, 1))).label("waitlisted"),
                func.count(case((Booking.status == BookingStatus.CANCELED, 1))).label("canceled"),
            )
            .outerjoin(Booking, Booking.session_id == Session.id)
            .group_by(Session.id, Session.code, Session.title, Session.capacity)
            .order_by(Session.starts_at.desc())
        )
        result = await self.db.execute(query)

        breakdowns: list[SessionBreakdown] = []
        for row in result.all():
            fill = round(row.confirmed / row.capacity * 100, 1) if row.capacity else 0.0
            breakdowns.append(
                SessionBreakdown(
                    session_code=row.code,
                    session_title=row.title,
                    confirmed=row.confirmed,
                    waitlisted=row.waitlisted,
                    canceled=row.canceled,
                    capacity=row.capacity,
                    fill_rate=fill,
                )
            )
        return breakdowns

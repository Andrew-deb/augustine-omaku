from fastapi import APIRouter, Request

from app.core.rate_limit import limiter
from app.schemas.youtube import ChannelStats, YouTubeResponse
from app.services.youtube_service import YouTubeService

router = APIRouter()


@router.get("/playlists", response_model=YouTubeResponse)
@limiter.limit("30/minute")
async def get_playlists(request: Request):
    """
    Fetch all YouTube playlists with channel stats.

    Returns cached data if available (cache TTL: 6 hours).
    Includes channel_stats (subscriber count) for StatsCounter.
    """
    service = YouTubeService()
    return await service.get_playlists()


@router.get("/channel-stats", response_model=ChannelStats)
@limiter.limit("30/minute")
async def get_channel_stats(request: Request):
    """
    Fetch channel statistics only (subscriber count, total views).

    Lighter endpoint for components like StatsCounter that only
    need the subscriber count without all the playlist data.
    Uses its own cache — costs only 1 quota unit per cache miss.
    """
    service = YouTubeService()
    return await service.get_channel_stats()

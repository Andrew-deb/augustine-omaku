import logging
import time
from datetime import datetime

import httpx

from app.configs import get_settings
from app.core.exceptions import ExternalServiceError
from app.schemas.youtube import ChannelStats, PlaylistItem, PlaylistRead, YouTubeResponse

logger = logging.getLogger(__name__)
settings = get_settings()

YT_API_BASE = "https://www.googleapis.com/youtube/v3"

# ── In-memory cache ────────────────────────────────
_cache: dict[str, dict] = {}


def _is_cache_valid(cache_key: str) -> bool:
    if cache_key not in _cache:
        return False
    cached_at = _cache[cache_key].get("timestamp", 0)
    return (time.time() - cached_at) < settings.YOUTUBE_CACHE_TTL_SECONDS


def _get_best_thumbnail(thumbnails: dict) -> str:
    for quality in ("maxres", "high", "medium", "default"):
        if quality in thumbnails:
            return thumbnails[quality].get("url", "")
    return ""


# ── Category Derivation ────────────────────────────
# Maps keywords found in playlist titles to category labels.
# Order matters — first match wins.
CATEGORY_KEYWORDS = [
    (["dax"], "DAX"),
    (["excel"], "Excel"),
    (["power bi service"], "Power BI"),
    (["power bi"], "Power BI"),
    (["visualization", "visualisation"], "Visualization"),
    (["transformation", "modeling", "modelling"], "Data Modeling"),
    (["financial"], "Analysis"),
    (["business analytics", "analytics"], "Analytics"),
    (["analysis"], "Analysis"),
    (["sql"], "SQL"),
    (["azure"], "Azure"),
    (["python"], "Python"),
]


def _derive_category(title: str) -> str:
    """
    Extract a category tag from a playlist title using keyword matching.

    Examples:
      "DAX Time Intelligence" → "DAX"
      "Master Data Visualization with Power BI" → "Visualization"
      "Excel Series" → "Excel"
    """
    title_lower = title.lower()
    for keywords, category in CATEGORY_KEYWORDS:
        if any(kw in title_lower for kw in keywords):
            return category
    return "General"


class YouTubeService:
    """
    Fetches playlist data and channel stats from YouTube Data API v3.

    Features:
    - Channel-based auto-discovery
    - Category derivation from titles
    - Channel subscriber/view stats
    - In-memory TTL caching (default: 6 hours)
    """

    def __init__(self):
        self.api_key = settings.YOUTUBE_API_KEY
        self.channel_id = settings.YOUTUBE_CHANNEL_ID

    async def get_playlists(self) -> YouTubeResponse:
        """Fetch all playlists with stats. Returns cached data if fresh."""
        if not self.api_key:
            raise ExternalServiceError(
                message="YouTube API key is not configured.",
                detail="Set YOUTUBE_API_KEY in your .env file.",
            )

        cache_key = f"playlists_{self.channel_id or 'explicit'}"

        if _is_cache_valid(cache_key):
            logger.debug("YouTube cache hit for %s", cache_key)
            cached_response = _cache[cache_key]["data"]
            cached_response.cached = True
            return cached_response

        logger.info("YouTube cache miss — fetching from API")
        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                # Fetch channel stats (1 quota unit)
                channel_stats = None
                if self.channel_id:
                    channel_stats = await self._fetch_channel_stats(client)

                # Fetch playlists (1 quota unit per page)
                playlists = await self._fetch_playlists(client)

                # Fetch videos for each playlist (1 unit each)
                for playlist in playlists:
                    playlist.videos = await self._fetch_playlist_items(client, playlist.playlist_id)

            response = YouTubeResponse(
                channel_id=self.channel_id or "explicit",
                channel_stats=channel_stats,
                playlists=playlists,
                cached=False,
            )

            _cache[cache_key] = {
                "data": response,
                "timestamp": time.time(),
            }
            return response

        except ExternalServiceError:
            raise
        except Exception as e:
            logger.error("YouTube API error: %s", str(e))
            raise ExternalServiceError(
                message="Failed to fetch YouTube playlists.",
                detail=str(e),
            )

    async def get_channel_stats(self) -> ChannelStats:
        """
        Fetch only channel stats (for StatsCounter).
        Uses the same cache as get_playlists.
        """
        if not self.api_key or not self.channel_id:
            raise ExternalServiceError(
                message="YouTube API key or channel ID not configured.",
            )

        cache_key = f"channel_stats_{self.channel_id}"

        if _is_cache_valid(cache_key):
            return _cache[cache_key]["data"]

        async with httpx.AsyncClient(timeout=15.0) as client:
            stats = await self._fetch_channel_stats(client)

        _cache[cache_key] = {"data": stats, "timestamp": time.time()}
        return stats

    # ── Private: API calls ──────────────────────────

    async def _fetch_channel_stats(self, client: httpx.AsyncClient) -> ChannelStats:
        """Fetch channel-level statistics (subscriber count, views, videos)."""
        params = {
            "part": "snippet,statistics",
            "id": self.channel_id,
            "key": self.api_key,
        }
        resp = await client.get(f"{YT_API_BASE}/channels", params=params)
        if resp.status_code != 200:
            raise ExternalServiceError(
                message="YouTube API error fetching channel stats.",
                detail=f"Status {resp.status_code}: {resp.text[:200]}",
            )

        data = resp.json()
        items = data.get("items", [])
        if not items:
            raise ExternalServiceError(
                message=f"Channel '{self.channel_id}' not found.",
            )

        channel = items[0]
        snippet = channel.get("snippet", {})
        stats = channel.get("statistics", {})

        return ChannelStats(
            channel_id=self.channel_id,
            channel_title=snippet.get("title", ""),
            subscriber_count=int(stats.get("subscriberCount", 0)),
            total_video_count=int(stats.get("videoCount", 0)),
            total_view_count=int(stats.get("viewCount", 0)),
        )

    async def _fetch_playlists(self, client: httpx.AsyncClient) -> list[PlaylistRead]:
        """Fetch playlists via channel discovery or explicit IDs."""
        if self.channel_id:
            return await self._fetch_channel_playlists(client)
        elif settings.YOUTUBE_PLAYLIST_IDS:
            return await self._fetch_explicit_playlists(client)
        else:
            raise ExternalServiceError(
                message="No YouTube channel or playlist IDs configured.",
            )

    async def _fetch_channel_playlists(self, client: httpx.AsyncClient) -> list[PlaylistRead]:
        """Discover all public playlists for the configured channel."""
        playlists = []
        page_token = None

        while True:
            params = {
                "part": "snippet,contentDetails",
                "channelId": self.channel_id,
                "maxResults": 25,
                "key": self.api_key,
            }
            if page_token:
                params["pageToken"] = page_token

            resp = await client.get(f"{YT_API_BASE}/playlists", params=params)
            if resp.status_code != 200:
                raise ExternalServiceError(
                    message="YouTube API error fetching playlists.",
                    detail=f"Status {resp.status_code}: {resp.text[:200]}",
                )

            data = resp.json()
            for item in data.get("items", []):
                snippet = item.get("snippet", {})
                content = item.get("contentDetails", {})
                published = snippet.get("publishedAt")
                title = snippet.get("title", "")
                pid = item["id"]

                playlists.append(PlaylistRead(
                    playlist_id=pid,
                    title=title,
                    description=snippet.get("description", ""),
                    thumbnail_url=_get_best_thumbnail(snippet.get("thumbnails", {})),
                    video_count=content.get("itemCount", 0),
                    category=_derive_category(title),
                    playlist_url=f"https://www.youtube.com/playlist?list={pid}",
                    published_at=datetime.fromisoformat(published.replace("Z", "+00:00")) if published else None,
                ))

            page_token = data.get("nextPageToken")
            if not page_token:
                break

        return playlists

    async def _fetch_explicit_playlists(self, client: httpx.AsyncClient) -> list[PlaylistRead]:
        """Fetch specific playlists by their IDs."""
        ids_str = ",".join(settings.YOUTUBE_PLAYLIST_IDS)
        params = {
            "part": "snippet,contentDetails",
            "id": ids_str,
            "key": self.api_key,
        }
        resp = await client.get(f"{YT_API_BASE}/playlists", params=params)
        if resp.status_code != 200:
            raise ExternalServiceError(
                message="YouTube API error fetching playlists.",
                detail=f"Status {resp.status_code}: {resp.text[:200]}",
            )

        data = resp.json()
        playlists = []
        for item in data.get("items", []):
            snippet = item.get("snippet", {})
            content = item.get("contentDetails", {})
            published = snippet.get("publishedAt")
            title = snippet.get("title", "")
            pid = item["id"]

            playlists.append(PlaylistRead(
                playlist_id=pid,
                title=title,
                description=snippet.get("description", ""),
                thumbnail_url=_get_best_thumbnail(snippet.get("thumbnails", {})),
                video_count=content.get("itemCount", 0),
                category=_derive_category(title),
                playlist_url=f"https://www.youtube.com/playlist?list={pid}",
                published_at=datetime.fromisoformat(published.replace("Z", "+00:00")) if published else None,
            ))

        return playlists

    async def _fetch_playlist_items(self, client: httpx.AsyncClient, playlist_id: str, max_items: int = 10) -> list[PlaylistItem]:
        """Fetch individual videos within a playlist (up to max_items)."""
        params = {
            "part": "snippet",
            "playlistId": playlist_id,
            "maxResults": max_items,
            "key": self.api_key,
        }
        resp = await client.get(f"{YT_API_BASE}/playlistItems", params=params)
        if resp.status_code != 200:
            logger.warning("Failed to fetch items for playlist %s: %s", playlist_id, resp.status_code)
            return []

        data = resp.json()
        items = []
        for item in data.get("items", []):
            snippet = item.get("snippet", {})
            resource = snippet.get("resourceId", {})
            published = snippet.get("publishedAt")

            items.append(PlaylistItem(
                video_id=resource.get("videoId", ""),
                title=snippet.get("title", ""),
                description=snippet.get("description", "")[:300],
                thumbnail_url=_get_best_thumbnail(snippet.get("thumbnails", {})),
                published_at=datetime.fromisoformat(published.replace("Z", "+00:00")) if published else None,
                position=snippet.get("position", 0),
            ))

        return items

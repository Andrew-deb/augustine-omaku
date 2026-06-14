from datetime import datetime

from pydantic import BaseModel


class PlaylistItem(BaseModel):
    """A single video within a playlist."""
    video_id: str
    title: str
    description: str
    thumbnail_url: str
    published_at: datetime | None = None
    position: int


class PlaylistRead(BaseModel):
    """
    A YouTube playlist with its videos.

    Fields mapped to frontend needs:
    - video_count → item.videos (badge count)
    - category → item.category (derived from title keywords)
    - playlist_url → item.url (link to YouTube playlist)
    - thumbnail_url → item.img (playlist cover)
    """
    playlist_id: str
    title: str
    description: str
    thumbnail_url: str
    video_count: int
    category: str = ""
    playlist_url: str = ""
    published_at: datetime | None = None
    videos: list[PlaylistItem] = []


class ChannelStats(BaseModel):
    """
    Channel-level statistics for the StatsCounter component.

    subscriber_count → replaces the hardcoded '360+' in StatsCounter
    total_video_count → total videos across the channel
    total_view_count → total views across the channel
    """
    channel_id: str
    channel_title: str
    subscriber_count: int
    total_video_count: int
    total_view_count: int


class YouTubeResponse(BaseModel):
    """Top-level response from the YouTube playlists endpoint."""
    channel_id: str
    channel_stats: ChannelStats | None = None
    playlists: list[PlaylistRead]
    cached: bool = False

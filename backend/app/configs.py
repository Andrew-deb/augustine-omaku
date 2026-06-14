from functools import lru_cache
from typing import List

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )

    APP_NAME: str = "Augustine Portfolio API"
    APP_ENV: str = "development"
    APP_VERSION: str = "0.1.0"
    API_V1_PREFIX: str = "/api/v1"

    DATABASE_URL: str

    SENDGRID_API_KEY: str
    FROM_EMAIL: str
    CONTACT_EMAIL: str

    NEXT_PUBLIC_SITE_URL: str = "http://localhost:5173"

    SUPABASE_URL: str = ""
    SUPABASE_ANON_KEY: str = ""
    SUPABASE_JWT_SECRET: str = ""

    YOUTUBE_API_KEY: str = ""
    YOUTUBE_CHANNEL_ID: str = ""
    YOUTUBE_PLAYLIST_IDS: List[str] = Field(default_factory=list)
    YOUTUBE_CACHE_TTL_SECONDS: int = 21600  # 6 hours

    ADMIN_API_KEY: str = ""

    IMAGEKIT_PRIVATE_KEY: str = ""
    IMAGEKIT_PUBLIC_KEY: str = ""
    IMAGEKIT_URL_ENDPOINT: str = ""


    ALLOWED_ORIGINS: List[str] = Field(default_factory=lambda: [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ])

    @classmethod
    def model_validate(cls, obj, *args, **kwargs):
        data = dict(obj) if isinstance(obj, dict) else obj
        if isinstance(data, dict):
            raw_origins = data.get("ALLOWED_ORIGINS")
            if isinstance(raw_origins, str):
                data["ALLOWED_ORIGINS"] = [o.strip() for o in raw_origins.split(",") if o.strip()]

            raw_playlist_ids = data.get("YOUTUBE_PLAYLIST_IDS")
            if isinstance(raw_playlist_ids, str):
                data["YOUTUBE_PLAYLIST_IDS"] = [p.strip() for p in raw_playlist_ids.split(",") if p.strip()]

        return super().model_validate(data, *args, **kwargs)


@lru_cache
def get_settings() -> Settings:
    return Settings()
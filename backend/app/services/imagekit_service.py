"""
ImageKit.io upload service for session display images.

Uploads images to ImageKit via their REST API and returns
the CDN URL + file ID for storage in our database.
"""

import base64
import logging

import httpx

from app.configs import get_settings

logger = logging.getLogger(__name__)

settings = get_settings()

# ImageKit upload URL (server-side)
IMAGEKIT_UPLOAD_URL = "https://upload.imagekit.io/api/v1/files/upload"


class ImageKitService:
    """Handles image uploads to ImageKit.io."""

    @staticmethod
    async def upload(
        file_bytes: bytes,
        file_name: str,
        folder: str = "/portfolio/sessions",
    ) -> dict:
        """
        Upload an image to ImageKit.

        Args:
            file_bytes: Raw image bytes
            file_name: Original filename (e.g., "azure-session.png")
            folder: ImageKit folder path (default: "/sessions")

        Returns:
            dict with 'url', 'file_id', 'thumbnail_url'
        """
        if not settings.IMAGEKIT_PRIVATE_KEY:
            raise ValueError(
                "ImageKit is not configured. Set IMAGEKIT_PRIVATE_KEY in .env"
            )

        # ImageKit uses HTTP Basic Auth: private_key as username, empty password
        auth_string = base64.b64encode(
            f"{settings.IMAGEKIT_PRIVATE_KEY}:".encode()
        ).decode()

        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                IMAGEKIT_UPLOAD_URL,
                headers={"Authorization": f"Basic {auth_string}"},
                data={
                    "fileName": file_name,
                    "folder": folder,
                    "useUniqueFileName": "true",
                },
                files={"file": (file_name, file_bytes)},
            )

            if response.status_code != 200:
                logger.error(
                    "ImageKit upload failed: %s %s",
                    response.status_code,
                    response.text,
                )
                raise ValueError(f"ImageKit upload failed: {response.text}")

            data = response.json()

            return {
                "url": data["url"],
                "file_id": data["fileId"],
                "thumbnail_url": data.get("thumbnailUrl", data["url"]),
            }

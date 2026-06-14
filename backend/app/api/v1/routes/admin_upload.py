"""
Admin image upload endpoint.

Accepts a multipart file upload, sends it to ImageKit.io,
and returns the CDN URL for use in session forms.
"""

import logging

from fastapi import APIRouter, Depends, File, UploadFile, HTTPException

from app.core.security import require_admin
from app.services.imagekit_service import ImageKitService

logger = logging.getLogger(__name__)

router = APIRouter(dependencies=[Depends(require_admin)])

# Max 5MB
MAX_FILE_SIZE = 5 * 1024 * 1024
ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}


@router.post("/image")
async def upload_image(file: UploadFile = File(...)):
    """
    Upload a session display image to ImageKit.

    Accepts: multipart/form-data with a 'file' field.
    Returns: { url, file_id, thumbnail_url }

    The returned `url` should be stored as `image_url` in the session.
    """
    # Validate content type
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type '{file.content_type}'. Allowed: JPEG, PNG, WebP, GIF.",
        )

    # Read and validate size
    file_bytes = await file.read()
    if len(file_bytes) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail=f"File too large ({len(file_bytes) // 1024}KB). Maximum is 5MB.",
        )

    try:
        result = await ImageKitService.upload(
            file_bytes=file_bytes,
            file_name=file.filename or "session-image.jpg",
            folder="/sessions",
        )
        return result
    except ValueError as e:
        logger.error("Image upload failed: %s", str(e))
        raise HTTPException(status_code=502, detail=str(e))

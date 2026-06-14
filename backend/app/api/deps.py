from typing import Annotated

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.db import get_db

# Reusable type alias for database session dependency injection.
#
# Usage in route handlers:
#   async def my_route(db: DBSession):
#       result = await db.execute(...)
#
# This is equivalent to:
#   async def my_route(db: AsyncSession = Depends(get_db)):
#
# But shorter, DRY, and easier to refactor.
DBSession = Annotated[AsyncSession, Depends(get_db)]

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware

from app.api.v1.router import api_router
from app.configs import get_settings
from app.core.db import engine
from app.core.exceptions import register_exception_handlers
from app.core.rate_limit import limiter


settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Manages the application lifecycle.

    - Before yield (startup): nothing needed — the SQLAlchemy engine
      and connection pool are created at import time in core/db.py.
    - After yield (shutdown): dispose the engine to release all
      database connections back to Supabase.
    """
    yield
    await engine.dispose()


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    lifespan=lifespan,
)

# ──────────────────────────────────────────────
# Middleware (order matters — first added = outermost)
# ──────────────────────────────────────────────

# 1. CORS — must be outermost so CORS headers appear on ALL responses,
#    including rate-limit 429s and error responses.
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 2. Rate limiting — intercepts requests to enforce per-route limits.
#    Stores the limiter instance on app.state so route decorators can find it.
app.state.limiter = limiter
app.add_middleware(SlowAPIMiddleware)

# ──────────────────────────────────────────────
# Exception handlers
# ──────────────────────────────────────────────

# slowapi's built-in handler for 429 Too Many Requests
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Our custom exception handlers (404, 409, 422, 502)
register_exception_handlers(app)

# ──────────────────────────────────────────────
# Routes
# ──────────────────────────────────────────────

app.include_router(api_router, prefix=settings.API_V1_PREFIX)


@app.get("/")
async def root():
    return {
        "name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "environment": settings.APP_ENV,
    }

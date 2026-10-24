import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config import settings
from app.database import engine, Base, SessionLocal, upgrade_schema
from app.models.seed_data import seed_initial_data

# Import all models so SQLAlchemy creates tables
import app.models  # noqa: F401 — registers all ORM models

# Import API routers
from app.api.auth import router as auth_router
from app.api.models import router as models_router
from app.api.upload import router as upload_router
from app.api.castings import router as castings_router
from app.api.messaging import router as messaging_router
from app.api.analytics import router as analytics_router
from app.api.discover import router as discover_router
from app.api.admin import router as admin_router
from app.api.bookings import router as bookings_router
from app.api.shortlists import router as shortlists_router
from app.api.agencies import router as agencies_router
from app.api.call_sheets import router as call_sheets_router
from app.api.calendar import router as calendar_router
from app.api.finances import router as finances_router
from app.api.notifications import router as notifications_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: ensure tables exist and seed initial demo data
    Base.metadata.create_all(bind=engine)
    upgrade_schema()
    db = SessionLocal()
    try:
        seed_initial_data(db)
    finally:
        db.close()
    yield
    # Shutdown logic if needed

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Professional Model Network & Talent Discovery Platform API",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # open for dev; supports http://localhost:3000
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static Files for Uploads
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# Mount Routers
app.include_router(auth_router, prefix=settings.API_V1_STR)
app.include_router(models_router, prefix=settings.API_V1_STR)
app.include_router(upload_router, prefix=settings.API_V1_STR)
app.include_router(castings_router, prefix=settings.API_V1_STR)
app.include_router(messaging_router, prefix=settings.API_V1_STR)
app.include_router(analytics_router, prefix=settings.API_V1_STR)
app.include_router(discover_router, prefix=settings.API_V1_STR)
app.include_router(admin_router, prefix=settings.API_V1_STR)
app.include_router(bookings_router, prefix=settings.API_V1_STR)
app.include_router(shortlists_router, prefix=settings.API_V1_STR)
app.include_router(agencies_router, prefix=settings.API_V1_STR)
app.include_router(call_sheets_router, prefix=settings.API_V1_STR)
app.include_router(calendar_router, prefix=settings.API_V1_STR)
app.include_router(finances_router, prefix=settings.API_V1_STR)
app.include_router(notifications_router, prefix=settings.API_V1_STR)

@app.get("/api/health", tags=["Health"])
def health_check():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "database": "connected",
        "version": "1.0.0",
        "phase": "Phase 6 - Live Notifications, Multi-Role Dashboards & Demo Presentation Active"
    }

"""
Phase 3 — Analytics API
Endpoints for tracking and retrieving profile analytics.
"""
from datetime import datetime, timezone, timedelta
from typing import Optional
from fastapi import APIRouter, Depends, Request, Query
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database import get_db
from app.security import get_current_user, get_optional_current_user
from app.models.analytics import ProfileView
from app.models.model_profile import ModelProfile
from app.models.casting import CastingApplication, CastingCall
from app.models.user import User

router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.post("/view/{username}", summary="Track a profile view", include_in_schema=False)
def track_profile_view(
    username: str,
    request: Request,
    viewer: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db),
):
    profile = db.query(ModelProfile).filter(ModelProfile.username == username).first()
    if not profile:
        return {"tracked": False}
    # Avoid double-counting same viewer within a session (simple: skip owner self-views)
    if viewer and viewer.id == profile.user_id:
        return {"tracked": False}
    pv = ProfileView(
        profile_id=profile.id,
        viewer_id=viewer.id if viewer else None,
        viewer_role=viewer.role if viewer else "anonymous",
        viewer_ip=request.client.host if request.client else None,
    )
    db.add(pv)
    db.commit()
    return {"tracked": True}


@router.get("/model/stats", summary="Model — own analytics summary")
def model_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    profile = db.query(ModelProfile).filter(ModelProfile.user_id == current_user.id).first()
    if not profile:
        return {"error": "No model profile found."}

    now = datetime.now(timezone.utc)
    thirty_days_ago = now - timedelta(days=30)
    seven_days_ago = now - timedelta(days=7)

    total_views = db.query(func.count(ProfileView.id)).filter(ProfileView.profile_id == profile.id).scalar() or 0
    views_30d = db.query(func.count(ProfileView.id)).filter(
        ProfileView.profile_id == profile.id,
        ProfileView.viewed_at >= thirty_days_ago
    ).scalar() or 0
    views_7d = db.query(func.count(ProfileView.id)).filter(
        ProfileView.profile_id == profile.id,
        ProfileView.viewed_at >= seven_days_ago
    ).scalar() or 0

    # Viewer breakdown by role
    viewer_breakdown = db.query(
        ProfileView.viewer_role, func.count(ProfileView.id).label("count")
    ).filter(ProfileView.profile_id == profile.id).group_by(ProfileView.viewer_role).all()

    # Casting applications
    total_applications = db.query(func.count(CastingApplication.id)).filter(
        CastingApplication.applicant_id == current_user.id
    ).scalar() or 0
    shortlisted = db.query(func.count(CastingApplication.id)).filter(
        CastingApplication.applicant_id == current_user.id,
        CastingApplication.status == "shortlisted"
    ).scalar() or 0
    selected = db.query(func.count(CastingApplication.id)).filter(
        CastingApplication.applicant_id == current_user.id,
        CastingApplication.status == "selected"
    ).scalar() or 0

    # Daily views for last 30 days chart
    daily = db.query(
        func.date(ProfileView.viewed_at).label("date"),
        func.count(ProfileView.id).label("views")
    ).filter(
        ProfileView.profile_id == profile.id,
        ProfileView.viewed_at >= thirty_days_ago
    ).group_by(func.date(ProfileView.viewed_at)).order_by("date").all()

    return {
        "profile_completion": profile.profile_completion_percentage,
        "availability": profile.availability_status,
        "views": {
            "total": total_views,
            "last_30_days": views_30d,
            "last_7_days": views_7d,
        },
        "viewer_breakdown": {row.viewer_role: row.count for row in viewer_breakdown},
        "castings": {
            "applied": total_applications,
            "shortlisted": shortlisted,
            "selected": selected,
        },
        "daily_views": [{"date": str(row.date), "views": row.views} for row in daily],
    }


@router.get("/brand/stats", summary="Brand — own casting analytics")
def brand_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    castings = db.query(CastingCall).filter(CastingCall.poster_id == current_user.id).all()
    total_castings = len(castings)
    active_castings = sum(1 for c in castings if c.status == "active")
    total_views = sum(c.views_count or 0 for c in castings)
    total_applications = sum(c.applications_count or 0 for c in castings)

    casting_summaries = []
    for c in castings[:10]:  # top 10
        app_counts = db.query(
            CastingApplication.status,
            func.count(CastingApplication.id).label("count")
        ).filter(CastingApplication.casting_call_id == c.id).group_by(CastingApplication.status).all()
        casting_summaries.append({
            "id": c.id,
            "title": c.title,
            "status": c.status,
            "views": c.views_count,
            "applications": c.applications_count,
            "application_breakdown": {row.status: row.count for row in app_counts},
        })

    return {
        "total_castings": total_castings,
        "active_castings": active_castings,
        "total_views": total_views,
        "total_applications": total_applications,
        "casting_summaries": casting_summaries,
    }

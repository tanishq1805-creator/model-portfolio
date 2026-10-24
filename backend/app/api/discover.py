"""
Phase 3 — Advanced Discover / Search API
Structured model search with filters + optional AI match scoring.
"""
from typing import Optional, List
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.security import get_optional_current_user
from app.models.model_profile import ModelProfile
from app.models.user import User
from app.services.matching import calculate_match_score

router = APIRouter(prefix="/discover", tags=["Discover"])


def profile_to_card(p: ModelProfile) -> dict:
    return {
        "username": p.username,
        "full_name": p.full_name,
        "profile_photo": p.profile_photo,
        "city": p.city,
        "location": p.location,
        "model_type": p.model_type,
        "experience_level": p.experience_level,
        "height_cm": p.height_cm,
        "height_feet_inches": p.height_feet_inches,
        "agency_name": p.agency_name,
        "agency_status": p.agency_status,
        "availability_status": p.availability_status,
        "skills": p.skills,
        "gender": p.gender,
        "is_identity_verified": p.is_identity_verified,
        "is_portfolio_verified": p.is_portfolio_verified,
        "profile_completion_percentage": p.profile_completion_percentage,
        "portfolio_preview": [
            {"url": item.media_url, "category": item.category}
            for item in (p.portfolio_items or [])[:3]
        ],
    }


@router.get("", summary="Discover models with filters + optional AI match scoring")
def discover_models(
    # Filters
    search: Optional[str] = Query(None, description="Full-text search on name, bio, skills"),
    model_type: Optional[str] = Query(None, description="Fashion, Runway, Commercial ..."),
    location: Optional[str] = Query(None, description="City or country keyword"),
    gender: Optional[str] = Query(None),
    min_height_cm: Optional[float] = Query(None),
    max_height_cm: Optional[float] = Query(None),
    experience_level: Optional[str] = Query(None),
    availability: Optional[str] = Query(None, description="available, partially_available"),
    verified_only: bool = Query(False),
    has_agency: Optional[bool] = Query(None),
    skills: Optional[str] = Query(None, description="Comma-separated skill keywords"),
    # AI match — provide a casting context
    match_category: Optional[str] = Query(None),
    match_location: Optional[str] = Query(None),
    match_is_remote: bool = Query(False),
    match_experience: Optional[str] = Query(None),
    match_skills: Optional[str] = Query(None),
    match_min_height: Optional[float] = Query(None),
    match_max_height: Optional[float] = Query(None),
    match_gender: Optional[str] = Query(None),
    # Pagination
    page: int = Query(1, ge=1),
    per_page: int = Query(12, ge=1, le=50),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user),
):
    q = db.query(ModelProfile).filter(ModelProfile.onboarding_completed == True)

    if search:
        q = q.filter(
            ModelProfile.full_name.ilike(f"%{search}%") |
            ModelProfile.bio.ilike(f"%{search}%") |
            ModelProfile.skills.ilike(f"%{search}%") |
            ModelProfile.username.ilike(f"%{search}%")
        )
    if model_type:
        q = q.filter(ModelProfile.model_type.ilike(f"%{model_type}%"))
    if location:
        q = q.filter(
            ModelProfile.city.ilike(f"%{location}%") |
            ModelProfile.location.ilike(f"%{location}%") |
            ModelProfile.country.ilike(f"%{location}%")
        )
    if gender:
        q = q.filter(ModelProfile.gender.ilike(f"%{gender}%"))
    if min_height_cm is not None:
        q = q.filter(ModelProfile.height_cm >= min_height_cm)
    if max_height_cm is not None:
        q = q.filter(ModelProfile.height_cm <= max_height_cm)
    if experience_level:
        q = q.filter(ModelProfile.experience_level.ilike(f"%{experience_level}%"))
    if availability:
        q = q.filter(ModelProfile.availability_status == availability)
    if verified_only:
        q = q.filter(ModelProfile.is_identity_verified == True)
    if has_agency is not None:
        if has_agency:
            q = q.filter(ModelProfile.agency_status == "represented")
        else:
            q = q.filter(ModelProfile.agency_status == "independent")
    if skills:
        for skill in skills.split(","):
            skill = skill.strip()
            if skill:
                q = q.filter(ModelProfile.skills.ilike(f"%{skill}%"))

    total = q.count()
    profiles = q.offset((page - 1) * per_page).limit(per_page).all()
    cards = [profile_to_card(p) for p in profiles]

    # AI Matching — if any match params provided, score each card
    use_matching = any([match_category, match_location, match_experience, match_skills, match_gender])
    if use_matching:
        casting_ctx = {
            "category": match_category,
            "location": match_location,
            "is_remote": match_is_remote,
            "experience_level": match_experience,
            "skills_required": match_skills,
            "min_height_cm": match_min_height,
            "max_height_cm": match_max_height,
            "gender_requirement": match_gender,
        }
        for card, profile in zip(cards, profiles):
            model_ctx = {
                "model_type": profile.model_type,
                "city": profile.city,
                "location": profile.location,
                "gender": profile.gender,
                "height_cm": profile.height_cm,
                "experience_level": profile.experience_level,
                "skills": profile.skills,
                "availability_status": profile.availability_status,
            }
            match = calculate_match_score(casting_ctx, model_ctx)
            card["match_score"] = match["score"]
            card["match_label"] = match["label"]
            card["match_reasons"] = match["reasons"]
        # sort by match score
        cards.sort(key=lambda c: c.get("match_score", 0), reverse=True)

    return {
        "total": total,
        "page": page,
        "per_page": per_page,
        "ai_matching_active": use_matching,
        "models": cards,
    }

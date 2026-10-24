"""
Phase 4 — Agency Directory & Roster API
Routes:
  GET    /agencies              — List verified model management agencies
  GET    /agencies/{slug}       — Get agency profile & represented roster
  POST   /agencies              — Create or claim agency profile (Agency user)
"""
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.database import get_db
from app.security import get_current_user, get_optional_current_user
from app.models.agency import AgencyProfile
from app.models.model_profile import ModelProfile
from app.models.user import User, UserRole

router = APIRouter(prefix="/agencies", tags=["Agencies"])


class AgencyCreate(BaseModel):
    name: str
    slug: str
    tagline: Optional[str] = None
    bio: Optional[str] = None
    logo_url: Optional[str] = None
    cover_image: Optional[str] = None
    headquarters: str = "Mumbai, India"
    global_locations: Optional[str] = "Paris, Milan, London, Mumbai"
    website: Optional[str] = None
    contact_email: Optional[str] = None
    phone: Optional[str] = None


def agency_to_dict(a: AgencyProfile, roster: list = None) -> dict:
    data = {
        "id": a.id,
        "name": a.name,
        "slug": a.slug,
        "tagline": a.tagline,
        "bio": a.bio,
        "logo_url": a.logo_url,
        "cover_image": a.cover_image,
        "headquarters": a.headquarters,
        "global_locations": a.global_locations,
        "website": a.website,
        "contact_email": a.contact_email,
        "phone": a.phone,
        "is_verified": a.is_verified,
        "created_at": a.created_at.isoformat() if a.created_at else None,
    }
    if roster is not None:
        data["roster"] = roster
    return data


@router.get("", summary="List all verified agencies")
def list_agencies(db: Session = Depends(get_db)):
    agencies = db.query(AgencyProfile).order_by(AgencyProfile.name.asc()).all()
    # Count roster size for each
    results = []
    for a in agencies:
        count = db.query(ModelProfile).filter(ModelProfile.agency_name.ilike(f"%{a.name}%")).count()
        d = agency_to_dict(a)
        d["roster_count"] = count
        results.append(d)
    return results


@router.get("/{slug}", summary="Get agency details and roster")
def get_agency(slug: str, db: Session = Depends(get_db)):
    agency = db.query(AgencyProfile).filter(AgencyProfile.slug == slug).first()
    if not agency:
        raise HTTPException(status_code=404, detail="Agency not found")

    # Find models represented by this agency
    models = db.query(ModelProfile).filter(
        ModelProfile.agency_name.ilike(f"%{agency.name}%")
    ).all()

    roster = [
        {
            "id": m.id,
            "username": m.username,
            "full_name": m.full_name,
            "profile_photo": m.profile_photo,
            "city": m.city,
            "model_type": m.model_type,
            "height_cm": m.height_cm,
            "experience_level": m.experience_level,
            "availability_status": m.availability_status,
            "is_identity_verified": m.is_identity_verified,
        }
        for m in models
    ]

    return agency_to_dict(agency, roster=roster)


@router.post("", status_code=status.HTTP_201_CREATED, summary="Create agency profile")
def create_agency(
    payload: AgencyCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role not in [UserRole.AGENCY.value, UserRole.ADMIN.value]:
        raise HTTPException(status_code=403, detail="Only agency accounts or admins can create agency profiles")

    existing = db.query(AgencyProfile).filter(AgencyProfile.slug == payload.slug).first()
    if existing:
        raise HTTPException(status_code=409, detail="Agency with this slug already exists")

    agency = AgencyProfile(user_id=current_user.id, **payload.model_dump())
    db.add(agency)
    db.commit()
    db.refresh(agency)
    return agency_to_dict(agency)

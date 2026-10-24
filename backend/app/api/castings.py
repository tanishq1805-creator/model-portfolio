"""
Phase 3 — Casting Marketplace API
Routes:
  GET    /castings            — list / search castings (public)
  POST   /castings            — create casting (brand / casting_director)
  GET    /castings/{id}       — casting detail (public)
  PUT    /castings/{id}       — update casting (owner)
  DELETE /castings/{id}       — delete casting (owner / admin)
  POST   /castings/{id}/apply — model applies
  GET    /castings/{id}/applications  — list applications (owner)
  PATCH  /castings/{id}/applications/{app_id} — update application status (owner)
  GET    /castings/my/applications   — model sees own applications
"""
from datetime import datetime, timezone
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.database import get_db
from app.security import get_current_user, get_optional_current_user
from app.models.casting import CastingCall, CastingApplication
from app.models.user import User, UserRole

router = APIRouter(prefix="/castings", tags=["Casting Marketplace"])


# ─── Pydantic schemas ────────────────────────────────────────────────────────

class CastingCallCreate(BaseModel):
    title: str
    brand_name: str
    campaign_name: Optional[str] = None
    description: str
    category: str
    location: str
    is_remote: bool = False
    gender_requirement: Optional[str] = None
    min_age: Optional[int] = None
    max_age: Optional[int] = None
    min_height_cm: Optional[float] = None
    max_height_cm: Optional[float] = None
    experience_level: Optional[str] = None
    skills_required: Optional[str] = None
    compensation: Optional[str] = None
    compensation_type: str = "paid"
    shoot_date: Optional[str] = None
    application_deadline: Optional[str] = None
    status: str = "active"

class CastingCallUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    location: Optional[str] = None
    compensation: Optional[str] = None
    shoot_date: Optional[str] = None
    application_deadline: Optional[str] = None
    status: Optional[str] = None

class ApplicationCreate(BaseModel):
    cover_note: Optional[str] = None
    portfolio_url: Optional[str] = None

class ApplicationStatusUpdate(BaseModel):
    status: str  # shortlisted, selected, rejected, pending

def casting_to_dict(c: CastingCall, include_applications: bool = False) -> dict:
    d = {
        "id": c.id,
        "title": c.title,
        "brand_name": c.brand_name,
        "campaign_name": c.campaign_name,
        "description": c.description,
        "category": c.category,
        "location": c.location,
        "is_remote": c.is_remote,
        "gender_requirement": c.gender_requirement,
        "min_age": c.min_age,
        "max_age": c.max_age,
        "min_height_cm": c.min_height_cm,
        "max_height_cm": c.max_height_cm,
        "experience_level": c.experience_level,
        "skills_required": c.skills_required,
        "compensation": c.compensation,
        "compensation_type": c.compensation_type,
        "shoot_date": c.shoot_date,
        "application_deadline": c.application_deadline,
        "status": c.status,
        "is_featured": c.is_featured,
        "views_count": c.views_count,
        "applications_count": c.applications_count,
        "poster_id": c.poster_id,
        "created_at": c.created_at.isoformat() if c.created_at else None,
        "updated_at": c.updated_at.isoformat() if c.updated_at else None,
    }
    if include_applications:
        d["applications"] = [app_to_dict(a) for a in c.applications]
    return d

def app_to_dict(a: CastingApplication) -> dict:
    profile = None
    mp = None
    if a.applicant and hasattr(a.applicant, "model_profile"):
        mp = a.applicant.model_profile
    return {
        "id": a.id,
        "casting_call_id": a.casting_call_id,
        "applicant_id": a.applicant_id,
        "applicant_name": mp.full_name if mp else (a.applicant.email if a.applicant else "Unknown"),
        "applicant_username": mp.username if mp else None,
        "applicant_photo": mp.profile_photo if mp else None,
        "cover_note": a.cover_note,
        "portfolio_url": a.portfolio_url,
        "status": a.status,
        "admin_notes": a.admin_notes,
        "created_at": a.created_at.isoformat() if a.created_at else None,
    }


# ─── Routes ──────────────────────────────────────────────────────────────────

@router.get("", summary="List / search casting calls")
def list_castings(
    category: Optional[str] = Query(None),
    location: Optional[str] = Query(None),
    status: str = Query("active"),
    compensation_type: Optional[str] = Query(None),
    experience_level: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    per_page: int = Query(12, ge=1, le=50),
    db: Session = Depends(get_db),
):
    q = db.query(CastingCall).filter(CastingCall.status == status)
    if category:
        q = q.filter(CastingCall.category.ilike(f"%{category}%"))
    if location:
        q = q.filter(CastingCall.location.ilike(f"%{location}%"))
    if compensation_type:
        q = q.filter(CastingCall.compensation_type == compensation_type)
    if experience_level:
        q = q.filter(CastingCall.experience_level == experience_level)
    if search:
        q = q.filter(
            CastingCall.title.ilike(f"%{search}%") |
            CastingCall.brand_name.ilike(f"%{search}%") |
            CastingCall.description.ilike(f"%{search}%")
        )
    total = q.count()
    items = q.order_by(CastingCall.is_featured.desc(), CastingCall.created_at.desc()) \
             .offset((page - 1) * per_page).limit(per_page).all()
    return {
        "total": total,
        "page": page,
        "per_page": per_page,
        "castings": [casting_to_dict(c) for c in items],
    }


@router.post("", status_code=status.HTTP_201_CREATED, summary="Create casting call")
def create_casting(
    payload: CastingCallCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    allowed = {UserRole.BRAND.value, UserRole.AGENCY.value, UserRole.CASTING_DIRECTOR.value, UserRole.ADMIN.value}
    if current_user.role not in allowed:
        raise HTTPException(status_code=403, detail="Only brands, agencies, and casting directors can post castings.")
    casting = CastingCall(poster_id=current_user.id, **payload.model_dump())
    db.add(casting)
    db.commit()
    db.refresh(casting)
    return casting_to_dict(casting)


@router.get("/my/applications", summary="Model — my casting applications")
def my_applications(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role != UserRole.MODEL.value:
        raise HTTPException(status_code=403, detail="Only models can view their applications.")
    apps = db.query(CastingApplication).filter(
        CastingApplication.applicant_id == current_user.id
    ).order_by(CastingApplication.created_at.desc()).all()
    results = []
    for a in apps:
        d = app_to_dict(a)
        if a.casting_call:
            d["casting"] = casting_to_dict(a.casting_call)
        results.append(d)
    return results


@router.get("/{casting_id}", summary="Get casting detail")
def get_casting(
    casting_id: int,
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db),
):
    casting = db.query(CastingCall).filter(CastingCall.id == casting_id).first()
    if not casting:
        raise HTTPException(status_code=404, detail="Casting call not found.")
    # increment view count
    casting.views_count = (casting.views_count or 0) + 1
    db.commit()
    db.refresh(casting)
    return casting_to_dict(casting)


@router.put("/{casting_id}", summary="Update casting call")
def update_casting(
    casting_id: int,
    payload: CastingCallUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    casting = db.query(CastingCall).filter(CastingCall.id == casting_id).first()
    if not casting:
        raise HTTPException(status_code=404, detail="Casting call not found.")
    if casting.poster_id != current_user.id and current_user.role != UserRole.ADMIN.value:
        raise HTTPException(status_code=403, detail="Not authorized to update this casting.")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(casting, field, value)
    casting.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(casting)
    return casting_to_dict(casting)


@router.delete("/{casting_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete casting call")
def delete_casting(
    casting_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    casting = db.query(CastingCall).filter(CastingCall.id == casting_id).first()
    if not casting:
        raise HTTPException(status_code=404, detail="Casting call not found.")
    if casting.poster_id != current_user.id and current_user.role != UserRole.ADMIN.value:
        raise HTTPException(status_code=403, detail="Not authorized to delete this casting.")
    db.delete(casting)
    db.commit()


@router.post("/{casting_id}/apply", status_code=status.HTTP_201_CREATED, summary="Model applies to casting")
def apply_to_casting(
    casting_id: int,
    payload: ApplicationCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role != UserRole.MODEL.value:
        raise HTTPException(status_code=403, detail="Only models can apply to casting calls.")
    casting = db.query(CastingCall).filter(CastingCall.id == casting_id).first()
    if not casting:
        raise HTTPException(status_code=404, detail="Casting call not found.")
    if casting.status != "active":
        raise HTTPException(status_code=400, detail="This casting call is no longer accepting applications.")
    existing = db.query(CastingApplication).filter(
        CastingApplication.casting_call_id == casting_id,
        CastingApplication.applicant_id == current_user.id,
    ).first()
    if existing:
        raise HTTPException(status_code=409, detail="You have already applied to this casting.")
    app = CastingApplication(
        casting_call_id=casting_id,
        applicant_id=current_user.id,
        **payload.model_dump(),
    )
    db.add(app)
    casting.applications_count = (casting.applications_count or 0) + 1
    db.commit()
    db.refresh(app)
    return app_to_dict(app)


@router.get("/{casting_id}/applications", summary="List applications for a casting (owner only)")
def list_applications(
    casting_id: int,
    status_filter: Optional[str] = Query(None, alias="status"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    casting = db.query(CastingCall).filter(CastingCall.id == casting_id).first()
    if not casting:
        raise HTTPException(status_code=404, detail="Casting call not found.")
    if casting.poster_id != current_user.id and current_user.role != UserRole.ADMIN.value:
        raise HTTPException(status_code=403, detail="Not authorized.")
    q = db.query(CastingApplication).filter(CastingApplication.casting_call_id == casting_id)
    if status_filter:
        q = q.filter(CastingApplication.status == status_filter)
    apps = q.order_by(CastingApplication.created_at.desc()).all()
    return [app_to_dict(a) for a in apps]


@router.patch("/{casting_id}/applications/{app_id}", summary="Update application status")
def update_application_status(
    casting_id: int,
    app_id: int,
    payload: ApplicationStatusUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    casting = db.query(CastingCall).filter(CastingCall.id == casting_id).first()
    if not casting:
        raise HTTPException(status_code=404, detail="Casting call not found.")
    if casting.poster_id != current_user.id and current_user.role != UserRole.ADMIN.value:
        raise HTTPException(status_code=403, detail="Not authorized.")
    app = db.query(CastingApplication).filter(
        CastingApplication.id == app_id,
        CastingApplication.casting_call_id == casting_id,
    ).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found.")
    app.status = payload.status
    app.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(app)
    return app_to_dict(app)

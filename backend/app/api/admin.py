"""
Phase 3 — Admin Panel API
Admin-only endpoints for:
  - User management
  - Verification queue
  - Casting moderation
  - Platform stats
"""
from datetime import datetime, timezone
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.database import get_db
from app.security import get_current_user
from app.models.user import User, UserRole
from app.models.model_profile import ModelProfile, VerificationRequest
from app.models.casting import CastingCall, CastingApplication
from app.models.analytics import ProfileView
from app.models.messaging import Message

router = APIRouter(prefix="/admin", tags=["Admin"])


def require_admin(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != UserRole.ADMIN.value:
        raise HTTPException(status_code=403, detail="Admin access required.")
    return current_user


# ─── Platform overview ────────────────────────────────────────────────────────

@router.get("/stats", summary="Platform overview statistics")
def admin_stats(
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    total_users = db.query(func.count(User.id)).scalar() or 0
    role_breakdown = db.query(User.role, func.count(User.id).label("cnt")).group_by(User.role).all()
    total_profiles = db.query(func.count(ModelProfile.id)).scalar() or 0
    completed_profiles = db.query(func.count(ModelProfile.id)).filter(ModelProfile.onboarding_completed == True).scalar() or 0
    total_castings = db.query(func.count(CastingCall.id)).scalar() or 0
    active_castings = db.query(func.count(CastingCall.id)).filter(CastingCall.status == "active").scalar() or 0
    total_applications = db.query(func.count(CastingApplication.id)).scalar() or 0
    pending_verifications = db.query(func.count(VerificationRequest.id)).filter(VerificationRequest.status == "pending").scalar() or 0
    total_messages = db.query(func.count(Message.id)).scalar() or 0
    total_views = db.query(func.count(ProfileView.id)).scalar() or 0

    return {
        "users": {
            "total": total_users,
            "by_role": {row.role: row.cnt for row in role_breakdown},
        },
        "profiles": {
            "total": total_profiles,
            "completed": completed_profiles,
        },
        "castings": {
            "total": total_castings,
            "active": active_castings,
            "total_applications": total_applications,
        },
        "verification": {
            "pending_requests": pending_verifications,
        },
        "engagement": {
            "total_messages": total_messages,
            "total_profile_views": total_views,
        },
    }


# ─── User management ─────────────────────────────────────────────────────────

@router.get("/users", summary="List all users")
def list_users(
    role: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    q = db.query(User)
    if role:
        q = q.filter(User.role == role)
    if search:
        q = q.filter(User.email.ilike(f"%{search}%"))
    total = q.count()
    users = q.order_by(User.created_at.desc()).offset((page - 1) * per_page).limit(per_page).all()

    def u2d(u: User):
        mp = u.model_profile
        return {
            "id": u.id,
            "email": u.email,
            "role": u.role,
            "is_active": u.is_active,
            "is_verified": u.is_verified,
            "created_at": u.created_at.isoformat() if u.created_at else None,
            "profile": {
                "username": mp.username,
                "full_name": mp.full_name,
                "location": mp.location,
                "onboarding_completed": mp.onboarding_completed,
                "is_identity_verified": mp.is_identity_verified,
            } if mp else None,
        }

    return {"total": total, "page": page, "per_page": per_page, "users": [u2d(u) for u in users]}


class UserStatusUpdate(BaseModel):
    is_active: Optional[bool] = None
    is_verified: Optional[bool] = None
    role: Optional[str] = None

@router.patch("/users/{user_id}", summary="Update user status / role")
def update_user(
    user_id: int,
    payload: UserStatusUpdate,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    if payload.is_active is not None:
        user.is_active = payload.is_active
    if payload.is_verified is not None:
        user.is_verified = payload.is_verified
    if payload.role is not None:
        user.role = payload.role
    user.updated_at = datetime.now(timezone.utc)
    db.commit()
    return {"success": True, "user_id": user_id}


@router.delete("/users/{user_id}", summary="Delete user account")
def delete_user(
    user_id: int,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    if user.role == UserRole.ADMIN.value:
        raise HTTPException(status_code=403, detail="Cannot delete another admin.")
    db.delete(user)
    db.commit()
    return {"success": True}


# ─── Verification queue ───────────────────────────────────────────────────────

@router.get("/verifications", summary="List verification requests")
def list_verifications(
    status: Optional[str] = Query("pending"),
    page: int = Query(1, ge=1),
    per_page: int = Query(20),
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    q = db.query(VerificationRequest)
    if status:
        q = q.filter(VerificationRequest.status == status)
    total = q.count()
    items = q.order_by(VerificationRequest.created_at.asc()).offset((page - 1) * per_page).limit(per_page).all()

    def vr2d(v: VerificationRequest):
        mp = v.profile
        return {
            "id": v.id,
            "verification_type": v.verification_type,
            "status": v.status,
            "notes": v.notes,
            "admin_notes": v.admin_notes,
            "document_url": v.document_url,
            "created_at": v.created_at.isoformat() if v.created_at else None,
            "model": {
                "username": mp.username,
                "full_name": mp.full_name,
                "profile_photo": mp.profile_photo,
            } if mp else None,
        }
    return {"total": total, "page": page, "per_page": per_page, "requests": [vr2d(v) for v in items]}


class VerificationDecision(BaseModel):
    status: str          # verified, rejected, under_review
    admin_notes: Optional[str] = None

@router.patch("/verifications/{vr_id}", summary="Process verification request")
def process_verification(
    vr_id: int,
    payload: VerificationDecision,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    vr = db.query(VerificationRequest).filter(VerificationRequest.id == vr_id).first()
    if not vr:
        raise HTTPException(status_code=404, detail="Verification request not found.")
    vr.status = payload.status
    vr.admin_notes = payload.admin_notes
    vr.updated_at = datetime.now(timezone.utc)

    # If verified, update the profile badge
    if payload.status == "verified" and vr.profile:
        badge_map = {
            "identity": "is_identity_verified",
            "portfolio": "is_portfolio_verified",
            "measurements": "is_measurements_verified",
            "agency": "is_agency_verified",
        }
        badge_field = badge_map.get(vr.verification_type)
        if badge_field:
            setattr(vr.profile, badge_field, True)

    db.commit()
    return {"success": True, "status": payload.status}


# ─── Casting moderation ───────────────────────────────────────────────────────

@router.get("/castings", summary="Admin — list all castings")
def admin_castings(
    status: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    per_page: int = Query(20),
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    q = db.query(CastingCall)
    if status:
        q = q.filter(CastingCall.status == status)
    total = q.count()
    items = q.order_by(CastingCall.created_at.desc()).offset((page - 1) * per_page).limit(per_page).all()
    return {
        "total": total,
        "castings": [
            {
                "id": c.id,
                "title": c.title,
                "brand_name": c.brand_name,
                "status": c.status,
                "is_featured": c.is_featured,
                "views_count": c.views_count,
                "applications_count": c.applications_count,
                "created_at": c.created_at.isoformat() if c.created_at else None,
            }
            for c in items
        ],
    }

class CastingAdminUpdate(BaseModel):
    status: Optional[str] = None
    is_featured: Optional[bool] = None

@router.patch("/castings/{casting_id}", summary="Admin — update casting status / feature flag")
def admin_update_casting(
    casting_id: int,
    payload: CastingAdminUpdate,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    casting = db.query(CastingCall).filter(CastingCall.id == casting_id).first()
    if not casting:
        raise HTTPException(status_code=404, detail="Casting not found.")
    if payload.status is not None:
        casting.status = payload.status
    if payload.is_featured is not None:
        casting.is_featured = payload.is_featured
    db.commit()
    return {"success": True}

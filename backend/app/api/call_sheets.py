"""
Phase 5 — Interactive Production Call Sheets API
Routes:
  POST   /call-sheets               — Production client creates a call sheet
  GET    /call-sheets/my            — List call sheets (as talent or production client)
  GET    /call-sheets/{id}          — View comprehensive digital call sheet
  PATCH  /call-sheets/{id}/attendance — Talent updates live status (confirmed, en_route, on_set, wrapped)
"""
import json
from datetime import datetime, timezone
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.database import get_db
from app.security import get_current_user
from app.models.logistics import ProductionCallSheet
from app.models.model_profile import ModelProfile
from app.models.user import User, UserRole

router = APIRouter(prefix="/call-sheets", tags=["Production Call Sheets"])


class ScheduleBlock(BaseModel):
    time: str
    activity: str
    notes: Optional[str] = None


class CrewContact(BaseModel):
    role: str
    name: str
    phone: Optional[str] = None


class CallSheetCreate(BaseModel):
    model_username: str
    booking_offer_id: Optional[int] = None
    shoot_title: str
    production_company: str
    shoot_date: str
    general_call_time: str = "08:00 AM"
    talent_call_time: str = "08:30 AM"
    shoot_location: str
    location_notes: Optional[str] = None
    wardrobe_brief: Optional[str] = None
    catering_notes: Optional[str] = None
    schedule_blocks: Optional[List[ScheduleBlock]] = None
    crew_contacts: Optional[List[CrewContact]] = None


class AttendanceUpdate(BaseModel):
    status: str # confirmed, en_route, on_set, wrapped


def callsheet_to_dict(cs: ProductionCallSheet) -> dict:
    mp = cs.model_profile

    # Parse schedule blocks and crew contacts JSON if stored as strings
    schedule = []
    if cs.schedule_blocks:
        try:
            schedule = json.loads(cs.schedule_blocks)
        except Exception:
            schedule = []

    crew = []
    if cs.crew_contacts:
        try:
            crew = json.loads(cs.crew_contacts)
        except Exception:
            crew = []

    return {
        "id": cs.id,
        "booking_offer_id": cs.booking_offer_id,
        "shoot_title": cs.shoot_title,
        "production_company": cs.production_company,
        "shoot_date": cs.shoot_date,
        "general_call_time": cs.general_call_time,
        "talent_call_time": cs.talent_call_time,
        "shoot_location": cs.shoot_location,
        "location_notes": cs.location_notes,
        "wardrobe_brief": cs.wardrobe_brief,
        "catering_notes": cs.catering_notes,
        "attendance_status": cs.attendance_status,
        "attendance_updated_at": cs.attendance_updated_at.isoformat() if cs.attendance_updated_at else None,
        "schedule_blocks": schedule,
        "crew_contacts": crew,
        "creator": {
            "id": cs.creator.id,
            "email": cs.creator.email,
        } if cs.creator else None,
        "model": {
            "id": mp.id,
            "username": mp.username,
            "full_name": mp.full_name,
            "profile_photo": mp.profile_photo,
            "agency_name": mp.agency_name,
            "height_cm": mp.height_cm,
        } if mp else None,
        "created_at": cs.created_at.isoformat() if cs.created_at else None,
    }


@router.post("", status_code=status.HTTP_201_CREATED, summary="Create a production call sheet")
def create_call_sheet(
    payload: CallSheetCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    mp = db.query(ModelProfile).filter(ModelProfile.username == payload.model_username).first()
    if not mp:
        raise HTTPException(status_code=404, detail="Target talent profile not found")

    blocks_str = json.dumps([b.model_dump() for b in payload.schedule_blocks]) if payload.schedule_blocks else None
    crew_str = json.dumps([c.model_dump() for c in payload.crew_contacts]) if payload.crew_contacts else None

    cs = ProductionCallSheet(
        creator_id=current_user.id,
        model_profile_id=mp.id,
        booking_offer_id=payload.booking_offer_id,
        shoot_title=payload.shoot_title,
        production_company=payload.production_company,
        shoot_date=payload.shoot_date,
        general_call_time=payload.general_call_time,
        talent_call_time=payload.talent_call_time,
        shoot_location=payload.shoot_location,
        location_notes=payload.location_notes,
        wardrobe_brief=payload.wardrobe_brief,
        catering_notes=payload.catering_notes,
        schedule_blocks=blocks_str,
        crew_contacts=crew_str,
        attendance_status="confirmed",
    )
    db.add(cs)
    db.commit()
    db.refresh(cs)
    return callsheet_to_dict(cs)


@router.get("/my", summary="List current user's call sheets")
def list_my_call_sheets(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    user_model = db.query(ModelProfile).filter(ModelProfile.user_id == current_user.id).first()

    q = db.query(ProductionCallSheet)
    if user_model:
        q = q.filter(
            (ProductionCallSheet.model_profile_id == user_model.id) |
            (ProductionCallSheet.creator_id == current_user.id)
        )
    else:
        q = q.filter(ProductionCallSheet.creator_id == current_user.id)

    sheets = q.order_by(ProductionCallSheet.shoot_date.desc()).all()
    return [callsheet_to_dict(s) for s in sheets]


@router.get("/{sheet_id}", summary="Get call sheet details")
def get_call_sheet(
    sheet_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    cs = db.query(ProductionCallSheet).filter(ProductionCallSheet.id == sheet_id).first()
    if not cs:
        raise HTTPException(status_code=404, detail="Call sheet not found")

    user_model = db.query(ModelProfile).filter(ModelProfile.user_id == current_user.id).first()
    is_creator = cs.creator_id == current_user.id
    is_talent = user_model and cs.model_profile_id == user_model.id
    is_admin = current_user.role == UserRole.ADMIN.value

    if not (is_creator or is_talent or is_admin):
        raise HTTPException(status_code=403, detail="Not authorized to access this call sheet")

    return callsheet_to_dict(cs)


@router.patch("/{sheet_id}/attendance", summary="Model updates live attendance status")
def update_attendance_status(
    sheet_id: int,
    payload: AttendanceUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    cs = db.query(ProductionCallSheet).filter(ProductionCallSheet.id == sheet_id).first()
    if not cs:
        raise HTTPException(status_code=404, detail="Call sheet not found")

    user_model = db.query(ModelProfile).filter(ModelProfile.user_id == current_user.id).first()
    is_talent = user_model and cs.model_profile_id == user_model.id
    is_creator = cs.creator_id == current_user.id
    is_admin = current_user.role == UserRole.ADMIN.value

    if not (is_talent or is_creator or is_admin):
        raise HTTPException(status_code=403, detail="Not authorized to update attendance")

    valid_statuses = ["confirmed", "en_route", "on_set", "wrapped", "delayed"]
    if payload.status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid attendance status: {payload.status}")

    cs.attendance_status = payload.status
    cs.attendance_updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(cs)
    return callsheet_to_dict(cs)

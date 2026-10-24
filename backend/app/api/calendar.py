"""
Phase 5 — Model Availability & Date Holds Calendar API
Routes:
  GET    /calendar/{username}       — View talent availability schedule
  POST   /calendar                  — Model sets or updates date hold / blackout
  DELETE /calendar/{entry_id}       — Clear date hold
"""
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.database import get_db
from app.security import get_current_user, get_optional_current_user
from app.models.logistics import AvailabilityEntry
from app.models.model_profile import ModelProfile
from app.models.user import User

router = APIRouter(prefix="/calendar", tags=["Availability Calendar"])


class AvailabilityEntryCreate(BaseModel):
    date: str # YYYY-MM-DD
    status: str = "booked" # available, option_1, option_2, booked, blackout, travel
    city_location: Optional[str] = "Mumbai"
    project_label: Optional[str] = None
    is_private: bool = False


def entry_to_dict(e: AvailabilityEntry) -> dict:
    return {
        "id": e.id,
        "model_profile_id": e.model_profile_id,
        "date": e.date,
        "status": e.status,
        "city_location": e.city_location,
        "project_label": e.project_label if not e.is_private else "Private Hold",
        "is_private": e.is_private,
        "created_at": e.created_at.isoformat() if e.created_at else None,
    }


@router.get("/{username}", summary="Get talent availability calendar")
def get_talent_calendar(
    username: str,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user),
):
    mp = db.query(ModelProfile).filter(ModelProfile.username == username).first()
    if not mp:
        raise HTTPException(status_code=404, detail="Model profile not found")

    is_owner = current_user and current_user.id == mp.user_id

    entries = db.query(AvailabilityEntry).filter(
        AvailabilityEntry.model_profile_id == mp.id
    ).order_by(AvailabilityEntry.date.asc()).all()

    results = []
    for e in entries:
        d = entry_to_dict(e)
        if not is_owner and e.is_private:
            d["project_label"] = "Unavailable"
        results.append(d)

    return {
        "model": {
            "username": mp.username,
            "full_name": mp.full_name,
            "availability_status": mp.availability_status,
        },
        "entries": results,
    }


@router.post("", status_code=status.HTTP_201_CREATED, summary="Set or update availability date hold")
def set_availability(
    payload: AvailabilityEntryCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    mp = db.query(ModelProfile).filter(ModelProfile.user_id == current_user.id).first()
    if not mp:
        raise HTTPException(status_code=403, detail="Only registered models can update their calendar")

    valid_statuses = ["available", "option_1", "option_2", "booked", "blackout", "travel"]
    if payload.status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid availability status: {payload.status}")

    # Check if entry for this date already exists
    existing = db.query(AvailabilityEntry).filter(
        AvailabilityEntry.model_profile_id == mp.id,
        AvailabilityEntry.date == payload.date
    ).first()

    if existing:
        existing.status = payload.status
        existing.city_location = payload.city_location
        existing.project_label = payload.project_label
        existing.is_private = payload.is_private
        db.commit()
        db.refresh(existing)
        return entry_to_dict(existing)

    entry = AvailabilityEntry(
        model_profile_id=mp.id,
        date=payload.date,
        status=payload.status,
        city_location=payload.city_location,
        project_label=payload.project_label,
        is_private=payload.is_private,
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry_to_dict(entry)


@router.delete("/{entry_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Clear date hold")
def delete_availability(
    entry_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    mp = db.query(ModelProfile).filter(ModelProfile.user_id == current_user.id).first()
    if not mp:
        raise HTTPException(status_code=403, detail="Not authorized")

    entry = db.query(AvailabilityEntry).filter(
        AvailabilityEntry.id == entry_id,
        AvailabilityEntry.model_profile_id == mp.id
    ).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Calendar entry not found")

    db.delete(entry)
    db.commit()

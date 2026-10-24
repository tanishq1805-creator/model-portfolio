"""
Phase 4 — Direct Bookings & Contract Offers API
Routes:
  POST   /bookings               — Client creates a booking offer for a model
  GET    /bookings/my            — List user's bookings (as client or model)
  GET    /bookings/{id}          — View booking details & contract terms
  PATCH  /bookings/{id}/respond  — Model responds (accept, decline, counter_offer)
  PATCH  /bookings/{id}/status   — Client or Admin updates completion status
"""
from datetime import datetime, timezone
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field

from app.database import get_db
from app.security import get_current_user
from app.models.booking import BookingOffer
from app.models.model_profile import ModelProfile
from app.models.user import User, UserRole

router = APIRouter(prefix="/bookings", tags=["Direct Bookings"])


class BookingOfferCreate(BaseModel):
    model_username: str
    project_title: str
    client_organization: str
    project_type: str = "Editorial"
    shoot_location: str
    start_date: str
    end_date: Optional[str] = None
    call_time: Optional[str] = "09:00 AM"
    compensation_amount: float
    currency: str = "INR"
    rate_basis: str = "day_rate"
    usage_rights: str = "Digital (1 Year)"
    cancellation_terms: Optional[str] = "Standard 48-hour notice required for full refund."
    wardrobe_notes: Optional[str] = None


class BookingResponse(BaseModel):
    action: str  # accept, decline, counter_offer
    response_notes: Optional[str] = None
    counter_offer_amount: Optional[float] = None


class BookingStatusUpdate(BaseModel):
    status: str  # in_progress, completed, cancelled


def booking_to_dict(b: BookingOffer) -> dict:
    mp = b.model_profile
    return {
        "id": b.id,
        "project_title": b.project_title,
        "client_organization": b.client_organization,
        "project_type": b.project_type,
        "shoot_location": b.shoot_location,
        "start_date": b.start_date,
        "end_date": b.end_date,
        "call_time": b.call_time,
        "compensation_amount": b.compensation_amount,
        "currency": b.currency,
        "rate_basis": b.rate_basis,
        "usage_rights": b.usage_rights,
        "cancellation_terms": b.cancellation_terms,
        "wardrobe_notes": b.wardrobe_notes,
        "status": b.status,
        "response_notes": b.response_notes,
        "counter_offer_amount": b.counter_offer_amount,
        "client": {
            "id": b.client.id,
            "email": b.client.email,
            "role": b.client.role,
        } if b.client else None,
        "model": {
            "id": mp.id,
            "username": mp.username,
            "full_name": mp.full_name,
            "profile_photo": mp.profile_photo,
            "agency_name": mp.agency_name,
        } if mp else None,
        "created_at": b.created_at.isoformat() if b.created_at else None,
        "updated_at": b.updated_at.isoformat() if b.updated_at else None,
    }


@router.post("", status_code=status.HTTP_201_CREATED, summary="Send direct booking offer")
def create_booking_offer(
    payload: BookingOfferCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    model_profile = db.query(ModelProfile).filter(ModelProfile.username == payload.model_username).first()
    if not model_profile:
        raise HTTPException(status_code=404, detail="Target model profile not found")

    if model_profile.user_id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot send booking contract to yourself")

    data = payload.model_dump(exclude={"model_username"})
    offer = BookingOffer(
        client_id=current_user.id,
        model_profile_id=model_profile.id,
        status="pending",
        **data,
    )
    db.add(offer)
    db.commit()
    db.refresh(offer)
    return booking_to_dict(offer)


@router.get("/my", summary="List current user's bookings")
def list_my_bookings(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # If user is a model, fetch bookings received
    user_model = db.query(ModelProfile).filter(ModelProfile.user_id == current_user.id).first()
    
    q = db.query(BookingOffer)
    if user_model:
        # User is a model: can see incoming offers OR offers they made if any
        q = q.filter((BookingOffer.model_profile_id == user_model.id) | (BookingOffer.client_id == current_user.id))
    else:
        # Client view: offers sent by current user
        q = q.filter(BookingOffer.client_id == current_user.id)
    
    offers = q.order_by(BookingOffer.created_at.desc()).all()
    return [booking_to_dict(o) for o in offers]


@router.get("/{booking_id}", summary="Get booking contract detail")
def get_booking(
    booking_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    b = db.query(BookingOffer).filter(BookingOffer.id == booking_id).first()
    if not b:
        raise HTTPException(status_code=404, detail="Booking contract not found")

    user_model = db.query(ModelProfile).filter(ModelProfile.user_id == current_user.id).first()
    is_client = b.client_id == current_user.id
    is_model = user_model and b.model_profile_id == user_model.id
    is_admin = current_user.role == UserRole.ADMIN.value

    if not (is_client or is_model or is_admin):
        raise HTTPException(status_code=403, detail="Not authorized to view this booking contract")

    return booking_to_dict(b)


@router.patch("/{booking_id}/respond", summary="Model responds to booking offer")
def respond_to_booking(
    booking_id: int,
    payload: BookingResponse,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    b = db.query(BookingOffer).filter(BookingOffer.id == booking_id).first()
    if not b:
        raise HTTPException(status_code=404, detail="Booking contract not found")

    user_model = db.query(ModelProfile).filter(ModelProfile.user_id == current_user.id).first()
    if not user_model or b.model_profile_id != user_model.id:
        raise HTTPException(status_code=403, detail="Only the designated talent may respond to this booking offer")

    if payload.action == "accept":
        b.status = "accepted"
    elif payload.action == "decline":
        b.status = "declined"
    elif payload.action == "counter_offer":
        if not payload.counter_offer_amount:
            raise HTTPException(status_code=400, detail="Counter-offer amount is required")
        b.status = "counter_offered"
        b.counter_offer_amount = payload.counter_offer_amount
    else:
        raise HTTPException(status_code=400, detail=f"Invalid action: {payload.action}")

    b.response_notes = payload.response_notes
    b.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(b)
    return booking_to_dict(b)


@router.patch("/{booking_id}/status", summary="Update booking progression status")
def update_booking_status(
    booking_id: int,
    payload: BookingStatusUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    b = db.query(BookingOffer).filter(BookingOffer.id == booking_id).first()
    if not b:
        raise HTTPException(status_code=404, detail="Booking contract not found")

    user_model = db.query(ModelProfile).filter(ModelProfile.user_id == current_user.id).first()
    is_client = b.client_id == current_user.id
    is_model = user_model and b.model_profile_id == user_model.id
    is_admin = current_user.role == UserRole.ADMIN.value

    if not (is_client or is_model or is_admin):
        raise HTTPException(status_code=403, detail="Not authorized")

    b.status = payload.status
    b.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(b)
    return booking_to_dict(b)

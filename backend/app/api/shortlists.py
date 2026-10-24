"""
Phase 4 — Talent Shortlists & Casting Boards API
Routes:
  POST   /shortlists                      — Create a new shortlist
  GET    /shortlists                      — List user's shortlists
  GET    /shortlists/{id}                 — Get shortlist details and models
  DELETE /shortlists/{id}                 — Delete shortlist
  POST   /shortlists/{id}/items           — Add a model to shortlist
  PATCH  /shortlists/{id}/items/{item_id} — Update casting status / notes
  DELETE /shortlists/{id}/items/{item_id} — Remove model from shortlist
"""
from datetime import datetime, timezone
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.database import get_db
from app.security import get_current_user
from app.models.shortlist import TalentShortlist, ShortlistItem
from app.models.model_profile import ModelProfile
from app.models.user import User

router = APIRouter(prefix="/shortlists", tags=["Talent Shortlists"])


class ShortlistCreate(BaseModel):
    title: str
    description: Optional[str] = None
    campaign_name: Optional[str] = None
    is_private: str = "private"


class AddModelToShortlist(BaseModel):
    model_username: str
    casting_status: str = "considering"
    internal_notes: Optional[str] = None


class UpdateShortlistItem(BaseModel):
    casting_status: Optional[str] = None
    internal_notes: Optional[str] = None


def item_to_dict(item: ShortlistItem) -> dict:
    mp = item.model_profile
    return {
        "id": item.id,
        "casting_status": item.casting_status,
        "internal_notes": item.internal_notes,
        "created_at": item.created_at.isoformat() if item.created_at else None,
        "model": {
            "id": mp.id,
            "username": mp.username,
            "full_name": mp.full_name,
            "profile_photo": mp.profile_photo,
            "city": mp.city,
            "height_cm": mp.height_cm,
            "model_type": mp.model_type,
            "agency_name": mp.agency_name,
            "is_identity_verified": mp.is_identity_verified,
        } if mp else None,
    }


def shortlist_to_dict(s: TalentShortlist, include_items: bool = True) -> dict:
    data = {
        "id": s.id,
        "title": s.title,
        "description": s.description,
        "campaign_name": s.campaign_name,
        "is_private": s.is_private,
        "creator_id": s.creator_id,
        "created_at": s.created_at.isoformat() if s.created_at else None,
        "item_count": len(s.items) if s.items else 0,
    }
    if include_items:
        data["items"] = [item_to_dict(it) for it in s.items]
    return data


@router.post("", status_code=status.HTTP_201_CREATED, summary="Create a new shortlist")
def create_shortlist(
    payload: ShortlistCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    sl = TalentShortlist(creator_id=current_user.id, **payload.model_dump())
    db.add(sl)
    db.commit()
    db.refresh(sl)
    return shortlist_to_dict(sl)


@router.get("", summary="List current user's shortlists")
def list_shortlists(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    shortlists = db.query(TalentShortlist).filter(
        TalentShortlist.creator_id == current_user.id
    ).order_by(TalentShortlist.created_at.desc()).all()
    return [shortlist_to_dict(s, include_items=True) for s in shortlists]


@router.get("/{shortlist_id}", summary="Get shortlist details")
def get_shortlist(
    shortlist_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    sl = db.query(TalentShortlist).filter(TalentShortlist.id == shortlist_id).first()
    if not sl:
        raise HTTPException(status_code=404, detail="Shortlist not found")
    if sl.creator_id != current_user.id and sl.is_private == "private":
        raise HTTPException(status_code=403, detail="Not authorized to access this private shortlist")
    return shortlist_to_dict(sl, include_items=True)


@router.delete("/{shortlist_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete shortlist")
def delete_shortlist(
    shortlist_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    sl = db.query(TalentShortlist).filter(TalentShortlist.id == shortlist_id).first()
    if not sl:
        raise HTTPException(status_code=404, detail="Shortlist not found")
    if sl.creator_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    db.delete(sl)
    db.commit()


@router.post("/{shortlist_id}/items", status_code=status.HTTP_201_CREATED, summary="Add model to shortlist")
def add_model_to_shortlist(
    shortlist_id: int,
    payload: AddModelToShortlist,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    sl = db.query(TalentShortlist).filter(TalentShortlist.id == shortlist_id).first()
    if not sl:
        raise HTTPException(status_code=404, detail="Shortlist not found")
    if sl.creator_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    mp = db.query(ModelProfile).filter(ModelProfile.username == payload.model_username).first()
    if not mp:
        raise HTTPException(status_code=404, detail="Model profile not found")

    existing = db.query(ShortlistItem).filter(
        ShortlistItem.shortlist_id == shortlist_id,
        ShortlistItem.model_profile_id == mp.id
    ).first()
    if existing:
        raise HTTPException(status_code=409, detail="Model is already on this shortlist")

    item = ShortlistItem(
        shortlist_id=shortlist_id,
        model_profile_id=mp.id,
        casting_status=payload.casting_status,
        internal_notes=payload.internal_notes,
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return item_to_dict(item)


@router.patch("/{shortlist_id}/items/{item_id}", summary="Update model shortlist status/notes")
def update_shortlist_item(
    shortlist_id: int,
    item_id: int,
    payload: UpdateShortlistItem,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    sl = db.query(TalentShortlist).filter(TalentShortlist.id == shortlist_id).first()
    if not sl or sl.creator_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    item = db.query(ShortlistItem).filter(
        ShortlistItem.id == item_id,
        ShortlistItem.shortlist_id == shortlist_id
    ).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")

    if payload.casting_status:
        item.casting_status = payload.casting_status
    if payload.internal_notes is not None:
        item.internal_notes = payload.internal_notes

    db.commit()
    db.refresh(item)
    return item_to_dict(item)


@router.delete("/{shortlist_id}/items/{item_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Remove model from shortlist")
def remove_shortlist_item(
    shortlist_id: int,
    item_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    sl = db.query(TalentShortlist).filter(TalentShortlist.id == shortlist_id).first()
    if not sl or sl.creator_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    item = db.query(ShortlistItem).filter(
        ShortlistItem.id == item_id,
        ShortlistItem.shortlist_id == shortlist_id
    ).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")

    db.delete(item)
    db.commit()

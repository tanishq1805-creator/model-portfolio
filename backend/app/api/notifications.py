"""
Phase 6 — Real-Time In-App Notifications API
Routes:
  GET    /notifications          — List user's notifications & unread count
  POST   /notifications          — Create notification (system / action trigger)
  PATCH  /notifications/{id}/read — Mark single notification as read
  POST   /notifications/read-all  — Mark all as read
  DELETE /notifications/{id}      — Dismiss/delete notification
"""
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.database import get_db
from app.security import get_current_user
from app.models.notification import Notification
from app.models.user import User

router = APIRouter(prefix="/notifications", tags=["Notifications"])


class NotificationCreate(BaseModel):
    user_id: Optional[int] = None # Defaults to current user if omitted
    title: str
    message: str
    category: str = "system" # booking, casting, call_sheet, finance, system
    action_url: Optional[str] = None


def notif_to_dict(n: Notification) -> dict:
    return {
        "id": n.id,
        "user_id": n.user_id,
        "title": n.title,
        "message": n.message,
        "category": n.category,
        "action_url": n.action_url,
        "is_read": n.is_read,
        "created_at": n.created_at.isoformat() if n.created_at else None,
    }


@router.get("", summary="List current user's notifications")
def list_notifications(
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    notifs = (
        db.query(Notification)
        .filter(Notification.user_id == current_user.id)
        .order_by(Notification.created_at.desc())
        .limit(limit)
        .all()
    )

    unread_count = (
        db.query(Notification)
        .filter(Notification.user_id == current_user.id, Notification.is_read == False)
        .count()
    )

    return {
        "notifications": [notif_to_dict(n) for n in notifs],
        "unread_count": unread_count,
        "total_count": len(notifs),
    }


@router.post("", status_code=status.HTTP_201_CREATED, summary="Create a notification")
def create_notification(
    payload: NotificationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    target_user_id = payload.user_id or current_user.id
    notif = Notification(
        user_id=target_user_id,
        title=payload.title,
        message=payload.message,
        category=payload.category,
        action_url=payload.action_url,
        is_read=False,
    )
    db.add(notif)
    db.commit()
    db.refresh(notif)
    return notif_to_dict(notif)


@router.patch("/{notification_id}/read", summary="Mark notification as read")
def mark_read(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    notif = (
        db.query(Notification)
        .filter(Notification.id == notification_id, Notification.user_id == current_user.id)
        .first()
    )
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found")

    notif.is_read = True
    db.commit()
    db.refresh(notif)
    return notif_to_dict(notif)


@router.post("/read-all", summary="Mark all user notifications as read")
def mark_all_read(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    updated = (
        db.query(Notification)
        .filter(Notification.user_id == current_user.id, Notification.is_read == False)
        .update({Notification.is_read: True})
    )
    db.commit()
    return {"message": "All notifications marked as read", "updated_count": updated}


@router.delete("/{notification_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete notification")
def delete_notification(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    notif = (
        db.query(Notification)
        .filter(Notification.id == notification_id, Notification.user_id == current_user.id)
        .first()
    )
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found")

    db.delete(notif)
    db.commit()

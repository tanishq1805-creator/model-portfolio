"""
Phase 3 — Messaging API
REST endpoints for conversations and message history.
WebSocket real-time is handled in websocket.py.
"""
from datetime import datetime, timezone
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.database import get_db
from app.security import get_current_user
from app.models.messaging import Conversation, Message
from app.models.user import User

router = APIRouter(prefix="/messages", tags=["Messaging"])


# ─── Schemas ─────────────────────────────────────────────────────────────────

class ConversationCreate(BaseModel):
    recipient_id: int
    subject: Optional[str] = None
    first_message: str

class MessageCreate(BaseModel):
    content: str
    message_type: str = "text"
    attachment_url: Optional[str] = None


# ─── Helpers ─────────────────────────────────────────────────────────────────

def conv_to_dict(conv: Conversation, current_user_id: int) -> dict:
    other_user = conv.user_b if conv.user_a_id == current_user_id else conv.user_a
    other_mp = getattr(other_user, "model_profile", None)
    return {
        "id": conv.id,
        "subject": conv.subject,
        "last_message_preview": conv.last_message_preview,
        "last_message_at": conv.last_message_at.isoformat() if conv.last_message_at else None,
        "unread_count": conv.user_a_unread if conv.user_b_id == current_user_id else conv.user_b_unread,
        "other_user": {
            "id": other_user.id,
            "email": other_user.email,
            "role": other_user.role,
            "name": other_mp.full_name if other_mp else other_user.email,
            "username": other_mp.username if other_mp else None,
            "photo": other_mp.profile_photo if other_mp else None,
        } if other_user else None,
        "created_at": conv.created_at.isoformat() if conv.created_at else None,
    }

def msg_to_dict(m: Message) -> dict:
    mp = getattr(m.sender, "model_profile", None)
    return {
        "id": m.id,
        "conversation_id": m.conversation_id,
        "sender_id": m.sender_id,
        "sender_name": mp.full_name if mp else (m.sender.email if m.sender else "Unknown"),
        "sender_photo": mp.profile_photo if mp else None,
        "content": m.content,
        "message_type": m.message_type,
        "attachment_url": m.attachment_url,
        "is_read": m.is_read,
        "created_at": m.created_at.isoformat() if m.created_at else None,
    }


# ─── Routes ──────────────────────────────────────────────────────────────────

@router.get("", summary="List my conversations (inbox)")
def list_conversations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    convs = db.query(Conversation).filter(
        (Conversation.user_a_id == current_user.id) | (Conversation.user_b_id == current_user.id)
    ).order_by(Conversation.last_message_at.desc()).all()
    return [conv_to_dict(c, current_user.id) for c in convs]


@router.post("", status_code=status.HTTP_201_CREATED, summary="Start or retrieve a conversation")
def start_conversation(
    payload: ConversationCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if payload.recipient_id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot message yourself.")
    recipient = db.query(User).filter(User.id == payload.recipient_id).first()
    if not recipient:
        raise HTTPException(status_code=404, detail="Recipient not found.")

    # Check if conversation already exists
    conv = db.query(Conversation).filter(
        ((Conversation.user_a_id == current_user.id) & (Conversation.user_b_id == payload.recipient_id)) |
        ((Conversation.user_a_id == payload.recipient_id) & (Conversation.user_b_id == current_user.id))
    ).first()

    if not conv:
        conv = Conversation(
            user_a_id=current_user.id,
            user_b_id=payload.recipient_id,
            subject=payload.subject,
        )
        db.add(conv)
        db.flush()

    # Send first message
    msg = Message(
        conversation_id=conv.id,
        sender_id=current_user.id,
        content=payload.first_message,
    )
    db.add(msg)
    conv.last_message_preview = payload.first_message[:300]
    conv.last_message_at = datetime.now(timezone.utc)
    # increment unread for recipient
    if conv.user_a_id == payload.recipient_id:
        conv.user_a_unread = (conv.user_a_unread or 0) + 1
    else:
        conv.user_b_unread = (conv.user_b_unread or 0) + 1
    db.commit()
    db.refresh(conv)
    return {**conv_to_dict(conv, current_user.id), "first_message": msg_to_dict(msg)}


@router.get("/{conversation_id}", summary="Get conversation messages")
def get_conversation(
    conversation_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    conv = db.query(Conversation).filter(Conversation.id == conversation_id).first()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found.")
    if conv.user_a_id != current_user.id and conv.user_b_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized.")

    # Mark messages as read
    unread_msgs = db.query(Message).filter(
        Message.conversation_id == conversation_id,
        Message.sender_id != current_user.id,
        Message.is_read == False,
    ).all()
    for m in unread_msgs:
        m.is_read = True
    # Reset unread count
    if conv.user_a_id == current_user.id:
        conv.user_a_unread = 0
    else:
        conv.user_b_unread = 0
    db.commit()
    db.refresh(conv)

    return {
        "conversation": conv_to_dict(conv, current_user.id),
        "messages": [msg_to_dict(m) for m in conv.messages],
    }


@router.post("/{conversation_id}/send", status_code=status.HTTP_201_CREATED, summary="Send a message")
def send_message(
    conversation_id: int,
    payload: MessageCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    conv = db.query(Conversation).filter(Conversation.id == conversation_id).first()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found.")
    if conv.user_a_id != current_user.id and conv.user_b_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized.")

    msg = Message(
        conversation_id=conv.id,
        sender_id=current_user.id,
        content=payload.content,
        message_type=payload.message_type,
        attachment_url=payload.attachment_url,
    )
    db.add(msg)
    conv.last_message_preview = payload.content[:300]
    conv.last_message_at = datetime.now(timezone.utc)
    recipient_id = conv.user_b_id if conv.user_a_id == current_user.id else conv.user_a_id
    if conv.user_a_id == recipient_id:
        conv.user_a_unread = (conv.user_a_unread or 0) + 1
    else:
        conv.user_b_unread = (conv.user_b_unread or 0) + 1
    db.commit()
    db.refresh(msg)
    return msg_to_dict(msg)

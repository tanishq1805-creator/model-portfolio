"""
Phase 4 — Talent Shortlists & Casting Boards
TalentShortlist: Curated board created by brand, agency, or casting director.
ShortlistItem: Model card pinned to a board with review status and notes.
"""
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base


class TalentShortlist(Base):
    __tablename__ = "talent_shortlists"

    id = Column(Integer, primary_key=True, index=True)
    creator_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    campaign_name = Column(String(200), nullable=True)
    is_private = Column(String(20), default="private") # private, shared_link, team

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    creator = relationship("User", foreign_keys=[creator_id])
    items = relationship("ShortlistItem", back_populates="shortlist", cascade="all, delete-orphan")


class ShortlistItem(Base):
    __tablename__ = "shortlist_items"

    id = Column(Integer, primary_key=True, index=True)
    shortlist_id = Column(Integer, ForeignKey("talent_shortlists.id", ondelete="CASCADE"), nullable=False)
    model_profile_id = Column(Integer, ForeignKey("model_profiles.id", ondelete="CASCADE"), nullable=False)

    casting_status = Column(String(50), default="considering") # considering, shortlisted, backup, booked, passed
    internal_notes = Column(Text, nullable=True)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    shortlist = relationship("TalentShortlist", back_populates="items")
    model_profile = relationship("ModelProfile", foreign_keys=[model_profile_id])

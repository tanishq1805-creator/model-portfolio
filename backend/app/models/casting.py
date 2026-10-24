"""
Phase 3 — Casting Marketplace Models
CastingCall: posted by brands/casting directors
CastingApplication: submitted by models
"""
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, Boolean, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base


class CastingCall(Base):
    __tablename__ = "casting_calls"

    id = Column(Integer, primary_key=True, index=True)
    poster_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    # Core details
    title = Column(String(200), nullable=False)
    brand_name = Column(String(150), nullable=False)
    campaign_name = Column(String(200), nullable=True)
    description = Column(Text, nullable=False)
    category = Column(String(100), nullable=False)  # Fashion, Commercial, Editorial, Runway, Beauty, Fitness ...
    location = Column(String(150), nullable=False)
    is_remote = Column(Boolean, default=False)

    # Requirements
    gender_requirement = Column(String(100), nullable=True)   # Any, Female, Male, Non-binary
    min_age = Column(Integer, nullable=True)
    max_age = Column(Integer, nullable=True)
    min_height_cm = Column(Float, nullable=True)
    max_height_cm = Column(Float, nullable=True)
    experience_level = Column(String(50), nullable=True)       # Beginner, Intermediate, Professional, Expert
    skills_required = Column(String(500), nullable=True)       # comma-separated

    # Compensation & timeline
    compensation = Column(String(200), nullable=True)          # e.g. "₹15,000 / day"
    compensation_type = Column(String(50), default="paid")     # paid, tfcd, negotiable
    shoot_date = Column(String(100), nullable=True)            # e.g. "15 Nov 2026" or "Nov 2026"
    application_deadline = Column(String(100), nullable=True)

    # Status
    status = Column(String(50), default="active")             # active, closed, draft, cancelled
    is_featured = Column(Boolean, default=False)
    views_count = Column(Integer, default=0)
    applications_count = Column(Integer, default=0)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    poster = relationship("User", foreign_keys=[poster_id])
    applications = relationship("CastingApplication", back_populates="casting_call", cascade="all, delete-orphan")


class CastingApplication(Base):
    __tablename__ = "casting_applications"

    id = Column(Integer, primary_key=True, index=True)
    casting_call_id = Column(Integer, ForeignKey("casting_calls.id", ondelete="CASCADE"), nullable=False)
    applicant_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    cover_note = Column(Text, nullable=True)
    portfolio_url = Column(String(500), nullable=True)
    status = Column(String(50), default="pending")  # pending, shortlisted, selected, rejected
    admin_notes = Column(Text, nullable=True)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    casting_call = relationship("CastingCall", back_populates="applications")
    applicant = relationship("User", foreign_keys=[applicant_id])

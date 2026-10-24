"""
Phase 4 — Agency Profiles & Representation Network
"""
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base


class AgencyProfile(Base):
    __tablename__ = "agency_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=True)

    name = Column(String(200), nullable=False)
    slug = Column(String(100), unique=True, index=True, nullable=False)
    tagline = Column(String(255), nullable=True)
    bio = Column(Text, nullable=True)
    logo_url = Column(String(500), nullable=True)
    cover_image = Column(String(500), nullable=True)
    headquarters = Column(String(150), nullable=False, default="Mumbai, India")
    global_locations = Column(String(255), nullable=True) # e.g. "Paris, Milan, London, Mumbai"
    website = Column(String(255), nullable=True)
    contact_email = Column(String(255), nullable=True)
    phone = Column(String(50), nullable=True)
    is_verified = Column(Boolean, default=True)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    user = relationship("User", foreign_keys=[user_id])

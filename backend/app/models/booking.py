"""
Phase 4 — Direct Bookings & Contract Offers
BookingOffer: Represents a direct booking contract between client (Brand/Agency/Photographer) and Model.
"""
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, Boolean, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base


class BookingOffer(Base):
    __tablename__ = "booking_offers"

    id = Column(Integer, primary_key=True, index=True)
    client_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    model_profile_id = Column(Integer, ForeignKey("model_profiles.id", ondelete="CASCADE"), nullable=False)

    # Project metadata
    project_title = Column(String(200), nullable=False)
    client_organization = Column(String(150), nullable=False)
    project_type = Column(String(100), default="Editorial")  # Editorial, Runway, Commercial, Lookbook, Campaign
    shoot_location = Column(String(200), nullable=False)
    start_date = Column(String(100), nullable=False)  # ISO or date string
    end_date = Column(String(100), nullable=True)
    call_time = Column(String(50), nullable=True)     # e.g., "08:30 AM"

    # Compensation & Usage terms
    compensation_amount = Column(Float, nullable=False)
    currency = Column(String(10), default="INR")       # INR, USD, EUR, GBP
    rate_basis = Column(String(50), default="day_rate") # day_rate, hourly, project_flat
    usage_rights = Column(String(150), default="Digital (1 Year)") # e.g. "Global Digital & Print 2 Years", "Perpetual Worldwide"
    cancellation_terms = Column(Text, nullable=True)
    wardrobe_notes = Column(Text, nullable=True)

    # Status: pending, accepted, declined, counter_offered, completed, cancelled
    status = Column(String(50), default="pending", nullable=False)
    response_notes = Column(Text, nullable=True)
    counter_offer_amount = Column(Float, nullable=True)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    client = relationship("User", foreign_keys=[client_id])
    model_profile = relationship("ModelProfile", foreign_keys=[model_profile_id])

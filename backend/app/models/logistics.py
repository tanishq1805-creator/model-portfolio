"""
Phase 5 — High-Fashion Production Logistics, Availability & Financials
1. ProductionCallSheet: Shoot logistics, crew directory, timeline schedule & attendance RSVP
2. AvailabilityEntry: Date holds (option 1, option 2, booked, blackout, travel)
3. Invoice: Commercial invoice, agency fee split, escrow tracking & payment status
"""
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, Boolean, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base


class ProductionCallSheet(Base):
    __tablename__ = "production_call_sheets"

    id = Column(Integer, primary_key=True, index=True)
    booking_offer_id = Column(Integer, ForeignKey("booking_offers.id", ondelete="SET NULL"), nullable=True)
    creator_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    model_profile_id = Column(Integer, ForeignKey("model_profiles.id", ondelete="CASCADE"), nullable=False)

    shoot_title = Column(String(200), nullable=False)
    production_company = Column(String(150), nullable=False)
    shoot_date = Column(String(50), nullable=False) # e.g. "2026-11-20"
    general_call_time = Column(String(50), nullable=False, default="08:00 AM")
    talent_call_time = Column(String(50), nullable=False, default="08:30 AM")
    shoot_location = Column(String(255), nullable=False)
    location_notes = Column(Text, nullable=True) # parking, gate code, studio bay

    # JSON or structured schedule & crew notes
    schedule_blocks = Column(Text, nullable=True) # JSON list: [{time, activity, notes}]
    crew_contacts = Column(Text, nullable=True)   # JSON list: [{role, name, phone}]
    wardrobe_brief = Column(Text, nullable=True)  # look description, skin prep
    catering_notes = Column(Text, nullable=True)

    # Live model check-in status: pending_confirmation, confirmed, en_route, on_set, wrapped
    attendance_status = Column(String(50), default="confirmed", nullable=False)
    attendance_updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    creator = relationship("User", foreign_keys=[creator_id])
    model_profile = relationship("ModelProfile", foreign_keys=[model_profile_id])
    booking_offer = relationship("BookingOffer", foreign_keys=[booking_offer_id])


class AvailabilityEntry(Base):
    __tablename__ = "model_availability_entries"

    id = Column(Integer, primary_key=True, index=True)
    model_profile_id = Column(Integer, ForeignKey("model_profiles.id", ondelete="CASCADE"), nullable=False)

    date = Column(String(20), nullable=False, index=True) # YYYY-MM-DD
    status = Column(String(50), default="booked", nullable=False) # available, option_1, option_2, booked, blackout, travel
    city_location = Column(String(100), nullable=True) # e.g. Paris, Milan, Mumbai
    project_label = Column(String(200), nullable=True) # e.g. "Chanel Runway Hold"
    is_private = Column(Boolean, default=False)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    model_profile = relationship("ModelProfile", foreign_keys=[model_profile_id])


class Invoice(Base):
    __tablename__ = "invoices"

    id = Column(Integer, primary_key=True, index=True)
    invoice_number = Column(String(50), unique=True, index=True, nullable=False)
    booking_offer_id = Column(Integer, ForeignKey("booking_offers.id", ondelete="SET NULL"), nullable=True)
    client_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    model_profile_id = Column(Integer, ForeignKey("model_profiles.id", ondelete="CASCADE"), nullable=False)

    project_title = Column(String(200), nullable=False)
    currency = Column(String(10), default="INR")
    gross_amount = Column(Float, nullable=False)
    agency_fee_percentage = Column(Float, default=20.0) # 20% standard agency commission
    agency_fee_amount = Column(Float, default=0.0)
    net_talent_amount = Column(Float, nullable=False)
    tax_amount = Column(Float, default=0.0)
    total_amount = Column(Float, nullable=False)

    # Status: draft, issued, in_escrow, paid, cancelled
    payment_status = Column(String(50), default="issued", nullable=False)
    due_date = Column(String(50), nullable=True)
    paid_at = Column(DateTime, nullable=True)
    payment_method = Column(String(50), default="Escrow Wire Transfer")

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    client = relationship("User", foreign_keys=[client_id])
    model_profile = relationship("ModelProfile", foreign_keys=[model_profile_id])
    booking_offer = relationship("BookingOffer", foreign_keys=[booking_offer_id])

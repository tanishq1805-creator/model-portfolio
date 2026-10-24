from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, Boolean, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class ModelProfile(Base):
    __tablename__ = "model_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    
    # Basic Info
    full_name = Column(String(150), nullable=False, default="")
    username = Column(String(100), unique=True, index=True, nullable=False)
    profile_photo = Column(String(500), nullable=True)
    cover_image = Column(String(500), nullable=True)
    bio = Column(Text, nullable=True)
    date_of_birth = Column(String(50), nullable=True)
    gender = Column(String(50), nullable=True)
    location = Column(String(150), nullable=True)
    city = Column(String(100), nullable=True, index=True)
    country = Column(String(100), nullable=True)

    # Professional Details
    model_type = Column(String(255), nullable=True)  # e.g., "Fashion, Runway, Editorial"
    experience_level = Column(String(50), nullable=True)  # Beginner, Intermediate, Professional, Expert
    height_cm = Column(Float, nullable=True)
    height_feet_inches = Column(String(20), nullable=True)  # e.g. 5'10"
    shoe_size = Column(String(20), nullable=True)
    hair_color = Column(String(50), nullable=True)
    eye_color = Column(String(50), nullable=True)
    languages = Column(String(255), nullable=True)  # comma-separated e.g. "English, Hindi, French"
    skills = Column(String(500), nullable=True)  # comma-separated e.g. "Runway, High Fashion, Posing, Acting"

    # Representation & Availability
    agency_status = Column(String(50), default="independent")  # independent, represented
    agency_name = Column(String(150), nullable=True)
    availability_status = Column(String(50), default="available")  # available, partially_available, unavailable

    # Platform State
    profile_completion_percentage = Column(Integer, default=0)
    onboarding_completed = Column(Boolean, default=False)
    
    # Verification Badges
    is_identity_verified = Column(Boolean, default=False)
    is_portfolio_verified = Column(Boolean, default=False)
    is_measurements_verified = Column(Boolean, default=False)
    is_agency_verified = Column(Boolean, default=False)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    user = relationship("User", back_populates="model_profile")
    measurements = relationship("ModelMeasurements", back_populates="profile", uselist=False, cascade="all, delete-orphan")
    portfolio_items = relationship("ModelPortfolioItem", back_populates="profile", cascade="all, delete-orphan", order_by="ModelPortfolioItem.display_order")
    experiences = relationship("ModelExperience", back_populates="profile", cascade="all, delete-orphan")
    social_links = relationship("ModelSocialLinks", back_populates="profile", uselist=False, cascade="all, delete-orphan")
    achievements = relationship("ModelAchievement", back_populates="profile", cascade="all, delete-orphan")
    reviews = relationship("ModelReview", back_populates="profile", cascade="all, delete-orphan")
    verification_requests = relationship("VerificationRequest", back_populates="profile", cascade="all, delete-orphan")


class ModelMeasurements(Base):
    __tablename__ = "model_measurements"

    id = Column(Integer, primary_key=True, index=True)
    model_profile_id = Column(Integer, ForeignKey("model_profiles.id", ondelete="CASCADE"), unique=True, nullable=False)

    bust = Column(Float, nullable=True)       # in inches or cm
    waist = Column(Float, nullable=True)
    hips = Column(Float, nullable=True)
    chest = Column(Float, nullable=True)
    collar = Column(Float, nullable=True)
    inseam = Column(Float, nullable=True)
    suit_jacket = Column(String(20), nullable=True)
    visibility = Column(String(50), default="public")  # public, verified_only, brands_only, private

    profile = relationship("ModelProfile", back_populates="measurements")


class ModelPortfolioItem(Base):
    __tablename__ = "model_portfolio_items"

    id = Column(Integer, primary_key=True, index=True)
    model_profile_id = Column(Integer, ForeignKey("model_profiles.id", ondelete="CASCADE"), nullable=False)

    media_url = Column(String(500), nullable=False)
    media_type = Column(String(20), default="image")  # image, video
    category = Column(String(50), default="Editorial")  # Editorial, Runway, Commercial, Beauty, Fitness, Lifestyle, Fashion, Jewellery, Product, Campaigns
    caption = Column(String(255), nullable=True)
    photographer_credit = Column(String(150), nullable=True)
    stylist_credit = Column(String(150), nullable=True)
    brand_credit = Column(String(150), nullable=True)
    is_cover = Column(Boolean, default=False)
    display_order = Column(Integer, default=0)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    profile = relationship("ModelProfile", back_populates="portfolio_items")


class ModelExperience(Base):
    __tablename__ = "model_experiences"

    id = Column(Integer, primary_key=True, index=True)
    model_profile_id = Column(Integer, ForeignKey("model_profiles.id", ondelete="CASCADE"), nullable=False)

    company_or_brand = Column(String(150), nullable=False)
    campaign_title = Column(String(200), nullable=False)
    role_title = Column(String(100), default="Model")
    location = Column(String(100), nullable=True)
    year = Column(String(20), nullable=False)
    description = Column(Text, nullable=True)

    profile = relationship("ModelProfile", back_populates="experiences")


class ModelAchievement(Base):
    __tablename__ = "model_achievements"

    id = Column(Integer, primary_key=True, index=True)
    model_profile_id = Column(Integer, ForeignKey("model_profiles.id", ondelete="CASCADE"), nullable=False)

    title = Column(String(200), nullable=False)  # e.g., "Paris Fashion Week - Chanel Grand Finale"
    organization_or_event = Column(String(150), nullable=False)  # e.g., "Chanel / Paris Haute Couture"
    year = Column(String(20), nullable=False)  # e.g., "2026"
    category = Column(String(50), default="Fashion Week")  # Fashion Week, Magazine Feature, Award, Brand Campaign
    description = Column(Text, nullable=True)

    profile = relationship("ModelProfile", back_populates="achievements")


class ModelReview(Base):
    __tablename__ = "model_reviews"

    id = Column(Integer, primary_key=True, index=True)
    model_profile_id = Column(Integer, ForeignKey("model_profiles.id", ondelete="CASCADE"), nullable=False)
    reviewer_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)

    reviewer_name = Column(String(150), nullable=False)
    reviewer_company = Column(String(150), nullable=True)
    reviewer_role = Column(String(50), default="Brand")  # Brand, Casting Director, Photographer, Agency
    rating = Column(Integer, default=5)  # 1 to 5 stars
    comment = Column(Text, nullable=False)
    project_name = Column(String(200), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    profile = relationship("ModelProfile", back_populates="reviews")


class VerificationRequest(Base):
    __tablename__ = "verification_requests"

    id = Column(Integer, primary_key=True, index=True)
    model_profile_id = Column(Integer, ForeignKey("model_profiles.id", ondelete="CASCADE"), nullable=False)

    verification_type = Column(String(50), nullable=False)  # identity, portfolio, measurements, agency
    document_url = Column(String(500), nullable=True)
    notes = Column(Text, nullable=True)
    status = Column(String(50), default="pending")  # pending, under_review, verified, rejected
    admin_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    profile = relationship("ModelProfile", back_populates="verification_requests")


class ModelSocialLinks(Base):
    __tablename__ = "model_social_links"

    id = Column(Integer, primary_key=True, index=True)
    model_profile_id = Column(Integer, ForeignKey("model_profiles.id", ondelete="CASCADE"), unique=True, nullable=False)

    instagram = Column(String(150), nullable=True)
    linkedin = Column(String(255), nullable=True)
    website = Column(String(255), nullable=True)
    youtube = Column(String(255), nullable=True)
    other_portfolio_url = Column(String(255), nullable=True)

    profile = relationship("ModelProfile", back_populates="social_links")

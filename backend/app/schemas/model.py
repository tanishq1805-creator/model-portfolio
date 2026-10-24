from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, Field

class MeasurementsSchema(BaseModel):
    bust: Optional[float] = None
    waist: Optional[float] = None
    hips: Optional[float] = None
    chest: Optional[float] = None
    collar: Optional[float] = None
    inseam: Optional[float] = None
    suit_jacket: Optional[str] = None
    visibility: Optional[str] = "public"
    is_restricted: Optional[bool] = False  # True if hidden from current viewer based on privacy

    class Config:
        from_attributes = True

class PortfolioItemSchema(BaseModel):
    id: Optional[int] = None
    media_url: str
    media_type: str = "image"
    category: str = "Editorial"
    caption: Optional[str] = None
    photographer_credit: Optional[str] = None
    stylist_credit: Optional[str] = None
    brand_credit: Optional[str] = None
    is_cover: bool = False
    display_order: int = 0

    class Config:
        from_attributes = True

class PortfolioItemCreate(BaseModel):
    media_url: str
    media_type: str = "image"
    category: str = "Editorial"
    caption: Optional[str] = None
    photographer_credit: Optional[str] = None
    stylist_credit: Optional[str] = None
    brand_credit: Optional[str] = None
    is_cover: bool = False
    display_order: Optional[int] = 0

class ExperienceSchema(BaseModel):
    id: Optional[int] = None
    company_or_brand: str
    campaign_title: str
    role_title: str = "Model"
    location: Optional[str] = None
    year: str
    description: Optional[str] = None

    class Config:
        from_attributes = True

class ExperienceCreate(BaseModel):
    company_or_brand: str
    campaign_title: str
    role_title: str = "Model"
    location: Optional[str] = None
    year: str
    description: Optional[str] = None

class AchievementSchema(BaseModel):
    id: Optional[int] = None
    title: str
    organization_or_event: str
    year: str
    category: str = "Fashion Week"
    description: Optional[str] = None

    class Config:
        from_attributes = True

class AchievementCreate(BaseModel):
    title: str
    organization_or_event: str
    year: str
    category: str = "Fashion Week"
    description: Optional[str] = None

class ReviewSchema(BaseModel):
    id: int
    reviewer_name: str
    reviewer_company: Optional[str] = None
    reviewer_role: str = "Brand"
    rating: int = 5
    comment: str
    project_name: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class ReviewCreate(BaseModel):
    rating: int = Field(5, ge=1, le=5)
    comment: str
    project_name: Optional[str] = None

class VerificationRequestSchema(BaseModel):
    id: int
    verification_type: str
    document_url: Optional[str] = None
    notes: Optional[str] = None
    status: str
    admin_notes: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class VerificationRequestCreate(BaseModel):
    verification_type: str  # identity, portfolio, measurements, agency
    document_url: str
    notes: Optional[str] = None

class SocialLinksSchema(BaseModel):
    instagram: Optional[str] = None
    linkedin: Optional[str] = None
    website: Optional[str] = None
    youtube: Optional[str] = None
    other_portfolio_url: Optional[str] = None

    class Config:
        from_attributes = True

class FullOnboardingPayload(BaseModel):
    step: Optional[int] = None
    full_name: Optional[str] = None
    username: Optional[str] = None
    profile_photo: Optional[str] = None
    cover_image: Optional[str] = None
    date_of_birth: Optional[str] = None
    gender: Optional[str] = None
    location: Optional[str] = None
    city: Optional[str] = None
    country: Optional[str] = None
    bio: Optional[str] = None

    model_type: Optional[str] = None
    experience_level: Optional[str] = None
    height_cm: Optional[float] = None
    height_feet_inches: Optional[str] = None
    shoe_size: Optional[str] = None
    hair_color: Optional[str] = None
    eye_color: Optional[str] = None
    languages: Optional[str] = None
    skills: Optional[str] = None
    measurements: Optional[MeasurementsSchema] = None

    portfolio_items: Optional[List[PortfolioItemSchema]] = None
    experiences: Optional[List[ExperienceSchema]] = None
    achievements: Optional[List[AchievementSchema]] = None
    agency_status: Optional[str] = None
    agency_name: Optional[str] = None
    availability_status: Optional[str] = None
    social_links: Optional[SocialLinksSchema] = None
    mark_completed: Optional[bool] = False

class ProfileCompletionScore(BaseModel):
    percentage: int
    is_complete: bool
    missing_items: List[str]

class ModelProfileResponse(BaseModel):
    id: int
    user_id: int
    full_name: str
    username: str
    profile_photo: Optional[str] = None
    cover_image: Optional[str] = None
    bio: Optional[str] = None
    date_of_birth: Optional[str] = None
    gender: Optional[str] = None
    location: Optional[str] = None
    city: Optional[str] = None
    country: Optional[str] = None

    model_type: Optional[str] = None
    experience_level: Optional[str] = None
    height_cm: Optional[float] = None
    height_feet_inches: Optional[str] = None
    shoe_size: Optional[str] = None
    hair_color: Optional[str] = None
    eye_color: Optional[str] = None
    languages: Optional[str] = None
    skills: Optional[str] = None

    agency_status: str
    agency_name: Optional[str] = None
    availability_status: str

    profile_completion_percentage: int
    onboarding_completed: bool

    is_identity_verified: bool
    is_portfolio_verified: bool
    is_measurements_verified: bool
    is_agency_verified: bool

    rating_average: float = 5.0
    reviews_count: int = 0

    measurements: Optional[MeasurementsSchema] = None
    portfolio_items: List[PortfolioItemSchema] = []
    experiences: List[ExperienceSchema] = []
    achievements: List[AchievementSchema] = []
    reviews: List[ReviewSchema] = []
    social_links: Optional[SocialLinksSchema] = None
    completion_score: Optional[ProfileCompletionScore] = None

    class Config:
        from_attributes = True

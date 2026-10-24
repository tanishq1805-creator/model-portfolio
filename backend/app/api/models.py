from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc, func

from app.database import get_db
from app.models.user import User, UserRole
from app.models.model_profile import (
    ModelProfile,
    ModelMeasurements,
    ModelPortfolioItem,
    ModelExperience,
    ModelSocialLinks,
    ModelAchievement,
    ModelReview,
    VerificationRequest,
)
from app.schemas.model import (
    ModelProfileResponse,
    FullOnboardingPayload,
    ProfileCompletionScore,
    MeasurementsSchema,
    PortfolioItemSchema,
    PortfolioItemCreate,
    ExperienceSchema,
    ExperienceCreate,
    AchievementSchema,
    AchievementCreate,
    ReviewSchema,
    ReviewCreate,
    VerificationRequestSchema,
    VerificationRequestCreate,
    SocialLinksSchema,
)
from app.security import get_current_user, get_optional_current_user
from app.services.profile_score import calculate_profile_completion

router = APIRouter(prefix="/models", tags=["Models"])

def resolve_measurements_privacy(
    measurements: Optional[ModelMeasurements],
    current_user: Optional[User],
    profile_user_id: int,
) -> Optional[MeasurementsSchema]:
    if not measurements:
        return None

    vis = measurements.visibility or "public"

    # Always visible to profile owner or platform admin
    if current_user and (current_user.id == profile_user_id or current_user.role == UserRole.ADMIN.value):
        return MeasurementsSchema(
            bust=measurements.bust,
            waist=measurements.waist,
            hips=measurements.hips,
            chest=measurements.chest,
            collar=measurements.collar,
            inseam=measurements.inseam,
            suit_jacket=measurements.suit_jacket,
            visibility=vis,
            is_restricted=False,
        )

    # Public visibility
    if vis == "public":
        return MeasurementsSchema(
            bust=measurements.bust,
            waist=measurements.waist,
            hips=measurements.hips,
            chest=measurements.chest,
            collar=measurements.collar,
            inseam=measurements.inseam,
            suit_jacket=measurements.suit_jacket,
            visibility=vis,
            is_restricted=False,
        )

    # Verified users only
    if vis == "verified_only":
        if current_user and current_user.is_verified:
            return MeasurementsSchema(
                bust=measurements.bust,
                waist=measurements.waist,
                hips=measurements.hips,
                chest=measurements.chest,
                collar=measurements.collar,
                inseam=measurements.inseam,
                suit_jacket=measurements.suit_jacket,
                visibility=vis,
                is_restricted=False,
            )
        # Restricted
        return MeasurementsSchema(
            visibility=vis,
            is_restricted=True,
        )

    # Brands and casting teams only
    if vis == "brands_only":
        if current_user and current_user.role in [
            UserRole.BRAND.value,
            UserRole.CASTING_DIRECTOR.value,
            UserRole.AGENCY.value,
        ]:
            return MeasurementsSchema(
                bust=measurements.bust,
                waist=measurements.waist,
                hips=measurements.hips,
                chest=measurements.chest,
                collar=measurements.collar,
                inseam=measurements.inseam,
                suit_jacket=measurements.suit_jacket,
                visibility=vis,
                is_restricted=False,
            )
        # Restricted
        return MeasurementsSchema(
            visibility=vis,
            is_restricted=True,
        )

    # Private
    return MeasurementsSchema(
        visibility="private",
        is_restricted=True,
    )


def build_profile_response(profile: ModelProfile, current_user: Optional[User] = None) -> ModelProfileResponse:
    score_data = calculate_profile_completion(
        profile=profile,
        measurements=profile.measurements,
        portfolio_items=profile.portfolio_items,
        experiences=profile.experiences,
        social_links=profile.social_links,
    )

    measurements_data = resolve_measurements_privacy(
        profile.measurements,
        current_user,
        profile.user_id,
    )

    portfolio_list = [
        PortfolioItemSchema(
            id=item.id,
            media_url=item.media_url,
            media_type=item.media_type,
            category=item.category,
            caption=item.caption,
            photographer_credit=item.photographer_credit,
            stylist_credit=item.stylist_credit,
            brand_credit=item.brand_credit,
            is_cover=item.is_cover,
            display_order=item.display_order,
        )
        for item in profile.portfolio_items
    ]

    experience_list = [
        ExperienceSchema(
            id=exp.id,
            company_or_brand=exp.company_or_brand,
            campaign_title=exp.campaign_title,
            role_title=exp.role_title,
            location=exp.location,
            year=exp.year,
            description=exp.description,
        )
        for exp in profile.experiences
    ]

    achievement_list = [
        AchievementSchema(
            id=ach.id,
            title=ach.title,
            organization_or_event=ach.organization_or_event,
            year=ach.year,
            category=ach.category,
            description=ach.description,
        )
        for ach in (profile.achievements or [])
    ]

    reviews_list = [
        ReviewSchema(
            id=rev.id,
            reviewer_name=rev.reviewer_name,
            reviewer_company=rev.reviewer_company,
            reviewer_role=rev.reviewer_role,
            rating=rev.rating,
            comment=rev.comment,
            project_name=rev.project_name,
            created_at=rev.created_at,
        )
        for rev in (profile.reviews or [])
    ]

    avg_rating = 5.0
    if profile.reviews and len(profile.reviews) > 0:
        avg_rating = round(sum(r.rating for r in profile.reviews) / len(profile.reviews), 1)

    social_data = None
    if profile.social_links:
        social_data = SocialLinksSchema(
            instagram=profile.social_links.instagram,
            linkedin=profile.social_links.linkedin,
            website=profile.social_links.website,
            youtube=profile.social_links.youtube,
            other_portfolio_url=profile.social_links.other_portfolio_url,
        )

    completion_score = ProfileCompletionScore(
        percentage=score_data["percentage"],
        is_complete=score_data["is_complete"],
        missing_items=score_data["missing_items"],
    )

    return ModelProfileResponse(
        id=profile.id,
        user_id=profile.user_id,
        full_name=profile.full_name or "Editorial Talent",
        username=profile.username,
        profile_photo=profile.profile_photo,
        cover_image=profile.cover_image,
        bio=profile.bio,
        date_of_birth=profile.date_of_birth,
        gender=profile.gender,
        location=profile.location,
        city=profile.city,
        country=profile.country,
        model_type=profile.model_type,
        experience_level=profile.experience_level,
        height_cm=profile.height_cm,
        height_feet_inches=profile.height_feet_inches,
        shoe_size=profile.shoe_size,
        hair_color=profile.hair_color,
        eye_color=profile.eye_color,
        languages=profile.languages,
        skills=profile.skills,
        agency_status=profile.agency_status or "independent",
        agency_name=profile.agency_name,
        availability_status=profile.availability_status or "available",
        profile_completion_percentage=score_data["percentage"],
        onboarding_completed=profile.onboarding_completed,
        is_identity_verified=profile.is_identity_verified,
        is_portfolio_verified=profile.is_portfolio_verified,
        is_measurements_verified=profile.is_measurements_verified,
        is_agency_verified=profile.is_agency_verified,
        rating_average=avg_rating,
        reviews_count=len(reviews_list),
        measurements=measurements_data,
        portfolio_items=portfolio_list,
        experiences=experience_list,
        achievements=achievement_list,
        reviews=reviews_list,
        social_links=social_data,
        completion_score=completion_score,
    )


@router.get("", response_model=List[ModelProfileResponse])
def list_models(
    query: Optional[str] = None,
    city: Optional[str] = None,
    model_type: Optional[str] = None,
    verified_only: Optional[bool] = False,
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db),
):
    q = db.query(ModelProfile)

    if query:
        search_filter = or_(
            ModelProfile.full_name.ilike(f"%{query}%"),
            ModelProfile.username.ilike(f"%{query}%"),
            ModelProfile.city.ilike(f"%{query}%"),
            ModelProfile.skills.ilike(f"%{query}%"),
            ModelProfile.model_type.ilike(f"%{query}%"),
        )
        q = q.filter(search_filter)

    if city:
        q = q.filter(ModelProfile.city.ilike(f"%{city}%"))

    if model_type:
        q = q.filter(ModelProfile.model_type.ilike(f"%{model_type}%"))

    if verified_only:
        q = q.filter(
            or_(
                ModelProfile.is_identity_verified == True,
                ModelProfile.is_portfolio_verified == True,
            )
        )

    profiles = q.order_by(desc(ModelProfile.profile_completion_percentage), desc(ModelProfile.id)).offset(offset).limit(limit).all()
    return [build_profile_response(p, current_user) for p in profiles]


@router.get("/me/profile", response_model=ModelProfileResponse)
def get_my_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not current_user.model_profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Model profile not found for this user account",
        )
    return build_profile_response(current_user.model_profile, current_user)


@router.get("/{username}", response_model=ModelProfileResponse)
def get_model_by_username(
    username: str,
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db),
):
    profile = db.query(ModelProfile).filter(ModelProfile.username == username.lower()).first()
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Model @{username} not found",
        )
    return build_profile_response(profile, current_user)


# ==========================================
# PHASE 2: PORTFOLIO MANAGEMENT
# ==========================================
@router.post("/portfolio", response_model=PortfolioItemSchema, status_code=status.HTTP_201_CREATED)
def add_portfolio_item(
    payload: PortfolioItemCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    profile = current_user.model_profile
    if not profile:
        raise HTTPException(status_code=400, detail="Only models can add portfolio items")

    order = payload.display_order or db.query(ModelPortfolioItem).filter(ModelPortfolioItem.model_profile_id == profile.id).count()

    item = ModelPortfolioItem(
        model_profile_id=profile.id,
        media_url=payload.media_url,
        media_type=payload.media_type,
        category=payload.category,
        caption=payload.caption,
        photographer_credit=payload.photographer_credit,
        stylist_credit=payload.stylist_credit,
        brand_credit=payload.brand_credit,
        is_cover=payload.is_cover,
        display_order=order,
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.delete("/portfolio/{item_id}", status_code=status.HTTP_200_OK)
def delete_portfolio_item(
    item_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    profile = current_user.model_profile
    if not profile:
        raise HTTPException(status_code=400, detail="Action not permitted")

    item = db.query(ModelPortfolioItem).filter(
        ModelPortfolioItem.id == item_id,
        ModelPortfolioItem.model_profile_id == profile.id,
    ).first()
    if not item:
        raise HTTPException(status_code=404, detail="Portfolio item not found")

    db.delete(item)
    db.commit()
    return {"message": "Portfolio item deleted successfully", "id": item_id}


# ==========================================
# PHASE 2: EXPERIENCE TIMELINE MANAGEMENT
# ==========================================
@router.post("/experience", response_model=ExperienceSchema, status_code=status.HTTP_201_CREATED)
def add_experience(
    payload: ExperienceCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    profile = current_user.model_profile
    if not profile:
        raise HTTPException(status_code=400, detail="Only models can add experience")

    exp = ModelExperience(
        model_profile_id=profile.id,
        company_or_brand=payload.company_or_brand,
        campaign_title=payload.campaign_title,
        role_title=payload.role_title,
        location=payload.location,
        year=payload.year,
        description=payload.description,
    )
    db.add(exp)
    db.commit()
    db.refresh(exp)
    return exp


@router.delete("/experience/{exp_id}", status_code=status.HTTP_200_OK)
def delete_experience(
    exp_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    profile = current_user.model_profile
    if not profile:
        raise HTTPException(status_code=400, detail="Action not permitted")

    exp = db.query(ModelExperience).filter(
        ModelExperience.id == exp_id,
        ModelExperience.model_profile_id == profile.id,
    ).first()
    if not exp:
        raise HTTPException(status_code=404, detail="Experience record not found")

    db.delete(exp)
    db.commit()
    return {"message": "Experience record deleted", "id": exp_id}


# ==========================================
# PHASE 2: ACHIEVEMENTS & ACCREDITATIONS
# ==========================================
@router.post("/achievements", response_model=AchievementSchema, status_code=status.HTTP_201_CREATED)
def add_achievement(
    payload: AchievementCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    profile = current_user.model_profile
    if not profile:
        raise HTTPException(status_code=400, detail="Only models can add achievements")

    ach = ModelAchievement(
        model_profile_id=profile.id,
        title=payload.title,
        organization_or_event=payload.organization_or_event,
        year=payload.year,
        category=payload.category,
        description=payload.description,
    )
    db.add(ach)
    db.commit()
    db.refresh(ach)
    return ach


@router.delete("/achievements/{ach_id}", status_code=status.HTTP_200_OK)
def delete_achievement(
    ach_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    profile = current_user.model_profile
    if not profile:
        raise HTTPException(status_code=400, detail="Action not permitted")

    ach = db.query(ModelAchievement).filter(
        ModelAchievement.id == ach_id,
        ModelAchievement.model_profile_id == profile.id,
    ).first()
    if not ach:
        raise HTTPException(status_code=404, detail="Achievement not found")

    db.delete(ach)
    db.commit()
    return {"message": "Achievement removed", "id": ach_id}


# ==========================================
# PHASE 2: REVIEWS & ENDORSEMENTS
# ==========================================
@router.post("/{username}/reviews", response_model=ReviewSchema, status_code=status.HTTP_201_CREATED)
def create_model_review(
    username: str,
    payload: ReviewCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    profile = db.query(ModelProfile).filter(ModelProfile.username == username.lower()).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Model profile not found")

    if profile.user_id == current_user.id:
        raise HTTPException(status_code=400, detail="You cannot review your own profile")

    reviewer_name = current_user.email.split("@")[0].title()
    reviewer_company = "Verified Creative Partner"

    rev = ModelReview(
        model_profile_id=profile.id,
        reviewer_id=current_user.id,
        reviewer_name=reviewer_name,
        reviewer_company=reviewer_company,
        reviewer_role=current_user.role,
        rating=payload.rating,
        comment=payload.comment,
        project_name=payload.project_name or "Commercial Collaboration",
    )
    db.add(rev)
    db.commit()
    db.refresh(rev)
    return rev


# ==========================================
# PHASE 2: VERIFICATION REQUEST WORKFLOW
# ==========================================
@router.post("/verification/request", response_model=VerificationRequestSchema, status_code=status.HTTP_201_CREATED)
def submit_verification_request(
    payload: VerificationRequestCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    profile = current_user.model_profile
    if not profile:
        raise HTTPException(status_code=400, detail="Only models can request badge verification")

    req = VerificationRequest(
        model_profile_id=profile.id,
        verification_type=payload.verification_type,
        document_url=payload.document_url,
        notes=payload.notes,
        status="pending",
    )
    db.add(req)
    db.commit()
    db.refresh(req)
    return req


@router.get("/verification/my-requests", response_model=List[VerificationRequestSchema])
def get_my_verification_requests(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    profile = current_user.model_profile
    if not profile:
        return []
    return profile.verification_requests or []


# ==========================================
# PHASE 2: PRIVACY VISIBILITY UPDATE
# ==========================================
@router.put("/privacy", response_model=MeasurementsSchema)
def update_measurements_privacy(
    visibility: str = Query(..., pattern="^(public|verified_only|brands_only|private)$"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    profile = current_user.model_profile
    if not profile:
        raise HTTPException(status_code=400, detail="Profile not found")

    if not profile.measurements:
        meas = ModelMeasurements(model_profile_id=profile.id, visibility=visibility)
        db.add(meas)
    else:
        profile.measurements.visibility = visibility

    db.commit()
    db.refresh(profile.measurements)
    return resolve_measurements_privacy(profile.measurements, current_user, profile.user_id)


# ==========================================
# ONBOARDING HANDLER
# ==========================================
@router.post("/onboarding", response_model=ModelProfileResponse)
def save_onboarding(
    payload: FullOnboardingPayload,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    profile = current_user.model_profile
    if not profile:
        profile = ModelProfile(
            user_id=current_user.id,
            username=f"model_{current_user.id}",
            full_name="",
        )
        db.add(profile)
        db.commit()
        db.refresh(profile)

    if payload.full_name is not None:
        profile.full_name = payload.full_name.strip()
    if payload.username is not None and payload.username.strip():
        new_username = payload.username.strip().lower()
        existing = db.query(ModelProfile).filter(
            ModelProfile.username == new_username,
            ModelProfile.id != profile.id,
        ).first()
        if existing:
            raise HTTPException(status_code=400, detail="This username is already taken. Please pick another.")
        profile.username = new_username

    if payload.profile_photo is not None:
        profile.profile_photo = payload.profile_photo
    if payload.cover_image is not None:
        profile.cover_image = payload.cover_image
    if payload.date_of_birth is not None:
        profile.date_of_birth = payload.date_of_birth
    if payload.gender is not None:
        profile.gender = payload.gender
    if payload.location is not None:
        profile.location = payload.location
    if payload.city is not None:
        profile.city = payload.city
    if payload.country is not None:
        profile.country = payload.country
    if payload.bio is not None:
        profile.bio = payload.bio

    if payload.model_type is not None:
        profile.model_type = payload.model_type
    if payload.experience_level is not None:
        profile.experience_level = payload.experience_level
    if payload.height_cm is not None:
        profile.height_cm = payload.height_cm
    if payload.height_feet_inches is not None:
        profile.height_feet_inches = payload.height_feet_inches
    if payload.shoe_size is not None:
        profile.shoe_size = payload.shoe_size
    if payload.hair_color is not None:
        profile.hair_color = payload.hair_color
    if payload.eye_color is not None:
        profile.eye_color = payload.eye_color
    if payload.languages is not None:
        profile.languages = payload.languages
    if payload.skills is not None:
        profile.skills = payload.skills

    if payload.measurements is not None:
        if not profile.measurements:
            meas = ModelMeasurements(model_profile_id=profile.id)
            db.add(meas)
            db.commit()
            db.refresh(meas)
            profile.measurements = meas

        if payload.measurements.bust is not None:
            profile.measurements.bust = payload.measurements.bust
        if payload.measurements.waist is not None:
            profile.measurements.waist = payload.measurements.waist
        if payload.measurements.hips is not None:
            profile.measurements.hips = payload.measurements.hips
        if payload.measurements.chest is not None:
            profile.measurements.chest = payload.measurements.chest
        if payload.measurements.collar is not None:
            profile.measurements.collar = payload.measurements.collar
        if payload.measurements.inseam is not None:
            profile.measurements.inseam = payload.measurements.inseam
        if payload.measurements.suit_jacket is not None:
            profile.measurements.suit_jacket = payload.measurements.suit_jacket
        if payload.measurements.visibility is not None:
            profile.measurements.visibility = payload.measurements.visibility

    if payload.portfolio_items is not None:
        db.query(ModelPortfolioItem).filter(ModelPortfolioItem.model_profile_id == profile.id).delete()
        for i, item_data in enumerate(payload.portfolio_items):
            db_item = ModelPortfolioItem(
                model_profile_id=profile.id,
                media_url=item_data.media_url,
                media_type=item_data.media_type or "image",
                category=item_data.category or "Editorial",
                caption=item_data.caption,
                photographer_credit=item_data.photographer_credit,
                stylist_credit=item_data.stylist_credit,
                brand_credit=item_data.brand_credit,
                is_cover=item_data.is_cover or (i == 0),
                display_order=i,
            )
            db.add(db_item)

    if payload.experiences is not None:
        db.query(ModelExperience).filter(ModelExperience.model_profile_id == profile.id).delete()
        for exp_data in payload.experiences:
            db_exp = ModelExperience(
                model_profile_id=profile.id,
                company_or_brand=exp_data.company_or_brand,
                campaign_title=exp_data.campaign_title,
                role_title=exp_data.role_title or "Model",
                location=exp_data.location,
                year=exp_data.year,
                description=exp_data.description,
            )
            db.add(db_exp)

    if payload.achievements is not None:
        db.query(ModelAchievement).filter(ModelAchievement.model_profile_id == profile.id).delete()
        for ach_data in payload.achievements:
            db_ach = ModelAchievement(
                model_profile_id=profile.id,
                title=ach_data.title,
                organization_or_event=ach_data.organization_or_event,
                year=ach_data.year,
                category=ach_data.category or "Fashion Week",
                description=ach_data.description,
            )
            db.add(db_ach)

    if payload.agency_status is not None:
        profile.agency_status = payload.agency_status
    if payload.agency_name is not None:
        profile.agency_name = payload.agency_name

    if payload.availability_status is not None:
        profile.availability_status = payload.availability_status

    if payload.social_links is not None:
        if not profile.social_links:
            soc = ModelSocialLinks(model_profile_id=profile.id)
            db.add(soc)
            db.commit()
            db.refresh(soc)
            profile.social_links = soc

        if payload.social_links.instagram is not None:
            profile.social_links.instagram = payload.social_links.instagram
        if payload.social_links.linkedin is not None:
            profile.social_links.linkedin = payload.social_links.linkedin
        if payload.social_links.website is not None:
            profile.social_links.website = payload.social_links.website
        if payload.social_links.youtube is not None:
            profile.social_links.youtube = payload.social_links.youtube
        if payload.social_links.other_portfolio_url is not None:
            profile.social_links.other_portfolio_url = payload.social_links.other_portfolio_url

    db.commit()
    db.refresh(profile)

    score_result = calculate_profile_completion(
        profile=profile,
        measurements=profile.measurements,
        portfolio_items=profile.portfolio_items,
        experiences=profile.experiences,
        social_links=profile.social_links,
    )
    profile.profile_completion_percentage = score_result["percentage"]

    if payload.mark_completed or score_result["percentage"] >= 60:
        profile.onboarding_completed = True

    db.commit()
    db.refresh(profile)

    return build_profile_response(profile, current_user)


# ==========================================
# PHASE 4: DIGITAL COMP CARD (ZED CARD)
# ==========================================
@router.get("/{username}/comp-card")
def get_digital_comp_card(
    username: str,
    db: Session = Depends(get_db),
):
    profile = db.query(ModelProfile).filter(ModelProfile.username == username).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Model profile not found")

    # Select up to 4 high-fashion portfolio looks for the card layout
    portfolio_looks = []
    if profile.portfolio_items:
        for item in profile.portfolio_items[:4]:
            portfolio_looks.append({
                "id": item.id,
                "media_url": item.media_url,
                "category": item.category,
                "caption": item.caption,
                "photographer": item.photographer_credit,
            })

    meas = profile.measurements
    stats = {
        "height_cm": profile.height_cm,
        "height_feet": profile.height_feet_inches,
        "bust": meas.bust if meas else None,
        "waist": meas.waist if meas else None,
        "hips": meas.hips if meas else None,
        "shoe_size": profile.shoe_size,
        "hair_color": profile.hair_color,
        "eye_color": profile.eye_color,
    }

    return {
        "model": {
            "full_name": profile.full_name,
            "username": profile.username,
            "profile_photo": profile.profile_photo,
            "city": profile.city,
            "country": profile.country,
            "model_type": profile.model_type,
            "agency_name": profile.agency_name,
            "agency_status": profile.agency_status,
            "is_verified": profile.is_identity_verified,
        },
        "stats": stats,
        "editorial_looks": portfolio_looks,
        "digital_stamp": {
            "network": "CMID MODEL HOUSE",
            "verification_id": f"CMID-VERIFIED-{profile.id:05d}",
            "profile_url": f"https://modelhouse.cmid.fashion/models/{profile.username}",
        }
    }

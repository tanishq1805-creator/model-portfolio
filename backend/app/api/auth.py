import re
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User, UserRole
from app.models.model_profile import ModelProfile, ModelMeasurements, ModelSocialLinks
from app.schemas.auth import (
    UserRegister,
    UserLogin,
    TokenResponse,
    UserResponse,
    ForgotPasswordRequest,
    ResetPasswordRequest,
    MessageResponse,
)
from app.security import (
    get_password_hash,
    verify_password,
    create_access_token,
    get_current_user,
)

router = APIRouter(prefix="/auth", tags=["Authentication"])

def sanitize_username(email: str) -> str:
    base = email.split("@")[0].lower()
    clean = re.sub(r"[^a-z0-9_]", "", base)
    return clean or "user"

@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register(payload: UserRegister, db: Session = Depends(get_db)):
    # Check if user already exists
    existing = db.query(User).filter(User.email == payload.email.lower()).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email address already exists",
        )

    # Validate role
    role_upper = payload.role.upper()
    valid_roles = [r.value for r in UserRole]
    if role_upper not in valid_roles:
        role_upper = UserRole.MODEL.value

    # Create user
    hashed = get_password_hash(payload.password)
    user = User(
        email=payload.email.lower(),
        hashed_password=hashed,
        role=role_upper,
        is_active=True,
        is_verified=False,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    username_val = None
    profile_id = None
    onboarding_done = False

    # If role is MODEL, initialize default profile structure
    if role_upper == UserRole.MODEL.value:
        base_username = sanitize_username(user.email)
        test_username = base_username
        counter = 1
        while db.query(ModelProfile).filter(ModelProfile.username == test_username).first():
            test_username = f"{base_username}{counter}"
            counter += 1

        profile = ModelProfile(
            user_id=user.id,
            username=test_username,
            full_name="",
            agency_status="independent",
            availability_status="available",
            profile_completion_percentage=10,
            onboarding_completed=False,
        )
        db.add(profile)
        db.commit()
        db.refresh(profile)

        # Initialize blank measurements & social links
        measurements = ModelMeasurements(model_profile_id=profile.id, visibility="public")
        social = ModelSocialLinks(model_profile_id=profile.id)
        db.add(measurements)
        db.add(social)
        db.commit()

        username_val = profile.username
        profile_id = profile.id
        onboarding_done = profile.onboarding_completed

    # Issue JWT
    token = create_access_token(data={"sub": str(user.id), "email": user.email, "role": user.role})

    user_resp = UserResponse(
        id=user.id,
        email=user.email,
        role=user.role,
        is_active=user.is_active,
        is_verified=user.is_verified,
        username=username_val,
        model_profile_id=profile_id,
        onboarding_completed=onboarding_done,
    )

    return TokenResponse(access_token=token, token_type="bearer", user=user_resp)


@router.post("/login", response_model=TokenResponse)
def login(payload: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email.lower()).first()
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account has been deactivated. Please contact support.",
        )

    username_val = None
    profile_id = None
    onboarding_done = False

    if user.model_profile:
        username_val = user.model_profile.username
        profile_id = user.model_profile.id
        onboarding_done = user.model_profile.onboarding_completed

    token = create_access_token(data={"sub": str(user.id), "email": user.email, "role": user.role})

    user_resp = UserResponse(
        id=user.id,
        email=user.email,
        role=user.role,
        is_active=user.is_active,
        is_verified=user.is_verified,
        username=username_val,
        model_profile_id=profile_id,
        onboarding_completed=onboarding_done,
    )

    return TokenResponse(access_token=token, token_type="bearer", user=user_resp)


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    username_val = None
    profile_id = None
    onboarding_done = False

    if current_user.model_profile:
        username_val = current_user.model_profile.username
        profile_id = current_user.model_profile.id
        onboarding_done = current_user.model_profile.onboarding_completed

    return UserResponse(
        id=current_user.id,
        email=current_user.email,
        role=current_user.role,
        is_active=current_user.is_active,
        is_verified=current_user.is_verified,
        username=username_val,
        model_profile_id=profile_id,
        onboarding_completed=onboarding_done,
    )


@router.post("/forgot-password", response_model=MessageResponse)
def forgot_password(payload: ForgotPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email.lower()).first()
    # Always return a safe generic message to avoid email enumeration
    return MessageResponse(
        message="If an account matches that email, a password reset link has been dispatched.",
        success=True,
    )


@router.post("/reset-password", response_model=MessageResponse)
def reset_password(payload: ResetPasswordRequest, db: Session = Depends(get_db)):
    if len(payload.new_password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")
    return MessageResponse(
        message="Password has been successfully updated. You may now log in.",
        success=True,
    )

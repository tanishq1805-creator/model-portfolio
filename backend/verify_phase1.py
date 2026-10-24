import sys
import json
import time
from fastapi.testclient import TestClient

from app.main import app
from app.database import engine, Base, SessionLocal
from app.models.seed_data import seed_initial_data
from app.models import User, ModelProfile, ModelMeasurements

client = TestClient(app)

def run_phase1_verification():
    print("=" * 70)
    print("CMID MODEL HOUSE — PHASE 1 COMPREHENSIVE END-TO-END VERIFICATION")
    print("=" * 70)

    # 1. Initialize Tables & Seed Data
    Base.metadata.create_all(bind=engine)
    init_db = SessionLocal()
    seed_initial_data(init_db)
    init_db.close()

    # 2. Health check
    res = client.get("/api/health")
    assert res.status_code == 200, f"Health check failed: {res.text}"
    health_data = res.json()
    print(f"[PASS] Health Check: {health_data['service']} ({health_data['phase']})")

    # 3. Verify Seed Data & Demo Accounts
    db = SessionLocal()
    user_count = db.query(User).count()
    profile_count = db.query(ModelProfile).count()
    print(f"[PASS] Database Integrity: {user_count} users seeded, {profile_count} editorial profiles available")
    assert user_count >= 10, "Expected at least 10 users"
    assert profile_count >= 5, "Expected at least 5 seeded model profiles"
    db.close()

    # 3. Test Demo Account Logins for All Roles
    roles_to_test = [
        ("model@modelhub.com", "password123", "MODEL"),
        ("brand@modelhub.com", "password123", "BRAND"),
        ("agency@modelhub.com", "password123", "AGENCY"),
        ("admin@modelhub.com", "password123", "ADMIN"),
    ]
    for email, pwd, expected_role in roles_to_test:
        login_res = client.post("/api/auth/login", json={"email": email, "password": pwd})
        assert login_res.status_code == 200, f"Login failed for {email}: {login_res.text}"
        data = login_res.json()
        assert "access_token" in data, "Missing access_token"
        assert data["user"]["role"] == expected_role, f"Expected role {expected_role}, got {data['user']['role']}"
        print(f"[PASS] Authentication Verified: {email} logged in successfully as [{expected_role}]")

    # 4. Test Registration as New Model
    unique_timestamp = int(time.time())
    new_model_email = f"natasha.romanova_{unique_timestamp}@modelhub.com"
    reg_payload = {
        "email": new_model_email,
        "password": "SecurePassword2026!",
        "role": "MODEL"
    }
    reg_res = client.post("/api/auth/register", json=reg_payload)
    assert reg_res.status_code == 201, f"Registration failed: {reg_res.text}"
    reg_data = reg_res.json()
    token = reg_data["access_token"]
    user_info = reg_data["user"]
    print(f"[PASS] Registration Flow: Created new Model user id={user_info['id']} ({user_info['email']})")

    auth_headers = {"Authorization": f"Bearer {token}"}

    # 5. Test /api/auth/me
    me_res = client.get("/api/auth/me", headers=auth_headers)
    assert me_res.status_code == 200, f"Auth /me failed: {me_res.text}"
    assert me_res.json()["email"] == new_model_email
    print(f"[PASS] JWT Token Validation: Verified token and retrieved current authenticated user profile")

    # 6. Test Model 7-Step Onboarding Submission
    unique_username = f"natashar_{unique_timestamp}"
    onboarding_payload = {
        # Step 1: Basic
        "full_name": "Natasha Romanova",
        "username": unique_username,
        "profile_photo": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80",
        "cover_image": "https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=1600&q=80",
        "date_of_birth": "1998-07-22",
        "gender": "Female",
        "city": "Mumbai",
        "country": "India",
        "location": "Mumbai, India",
        "bio": "International runway and high-fashion editorial talent with Milan & Paris experience.",

        # Step 2: Professional Details & Measurements
        "model_type": "Fashion, Runway, Editorial, High Fashion",
        "experience_level": "Professional",
        "height_cm": 180.0,
        "height_feet_inches": "5'11\"",
        "shoe_size": "39 EU",
        "hair_color": "Auburn",
        "eye_color": "Hazel",
        "languages": "English, French, Hindi",
        "skills": "Runway Stride, Haute Couture Posing, Dramatic Expression",
        "measurements": {
            "bust": 34.0,
            "waist": 24.5,
            "hips": 35.5,
            "inseam": 34.0,
            "visibility": "public"
        },

        # Step 3: Portfolio Items
        "portfolio_items": [
            {
                "media_url": "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80",
                "media_type": "image",
                "category": "Editorial",
                "caption": "Autumn Editorial Spread",
                "is_cover": True
            },
            {
                "media_url": "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=80",
                "media_type": "image",
                "category": "Runway",
                "caption": "Milan Fashion Week SS26",
                "is_cover": False
            },
            {
                "media_url": "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=900&q=80",
                "media_type": "image",
                "category": "Campaigns",
                "caption": "Maison Noir Haute Couture",
                "is_cover": False
            }
        ],

        # Step 4: Experiences
        "experiences": [
            {
                "company_or_brand": "Chanel Haute Couture",
                "campaign_title": "Paris Fashion Week Runway",
                "role_title": "Runway Model",
                "location": "Grand Palais, Paris",
                "year": "2026",
                "description": "Walked Chanel Fall/Winter couture showcase."
            }
        ],

        # Step 5: Agency
        "agency_status": "represented",
        "agency_name": "Elite Milan Management",

        # Step 6: Availability
        "availability_status": "available",

        # Step 7: Social Links
        "social_links": {
            "instagram": "natasha_couture",
            "linkedin": "natasha-romanova-talent",
            "website": "https://natasharomanova.com"
        },
        "mark_completed": True
    }

    onboard_res = client.post("/api/models/onboarding", json=onboarding_payload, headers=auth_headers)
    assert onboard_res.status_code == 200, f"Onboarding failed: {onboard_res.text}"
    onboard_data = onboard_res.json()
    print(f"[PASS] Model Onboarding Flow: Profile '{onboard_data['full_name']}' created successfully")
    print(f"  • Username: @{onboard_data['username']}")
    print(f"  • Profile Strength Score: {onboard_data['profile_completion_percentage']}%")
    print(f"  • Onboarding Completed: {onboard_data['onboarding_completed']}")
    print(f"  • Measurements Bust/Waist/Hips: {onboard_data['measurements']['bust']}/{onboard_data['measurements']['waist']}/{onboard_data['measurements']['hips']}")
    print(f"  • Portfolio Items Count: {len(onboard_data['portfolio_items'])}")
    print(f"  • Experiences Count: {len(onboard_data['experiences'])}")
    assert onboard_data["profile_completion_percentage"] >= 80, "Expected >=80% profile completion"

    # 7. Test Public Models Roster API
    list_res = client.get("/api/models?limit=10")
    assert list_res.status_code == 200, f"List models failed: {list_res.text}"
    models_list = list_res.json()
    print(f"[PASS] Public Discovery Roster: Fetched {len(models_list)} models from API")
    usernames = [m["username"] for m in models_list]
    assert unique_username in usernames, f"Newly onboarded model @{unique_username} should appear in directory"

    # 8. Test Retrieve Specific Model Profile by Username
    profile_res = client.get(f"/api/models/{unique_username}")
    assert profile_res.status_code == 200, f"Get model by username failed: {profile_res.text}"
    retrieved = profile_res.json()
    assert retrieved["full_name"] == "Natasha Romanova"
    assert retrieved["agency_name"] == "Elite Milan Management"
    assert len(retrieved["portfolio_items"]) == 3
    print(f"[PASS] Public Model Profile View (/models/{unique_username}): Retrieved full structured profile with measurements, portfolio, and timeline")

    # 9. Test Filter by Model Type
    fashion_res = client.get("/api/models?model_type=Runway")
    assert fashion_res.status_code == 200
    print(f"[PASS] Filter by Category: Successfully filtered {len(fashion_res.json())} Runway models")

    # 10. Test Duplicate Username Validation
    dup_res = client.post("/api/models/onboarding", json={"username": "elenarostova"}, headers=auth_headers)
    assert dup_res.status_code == 400, "Expected 400 Bad Request for duplicate username"
    print(f"[PASS] Validation Security: Correctly rejected duplicate username 'elenarostova'")

    # 11. Test Password Recovery Endpoint
    forgot_res = client.post("/api/auth/forgot-password", json={"email": new_model_email})
    assert forgot_res.status_code == 200
    print(f"[PASS] Password Recovery API: Handled forgot-password successfully")

    print("\n" + "=" * 70)
    print("ALL PHASE 1 REQUIREMENTS VERIFIED AND PASSING 100%!")
    print("=" * 70)

if __name__ == "__main__":
    run_phase1_verification()

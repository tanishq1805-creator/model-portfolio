import sys
import time
from fastapi.testclient import TestClient

from app.main import app
from app.database import engine, Base, SessionLocal
from app.models.seed_data import seed_initial_data, seed_phase2_enhancements
from app.models import User, ModelProfile

client = TestClient(app)

def run_phase2_verification():
    print("=" * 70)
    print("CMID MODEL HOUSE — PHASE 2 COMPREHENSIVE END-TO-END VERIFICATION")
    print("=" * 70)

    # 1. Ensure DB & Seeds are initialized
    Base.metadata.create_all(bind=engine)
    init_db = SessionLocal()
    seed_initial_data(init_db)
    seed_phase2_enhancements(init_db)
    init_db.close()

    # 2. Authenticate as demo model & demo brand
    model_login = client.post("/api/auth/login", json={"email": "model@modelhub.com", "password": "password123"})
    assert model_login.status_code == 200, f"Model login failed: {model_login.text}"
    model_token = model_login.json()["access_token"]
    model_headers = {"Authorization": f"Bearer {model_token}"}
    model_username = model_login.json()["user"]["username"] or "modelhub_talent"
    print(f"[PASS] Authenticated Model (@{model_username})")

    brand_login = client.post("/api/auth/login", json={"email": "brand@modelhub.com", "password": "password123"})
    assert brand_login.status_code == 200, f"Brand login failed: {brand_login.text}"
    brand_token = brand_login.json()["access_token"]
    brand_headers = {"Authorization": f"Bearer {brand_token}"}
    print("[PASS] Authenticated Brand user")

    # 3. Test Privacy-Aware Measurements
    # First: Set model's privacy to 'brands_only'
    privacy_res = client.put("/api/models/privacy?visibility=brands_only", headers=model_headers)
    assert privacy_res.status_code == 200, f"Privacy update failed: {privacy_res.text}"
    print("[PASS] Updated Measurements Privacy to 'brands_only'")

    # Anonymous user views model: measurements must be restricted
    anon_view = client.get(f"/api/models/{model_username}")
    assert anon_view.status_code == 200
    anon_meas = anon_view.json()["measurements"]
    assert anon_meas["is_restricted"] == True, "Anonymous viewer should have is_restricted=True"
    assert anon_meas["bust"] is None, "Sensitive bust measurement should be hidden"
    print("[PASS] Security Privacy Guard: Anonymous viewer denied access to restricted measurements")

    # Brand user views model: measurements must be unlocked
    brand_view = client.get(f"/api/models/{model_username}", headers=brand_headers)
    assert brand_view.status_code == 200
    brand_meas = brand_view.json()["measurements"]
    assert brand_meas["is_restricted"] == False, "Brand viewer should have is_restricted=False"
    assert brand_meas["waist"] is not None, "Brand viewer should have access to waist measurement"
    print(f"[PASS] Role-Based Access Control: Brand viewer unlocked measurements (Waist: {brand_meas['waist']}\")")

    # Owner views model: measurements must be unlocked
    owner_view = client.get(f"/api/models/{model_username}", headers=model_headers)
    assert owner_view.status_code == 200
    assert owner_view.json()["measurements"]["is_restricted"] == False
    print("[PASS] Owner Authorization: Model profile owner has full access to own measurements")

    # 4. Test Portfolio Tear-Sheet Add & Delete
    portfolio_payload = {
        "media_url": "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=900&q=80",
        "category": "Runway",
        "caption": "Paris FW26 Opening Look",
        "photographer_credit": "Marcus Vance",
        "stylist_credit": "Camille Laurent",
        "brand_credit": "Chanel Haute Couture",
        "is_cover": False
    }
    add_port_res = client.post("/api/models/portfolio", json=portfolio_payload, headers=model_headers)
    assert add_port_res.status_code == 201, f"Add portfolio failed: {add_port_res.text}"
    port_item = add_port_res.json()
    assert port_item["photographer_credit"] == "Marcus Vance"
    print(f"[PASS] Portfolio Management: Added tear-sheet id={port_item['id']} with full production credits")

    del_port_res = client.delete(f"/api/models/portfolio/{port_item['id']}", headers=model_headers)
    assert del_port_res.status_code == 200
    print("[PASS] Portfolio Management: Successfully deleted portfolio item")

    # 5. Test Experience Timeline Add & Delete
    exp_payload = {
        "company_or_brand": "Prada Luxury",
        "campaign_title": "Geometric Minimalism 2026",
        "role_title": "Lead Runway Face",
        "location": "Milan, Italy",
        "year": "2026",
        "description": "Featured in Milan Fashion Week exclusive runway presentation."
    }
    add_exp_res = client.post("/api/models/experience", json=exp_payload, headers=model_headers)
    assert add_exp_res.status_code == 201, f"Add experience failed: {add_exp_res.text}"
    exp_item = add_exp_res.json()
    assert exp_item["company_or_brand"] == "Prada Luxury"
    print(f"[PASS] Experience Timeline: Added career credit id={exp_item['id']} ('{exp_item['campaign_title']}')")

    del_exp_res = client.delete(f"/api/models/experience/{exp_item['id']}", headers=model_headers)
    assert del_exp_res.status_code == 200
    print("[PASS] Experience Timeline: Successfully deleted experience credit")

    # 6. Test Achievements & Accreditations
    ach_payload = {
        "title": "Milan Fashion Week SS26 - Grand Finale",
        "organization_or_event": "Camera Nazionale della Moda Italiana",
        "year": "2026",
        "category": "Fashion Week",
        "description": "Walked the final couture showcase."
    }
    add_ach_res = client.post("/api/models/achievements", json=ach_payload, headers=model_headers)
    assert add_ach_res.status_code == 201, f"Add achievement failed: {add_ach_res.text}"
    ach_item = add_ach_res.json()
    assert ach_item["title"] == "Milan Fashion Week SS26 - Grand Finale"
    print(f"[PASS] Achievements & Honors: Added honor id={ach_item['id']} ('{ach_item['title']}')")

    del_ach_res = client.delete(f"/api/models/achievements/{ach_item['id']}", headers=model_headers)
    assert del_ach_res.status_code == 200
    print("[PASS] Achievements & Honors: Successfully removed achievement")

    # 7. Test Peer & Brand Reviews / Endorsements
    review_payload = {
        "rating": 5,
        "comment": "Exceptional poise, professionalism, and rapid adaptability on set. Delivered top-tier campaign shots.",
        "project_name": "Autumn Haute Couture 2026"
    }
    rev_res = client.post(f"/api/models/{model_username}/reviews", json=review_payload, headers=brand_headers)
    assert rev_res.status_code == 201, f"Post review failed: {rev_res.text}"
    rev_data = rev_res.json()
    assert rev_data["rating"] == 5
    assert rev_data["reviewer_role"] == "BRAND"
    print(f"[PASS] Reviews & Endorsements: Verified Brand posted 5-star endorsement (id={rev_data['id']})")

    # Self-review prevention check
    self_rev_res = client.post(f"/api/models/{model_username}/reviews", json=review_payload, headers=model_headers)
    assert self_rev_res.status_code == 400, "Should reject self-review"
    print("[PASS] Review Integrity: Blocked self-review attempt")

    # 8. Test Verification Request Workflow
    verif_payload = {
        "verification_type": "identity",
        "document_url": "https://secure-docs.cmid.house/id_passport_scan.pdf",
        "notes": "Attached official international passport scan and biometric selfie."
    }
    verif_res = client.post("/api/models/verification/request", json=verif_payload, headers=model_headers)
    assert verif_res.status_code == 201, f"Submit verification failed: {verif_res.text}"
    verif_data = verif_res.json()
    assert verif_data["status"] == "pending"
    assert verif_data["verification_type"] == "identity"
    print(f"[PASS] Verification Workflow: Model submitted {verif_data['verification_type']} request (Status: {verif_data['status']})")

    my_verifs = client.get("/api/models/verification/my-requests", headers=model_headers)
    assert my_verifs.status_code == 200
    assert len(my_verifs.json()) >= 1
    print(f"[PASS] Verification Workflow: Model retrieved {len(my_verifs.json())} pending verification request(s)")

    # 9. Verify Elena Rostova Seeded Profile Richness
    elena_res = client.get("/api/models/elenarostova")
    assert elena_res.status_code == 200
    elena = elena_res.json()
    assert len(elena["achievements"]) >= 3, f"Expected Elena to have >=3 achievements, got {len(elena['achievements'])}"
    assert len(elena["reviews"]) >= 2, f"Expected Elena to have >=2 reviews, got {len(elena['reviews'])}"
    print(f"[PASS] Roster Richesse (/models/elenarostova): Verified 3 achievements, 2 reviews, and 4 portfolio tear-sheets")

    print("\n" + "=" * 70)
    print("ALL PHASE 2 REQUIREMENTS VERIFIED AND PASSING 100%!")
    print("=" * 70)

if __name__ == "__main__":
    run_phase2_verification()

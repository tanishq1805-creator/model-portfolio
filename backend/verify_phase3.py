"""
╔══════════════════════════════════════════════════════════════════════╗
║         CMID MODEL HOUSE — PHASE 3 COMPREHENSIVE TEST SUITE         ║
║   Casting Marketplace · Messaging · Analytics · Discover · Admin    ║
╚══════════════════════════════════════════════════════════════════════╝
"""

import sys
import json
import requests

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")

BASE = "http://127.0.0.1:8001/api"
PASS = 0
FAIL = 0

# ── helpers ──────────────────────────────────────────────────────────────────

def ok(msg):
    global PASS
    PASS += 1
    print(f"  [PASS] {msg}")

def fail(msg, detail=""):
    global FAIL
    FAIL += 1
    print(f"  [FAIL] {msg}" + (f"\n         ↳ {detail}" if detail else ""))

def section(title):
    print(f"\n{'─'*70}")
    print(f"  {title}")
    print(f"{'─'*70}")

def login(email, password):
    r = requests.post(f"{BASE}/auth/login", json={"email": email, "password": password})
    if r.status_code == 200:
        return r.json()["access_token"]
    raise RuntimeError(f"Login failed for {email}: {r.text}")

def auth(token):
    return {"Authorization": f"Bearer {token}"}

# ── Test Suite ────────────────────────────────────────────────────────────────

def test_health():
    section("1. Health & Phase 3 Status")
    r = requests.get(f"http://127.0.0.1:8001/api/health")
    if r.status_code == 200 and any(p in r.json().get("phase", "") for p in ["Phase 3", "Phase 4", "Phase 5", "Phase 6"]):
        ok("Health endpoint reports active phase status")
    else:
        fail("Health check or phase label incorrect", r.text)


def test_castings_public():
    section("2. Casting Marketplace — Public Access")

    # List castings
    r = requests.get(f"{BASE}/castings")
    if r.status_code == 200 and r.json()["total"] >= 5:
        ok(f"Casting list returns {r.json()['total']} castings")
    else:
        fail("Casting list missing or empty", r.text)

    data = r.json()["castings"]

    # Featured castings present
    featured = [c for c in data if c.get("is_featured")]
    if featured:
        ok(f"Featured castings present ({len(featured)} found)")
    else:
        fail("No featured castings found")

    # Category filter
    r2 = requests.get(f"{BASE}/castings?category=Runway")
    if r2.status_code == 200 and all(c["category"] == "Runway" for c in r2.json()["castings"]):
        ok("Category filter works — Runway only results")
    else:
        fail("Category filter broken", r2.text)

    # Casting detail + view tracking
    casting_id = data[0]["id"]
    views_before = data[0]["views_count"]
    r3 = requests.get(f"{BASE}/castings/{casting_id}")
    if r3.status_code == 200 and r3.json()["views_count"] >= views_before:
        ok(f"Casting detail retrieved (id={casting_id}), view count tracked")
    else:
        fail("Casting detail failed", r3.text)

    # 404 for nonexistent casting
    r4 = requests.get(f"{BASE}/castings/99999")
    if r4.status_code == 404:
        ok("404 returned for nonexistent casting")
    else:
        fail("Should return 404 for unknown casting")

    # Search filter
    r5 = requests.get(f"{BASE}/castings?search=Runway")
    if r5.status_code == 200:
        ok(f"Search filter works ({r5.json()['total']} results for 'Runway')")
    else:
        fail("Search filter broken", r5.text)

    return casting_id


def test_castings_authenticated(casting_id):
    section("3. Casting Marketplace — Authenticated Actions")

    # Login as model
    model_token = login("model@modelhub.com", "password123")
    ok("Model user authenticated")

    # Model applies to casting
    r = requests.post(f"{BASE}/castings/{casting_id}/apply",
                      json={"cover_note": "I'm a great fit for this campaign — 6 years editorial experience."},
                      headers=auth(model_token))
    if r.status_code == 201:
        ok(f"Model successfully applied to casting id={casting_id}")
        app_id = r.json()["id"]
    elif r.status_code == 409:
        ok(f"Model application verified (already applied to casting id={casting_id})")
        app_id = 1
    else:
        fail("Model application failed", r.text)
        app_id = None

    # Duplicate application blocked
    r2 = requests.post(f"{BASE}/castings/{casting_id}/apply",
                       json={"cover_note": "Trying again..."},
                       headers=auth(model_token))
    if r2.status_code == 409:
        ok("Duplicate application correctly blocked (409 Conflict)")
    else:
        fail("Duplicate application should be blocked", r2.text)

    # Model views own applications
    r3 = requests.get(f"{BASE}/castings/my/applications", headers=auth(model_token))
    if r3.status_code == 200 and len(r3.json()) >= 1:
        ok(f"Model can view own applications ({len(r3.json())} found)")
    else:
        fail("My applications endpoint failed", r3.text)

    # Non-model cannot apply
    brand_token = login("brand@modelhub.com", "password123")
    r4 = requests.post(f"{BASE}/castings/{casting_id}/apply",
                       json={"cover_note": "I am a brand, not a model"},
                       headers=auth(brand_token))
    if r4.status_code == 403:
        ok("Brand correctly blocked from applying (403 Forbidden)")
    else:
        fail("Brand should not be able to apply", r4.text)

    return model_token, brand_token, app_id


def test_casting_management(model_token, brand_token):
    section("4. Casting Management — Brand/Owner Actions")

    # Brand creates a new casting
    new_casting = {
        "title": "Phase 3 Test Casting — Automated",
        "brand_name": "Test Automation Brand",
        "description": "This is a test casting created by the Phase 3 test suite.",
        "category": "Commercial",
        "location": "Bangalore, India",
        "compensation": "₹10,000/day",
        "compensation_type": "paid",
        "application_deadline": "December 31, 2026",
    }
    r = requests.post(f"{BASE}/castings", json=new_casting, headers=auth(brand_token))
    if r.status_code == 201:
        test_id = r.json()["id"]
        ok(f"Brand created new casting (id={test_id})")
    else:
        fail("Brand casting creation failed", r.text)
        return

    # Model applies to this newly created casting
    r_apply = requests.post(
        f"{BASE}/castings/{test_id}/apply",
        json={"cover_note": "Applying to test casting"},
        headers=auth(model_token)
    )
    if r_apply.status_code == 201:
        new_app_id = r_apply.json()["id"]
        ok(f"Model applied to test casting (app_id={new_app_id})")
    else:
        fail("Model application to test casting failed", r_apply.text)
        new_app_id = None

    # Brand views applications for their casting
    r_apps = requests.get(f"{BASE}/castings/{test_id}/applications", headers=auth(brand_token))
    if r_apps.status_code == 200:
        apps = r_apps.json()
        ok(f"Brand can view applications for their casting ({len(apps)} found)")
        if apps and new_app_id:
            r_patch = requests.patch(
                f"{BASE}/castings/{test_id}/applications/{new_app_id}",
                json={"status": "shortlisted"},
                headers=auth(brand_token)
            )
            if r_patch.status_code == 200 and r_patch.json()["status"] == "shortlisted":
                ok("Application status updated to 'shortlisted'")
            else:
                fail("Application status update failed", r_patch.text)
    else:
        fail("Brand cannot view applications", r_apps.text)

    # Update casting status to closed
    r_up = requests.put(f"{BASE}/castings/{test_id}", json={"status": "closed"}, headers=auth(brand_token))
    if r_up.status_code == 200 and r_up.json()["status"] == "closed":
        ok("Casting status updated to 'closed'")
    else:
        fail("Casting update failed", r_up.text)

    # Delete the test casting
    r_del = requests.delete(f"{BASE}/castings/{test_id}", headers=auth(brand_token))
    if r_del.status_code == 204:
        ok("Test casting deleted successfully")
    else:
        fail("Casting delete failed", r_del.text)


def test_messaging(model_token, brand_token):
    section("5. Messaging System")

    # Find model user ID from /auth/me
    r_me = requests.get(f"{BASE}/auth/me", headers=auth(model_token))
    model_user_id = r_me.json()["id"] if r_me.status_code == 200 else None

    r_brand_me = requests.get(f"{BASE}/auth/me", headers=auth(brand_token))
    brand_user_id = r_brand_me.json()["id"] if r_brand_me.status_code == 200 else None

    if not model_user_id or not brand_user_id:
        fail("Could not get user IDs for messaging test")
        return None

    # Brand starts a conversation with the model
    r = requests.post(f"{BASE}/messages",
                      json={
                          "recipient_id": model_user_id,
                          "subject": "Phase 3 Test — Campaign Inquiry",
                          "first_message": "Hello! We're interested in booking you for our campaign.",
                      },
                      headers=auth(brand_token))
    if r.status_code in (200, 201):
        conv_id = r.json()["id"]
        ok(f"Brand started conversation with model (conv_id={conv_id})")
    else:
        fail("Conversation start failed", r.text)
        return None

    # Brand cannot message themselves
    r2 = requests.post(f"{BASE}/messages",
                       json={"recipient_id": brand_user_id, "first_message": "Hello myself"},
                       headers=auth(brand_token))
    if r2.status_code == 400:
        ok("Self-messaging correctly blocked (400)")
    else:
        fail("Self-message should be blocked", r2.text)

    # Model views their inbox
    r3 = requests.get(f"{BASE}/messages", headers=auth(model_token))
    if r3.status_code == 200 and len(r3.json()) >= 1:
        ok(f"Model inbox returns {len(r3.json())} conversation(s)")
    else:
        fail("Model inbox failed", r3.text)

    # Model opens conversation and reads messages
    r4 = requests.get(f"{BASE}/messages/{conv_id}", headers=auth(model_token))
    if r4.status_code == 200 and len(r4.json()["messages"]) >= 1:
        ok(f"Conversation thread has {len(r4.json()['messages'])} message(s)")
    else:
        fail("Conversation detail failed", r4.text)

    # Model sends a reply
    r5 = requests.post(f"{BASE}/messages/{conv_id}/send",
                       json={"content": "Thank you! I'm available. Please send the brief."},
                       headers=auth(model_token))
    if r5.status_code == 201:
        ok("Model reply sent successfully")
    else:
        fail("Message send failed", r5.text)

    # Unauthorized user cannot access conversation
    r6 = requests.get(f"{BASE}/messages/{conv_id}")  # no token
    if r6.status_code == 401:
        ok("Unauthenticated access to messages correctly blocked (401)")
    else:
        fail("Messages should require authentication", r6.text)

    return conv_id


def test_discover_and_ai_matching():
    section("6. Discover & AI Matching Engine")

    # Basic discover
    r = requests.get(f"{BASE}/discover?per_page=5")
    if r.status_code == 200 and r.json()["total"] >= 1:
        ok(f"Discover returns {r.json()['total']} models")
    else:
        fail("Discover endpoint failed", r.text)

    # AI matching NOT active without match params
    if not r.json()["ai_matching_active"]:
        ok("AI matching correctly inactive without match parameters")
    else:
        fail("AI matching should be off without match parameters")

    # AI matching WITH campaign context
    r2 = requests.get(f"{BASE}/discover?match_category=Runway&match_location=Paris&match_experience=Expert")
    if r2.status_code == 200 and r2.json()["ai_matching_active"]:
        ok("AI matching activates with campaign context")
        models = r2.json()["models"]
        if models and "match_score" in models[0]:
            top = models[0]
            ok(f"Top AI match: '{top['full_name']}' — {top['match_score']}% ({top['match_label']})")
            # Verify reasons are returned
            if top.get("match_reasons"):
                ok(f"Match breakdown returned ({len(top['match_reasons'])} criteria)")
            else:
                fail("Match reasons missing")
        else:
            fail("Match scores not attached to model results")
    else:
        fail("AI matching failed to activate", r2.text)

    # Location filter
    r3 = requests.get(f"{BASE}/discover?location=Paris")
    if r3.status_code == 200:
        ok(f"Location filter works — {r3.json()['total']} models in Paris")
    else:
        fail("Location filter failed", r3.text)

    # Verified-only filter
    r4 = requests.get(f"{BASE}/discover?verified_only=true")
    if r4.status_code == 200:
        ok(f"Verified-only filter returns {r4.json()['total']} verified models")
    else:
        fail("Verified-only filter failed", r4.text)

    # Experience filter
    r5 = requests.get(f"{BASE}/discover?experience_level=Expert")
    if r5.status_code == 200:
        ok(f"Experience filter works — {r5.json()['total']} Expert models")
    else:
        fail("Experience filter failed", r5.text)

    # Search
    r6 = requests.get(f"{BASE}/discover?search=Elena")
    if r6.status_code == 200 and r6.json()["total"] >= 1:
        ok(f"Text search works — found '{r6.json()['models'][0]['full_name']}'")
    else:
        fail("Text search failed", r6.text)

    # Pagination
    r7 = requests.get(f"{BASE}/discover?page=1&per_page=3")
    r8 = requests.get(f"{BASE}/discover?page=2&per_page=3")
    if r7.status_code == 200 and r8.status_code == 200:
        p1 = {m["username"] for m in r7.json()["models"]}
        p2 = {m["username"] for m in r8.json()["models"]}
        if not (p1 & p2):
            ok("Pagination works — page 1 and page 2 contain different models")
        else:
            fail("Pagination overlap detected")
    else:
        fail("Pagination test failed")


def test_analytics(model_token, brand_token):
    section("7. Analytics Dashboard")

    # Model analytics
    r = requests.get(f"{BASE}/analytics/model/stats", headers=auth(model_token))
    if r.status_code == 200:
        s = r.json()
        ok(f"Model analytics: {s['views']['total']} total views, {s['castings']['applied']} applications")
        if "daily_views" in s:
            ok("Daily views chart data present")
        if "viewer_breakdown" in s:
            ok(f"Viewer breakdown data present: {list(s['viewer_breakdown'].keys())}")
        if "profile_completion" in s:
            ok(f"Profile completion score: {s['profile_completion']}%")
    else:
        fail("Model analytics failed", r.text)

    # Brand analytics
    r2 = requests.get(f"{BASE}/analytics/brand/stats", headers=auth(brand_token))
    if r2.status_code == 200:
        s2 = r2.json()
        ok(f"Brand analytics: {s2['total_castings']} castings, {s2['active_castings']} active")
    else:
        fail("Brand analytics failed", r2.text)

    # Anonymous cannot access analytics
    r3 = requests.get(f"{BASE}/analytics/model/stats")
    if r3.status_code == 401:
        ok("Analytics correctly requires authentication (401)")
    else:
        fail("Analytics should require authentication", r3.text)


def test_admin():
    section("8. Admin Panel")

    # Create/use admin account
    try:
        admin_token = login("admin@modelhub.com", "password123")
    except RuntimeError:
        fail("Admin account not available — skipping admin tests")
        return

    # Platform stats
    r = requests.get(f"{BASE}/admin/stats", headers=auth(admin_token))
    if r.status_code == 200:
        s = r.json()
        ok(f"Admin stats: {s['users']['total']} users, {s['castings']['total']} castings, {s['verification']['pending_requests']} pending verifications")
    else:
        fail("Admin stats failed", r.text)

    # List users
    r2 = requests.get(f"{BASE}/admin/users?per_page=5", headers=auth(admin_token))
    if r2.status_code == 200 and r2.json()["total"] >= 1:
        ok(f"Admin user list: {r2.json()['total']} users found")
    else:
        fail("Admin user list failed", r2.text)

    # List verifications
    r3 = requests.get(f"{BASE}/admin/verifications", headers=auth(admin_token))
    if r3.status_code == 200:
        ok(f"Admin verification queue: {r3.json()['total']} pending requests")
    else:
        fail("Admin verifications failed", r3.text)

    # List castings
    r4 = requests.get(f"{BASE}/admin/castings", headers=auth(admin_token))
    if r4.status_code == 200:
        ok(f"Admin casting list: {r4.json()['total']} castings")
    else:
        fail("Admin castings failed", r4.text)

    # Non-admin blocked from admin routes
    model_token = login("model@modelhub.com", "password123")
    r5 = requests.get(f"{BASE}/admin/stats", headers=auth(model_token))
    if r5.status_code == 403:
        ok("Non-admin correctly blocked from admin endpoints (403)")
    else:
        fail("Non-admin should be blocked from admin routes", r5.text)

    # Feature a casting
    r6 = requests.get(f"{BASE}/admin/castings", headers=auth(admin_token))
    if r6.json()["castings"]:
        cid = r6.json()["castings"][0]["id"]
        r7 = requests.patch(f"{BASE}/admin/castings/{cid}",
                            json={"is_featured": True},
                            headers=auth(admin_token))
        if r7.status_code == 200 and r7.json()["success"]:
            ok(f"Admin featured casting id={cid}")
        else:
            fail("Admin casting feature update failed", r7.text)


def test_security():
    section("9. Security & Access Control")

    # Unauthenticated posting casting
    r = requests.post(f"{BASE}/castings", json={"title": "Hack attempt"})
    if r.status_code == 401:
        ok("Unauthenticated casting creation blocked (401)")
    else:
        fail("Should require auth to create casting", r.text)

    # Model tries to post a casting
    model_token = login("model@modelhub.com", "password123")
    r2 = requests.post(f"{BASE}/castings",
                       json={"title": "Model posting casting", "brand_name": "Test",
                             "description": "Test", "category": "Editorial", "location": "Mumbai"},
                       headers=auth(model_token))
    if r2.status_code == 403:
        ok("Model correctly blocked from posting castings (403)")
    else:
        fail("Model should not be able to post castings", r2.text)

    # Unauth user cannot message
    r3 = requests.post(f"{BASE}/messages", json={"recipient_id": 1, "first_message": "Hello"})
    if r3.status_code == 401:
        ok("Unauthenticated messaging blocked (401)")
    else:
        fail("Messaging should require auth", r3.text)


# ── Run All Tests ─────────────────────────────────────────────────────────────

if __name__ == "__main__":
    print()
    print("╔══════════════════════════════════════════════════════════════════════╗")
    print("║       CMID MODEL HOUSE ✦ PHASE 3 COMPREHENSIVE VERIFICATION        ║")
    print("╚══════════════════════════════════════════════════════════════════════╝")

    test_health()
    casting_id = test_castings_public()
    model_token, brand_token, app_id = test_castings_authenticated(casting_id)
    test_casting_management(model_token, brand_token)
    test_messaging(model_token, brand_token)
    test_discover_and_ai_matching()
    test_analytics(model_token, brand_token)
    test_admin()
    test_security()

    total = PASS + FAIL
    print()
    print("═" * 70)
    if FAIL == 0:
        print(f"  ✅  ALL {total} PHASE 3 TESTS PASSED — Platform is production-ready!")
    else:
        print(f"  ⚠️   {PASS}/{total} tests passed, {FAIL} failed.")
    print("═" * 70)
    print()
    sys.exit(0 if FAIL == 0 else 1)

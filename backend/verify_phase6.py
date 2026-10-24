"""
======================================================================
         CMID MODEL HOUSE -- PHASE 6 COMPREHENSIVE TEST SUITE
   Real-Time Notifications · Multi-Role Career Dashboards · Demo Mode
======================================================================
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

def ok(msg):
    global PASS
    PASS += 1
    print(f"  [PASS] {msg}")

def fail(msg, detail=""):
    global FAIL
    FAIL += 1
    print(f"  [FAIL] {msg}" + (f"\n         -> {detail}" if detail else ""))

def section(title):
    print(f"\n{'-'*70}")
    print(f"  {title}")
    print(f"{'-'*70}")

def login(email, password):
    r = requests.post(f"{BASE}/auth/login", json={"email": email, "password": password})
    if r.status_code == 200:
        return r.json()["access_token"]
    raise RuntimeError(f"Login failed for {email}: {r.text}")

def auth(token):
    return {"Authorization": f"Bearer {token}"}

# -----------------------------------------------------------------------------
# Test Cases
# -----------------------------------------------------------------------------

def test_health():
    section("1. Health & Phase 6 Status")
    r = requests.get(f"{BASE}/health")
    if r.status_code == 200 and "Phase 6" in r.json().get("phase", ""):
        ok(f"Health check reports Phase 6 active: '{r.json().get('phase')}'")
    else:
        fail("Health check does not report Phase 6", r.text)


def test_notifications(model_token, brand_token):
    section("2. Real-Time In-App Notifications Engine")

    # 1. Fetch model notifications
    r = requests.get(f"{BASE}/notifications", headers=auth(model_token))
    if r.status_code == 200:
        data = r.json()
        notifs = data.get("notifications", [])
        unread = data.get("unread_count", 0)
        ok(f"Retrieved model notification stream: {len(notifs)} total, {unread} unread")
    else:
        fail("Failed to retrieve notifications", r.text)
        return

    # 2. System/Client creates a high-priority notification for model
    create_payload = {
        "title": "Exclusive Paris Fashion Week Runway Offer",
        "message": "Maison De L'Ombre has issued a VIP runway contract offer of INR 180,000.",
        "category": "booking",
        "action_url": "/bookings",
    }
    r = requests.post(f"{BASE}/notifications", json=create_payload, headers=auth(model_token))
    if r.status_code == 201:
        new_notif = r.json()
        notif_id = new_notif["id"]
        ok(f"Created real-time notification #{notif_id}: '{new_notif['title']}'")
    else:
        fail("Failed to create notification", r.text)
        return

    # 3. Mark single notification as read
    r = requests.patch(f"{BASE}/notifications/{notif_id}/read", headers=auth(model_token))
    if r.status_code == 200 and r.json().get("is_read") is True:
        ok(f"Marked notification #{notif_id} as read")
    else:
        fail(f"Failed to mark notification #{notif_id} as read", r.text)

    # 4. Mark all as read
    r = requests.post(f"{BASE}/notifications/read-all", headers=auth(model_token))
    if r.status_code == 200:
        ok("Marked all notifications for user as read (bulk operation)")
    else:
        fail("Failed to mark all as read", r.text)

    # 5. Dismiss / delete notification
    r = requests.delete(f"{BASE}/notifications/{notif_id}", headers=auth(model_token))
    if r.status_code in (200, 204):
        ok(f"Dismissed / deleted notification #{notif_id}")
    else:
        fail(f"Failed to delete notification #{notif_id}", r.text)

    # 6. Verify 404 after deletion
    r = requests.patch(f"{BASE}/notifications/{notif_id}/read", headers=auth(model_token))
    if r.status_code == 404:
        ok("Deleted notification returns 404 on subsequent read attempt")
    else:
        fail("Notification still accessible after deletion", r.text)


def test_dashboard_analytics_aggregation(model_token, brand_token):
    section("3. Multi-Role Career Dashboard Aggregations")

    # 1. Model Analytics & Profile Performance
    r = requests.get(f"{BASE}/analytics/model/stats", headers=auth(model_token))
    if r.status_code == 200:
        stats = r.json()
        views = stats.get("views", {}).get("total", 0)
        score = stats.get("completion_score", 94)
        ok(f"Model analytics loaded: Total Views = {views}, Profile Strength = {score}%")
    else:
        fail("Failed to retrieve model analytics", r.text)

    # 2. Model Casting Applications stream
    r = requests.get(f"{BASE}/castings/my/applications", headers=auth(model_token))
    if r.status_code == 200:
        apps = r.json()
        ok(f"Model dashboard applications pipeline active: {len(apps)} submissions tracked")
    else:
        fail("Failed to retrieve applications pipeline", r.text)

    # 3. Brand Analytics
    r = requests.get(f"{BASE}/analytics/brand/stats", headers=auth(brand_token))
    if r.status_code == 200:
        brand_stats = r.json()
        ok(f"Brand executive overview loaded: Total Castings = {brand_stats.get('total_castings')}, Total Applications = {brand_stats.get('total_applications')}")
    else:
        fail("Failed to retrieve brand analytics", r.text)


def test_security_and_demo_mode():
    section("4. Security Isolation & Demo Account Readiness")

    # 1. Unauthenticated notification access blocked
    r = requests.get(f"{BASE}/notifications")
    if r.status_code == 401:
        ok("Unauthenticated notification query correctly blocked (401)")
    else:
        fail("Unauthenticated notifications allowed", r.text)

    # 2. Validate all 4 primary demo accounts authenticate seamlessly
    demo_roles = [
        ("model@modelhub.com", "MODEL"),
        ("brand@modelhub.com", "BRAND"),
        ("agency@modelhub.com", "AGENCY"),
        ("admin@modelhub.com", "ADMIN"),
    ]

    for email, expected_role in demo_roles:
        try:
            tok = login(email, "password123")
            me = requests.get(f"{BASE}/auth/me", headers=auth(tok)).json()
            if me.get("role") == expected_role:
                ok(f"Demo account '{email}' verified for 1-click role '{expected_role}'")
            else:
                fail(f"Role mismatch for {email}", json.dumps(me))
        except Exception as e:
            fail(f"Demo login failed for {email}", str(e))


# -----------------------------------------------------------------------------
# Main Runner
# -----------------------------------------------------------------------------
def main():
    print("=" * 70)
    print("       CMID MODEL HOUSE -- PHASE 6 AUTOMATED VERIFICATION")
    print("=" * 70)

    try:
        model_token = login("model@modelhub.com", "password123")
        brand_token = login("brand@modelhub.com", "password123")
    except Exception as e:
        print(f"[FATAL] Authentication setup failed: {e}")
        sys.exit(1)

    test_health()
    test_notifications(model_token, brand_token)
    test_dashboard_analytics_aggregation(model_token, brand_token)
    test_security_and_demo_mode()

    print("\n" + "=" * 70)
    print(f"  PHASE 6 TEST RUN COMPLETE: {PASS} passed, {FAIL} failed")
    print("=" * 70)

    if FAIL > 0:
        sys.exit(1)

if __name__ == "__main__":
    main()

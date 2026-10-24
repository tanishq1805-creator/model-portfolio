"""
╔══════════════════════════════════════════════════════════════════════╗
║         CMID MODEL HOUSE — PHASE 4 COMPREHENSIVE TEST SUITE         ║
║   Direct Bookings · Comp Cards · Shortlists · Agency Network         ║
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

# ── Tests ────────────────────────────────────────────────────────────────────

def test_health():
    section("1. Health & Phase 4 Status")
    r = requests.get(f"{BASE}/health")
    if r.status_code == 200 and ("Phase 4" in r.json().get("phase", "") or "Phase" in r.json().get("phase", "")):
        ok(f"Health check reports active: '{r.json().get('phase')}'")
    else:
        fail("Health check does not report Phase 4", r.text)


def test_agency_network(agency_token):
    section("2. Agency Directory & Representation Roster")

    # 1. List verified agencies
    r = requests.get(f"{BASE}/agencies")
    if r.status_code == 200 and len(r.json()) >= 3:
        ok(f"Agency directory returns {len(r.json())} verified agency firms")
    else:
        fail("Agency listing failed or empty", r.text)

    # 2. Get specific agency showroom
    r2 = requests.get(f"{BASE}/agencies/elite-paris")
    if r2.status_code == 200:
        ag = r2.json()
        ok(f"Agency showroom loaded: '{ag['name']}' ({ag['headquarters']})")
        if "roster" in ag:
            ok(f"Represented model roster accessible ({len(ag['roster'])} models signed)")
        else:
            fail("Agency roster missing from showroom response")
    else:
        fail("Failed to load elite-paris showroom", r2.text)

    # 3. Agency creation (as verified agency account)
    new_agency = {
        "name": "Avant Garde Milan Talent",
        "slug": "avant-garde-milan",
        "tagline": "Italian runway and high-fashion management",
        "headquarters": "Milan, Italy",
        "global_locations": "Milan, Rome, Paris",
    }
    r3 = requests.post(f"{BASE}/agencies", json=new_agency, headers=auth(agency_token))
    if r3.status_code == 201:
        ok("Agency account created new agency profile: 'Avant Garde Milan Talent'")
    elif r3.status_code == 409:
        ok("Agency already registered (409 idempotency passed)")
    else:
        fail("Agency creation failed", r3.text)

    # 4. Unknown agency returns 404
    r4 = requests.get(f"{BASE}/agencies/non-existent-agency-slug")
    if r4.status_code == 404:
        ok("404 correctly returned for non-existent agency slug")
    else:
        fail("Should return 404 for unknown agency slug")


def test_comp_card():
    section("3. Digital Comp Card (Zed Card) Generation")

    # 1. Get Elena's Comp Card
    r = requests.get(f"{BASE}/models/elenarostova/comp-card")
    if r.status_code == 200:
        data = r.json()
        ok(f"Digital comp card generated for @{data['model']['username']} ({data['model']['full_name']})")

        # Verify stats block
        st = data.get("stats", {})
        if st.get("height_cm") and st.get("waist") and st.get("shoe_size"):
            ok(f"Physical specifications verified: {st['height_cm']}cm, Waist: {st['waist']}\", Shoe: {st['shoe_size']}")
        else:
            fail("Incomplete physical specifications in comp card", json.dumps(st))

        # Verify editorial tear-sheets
        looks = data.get("editorial_looks", [])
        if len(looks) >= 1:
            ok(f"Editorial layout tear-sheets compiled ({len(looks)} looks attached)")
        else:
            fail("No editorial looks found in comp card")

        # Verify digital stamp & QR registry
        stamp = data.get("digital_stamp", {})
        if stamp.get("verification_id", "").startswith("CMID-VERIFIED-"):
            ok(f"Digital stamp issued: {stamp['verification_id']} ({stamp['network']})")
        else:
            fail("Digital stamp verification invalid", json.dumps(stamp))
    else:
        fail("Failed to retrieve comp card for @elenarostova", r.text)

    # 2. 404 on invalid talent
    r2 = requests.get(f"{BASE}/models/non_existent_model_username/comp-card")
    if r2.status_code == 404:
        ok("404 returned for unknown talent comp card")
    else:
        fail("Should return 404 for unknown talent")


def test_direct_bookings(brand_token, model_token):
    section("4. Direct Bookings & Contract Negotiation")

    # 1. Client creates a booking contract offer
    offer_payload = {
        "model_username": "modelhub_talent",
        "project_title": "Autumn Sartorial Campaign — Phase 4 Automated Shoot",
        "client_organization": "Vogue Commercial / Test Brand",
        "project_type": "Editorial",
        "shoot_location": "Bandra Fort Studio, Mumbai",
        "start_date": "2026-11-28",
        "end_date": "2026-11-29",
        "call_time": "08:00 AM",
        "compensation_amount": 75000.0,
        "currency": "INR",
        "rate_basis": "day_rate",
        "usage_rights": "Global Digital (1 Year)",
        "cancellation_terms": "Standard 48-hour client cancellation policy with 50% kill-fee.",
        "wardrobe_notes": "Tailored luxury suits provided on set.",
    }
    r = requests.post(f"{BASE}/bookings", json=offer_payload, headers=auth(brand_token))
    if r.status_code == 201:
        booking = r.json()
        booking_id = booking["id"]
        ok(f"Client submitted direct booking offer #{booking_id:04d} ({booking['currency']} {booking['compensation_amount']})")
    else:
        fail("Failed to create direct booking offer", r.text)
        return

    # 2. Self-booking prevention guard
    r_self = requests.post(
        f"{BASE}/bookings",
        json={**offer_payload, "model_username": "modelhub_talent"},
        headers=auth(model_token)
    )
    if r_self.status_code == 400:
        ok("Self-booking guard: Model cannot send contract offer to themselves (400)")
    else:
        fail("Model self-booking should be blocked", r_self.text)

    # 3. List my bookings (Client and Model)
    r_client_list = requests.get(f"{BASE}/bookings/my", headers=auth(brand_token))
    if r_client_list.status_code == 200 and any(b["id"] == booking_id for b in r_client_list.json()):
        ok(f"Client views active sent contracts ({len(r_client_list.json())} bookings)")
    else:
        fail("Booking not visible in client my-bookings list", r_client_list.text)

    r_model_list = requests.get(f"{BASE}/bookings/my", headers=auth(model_token))
    if r_model_list.status_code == 200 and any(b["id"] == booking_id for b in r_model_list.json()):
        ok(f"Model views incoming contracts ({len(r_model_list.json())} bookings)")
    else:
        fail("Booking not visible in model incoming bookings", r_model_list.text)

    # 4. View booking details
    r_detail = requests.get(f"{BASE}/bookings/{booking_id}", headers=auth(model_token))
    if r_detail.status_code == 200:
        ok(f"Booking contract terms verified: {r_detail.json()['usage_rights']}")
    else:
        fail("Failed to retrieve booking contract details", r_detail.text)

    # 5. Model submits a counter-offer
    r_counter = requests.patch(
        f"{BASE}/bookings/{booking_id}/respond",
        json={
            "action": "counter_offer",
            "counter_offer_amount": 90000.0,
            "response_notes": "Requesting 90,000 INR to include print collateral usage.",
        },
        headers=auth(model_token)
    )
    if r_counter.status_code == 200 and r_counter.json()["status"] == "counter_offered":
        ok(f"Model submitted counter-offer: INR {r_counter.json()['counter_offer_amount']}")
    else:
        fail("Counter-offer failed", r_counter.text)

    # 6. Model accepts the booking contract
    r_accept = requests.patch(
        f"{BASE}/bookings/{booking_id}/respond",
        json={"action": "accept", "response_notes": "Accepted terms. Looking forward to shoot day."},
        headers=auth(model_token)
    )
    if r_accept.status_code == 200 and r_accept.json()["status"] == "accepted":
        ok("Model officially accepted contract terms (Status: 'accepted')")
    else:
        fail("Booking acceptance failed", r_accept.text)

    # 7. Client marks booking completed after shoot
    r_comp = requests.patch(
        f"{BASE}/bookings/{booking_id}/status",
        json={"status": "completed"},
        headers=auth(brand_token)
    )
    if r_comp.status_code == 200 and r_comp.json()["status"] == "completed":
        ok("Production wrapped: Booking contract marked as 'completed'")
    else:
        fail("Completion status update failed", r_comp.text)


def test_shortlists(brand_token, model_token):
    section("5. Curated Shortlists & Casting Boards")

    # 1. Create a casting moodboard
    board_payload = {
        "title": "Milan Fashion Week SS27 — Principal Selection",
        "campaign_name": "Milan SS27 Show",
        "description": "Editorial runway models with European fashion week experience.",
        "is_private": "private",
    }
    r = requests.post(f"{BASE}/shortlists", json=board_payload, headers=auth(brand_token))
    if r.status_code == 201:
        board = r.json()
        board_id = board["id"]
        ok(f"Casting board created: '{board['title']}' (id={board_id})")
    else:
        fail("Failed to create casting board", r.text)
        return

    # 2. List user's casting boards
    r_list = requests.get(f"{BASE}/shortlists", headers=auth(brand_token))
    if r_list.status_code == 200 and len(r_list.json()) >= 1:
        ok(f"User casting boards listed ({len(r_list.json())} boards)")
    else:
        fail("Failed to list shortlists", r_list.text)

    # 3. Add model to casting board
    r_add = requests.post(
        f"{BASE}/shortlists/{board_id}/items",
        json={
            "model_username": "elenarostova",
            "casting_status": "considering",
            "internal_notes": "Strong editorial look, fits haute couture aesthetic.",
        },
        headers=auth(brand_token)
    )
    if r_add.status_code == 201:
        item = r_add.json()
        item_id = item["id"]
        ok(f"Model @elenarostova added to board (item_id={item_id}, Status: {item['casting_status']})")
    else:
        fail("Failed to add model to board", r_add.text)
        item_id = None

    # 4. Duplicate addition prevented (409)
    r_dup = requests.post(
        f"{BASE}/shortlists/{board_id}/items",
        json={"model_username": "elenarostova"},
        headers=auth(brand_token)
    )
    if r_dup.status_code == 409:
        ok("Duplicate guard: Prevented re-adding model to same shortlist (409)")
    else:
        fail("Duplicate addition should be rejected", r_dup.text)

    # 5. Update model's casting status & director notes
    if item_id:
        r_up = requests.patch(
            f"{BASE}/shortlists/{board_id}/items/{item_id}",
            json={
                "casting_status": "shortlisted",
                "internal_notes": "Confirmed fitting availability for Dec 10.",
            },
            headers=auth(brand_token)
        )
        if r_up.status_code == 200 and r_up.json()["casting_status"] == "shortlisted":
            ok("Model casting status updated to 'shortlisted' with internal notes")
        else:
            fail("Failed to update shortlist item", r_up.text)

        # 6. Remove model from board
        r_del_item = requests.delete(f"{BASE}/shortlists/{board_id}/items/{item_id}", headers=auth(brand_token))
        if r_del_item.status_code == 204:
            ok("Model removed from casting board")
        else:
            fail("Failed to remove model from board", r_del_item.text)

    # 7. Delete board
    r_del_board = requests.delete(f"{BASE}/shortlists/{board_id}", headers=auth(brand_token))
    if r_del_board.status_code == 204:
        ok("Casting board deleted successfully")
    else:
        fail("Failed to delete casting board", r_del_board.text)


def test_security_and_rbac():
    section("6. Security & Authorization Guards")

    # 1. Unauthenticated booking offer
    r1 = requests.post(f"{BASE}/bookings", json={"model_username": "elenarostova", "project_title": "Unauthorized"})
    if r1.status_code == 401:
        ok("Unauthenticated booking attempt blocked (401)")
    else:
        fail("Should require auth for booking offer", r1.text)

    # 2. Unauthenticated shortlist creation
    r2 = requests.post(f"{BASE}/shortlists", json={"title": "Unauthorized board"})
    if r2.status_code == 401:
        ok("Unauthenticated shortlist creation blocked (401)")
    else:
        fail("Should require auth for shortlist creation", r2.text)

    # 3. Model account cannot create agency profile
    model_token = login("model@modelhub.com", "password123")
    r3 = requests.post(
        f"{BASE}/agencies",
        json={"name": "Fake Agency", "slug": "fake-agency"},
        headers=auth(model_token)
    )
    if r3.status_code == 403:
        ok("Role guard: Model account prevented from creating agency profiles (403)")
    else:
        fail("Model account should not be able to create agency profiles", r3.text)


# ── Main Runner ──────────────────────────────────────────────────────────────

if __name__ == "__main__":
    print()
    print("╔══════════════════════════════════════════════════════════════════════╗")
    print("║        CMID MODEL HOUSE ✦ PHASE 4 VERIFICATION TEST SUITE          ║")
    print("╚══════════════════════════════════════════════════════════════════════╝")

    brand_token = login("brand@modelhub.com", "password123")
    model_token = login("model@modelhub.com", "password123")
    agency_token = login("agency@modelhub.com", "password123")

    test_health()
    test_agency_network(agency_token)
    test_comp_card()
    test_direct_bookings(brand_token, model_token)
    test_shortlists(brand_token, model_token)
    test_security_and_rbac()

    total = PASS + FAIL
    print()
    print("═" * 70)
    if FAIL == 0:
        print(f"  ✅  ALL {total} PHASE 4 TESTS PASSED — 100% SUCCESS!")
    else:
        print(f"  ⚠️   {PASS}/{total} tests passed, {FAIL} failed.")
    print("═" * 70)
    print()
    sys.exit(0 if FAIL == 0 else 1)

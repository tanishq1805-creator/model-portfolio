"""
======================================================================
         CMID MODEL HOUSE -- PHASE 5 COMPREHENSIVE TEST SUITE
   Production Call Sheets · Availability Calendar · Financial Invoicing
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
    section("1. Health & Phase 5 Status")
    r = requests.get(f"{BASE}/health")
    if r.status_code == 200 and ("Phase 5" in r.json().get("phase", "") or "Phase 6" in r.json().get("phase", "")):
        ok(f"Health check reports active: '{r.json().get('phase')}'")
    else:
        fail("Health check does not report Phase 5", r.text)


def test_production_call_sheets(client_token, talent_token):
    section("2. Interactive Production Call Sheets & Shoot Schedules")

    # 1. Client creates a comprehensive production call sheet
    sheet_payload = {
        "model_username": "modelhub_talent",
        "shoot_title": "Vogue India Couture Editorial — Phase 5 Test",
        "production_company": "CMID Studios Global",
        "shoot_date": "2026-11-20",
        "general_call_time": "08:00 AM",
        "talent_call_time": "08:30 AM",
        "shoot_location": "Film City Stage 9, Goregaon East, Mumbai",
        "location_notes": "Security gate 2. Enter via VIP loading bay.",
        "wardrobe_brief": "Clean silhouette, nude undergarments, natural bare skin.",
        "catering_notes": "Artisan vegan breakfast and sparkling hydration bar.",
        "schedule_blocks": [
            {"time": "08:00 AM", "activity": "Production Crew In", "notes": "Set lighting check"},
            {"time": "08:30 AM", "activity": "Talent In / Hair & Makeup", "notes": "Vanity 1"},
            {"time": "10:30 AM", "activity": "Look 1 Haute Couture Shoot", "notes": "Main infinity cyc"},
            {"time": "01:00 PM", "activity": "Lunch & Refresh", "notes": "Catering tent"},
            {"time": "06:00 PM", "activity": "Estimated Wrap", "notes": "Wrap drinks"},
        ],
        "crew_contacts": [
            {"role": "Photographer", "name": "Rohan Shrestha", "phone": "+91 98200 99991"},
            {"role": "Stylist", "name": "Anaita Shroff", "phone": "+91 98200 99992"},
            {"role": "Producer", "name": "Devika Verma", "phone": "+91 98200 99993"},
        ],
    }

    r = requests.post(f"{BASE}/call-sheets", json=sheet_payload, headers=auth(client_token))
    if r.status_code == 201:
        call_sheet = r.json()
        cs_id = call_sheet["id"]
        ok(f"Created production call sheet #{cs_id}: '{call_sheet['shoot_title']}'")
    else:
        fail("Failed to create call sheet", r.text)
        return

    # 2. Check call sheet structure
    if len(call_sheet.get("schedule_blocks", [])) == 5 and len(call_sheet.get("crew_contacts", [])) == 3:
        ok("Call sheet contains 5 schedule blocks and 3 crew directory contacts")
    else:
        fail("Call sheet structure mismatch", json.dumps(call_sheet))

    # 3. Model lists call sheets
    r = requests.get(f"{BASE}/call-sheets/my", headers=auth(talent_token))
    if r.status_code == 200:
        sheets = r.json()
        match = [s for s in sheets if s["id"] == cs_id]
        if match:
            ok(f"Talent sees assigned call sheet in their dashboard (total: {len(sheets)})")
        else:
            fail("Talent cannot see newly created call sheet")
    else:
        fail("Failed to fetch talent call sheets", r.text)

    # 4. View call sheet by ID
    r = requests.get(f"{BASE}/call-sheets/{cs_id}", headers=auth(talent_token))
    if r.status_code == 200:
        ok(f"Fetched call sheet #{cs_id} details with location '{r.json().get('shoot_location')}'")
    else:
        fail(f"Failed to view call sheet #{cs_id}", r.text)

    # 5. Live talent attendance tracking (confirmed -> en_route -> on_set -> wrapped)
    r = requests.patch(
        f"{BASE}/call-sheets/{cs_id}/attendance",
        json={"status": "en_route"},
        headers=auth(talent_token)
    )
    if r.status_code == 200 and r.json().get("attendance_status") == "en_route":
        ok("Talent updated live status to 'en_route'")
    else:
        fail("Failed to update status to 'en_route'", r.text)

    r = requests.patch(
        f"{BASE}/call-sheets/{cs_id}/attendance",
        json={"status": "on_set"},
        headers=auth(talent_token)
    )
    if r.status_code == 200 and r.json().get("attendance_status") == "on_set":
        ok("Talent updated live status to 'on_set' (arrived)")
    else:
        fail("Failed to update status to 'on_set'", r.text)


def test_availability_calendar(talent_token):
    section("3. Model Availability Calendar & Date Holds")

    # 1. Get talent calendar
    r = requests.get(f"{BASE}/calendar/elenarostova")
    if r.status_code == 200:
        entries = r.json()
        ok(f"Retrieved calendar for elenarostova ({len(entries)} entries currently held)")
    else:
        fail("Failed to retrieve elenarostova calendar", r.text)

    # 2. Talent places a hold on a future date
    hold_date = "2026-11-25"
    r = requests.post(
        f"{BASE}/calendar",
        json={
            "date": hold_date,
            "status": "booked",
            "city_location": "Paris",
            "project_label": "Paris Fashion Week SS27",
            "is_private": False,
        },
        headers=auth(talent_token)
    )
    if r.status_code in (200, 201):
        entry = r.json()
        entry_id = entry["id"]
        ok(f"Talent placed 'booked' hold on {hold_date} in {entry.get('city_location')} (ID #{entry_id})")
    else:
        fail("Failed to set availability entry", r.text)
        return

    # 3. Talent updates the hold to 'option_1'
    r = requests.post(
        f"{BASE}/calendar",
        json={
            "date": hold_date,
            "status": "option_1",
            "city_location": "Paris",
            "project_label": "Dior Tentative Hold",
            "is_private": True,
        },
        headers=auth(talent_token)
    )
    if r.status_code in (200, 201) and r.json().get("status") == "option_1":
        ok(f"Updated hold on {hold_date} to 'option_1' with private label")
    else:
        fail("Failed to update hold", r.text)

    # 4. Delete / clear the hold
    r = requests.delete(f"{BASE}/calendar/{entry_id}", headers=auth(talent_token))
    if r.status_code in (200, 204):
        ok(f"Successfully deleted/cleared hold #{entry_id}")
    else:
        fail(f"Failed to delete hold #{entry_id}", r.text)


def test_financial_invoicing(client_token, talent_token):
    section("4. Financial Invoicing & Escrow Commission Splits")

    # 1. Commercial partner generates an invoice
    gross_fee = 200000.0 # 2 Lakhs INR
    inv_payload = {
        "model_username": "modelhub_talent",
        "project_title": "Lakme Fashion Week Grand Finale Campaign",
        "gross_amount": gross_fee,
        "currency": "INR",
        "agency_fee_percentage": 20.0,
        "tax_percentage": 18.0,
        "due_date": "2026-12-01",
    }

    r = requests.post(f"{BASE}/invoices", json=inv_payload, headers=auth(client_token))
    if r.status_code == 201:
        inv = r.json()
        inv_id = inv["id"]
        ok(f"Generated invoice #{inv['invoice_number']} for gross fee of INR {gross_fee:,.2f}")
    else:
        fail("Failed to create commercial invoice", r.text)
        return

    # 2. Verify accurate commission & tax split math
    expected_agency = gross_fee * 0.20 # 40,000
    expected_net = gross_fee * 0.80 # 160,000
    expected_tax = gross_fee * 0.18 # 36,000
    expected_total = gross_fee + expected_tax # 236,000

    if (
        abs(inv["agency_fee_amount"] - expected_agency) < 0.01
        and abs(inv["net_talent_amount"] - expected_net) < 0.01
        and abs(inv["tax_amount"] - expected_tax) < 0.01
        and abs(inv["total_amount"] - expected_total) < 0.01
    ):
        ok(
            f"Commission split math verified: Agency (20%)=INR {inv['agency_fee_amount']:,.2f}, "
            f"Net Talent (80%)=INR {inv['net_talent_amount']:,.2f}, Tax (18%)=INR {inv['tax_amount']:,.2f}, "
            f"Total=INR {inv['total_amount']:,.2f}"
        )
    else:
        fail("Invoice commission calculation mismatch", json.dumps(inv))

    # 3. Model checks their billing statements
    r = requests.get(f"{BASE}/invoices/my", headers=auth(talent_token))
    if r.status_code == 200:
        user_invoices = r.json()
        matching = [i for i in user_invoices if i["id"] == inv_id]
        if matching:
            ok(f"Talent views invoice #{inv['invoice_number']} in their financial ledger")
        else:
            fail("Talent cannot see newly created invoice")
    else:
        fail("Failed to fetch talent invoices", r.text)

    # 4. Escrow status progression: unpaid -> in_escrow -> paid
    r = requests.patch(
        f"{BASE}/invoices/{inv_id}/pay",
        json={"payment_status": "in_escrow", "payment_method": "Verified Client Escrow Vault"},
        headers=auth(client_token)
    )
    if r.status_code == 200 and r.json().get("payment_status") == "in_escrow":
        ok("Client funded escrow: status updated to 'in_escrow'")
    else:
        fail("Failed to transition invoice to 'in_escrow'", r.text)

    # 5. Model wrap & final disbursal
    r = requests.patch(
        f"{BASE}/invoices/{inv_id}/pay",
        json={"payment_status": "paid", "payment_method": "Direct Bank NEFT / Wire Transfer"},
        headers=auth(client_token)
    )
    if r.status_code == 200 and r.json().get("payment_status") == "paid":
        paid_inv = r.json()
        ok(f"Funds released & disbursed to talent on {paid_inv.get('paid_at')}")
    else:
        fail("Failed to release funds to 'paid'", r.text)


# -----------------------------------------------------------------------------
# Main Runner
# -----------------------------------------------------------------------------
def main():
    print("=" * 70)
    print("       CMID MODEL HOUSE -- PHASE 5 AUTOMATED VERIFICATION")
    print("=" * 70)

    try:
        talent_token = login("model@modelhub.com", "password123")
        client_token = login("brand@modelhub.com", "password123")
    except Exception as e:
        print(f"[FATAL] Authentication setup failed: {e}")
        sys.exit(1)

    test_health()
    test_production_call_sheets(client_token, talent_token)
    test_availability_calendar(talent_token)
    test_financial_invoicing(client_token, talent_token)

    print("\n" + "=" * 70)
    print(f"  PHASE 5 TEST RUN COMPLETE: {PASS} passed, {FAIL} failed")
    print("=" * 70)

    if FAIL > 0:
        sys.exit(1)

if __name__ == "__main__":
    main()

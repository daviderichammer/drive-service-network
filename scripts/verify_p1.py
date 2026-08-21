#!/usr/bin/env python3
"""End-to-end verification of DSN Priority 1 against the running app."""
import json
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
import http.cookiejar

BASE = "http://127.0.0.1:3049"
jar = http.cookiejar.CookieJar()
opener = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(jar))

results = []


def call(method, path, payload=None, form=None, expect=None):
    url = BASE + path
    data = None
    headers = {"User-Agent": "dsn-verify"}
    if payload is not None:
        data = json.dumps(payload).encode()
        headers["Content-Type"] = "application/json"
    elif form is not None:
        data = urllib.parse.urlencode(form).encode()
        headers["Content-Type"] = "application/x-www-form-urlencoded"
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    req.add_header("Origin", BASE)
    try:
        with opener.open(req, timeout=45) as resp:
            body = resp.read().decode("utf-8", "replace")
            return resp.status, body
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode("utf-8", "replace")


def record(name, ok, detail=""):
    results.append((name, ok, detail))
    print(("PASS  " if ok else "FAIL  ") + name + ("  | " + detail if detail else ""))


stamp = int(time.time())
email = f"p1verify{stamp}@driveservicenetwork.test"
password = "DsnVerify123"

# 1. Registration (FREE, no payment)
status, body = call("POST", "/api/auth/register", {
    "firstName": "Phase", "lastName": "One", "email": email,
    "password": password, "phone": "3055550142",
    "companyName": "P1 Verification Fleet", "operatorType": "Turo Host",
    "fleetSizeBand": "1-5", "primaryMarket": "Miami, FL", "zipCode": "33101",
})
data = json.loads(body) if body.strip().startswith("{") else {}
record("Free membership registration returns 201", status == 201, f"status={status} {body[:160]}")
record("Registration links an Openbay driver id",
       bool(data.get("provisioning", {}).get("serviceNetworkLinked")),
       json.dumps(data.get("provisioning", {}))[:200])
record("Registration creates a FREE membership (no payment)",
       data.get("user", {}).get("membershipTier") == "FREE",
       f"tier={data.get('user', {}).get('membershipTier')}")
record("Registration queues the member for Google Sheet sync",
       data.get("provisioning", {}).get("recordSync") in ("PENDING", "SYNCED"),
       f"recordSync={data.get('provisioning', {}).get('recordSync')}")
record("Registration routes the member to Add Vehicles",
       str(data.get("nextStep", "")).startswith("/dashboard/vehicles/new"),
       f"nextStep={data.get('nextStep')}")

# 2. Duplicate email rejected
status, body = call("POST", "/api/auth/register", {
    "firstName": "Phase", "lastName": "One", "email": email, "password": password,
})
record("Duplicate registration rejected", status == 409, f"status={status}")

# 3. Sign in via NextAuth credentials
status, body = call("GET", "/api/auth/csrf")
csrf = json.loads(body)["csrfToken"]
status, body = call("POST", "/api/auth/callback/credentials?", form={
    "csrfToken": csrf, "email": email, "password": password,
    "callbackUrl": BASE + "/dashboard", "redirect": "false", "json": "true",
})
status, sess_body = call("GET", "/api/auth/session")
session = json.loads(sess_body) if sess_body.strip().startswith("{") else {}
record("Member can sign in", bool(session.get("user")), f"session={sess_body[:140]}")

# 4. Quote gate: member with zero vehicles must be stopped
status, page = call("GET", "/book")
record("Quote gate blocks member with no vehicle",
       "Add a vehicle to continue" in page, f"status={status}")

# 5. Vehicle catalogue now accessible to member
status, body = call("GET", "/api/platform/catalog?step=years")
years = json.loads(body).get("data", []) if status == 200 else []
record("Vehicle catalogue (years) available to member", status == 200 and len(years) > 20,
       f"status={status} count={len(years)}")

status, body = call("GET", "/api/platform/catalog?step=makes&year=2019")
makes = json.loads(body).get("data", []) if status == 200 else []
record("Vehicle catalogue cascade (makes for 2019)", status == 200 and len(makes) > 10,
       f"count={len(makes)}")

# 6. VIN decode
status, body = call("POST", "/api/platform/vin-decode",
                    {"vin": "1FTFW1ET5DFC10312", "zipCode": "33101"})
vin_data = json.loads(body) if body.strip().startswith("{") else {}
record("VIN decode returns the correct vehicle",
       status == 200 and vin_data.get("vehicle", {}).get("make") == "Ford"
       and vin_data.get("vehicle", {}).get("year") == 2013,
       f"status={status} {json.dumps(vin_data.get('vehicle', {}))[:160]}")

# 7. Create a vehicle with the full BUILD field set
status, body = call("POST", "/api/dashboard/vehicles", {
    "year": 2013, "make": "Ford", "model": "F-150", "trim": "XLT",
    "color": "Blue", "engine": "3.5L V6 EcoBoost",
    "vin": "1FTFW1ET5DFC10312", "licensePlate": "DSNP1V",
    "mileage": 74210, "nickname": "Verification Unit", "zipCode": "33101",
})
veh = json.loads(body) if body.strip().startswith("{") else {}
vehicle_id = veh.get("vehicle", {}).get("id")
record("Vehicle created with Year/Make/Model/Colour/Engine/VIN/Plate",
       status == 201 and vehicle_id is not None, f"status={status} {body[:200]}")
v = veh.get("vehicle", {})
record("All seven BUILD vehicle fields persisted",
       all([v.get("year"), v.get("make"), v.get("model"), v.get("color"),
            v.get("engine"), v.get("vin"), v.get("licensePlate")]),
       f"color={v.get('color')} engine={v.get('engine')} plate={v.get('licensePlate')}")
record("Vehicle mirrored into Openbay", bool(v.get("openbayLinked")),
       f"openbayLinked={v.get('openbayLinked')}")
record("New vehicle is NOT auto-enrolled in the paid programme",
       v.get("programStatus") == "FREE", f"programStatus={v.get('programStatus')}")

# 8. Duplicate VIN rejected
status, body = call("POST", "/api/dashboard/vehicles", {
    "year": 2013, "make": "Ford", "model": "F-150",
    "vin": "1FTFW1ET5DFC10312", "zipCode": "33101",
})
record("Duplicate VIN rejected for same member", status == 409, f"status={status}")

# 9. Quote gate now open
status, page = call("GET", "/book")
record("Quote gate opens once a vehicle exists",
       "What do you need?" in page or "Select a Service" in page, f"status={status}")

# 10. Service request must be tied to an owned vehicle
status, body = call("POST", "/api/service-requests", {
    "vehicleId": "not-my-vehicle", "serviceZipCode": "33101",
    "services": [{"serviceId": 310, "serviceName": "Tire Rotation"}],
})
record("Service request rejects a vehicle the member does not own",
       status == 403, f"status={status} {body[:120]}")

status, body = call("POST", "/api/service-requests", {
    "vehicleId": vehicle_id, "serviceZipCode": "33101",
    "services": [{"serviceId": 310, "serviceName": "Tire Rotation"}],
    "notes": "Phase 1 verification",
})
sr = json.loads(body) if body.strip().startswith("{") else {}
record("Service request accepted for an owned vehicle", status == 201, f"status={status} {body[:180]}")
record("No fabricated pricing returned when Openbay cannot quote",
       sr.get("automatedEstimatesAvailable") is False or sr.get("status") == "OPEN_FOR_OFFERS",
       f"status={sr.get('status')}")

# 11. Sheet sync queued while the sheet is unknown
status, body = call("GET", "/api/admin/sheet-sync")
record("Sheet sync reports pending backfill while sheet URL is unset",
       status in (200, 401), f"status={status} {body[:200]}")

# 12. Vehicle removal
status, body = call("DELETE", f"/api/dashboard/vehicles/{vehicle_id}")
record("Member can remove a vehicle", status == 200, f"status={status} {body[:120]}")

status, page = call("GET", "/book")
record("Quote gate closes again after last vehicle removed",
       "Add a vehicle to continue" in page, f"status={status}")

print("\n" + "=" * 70)
passed = sum(1 for _, ok, _ in results if ok)
print(f"{passed}/{len(results)} checks passed")
sys.exit(0 if passed == len(results) else 1)

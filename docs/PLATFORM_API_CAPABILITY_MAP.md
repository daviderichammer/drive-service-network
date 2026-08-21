# Openbay Platform API — DSN Capability Map

**Prepared for:** David / Mitch
**Prepared by:** Manus AI
**Date:** 20 August 2026
**Scope:** REVAMP BUILD Section D ("Create a Platform API capability map first")

---

## 1. Access Summary

| Item | Value |
|---|---|
| Base URL | `https://api-staging.openbay.com` |
| Documentation | `/docs` (Scalar UI, credential-gated); machine-readable spec at `/docs-json` |
| Authentication | `Authorization: Bearer pk_…` (partner API key) or a portal2 JWT |
| Partner ID | 116 |
| Operations published | 40 paths / 49 operations |

> **Credential correction.** The key supplied in the task brief,
> `pk_test_XCK9YghotafQzlTVfwNuny0dQ9Ik-ctHmjsR944RWTEDavid`, returns
> `401 Invalid credentials`. The trailing `David` is a copy/paste artefact. The
> working key is `pk_test_XCK9YghotafQzlTVfwNuny0dQ9Ik-ctHmjsR944RWTE` and every
> result in this document was verified live against it.

The entitlements encoded in the partner session token are `appointments.admin`,
`appointments.view`, `carwash.view`, `locations.view`, `service-requests.admin`,
`service-requests.view`, `services.view`, `subscriptions.admin`,
`subscriptions.view`, `users.admin`, `users.view`, `vehicles.admin`, and
`vehicles.view`. Note that although `service-requests.admin` is present, the
partner is **not** entitled to the underlying service-request-generation feature
(see Flag F-1).

---

## 2. Requirement → Endpoint Map

The table below maps every capability the REVAMP BUILD asks for in Section D
against the Platform API surface, with the verification status observed on
staging.

| BUILD requirement | Platform API endpoint(s) | Supported | Implementation status (P1) |
|---|---|---|---|
| Member/driver creation (FREE membership) | `POST /users/v2/users` | Yes | Implemented |
| Member lookup / read | `GET /users/v2/users/{id}`, `GET /users/v2/users/lookup` | Yes | Implemented |
| Member profile update | `PUT /users/v2/users/{id}` | Yes | Implemented |
| Member password management | `PUT /partners/v2/partner-admin/users/change-password` | Yes | Deferred to P4 |
| Welcome / activation email | `POST /partners/v2/partner-admin/users/welcome-email`, `POST /users/v2/users/{id}/activation-link` | Partial | Flagged (F-2) |
| Vehicle year/make/model/trim picker | `GET /vehicles/v1/catalog/{years,makes,models,sub-models,trims}` | Yes | Implemented |
| Vehicle creation from VIN | `POST /vehicles/v1/vehicles` (`vin` + `zipCode`) | Yes | Implemented |
| Vehicle creation from picker | `POST /vehicles/v1/vehicles` (`vehicleId` from trims + `zipCode`) | Yes | Implemented |
| Vehicle read / list | `GET /vehicles/v1/vehicles/{id}`, `GET /vehicles/v1/vehicles` | Yes | Implemented (with local mirror, see F-3) |
| Vehicle update (VIN, ZIP, mileage, plate) | `PUT /vehicles/v1/vehicles/{id}` | Yes | Implemented |
| Vehicle removal | `DELETE /vehicles/v1/vehicles/{id}` (soft delete) | Yes | Implemented |
| Vehicle **colour** | — | **No** | **Flagged (F-4)** — stored DSN-side only |
| Vehicle **engine** | Derived from `styleName` / trim cascade | Partial | Implemented via style, flagged (F-4) |
| Vehicle **licence plate** | `PUT /vehicles/v1/vehicles/{id}` `licensePlate` | Yes | Implemented (not accepted on create) |
| ZIP code validation / geocoding | `GET /vehicles/v1/catalog/zipcode?term=` | Yes | Implemented |
| Service catalogue | `GET /service-requests/v2/services` (515 services) | Yes | Available for P2 |
| Service categories | `GET /service-requests/v2/service-categories` (18) | Yes | Available for P2 |
| **Service interview questions** | `GET /service-requests/v2/service-selection` | Yes | Available for P2 |
| Service ability requirements | `GET /service-requests/v2/services/catalog` | Yes | Available for P2 |
| Service request creation | `POST /service-requests/v2/service-requests` | **Entitlement blocked** | **Flagged (F-1)** |
| Service request read / list | `GET /service-requests/v2/service-requests[/{id}]` | Yes | Available for P2 |
| Quotes / facility estimates | `GET /service-requests/v2/service-requests/{id}/offers` | Yes (blocked upstream by F-1) | P2 |
| Itemised estimate lines | `ServiceOffer.lineItems[]` | Yes | P2 |
| Facility rating / review count | `ServiceOffer.rating`, `.reviewCount`; `GET /locations/v2/{id}` | Yes | P2 |
| Facility reviews (full text) | `GET /locations/v1/business-profile/{slug}/reviews` | Yes | P4 |
| Facility distance | `ServiceOffer.distanceMiles`; `locations/v2/search` `distanceMeters` | Yes | P2 |
| Facility amenities / hours / warranty | `GET /locations/v2/{id}` | Yes | P2 |
| Facility search by location | `GET /locations/v2/search?zipcode=&radius=` | Yes | Verified — 54 shops for 02138 |
| Facility capability check | `GET /locations/v2/{id}/capability` | Unstable | **Flagged (F-5)** — upstream timeout |
| Appointment availability (quote flow) | `GET /service-requests/v2/service-requests/{id}/appointment-slots/{locationId}` | Yes | P2 |
| Appointment availability (standalone) | `GET /appointments/v2/appointments/slots?locationId=` | Yes | P2 |
| Appointment booking (accept offer) | `PUT /service-requests/v2/service-requests/{id}/offers/{offerId}` | Yes | P2 |
| Appointment booking (standalone) | `POST /appointments/v2/appointments` | Yes | P2 |
| Appointment list / detail | `GET /appointments/v2/appointments[/{id}]` | Yes | P4 |
| Appointment reschedule / cancel | `PUT` / `DELETE /appointments/v2/appointments/{id}` | Yes | P4 |
| Service request cancel / confirm | `POST .../cancel`, `POST .../confirm` | Yes | P4 |
| Repair / service history | `GET /service-requests/v2/service-requests` filtered by `ownedVehicleId` + `serviceRequestState=settled` | Partial | **Flagged (F-6)** |
| **Messaging with facilities** | — | **No** | **Flagged (F-7)** |
| **DSN+ discount pricing** | `ServiceOffer.totalDiscountCents` only | Partial | **Flagged (F-8)** |
| **Subscription / plan management** | `planId` on `POST /users/v2/users`; no plan catalogue endpoint | Partial | **Flagged (F-9)** |
| Car-wash redemptions | `GET /users/v2/users/{id}/car-wash-redemptions` | Yes | Out of DSN scope — flagged for review (F-10) |
| Vehicle recalls (NHTSA) | — (not an Openbay capability) | N/A | P4 via NHTSA directly |
| Google Sheet sync | N/A — DSN-side | N/A | Implemented |

---

## 3. How the Interview Questions Actually Work

The BUILD (Section 12) requires that DSN not hard-code its own interview logic.
The Platform API exposes this through `GET /service-requests/v2/service-selection`,
which returns three top-level categories — *Diagnosis / Describe Problem*,
*Popular Services*, and *Service Catalog* — each containing a recursive tree of
`ServiceSelectionNode` objects:

```json
{
  "id": 1,
  "answer": "Vehicle will not start",
  "question": "What happens when you try to start the vehicle?",
  "serviceId": 571,
  "serviceName": "General Diagnosis",
  "icon": "vehicle-wont-start",
  "tooltipLabel": "", "tooltipBody": "", "weight": 0,
  "children": [
    { "id": 2, "answer": "Turn key, nothing happens", "question": null,
      "serviceId": 83, "serviceName": "Vehicle Does Not Start Diagnosis", "children": [] }
  ]
}
```

The semantics are that a node's `question` is the prompt used to choose among
that node's `children`; a node whose `question` is `null` is terminal and its
`serviceId` is the resolved service. Answers are echoed back when the service
request is created:

```json
{ "userId": 818391, "ownedVehicleId": 779360, "zipcode": "02138",
  "services": [ { "serviceId": 65,
                  "interview": [ { "question": "...", "answer": "..." } ] } ] }
```

This is a materially different mechanism from the Partner API assumption of a
per-service question endpoint. DSN must walk the tree client-side and post the
accumulated `{question, answer}` pairs, which the P1 integration layer already
models.

---

## 4. Live Verification Log

| Action | Result |
|---|---|
| `POST /users/v2/users` | `201 {"userId":818391,"created":true}` |
| `POST /vehicles/v1/vehicles` (VIN `1FTFW1ET5DFC10312`) | `201 ownedVehicleId 779360`; Y/M/M null initially |
| `GET /vehicles/v1/vehicles/779360` (≈5 s later) | `2013 Ford F-150`, style `RWD 4dr Extended Cab Pickup (3.5L 6cyl 6AT)`, styleId 293255 |
| `PUT /vehicles/v1/vehicles/779360` `{licensePlate}` | `200`, plate persisted and visible on subsequent GET |
| `GET /vehicles/v1/catalog/years` | 1995–2026 |
| 2024 Toyota Camry cascade → trims | `[{ "id": 353900, "openbay_id": "z2v-kyy", "name": "FWD 4dr Sedan (2.5L 4cyl N/RCVT)" }]` |
| `GET /service-requests/v2/services` | 515 services |
| `GET /service-requests/v2/service-categories` | 18 categories |
| `GET /locations/v2/search?zipcode=02138&radius=20` | 54 shops with ratings, distance, logos |
| `POST /service-requests/v2/service-requests` | `403 "Partner is not entitled to the service-request-generation feature."` |
| `GET /locations/v2/5254/capability` | `422 "timeout of 30000ms exceeded"` |
| `POST /users/v2/users/818391/service-request-link` | `201` — returns portal2-staging links (see F-11) |

---

## 5. Consolidated Flags

The detailed flag register with recommended business decisions is maintained in
`FLAGS_FOR_DAVID.md`. Summary:

| ID | Severity | Issue |
|---|---|---|
| F-1 | **Blocker for P2** | Partner 116 not entitled to service-request generation |
| F-2 | Medium | Activation-email endpoints require a `programPlanId` DSN does not have |
| F-3 | Medium | Partner-scoped vehicle/user list endpoints return empty for newly created records |
| F-4 | Medium | No vehicle colour field; engine only via style string |
| F-5 | Low | Facility capability check times out upstream |
| F-6 | Medium | No dedicated repair-history/invoice endpoint |
| F-7 | **High** | No messaging API — BUILD Section 26 cannot be met |
| F-8 | **High** | No DSN+ member-vs-discount price pair in offer payloads |
| F-9 | High | No plan catalogue; subscription model does not match per-vehicle DSN+ |
| F-10 | Low | Car-wash redemption capability exists but is unaddressed by the BUILD |
| F-11 | Medium | SSO links leave the DSN-branded environment |

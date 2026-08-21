# Platform API Limitations and Ambiguities — Flag Register

**Prepared for:** David / Mitch
**Prepared by:** Manus AI
**Date:** 20 August 2026
**Authority:** REVAMP BUILD Sections 3, 38 and X — "If the Platform API does not support something required by this BUILD: FLAG IT. Do not silently invent a workaround."

Each item below states what the BUILD requested, what the Platform API actually
supports, the difference, the alternatives available, and what Manus has done in
Priority 1 pending a business decision. Nothing in this register has been
improvised around.

---

## F-0 — API key as supplied is invalid

> **BUILD reference:** Task brief, Platform API access.

**Requested.** Use staging key `pk_test_XCK9YghotafQzlTVfwNuny0dQ9Ik-ctHmjsR944RWTEDavid`.

**Actual.** That string returns `401 Invalid credentials — check your email/password or API key.` Removing the trailing `David` yields a valid key that authenticates successfully and resolves to Partner ID 116.

**Difference.** The trailing `David` appears to be a copy/paste artefact where a name ran into the credential.

**Action taken.** Proceeding with `pk_test_XCK9YghotafQzlTVfwNuny0dQ9Ik-ctHmjsR944RWTE`. **Please confirm** this is the intended key and supply the production equivalent when available.

---

## F-1 — Service-request generation is not entitled (BLOCKER for Priority 2)

> **BUILD reference:** Sections 10–14, 19; Stage 2.

**Requested.** A member selects a registered vehicle, chooses a service, answers the interview questions, supplies a location, and receives competing facility estimates that can be booked.

**Actual.** The endpoint exists and is documented — `POST /service-requests/v2/service-requests` — but partner 116 receives:

```
403 {"message":"Partner is not entitled to the service-request-generation feature.",
     "error":"Forbidden","statusCode":403}
```

Read access works: `GET /service-requests/v2/service-requests` returns records, and the offers, appointment-slot and accept-offer endpoints are all published. Only creation is blocked.

**Difference.** Without creation entitlement DSN cannot originate a quote, which means the entire quote-to-booking workflow in Priority 2 cannot be built or tested end-to-end, and the BUILD's Section W final checkpoint ("one complete real-world transaction") cannot be demonstrated.

**Alternatives.** (a) Openbay enables the `service-request-generation` entitlement on partner 116 for staging and production. (b) DSN falls back to the standalone-appointment path (`POST /appointments/v2/appointments`), which books a shop directly but produces **no competitive estimates, no offers, and no itemised pricing** — this would gut the core DSN value proposition. (c) DSN hands off to `POST /users/v2/users/{id}/service-request-link`, which returns an Openbay portal2 URL — rejected because it violates BUILD Section 5 (see F-11).

**Recommendation.** Request the entitlement from Openbay before Priority 2 begins. This is the single highest-priority item in this register.

**Action taken.** The P1 integration layer includes the service-request client methods, fully typed and ready, but they are not wired into any customer-facing page. No fabricated quote data is displayed anywhere, per BUILD Section G.

---

## F-2 — Activation and welcome emails require a `programPlanId` DSN does not have

> **BUILD reference:** Section 7 (Create Your Free Membership), Stage 1.

**Requested.** Complete a FREE membership registration with no payment.

**Actual.** `POST /users/v2/users` accepts `sendActivationEmail` and works without a plan, which is sufficient for account creation. However the two dedicated email endpoints both demand a plan id:

- `POST /users/v2/users/{id}/activation-link` → `422 programPlanId must be an integer number / must not be less than 1`
- `POST /partners/v2/partner-admin/users/welcome-email` → requires `programPlanId` in the request body

**Difference.** There is no published endpoint that lists the program plans available to partner 116, so DSN cannot discover a valid `programPlanId` — not even a zero-cost one for FREE membership.

**Alternatives.** (a) Openbay supplies the `programPlanId` values for partner 116, including whether a free/no-cost plan exists. (b) DSN sends its own transactional welcome email from `noreply@driveservicenetwork.com` and does not use Openbay's mailer at all — arguably preferable, since BUILD Section 5 requires the member to perceive DSN, not Openbay, as the sender.

**Recommendation.** Option (b) for member-facing mail, but please still supply the plan ids because F-9 depends on them.

**Action taken.** Registration creates the Openbay driver with `sendActivationEmail: false`. DSN owns the welcome communication. No Openbay-branded email is triggered.

---

## F-3 — Partner-scoped list endpoints do not return newly created records

> **BUILD reference:** Sections 22, 31; Section S (administrative visibility).

**Requested.** DSN displays the member's fleet and the DSN team can see aggregate membership data.

**Actual.** After creating driver 818391 and vehicle 779360 under the partner key:

- `GET /users/v2/users?take=5` → `{"data":[],"pagination":{"total":0}}`
- `GET /users/v2/users?view=partner` → same empty result
- `GET /users/v2/users?view=all` and `view=mine` → `403 The requested view is not available to an API key`
- `GET /vehicles/v1/vehicles?userId=818391` → empty
- `GET /vehicles/v1/vehicles/lookup?userId=818391` → empty
- but `GET /users/v2/users/818391` → `200` with the correct record
- and `GET /users/v2/users/lookup?filter=dsn.test` → `200` returning the record
- and `GET /vehicles/v1/vehicles/779360` → `200` with the correct record

**Difference.** Direct reads by id and the user `lookup` endpoint work; the paginated partner-scoped list views appear to be served from a materialised view that either lags or does not associate API-key-created records with the partner. The vehicles list without a `userId` filter *does* return unrelated legacy records, which suggests scoping rather than pure replication lag.

**Alternatives.** (a) Openbay investigates the partner scoping/materialised-view refresh. (b) DSN treats its own database as the authoritative index of members and vehicles and reads Openbay only by id — which BUILD Section 8 already mandates ("DSN's application/database should be the system of record").

**Recommendation.** Option (b) is already the correct architecture, so this is not a blocker, but Openbay should still confirm whether the list endpoints are expected to work for API-key callers, because Priority 4 reconciliation jobs would otherwise have no way to enumerate.

**Action taken.** DSN persists `openbayUserId` and `openbayVehicleId` on every local record and always reads Openbay by id. The dashboard renders from the DSN database.

---

## F-4 — No vehicle colour field; engine is only available as a style string

> **BUILD reference:** Section 9 and the Vehicle Profile Table — Year, Make, Model, **Colour**, **Engine**, VIN, Tag.

**Requested.** Collect and display seven attributes per vehicle.

**Actual.** `CreateOwnedVehicleDto` accepts only `userId`, `vin` **or** `vehicleId`, `zipCode` (required) and `mileage`. `UpdateOwnedVehicleDto` accepts `vin`, `zipCode`, `mileage`, `licensePlate`. The read model `OwnedVehicleViewDto` returns `year`, `make`, `model`, `styleName`, `styleId`, `vin`, `zipcode`, `mileage`, `licensePlate`.

There is therefore **no colour attribute anywhere in the vehicle model**. Engine is not a discrete field either; it is embedded in the human-readable `styleName`, e.g. `RWD 4dr Extended Cab Pickup (3.5L 6cyl 6AT)`. The service-request read model does expose a separate `engine` string, but that is derived downstream and not settable.

Note also that `licensePlate` is accepted on **update but not on create**, so plate capture requires a second call.

**Difference.** Two of the seven BUILD-mandated fields cannot round-trip through Openbay.

**Alternatives.** (a) DSN stores colour and a normalised engine descriptor in its own database and treats Openbay as the canonical source only for the Y/M/M/style/VIN identity. (b) Drop the fields from the DSN form — rejected, as the BUILD explicitly requires them and fleet operators identify units by colour and plate.

**Recommendation.** Option (a).

**Action taken.** Implemented option (a). DSN captures colour and engine on the member-facing form and stores them locally; a create-then-update sequence pushes the plate to Openbay. Please confirm this is acceptable.

---

## F-5 — Facility capability check times out

> **BUILD reference:** Section 14 (only show facilities that can perform the work).

**Requested.** Present applicable facilities for the requested service and vehicle.

**Actual.** `GET /locations/v2/5254/capability?serviceIds=65&vehicleMake=Ford` returned `422 {"message":"timeout of 30000ms exceeded"}`. The documentation itself notes capability is resolved by an upstream service that may be unavailable. Separately, `GET /locations/v2/search` documents that its `serviceIds` and `vehicleMake` parameters are "reserved and echoed but do not filter results."

**Difference.** DSN cannot reliably pre-filter the facility list by capability, and the search endpoint offers no server-side filtering at all.

**Alternatives.** (a) Rely on the offers returned by the service-request flow, which are by definition from capable shops — this is the natural design once F-1 is resolved. (b) Call the capability endpoint per shop with a short timeout and degrade gracefully.

**Recommendation.** Option (a). Note this makes F-1 doubly important.

**Action taken.** No capability filtering in P1; nothing customer-facing depends on it yet.

---

## F-6 — No dedicated repair-history or invoice endpoint

> **BUILD reference:** Section 25 and Section R ("Service history is a strategic asset").

**Requested.** An ongoing per-vehicle record of work performed, quoted price, final price, DSN+ discount and savings.

**Actual.** The closest available data is `GET /service-requests/v2/service-requests` filtered by `ownedVehicleId`, where a settled request exposes `serviceRequestState`, `appointmentAt`, `acceptedShopName`, address fields, `acceptedPriceCents` and the requested `services[]`. The vehicle list view also carries `lastServiceDate`.

**Difference.** There is no post-service record: no final invoiced amount as distinct from the accepted offer price, no line-item record of work actually performed, and no completion confirmation beyond the `settled` state.

**Alternatives.** (a) DSN constructs repair history from accepted offers plus settled service requests and labels the figure "quoted/accepted price" rather than "final price". (b) Openbay confirms whether a settlement or invoice payload exists on another surface.

**Recommendation.** Option (a) for Priority 4, with the caveat that DSN must not present an accepted-offer price as a final invoiced price.

**Action taken.** Data model provisions for both `quotedPriceCents` and `finalPriceCents`, with the latter left null until Openbay confirms a source.

---

## F-7 — No messaging API (HIGH)

> **BUILD reference:** Section 26 — "Use Platform API messaging functionality where available for communications involving repair facilities/service requests."

**Requested.** Members exchange messages with repair facilities inside the DSN environment, with unread indicators and conversation threads.

**Actual.** There is **no messaging endpoint of any kind** in the published Platform API. All 40 paths were reviewed; none relate to messages, threads or conversations. Probes to plausible paths (`/messages/v1/messages`) return 404. The legacy Rails user payload does contain an `unread_count` attribute, which implies a messaging system exists somewhere in the Openbay stack, but it is not exposed here.

**Difference.** BUILD Section 26 cannot be implemented as written, and the "SEND MESSAGE" action required in Section 18 (View Details) has no backing service.

**Alternatives.** (a) Openbay exposes the messaging surface, or confirms whether the `unread_count` field is reachable. (b) DSN omits Messages from the member navigation until it exists. (c) DSN builds its own member↔DSN-support messaging (not facility messaging) and routes facility questions through DSN staff — this changes the operating model and needs Mitch's approval, as it puts DSN in the middle of every conversation. (d) Members contact the facility by telephone using the number already returned on the accepted-offer payload.

**Recommendation.** Ask Openbay first. If unavailable, option (d) for Priority 2 and a business decision on (c) for Priority 4.

**Action taken.** Messages is not present in the P1 dashboard navigation. No placeholder inbox has been built.

---

## F-8 — No DSN+ member price versus standard price in the offer payload (HIGH)

> **BUILD reference:** Sections 15, 16E, and Section I — "Whenever showing FREE MEMBER PRICE versus DSN+ PRICE, use actual pricing available for that repair/facility through the applicable Platform API functionality. Never manufacture a discount."

**Requested.** For every quote, display the FREE member price and the DSN+ price side by side, with the actual saving.

**Actual.** `ServiceOffer` exposes `totalPriceCents`, `totalDiscountCents`, `currency` and `lineItems[]` (each with `unitPriceCents` and `extendedPriceCents`). There is exactly **one** price per offer. `totalDiscountCents` reflects a discount already applied to that offer — it is not a second, member-tier price, and there is no parameter on any endpoint to request pricing "as if" the member held a discount programme.

**Difference.** The single most important commercial requirement in the BUILD — the side-by-side FREE vs DSN+ price at the moment of quoting — has no data source. DSN cannot compute a DSN+ price without either applying its own percentage (explicitly forbidden by Sections 16E and I) or receiving a second priced offer from Openbay.

**Alternatives.** (a) Openbay confirms whether a discount-programme context can be attached to a service request or partner so that offers return the discounted price, and whether both prices can be returned. (b) Openbay clarifies the semantics of `totalDiscountCents` — specifically whether `totalPriceCents` is pre- or post-discount, which determines whether the undiscounted price is recoverable by addition. (c) DSN presents only the actual returned price and markets DSN+ savings generically ("up to 25% on eligible services") without a transaction-level comparison — commercially much weaker but compliant.

**Recommendation.** This must be resolved with Openbay before Priority 3. Until then DSN+ conversion messaging cannot be quantified at the quote level.

**Action taken.** Nothing in P1 displays a DSN+ price. The centralised pricing configuration (BUILD Section H) has been built with the approved fleet tiers so that Priority 3 can proceed the moment the pricing question is answered.

---

## F-9 — Subscription model does not match per-vehicle DSN+ enrolment (HIGH)

> **BUILD reference:** Sections 16A–16J and the entire "Critical Business Rule — Free Registered Vehicles vs. Discount-Program Enrolled Vehicles" section.

**Requested.** DSN+ enrolment attaches to a **specific vehicle (by VIN)**, with a per-vehicle enrolment date, effective date, billing anniversary, payment plan and subscription status; fleet pricing tier is recalculated from the active enrolled-vehicle count on each payment date.

**Actual.** The only subscription surface in the Platform API is three optional fields on driver creation — `planId`, `start`, `end` — described as "Coverage program-plan id to subscribe the user to." The partner holds `subscriptions.admin` and `subscriptions.view` entitlements, but **no subscription endpoints are published**: there is no plan catalogue, no subscription list, no create/cancel/renew, and no way to associate a subscription with a vehicle. `GET /subscriptions/v2/subscriptions` returns 401 and is not in the spec.

**Difference.** Three structural mismatches. First, Openbay subscriptions attach to the **user**, whereas DSN+ must attach to the **vehicle** — BUILD is emphatic that `MEMBER → VEHICLE → ENROLMENT`, not `MEMBER → ENROLMENT`. Second, there is no discoverable plan catalogue. Third, there is no billing surface, so recurring charges, billing anniversaries, prepaid terms and the 12-Month Finance option have no home in Openbay at all.

**Alternatives.** (a) DSN owns the entire DSN+ subscription, billing and entitlement model in its own database and payment processor, and uses Openbay purely for service delivery. (b) Openbay publishes the subscription endpoints and confirms whether vehicle-level subscriptions are possible.

**Recommendation.** Option (a) is almost certainly correct regardless — the BUILD's fleet-tier snapshot rules, per-vehicle billing anniversaries and no-proration rules are DSN business logic that Openbay has no reason to model. But this must be confirmed, because it also determines whether Openbay needs to know about DSN+ at all in order to return discounted pricing (see F-8). Note also BUILD Section P: David is to determine the payment/financing architecture, which remains outstanding.

**Action taken.** The P1 data model implements vehicle-level enrolment status (`FREE` vs `DSN_PLUS`) with per-vehicle enrolment, effective, billing and expiry dates and a subscription-status enum, exactly as the BUILD specifies, entirely DSN-side. No payment processing has been built.

---

## F-10 — Car-wash capability exists but is not addressed by the BUILD

> **BUILD reference:** Section 38 — "If the Platform API supports additional functionality that could materially improve DSN: FLAG IT."

**Actual.** Partner 116 holds `carwash.view`, `GET /users/v2/users/{id}/car-wash-redemptions` is published and returns `200`, and `locations/v2/search/by-time-slot` supports `locationType=carwash` and `car_wash_national_launch_v1`.

**Question for Mitch.** Is car wash a service DSN wishes to offer fleet members? It is a natural fleet ancillary and appears to be an active Openbay programme. Not implemented, awaiting direction.

---

## F-11 — Openbay SSO links leave the DSN-branded environment

> **BUILD reference:** Section 5 — "Avoid unnecessary Openbay redirects, Openbay branding or experiences that make the member feel that he/she has left DSN."

**Actual.** `POST /users/v2/users/{id}/service-request-link` works and returns, for example:

```json
{ "serviceRequestLink": "https://portal2-staging.openbay.com/a/84aeb43c…",
  "dashboardLink":      "https://portal2-staging.openbay.com/a/327fc413…",
  "expiresAt": "2026-08-27T23:24:15.088Z" }
```

**Difference.** These are Openbay-hosted, Openbay-branded pages. Using them would be the fastest route to a working quote flow — and would sidestep F-1 entirely — but it directly contradicts the private-label requirement.

**Recommendation.** Do not use these links in the member journey. They may be useful as an internal DSN support tool for staff troubleshooting a member's request. Flagging because the temptation to use them as an F-1 workaround will be strong.

**Action taken.** Not used anywhere. The client method exists but is marked internal-support-only.

---

## Summary of decisions required

| ID | Decision owner | Question |
|---|---|---|
| F-0 | David | Confirm the corrected API key; supply production credentials |
| F-1 | David → Openbay | Enable `service-request-generation` for partner 116 |
| F-2 | David → Openbay | Supply `programPlanId` values, or confirm DSN owns welcome email |
| F-3 | David → Openbay | Are partner-scoped list endpoints expected to work for API keys? |
| F-4 | Mitch | Confirm colour and engine may be DSN-local fields |
| F-6 | David → Openbay | Is there any settlement/invoice payload for final pricing? |
| F-7 | David → Openbay, then Mitch | Is messaging available? If not, which alternative? |
| F-8 | David → Openbay | How does DSN obtain an actual DSN+ discounted price? |
| F-9 | David / Mitch | Confirm DSN owns DSN+ billing entirely; confirm payment architecture |
| F-10 | Mitch | Should DSN offer car wash? |
| F-11 | Noted | SSO links will not be used in the member journey |

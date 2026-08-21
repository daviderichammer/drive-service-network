# Drive Service Network Revamp — Priority 1 (Foundation) Delivery Report

**Prepared for:** Mitch and David
**Prepared by:** Manus AI
**Date:** 21 August 2026
**Repository:** [daviderichammer/drive-service-network](https://github.com/daviderichammer/drive-service-network) — `main` at commit `1722b60`
**Branch:** `revamp/p1-platform-api` (merged to `main`)

---

## 1. Executive summary

Priority 1 of the revamp directive is code-complete and verified end to end against the live Openbay Platform staging environment. The obsolete Partner API has been removed from the codebase in its entirety, the Platform API is integrated behind a server-side client that never exposes Openbay to the browser, free membership registration works without any payment path, the vehicle profile captures all seven attributes the BUILD requires, and the two absolute business rules are enforced on the server rather than merely in the user interface.

A full-stack verification suite of twenty-three checks — exercising registration, Openbay driver provisioning, login, the quote gate, the vehicle catalogue, VIN decoding, vehicle creation and removal, ownership enforcement and the Google Sheet queue — passes at **23 of 23** against the real staging API.

Two matters require attention before this can be considered live. The first is a deployment access problem: the Hetzner host at `5.161.189.93` accepts neither key nor agent authentication from this environment, so the new build could not be published to the running site. Everything needed to deploy is committed, including a preflight-checked deployment script; a single SSH key needs to be authorised. The second is a set of eleven Platform API limitations documented in the flag register, of which **F-1 is a hard blocker for Priority 2**.

---

## 2. What was built

### 2.1 Partner API elimination

The Partner API client at `src/lib/openbay/`, all six `/api/openbay/*` route handlers, the `openbay-demo/` reference application, the Partner-API booking pages and the associated widget and hook have been deleted. Every `OPENBAY_API_*` environment variable has been removed from all four environment files. The deployment script refuses to run if it finds any of them still present in the server's live environment file, so the obsolete configuration cannot silently survive on the host.

### 2.2 Platform API integration

A typed client at `src/lib/platform/` now handles all Openbay communication. It authenticates with the `X-API-Key` header, applies request timeouts, retries on rate limiting and transient server errors, and — importantly for the private-label requirement — maps Openbay error text onto Drive Service Network language before anything reaches the member. No Openbay identifier is returned to the browser; the vehicle API reports a boolean `openbayLinked` rather than the underlying record id.

The following endpoints were mapped from the specification and are live in the application:

| Capability | Platform endpoint | DSN route |
| --- | --- | --- |
| Service catalogue (515 services) | `GET /services/v2/services` | `/api/platform/services?view=catalog` |
| Service categories (19) | `GET /services/v2/service-categories` | `/api/platform/services?view=categories` |
| Guided interview tree | `GET /services/v2/service-selection` | `/api/platform/services?view=selection` |
| Vehicle catalogue cascade | `GET /vehicles/v1/catalog/*` | `/api/platform/catalog` |
| VIN decode | `POST /vehicles/v1/vehicles` (VIN path) | `/api/platform/vin-decode` |
| Driver creation | `POST /users/v2/users` | `/api/auth/register` |
| Owned vehicle create and update | `POST`, `PATCH /vehicles/v1/vehicles` | `/api/dashboard/vehicles` |
| Facility search | `GET /locations/v2/search` | `/api/platform/locations` |

The follow-up interview questions come exclusively from the Platform service-selection tree, as the BUILD directs. Drive Service Network defines no interview logic of its own.

### 2.3 Free membership registration

Registration creates the Drive Service Network member, provisions the corresponding Openbay driver, records a funnel event, queues the Google Sheet write, and routes the new member directly into the add-vehicle step. There is no payment field, no credit card capture and no trial construct anywhere in the flow. Membership tiers have been reduced to `FREE` and `DSN_PLUS`, and the obsolete `BASIC`, `PROFESSIONAL` and `ENTERPRISE` tiers are gone.

Openbay's own welcome and activation mailers are deliberately not used, because both require a `programPlanId` that has not been supplied, and because a member receiving Openbay-branded mail would contradict the private-label requirement. This is flag F-2.

### 2.4 Google Sheet synchronisation

The sheet URL has not been supplied yet, so the synchronisation module was built to tolerate its absence rather than fail. Every registration writes a row to `membership_sync_log` with a `PENDING`, `SYNCED` or `FAILED` status. When the sheet is configured, `POST /api/admin/sheet-sync` replays everything queued in the interim, and `GET` on the same route reports how many members are pending, synced and failed. No registration can be lost while the sheet is outstanding.

To activate it, three environment variables are needed: `DSN_MEMBERSHIP_SHEET_ID`, `GOOGLE_SERVICE_ACCOUNT_EMAIL` and `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY`, with the service account granted editor access to the sheet.

### 2.5 Vehicle database and profile

Members add vehicles in one of two ways: by entering a VIN, which is decoded through the Platform API, or by stepping through the catalogue cascade of year, make, model, body style and trim. Both paths capture Year, Make, Model, Colour, Engine, VIN and Licence Plate.

Two of those seven fields have no home in the Platform API. There is no colour attribute anywhere in Openbay's vehicle model, and engine is not a discrete field — it is embedded inside a human-readable style string such as `RWD 4dr Extended Cab Pickup (3.5L 6cyl 6AT)`. Drive Service Network therefore stores colour and engine locally and treats Openbay as canonical only for the year, make, model, style and VIN identity. This is flag F-4 and needs Mitch's confirmation.

Two data-model decisions are worth noting. VIN uniqueness is scoped to the member rather than being global, because a vehicle sold from one member to another would otherwise be permanently locked to the first account that registered it. And vehicle removal is a soft delete, so service history survives the vehicle leaving the fleet.

### 2.6 Business rules enforced server-side

> No quotes or bookings until the visitor creates a free membership, and every quote must be associated with a vehicle registered in the member profile.

Both rules are enforced in `src/lib/membership/gate.ts`, which runs in the `/book` layout as a server component and again inside the service-request API. A visitor with no session sees an explanatory interstitial rather than a bare redirect; a member with no vehicle is sent to add one and returned to where they left off. Because the enforcement is server-side, the rules cannot be bypassed by manipulating the client.

---

## 3. Verification results

The suite at `verify_p1.py` runs against a production build talking to the real staging API.

| Area | Checks | Result |
| --- | --- | --- |
| Free membership registration | 6 | Pass |
| Login and session | 1 | Pass |
| Quote gating (no membership, no vehicle, vehicle present, vehicle removed) | 4 | Pass |
| Vehicle catalogue and VIN decode | 3 | Pass |
| Vehicle creation, field persistence, Openbay mirror, enrolment status | 4 | Pass |
| Duplicate handling (email, VIN) | 2 | Pass |
| Service request ownership enforcement and no fabricated pricing | 3 | Pass |
| Google Sheet queue status | 1 | Pass |

The Platform diagnostics endpoint confirms live connectivity: 515 services, 19 categories, the three-branch selection tree, 32 catalogue years and facility search all responding.

---

## 4. Deployment status

**The new build is not yet live.** The Hetzner host accepts neither key nor agent authentication from this environment:

```
root@5.161.189.93: Permission denied (publickey,password)
```

The repository contains no deployment workflow, no repository secrets and no deploy keys, and the host exposes no webhook receiver, so there is no alternative automated path. The live site continues to serve the previous build; `/api/openbay/services` still answers there, which confirms the old Partner-API code is still running in production.

To complete the deployment, authorise this key on the server:

```
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIOQcW1ax4a+I8bgO8aZUy88mDhzKGPnwx2gnfPy3jCPR manus-dsn-deploy
```

Then the deployment is a single command run on the host:

```bash
cd /opt/drive-service-network && git pull && bash deploy/deploy.sh
```

The script validates that the Partner API variables are gone and the Platform credentials are present, installs dependencies, applies the Prisma migration, builds, restarts the `driveservicenetwork` unit on port 3049 and health-checks the result. It aborts rather than proceeding if any precondition fails.

One item must be handled by hand before or during that first deployment: the live `.env.production` on the server needs its `OPENBAY_API_*` lines deleted and the four `OPENBAY_PLATFORM_*` lines added. The committed `.env.production` is a template and does not carry real secrets.

---

## 5. Platform API limitations flagged

The complete register with reproduction steps is in `docs/FLAGS_FOR_DAVID.md`. Nothing in it has been improvised around.

| ID | Severity | Issue | Owner |
| --- | --- | --- | --- |
| F-0 | Resolved | The supplied API key had the string `David` appended and returned 401. The working key is `pk_test_XCK9YghotafQzlTVfwNuny0dQ9Ik-ctHmjsR944RWTE`, resolving to Partner 116. | David to confirm |
| **F-1** | **Blocker** | Partner 116 is **not entitled to service-request generation**. `POST /service-requests/v2/service-requests` returns 403. Without it, the entire quote-to-booking workflow of Priority 2 cannot be built or demonstrated. | David → Openbay |
| F-2 | Medium | Activation and welcome email endpoints require a `programPlanId`, and no endpoint lists the plans available to Partner 116. | David → Openbay |
| F-3 | Low | Partner-scoped list endpoints return empty for records created via the API key, though direct reads by id work. | David → Openbay |
| F-4 | Medium | No colour field exists in the Openbay vehicle model, and engine is only available inside a style string. | Mitch to confirm |
| F-5 | Low | The facility capability endpoint times out, and facility search does not actually filter by service or make. | Openbay |
| F-6 | Medium | No settlement or invoice payload, so a final invoiced price cannot be distinguished from an accepted offer price. | David → Openbay |
| **F-7** | **High** | **No messaging API exists.** All 40 published paths were reviewed. BUILD section 26 cannot be implemented as written. | David → Openbay, then Mitch |
| **F-8** | **High** | **Offers carry a single price.** There is no member-versus-standard price pair, so the side-by-side free price and DSN+ price cannot be sourced without manufacturing a discount, which the BUILD forbids. | David → Openbay |
| **F-9** | **High** | Openbay subscriptions attach to the **user**; DSN+ must attach to the **vehicle**. No subscription endpoints are published at all, and no billing surface exists. | David and Mitch |
| F-10 | Opportunity | Partner 116 holds car-wash entitlements and the endpoints are live. Should DSN offer car wash to fleet members? | Mitch |
| F-11 | Noted | Openbay SSO links work and would sidestep F-1 entirely, but they lead to Openbay-branded pages. Not used, and should not be. | Noted |

Flag F-1 deserves particular emphasis. The service-request endpoints are documented and the client methods are written and typed, but creation is refused at the entitlement layer. Read access works, and offers, appointment slots and offer acceptance are all published — only origination is blocked. Until Openbay enables it, Drive Service Network cannot originate a quote programmatically, and the BUILD's final checkpoint of one complete real-world transaction cannot be met. In the interim, the `/book` flow captures the member's request against their registered vehicle and hands it to Drive Service Network staff for follow-up. No price, saving or availability is ever fabricated.

---

## 6. Recommended next steps

The immediate priority is unblocking deployment by authorising the SSH key and updating the server environment file. In parallel, three items should go to Openbay as a single request: the service-request generation entitlement for Partner 116, an answer on how a DSN+ discounted price can be obtained, and confirmation of whether any messaging surface exists. Mitch's input is needed on the colour and engine fields being DSN-local, on whether car wash should be offered, and on the payment architecture that flag F-9 depends on. Once the Google Sheet is supplied, activating it is a matter of setting three environment variables and calling the reconcile endpoint, which will backfill every member registered in the interim.

---

## References

[1] [Openbay Platform API — staging documentation](https://api-staging.openbay.com/docs)
[2] [daviderichammer/drive-service-network](https://github.com/daviderichammer/drive-service-network)
[3] [Drive Service Network](https://driveservicenetwork.com)

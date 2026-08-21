# DSN Revamp — Priority 1 (Foundation)

This document describes what Priority 1 of the Drive Service Network revamp
changed, how to run it, and what remains blocked on Openbay or on decisions from
Mitch and David. It is the companion to the revamp BUILD directive.

## 1. What Priority 1 delivers

| BUILD requirement | Status | Where |
| --- | --- | --- |
| Eliminate all Partner API dependencies | Complete | `src/lib/openbay/` and `src/app/api/openbay/` deleted |
| Integrate the Openbay Platform API (staging) | Complete | `src/lib/platform/`, `src/app/api/platform/` |
| FREE membership registration, no payment | Complete | `src/app/api/auth/register/route.ts`, `src/lib/membership/service.ts` |
| Google Sheet synchronisation for membership data | Infrastructure complete, awaiting sheet | `src/lib/google-sheets/membership-sync.ts`, `src/app/api/admin/sheet-sync` |
| Vehicle database and profile | Complete | `src/lib/vehicles/service.ts`, `src/app/dashboard/vehicles/` |
| Login and member dashboard foundation | Complete | `src/app/dashboard/`, `src/lib/auth.ts` |
| No quotes or bookings before free membership | Enforced server-side | `src/lib/membership/gate.ts`, `src/app/book/layout.tsx` |
| Every quote tied to a registered vehicle | Enforced server-side | `src/lib/membership/gate.ts`, `src/app/api/service-requests/route.ts` |
| DSN remains the customer-facing brand | Enforced | `src/lib/platform/index.ts` error mapping; no Openbay identifier is returned to the browser |

## 2. Architecture

```
Browser ──► DSN Next.js app ──► Openbay Platform API (server-side only)
                │
                ├──► MySQL (Prisma)          — system of record for members,
                │                              vehicles and service requests
                └──► Google Sheets           — operational mirror of membership
```

The Platform API key never reaches the browser. Every Platform call is made
from a route handler or a server component through `src/lib/platform/client.ts`,
which also maps Openbay error text onto DSN-branded language.

### Key modules

- **`src/lib/platform/client.ts`** — typed client for the Platform API. Handles
  authentication, timeouts, retry on 429/5xx, and structured errors.
- **`src/lib/platform/index.ts`** — `safePlatformCall`, DSN-branded error
  messages, and the entitlement detection used to flag F-1.
- **`src/lib/membership/service.ts`** — creates the DSN member, provisions the
  matching Openbay driver, records funnel events, and queues the Sheet sync.
- **`src/lib/membership/gate.ts`** — the two absolute business rules.
- **`src/lib/vehicles/service.ts`** — vehicle CRUD plus the Openbay
  owned-vehicle mirror, VIN validation and normalisation.
- **`src/lib/google-sheets/membership-sync.ts`** — append/update rows, plus a
  reconcile pass that replays anything queued while the sheet was unavailable.
- **`src/lib/dsn-plus/pricing.ts`** — the approved DSN+ price table in one
  place. Nothing in P1 charges money; the table exists so that Priority 2 has a
  single source of truth.

## 3. Running locally

```bash
pnpm install
cp .env.example .env.local          # fill in DATABASE_URL and the Platform key
pnpm exec prisma migrate dev
pnpm dev
```

Verify the Platform integration at any time:

```bash
curl -H "x-dsn-internal-secret: $INTERNAL_API_SECRET" \
     http://localhost:3000/api/platform/health
```

The health endpoint exercises the service catalogue, the categories, the guided
selection tree, the vehicle catalogue and facility search, and reports the known
Platform limitations.

## 4. API surface added in P1

| Route | Method | Purpose | Auth |
| --- | --- | --- | --- |
| `/api/auth/register` | POST | Create a FREE membership | Public |
| `/api/platform/services` | GET | Service catalogue, categories, guided interview tree | Public |
| `/api/platform/locations` | GET | Facility search by ZIP | Public |
| `/api/platform/catalog` | GET | Year → make → model → sub-model → trim cascade | Member |
| `/api/platform/vin-decode` | POST | Decode a VIN to a vehicle | Member |
| `/api/dashboard/vehicles` | GET, POST | List and register vehicles | Member |
| `/api/dashboard/vehicles/[id]` | GET, PATCH, DELETE | Manage one vehicle | Member (ownership enforced) |
| `/api/service-requests` | POST | Request pricing for a registered vehicle | Member (ownership enforced) |
| `/api/admin/sheet-sync` | GET, POST | Sheet status and reconcile queued rows | Internal secret or ADMIN |
| `/api/platform/health` | GET | Platform diagnostics | Internal secret or ADMIN |

The guided interview questions are always read from
`/api/platform/services?view=selection`. DSN does not define its own interview
logic, per BUILD section 12.

## 5. Data model notes

- `vehicles.vin` is unique **per member**, not globally, so a vehicle sold
  between two members can still be registered by the new owner.
- Vehicle removal is a soft delete (`status = REMOVED`, `removedAt` set) so that
  service history survives.
- `vehicles.programStatus` records whether *that vehicle* is enrolled in the
  paid discount programme. It is independent of `users.membershipTier`.
  Registering a vehicle never enrols it.
- `membership_sync_log` records every attempted Sheet write with its status, so
  nothing is silently lost while the sheet is unconfigured.

## 6. Deployment

Run on the Hetzner host as root:

```bash
cd /opt/drive-service-network
bash deploy/deploy.sh
```

The script refuses to continue if `.env.production` still contains Partner API
variables (`OPENBAY_API_*`) or an unset Platform key, applies migrations, builds,
restarts the `driveservicenetwork` systemd unit on port 3049, and health-checks
the result.

## 7. Known limitations

See `docs/FLAGS_FOR_DAVID.md` for the full list with reproduction steps. The
short version:

- **F-1** Partner 116 is not entitled to service-request generation, so
  automated quotes and bookings cannot complete. Requests are captured for
  manual follow-up instead; no pricing is ever invented.
- **F-4** The Platform API has no colour field and no discrete engine field.
  DSN stores both locally.
- **F-8** Offers do not carry a member-versus-standard price pair, so the
  "you saved X" figure required later in the BUILD cannot be sourced.
- **F-9** The membership Google Sheet has not been supplied yet.
- **F-10** No production Platform credentials have been issued.

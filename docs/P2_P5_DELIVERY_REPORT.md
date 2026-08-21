# Drive Service Network — Revamp Priorities 2 to 5

**Delivery report**
Global Drive Holdings Inc. · 21 August 2026

---

## Summary

Priority 1 has been deployed to production, and Priorities 2 through 5 are code-complete, verified end to end against the live Openbay staging environment, and deployed. Twenty-four automated checks covering the whole member journey pass with no failures.

The single most consequential finding of this phase concerns the **F-1 entitlement gap** carried over from Priority 1. That flag recorded that Partner 116 cannot create service requests, and the natural conclusion was that Drive Service Network could not book work. That conclusion was wrong. The Platform API exposes a **standalone appointments path** that this partner *is* entitled to use, and it was verified live on 21 August 2026: a real appointment was created at a real Boston-area facility, rescheduled and cancelled, all against the facility's own scheduling system. Drive Service Network is therefore genuinely transactional today. What F-1 actually blocks is narrower than believed — competitive priced estimates — and that limitation is stated honestly in the interface rather than concealed behind invented numbers.

---

## What is live

### Priority 1 — Foundation

Deployment of the existing Priority 1 build exposed three defects that had to be resolved before any new work could be trusted.

| Issue | Resolution |
| --- | --- |
| Production pointed at `prod-db.driveservicenetwork.com`, a host that does not resolve | Repointed to the local MySQL instance; the application previously had **no working database at all** |
| MySQL administrative credentials unrecoverable on the server | Access re-established via a controlled `mysqld` init-file; dedicated `dsn_user` provisioned |
| Secrets held in a git-tracked file and destroyed on every deploy | Moved to `/etc/dsn/production.env`, outside the repository, referenced by symlink and by the systemd unit |

With those corrected, Priority 1 verified live: the Partner API endpoints return 404, the Platform API catalog serves 515 services across 19 categories, and free registration provisions both a DSN member and an Openbay driver record.

### Priority 2 — Core transaction

The booking journey is three steps, each of which draws on real Platform data.

The member begins at `/book` by choosing a registered vehicle and describing the problem. The service selection uses the Platform API's own guided-interview tree — **387 selectable services across three categories** — exactly as the BUILD requires. Drive Service Network invents no interview logic of its own; the questions, answers and follow-ups are the network's.

At `/book/facilities` the member compares the facilities that serve their ZIP code. A search on 02116 returns **66 facilities**, ranked by whether they perform the requested work, then by distance. Each card carries the attributes the network can genuinely evidence: distance, member rating, review count, certifications, amenities, warranty terms, opening hours and whether the facility is a mobile mechanic. **View Details** opens the full profile with the facility's next real openings.

At `/book/schedule` the member picks from live availability — **180 slots across 12 days** in verification — and confirms. The appointment is created in the facility's scheduling system and returns confirmed. It can subsequently be rescheduled or cancelled from the appointment page, and both operations reach the facility rather than merely updating a local record.

### Priority 3 — Monetisation

DSN+ applies a **flat 10 percent discount** on all services, as directed. The rate lives in a single module, `lib/dsn-plus/discount.ts`, so the more complex tier model can be restored later by changing one file rather than hunting through the interface.

Savings are presented as a FREE-membership price beside the DSN+ price with the difference stated in dollars. Where the network has not returned a price — which, under F-1, is currently the common case — no figure is invented. The interface presents the discount as a benefit statement instead, which is the only honest option available.

Enrollment is per vehicle rather than per account, working around **F-9**: Openbay subscriptions attach to a user, so Drive Service Network owns vehicle-level enrollment in its own database. The dashboard reports registered vehicles, enrolled vehicles, pending activations and realised lifetime savings as distinct figures, and addresses its enrollment prompt to the specific vehicles not yet covered.

### Priority 4 — Member retention

Appointment history and management, service and repair history per vehicle, facility messaging, safety recalls and member support are all live at `/dashboard`.

Two of these required decisions worth recording. **Messaging** (FLAG F-7, new): the Platform API's forty-one-path specification contains no messaging surface whatsoever, so there is nothing to proxy. Drive Service Network therefore operates the conversation itself and relays it to the facility. This keeps the member inside the DSN brand as Absolute Rule 1 demands and keeps the correspondence in DSN's system of record. The interface states plainly how messages reach the shop; it does not imply a live chat that does not exist, and it never fabricates facility replies.

**Recalls**: the Platform API publishes no recall data, so campaigns are sourced from the U.S. National Highway Traffic Safety Administration, cached per vehicle for twenty-four hours, and attributed openly. Verification found six genuine open campaigns for the test vehicle. Two refusals are deliberate here. Drive Service Network will not mark a recall complete, because only the member or the repairing dealer can know that; the member may acknowledge a recall to clear the alert, and the record says explicitly that acknowledging is not the same as having the work done. And when the lookup fails, the page says so rather than showing nothing — no member should be left believing their vehicle is clear because a request timed out.

### Priority 5 — Quality assurance

An end-to-end suite at `scripts/verify-p2-p5.mjs` exercises the complete journey against a running instance and reports each check as passed, failed, or blocked upstream. That third category matters: it separates a Drive Service Network defect from an Openbay entitlement limit, which is exactly the distinction that determines who has to fix something.

Funnel analytics record twenty-three named events across membership, transaction, monetisation and retention. Events are stored in DSN's own database; no third-party analytics service is introduced, because a member's vehicle, location and repair intentions are commercially sensitive and there is no reason to hand them to an advertising network. Only declared event names are accepted. The reporting endpoint counts distinct people per step rather than raw events, so one visitor refreshing the facility list twelve times counts once.

Error boundaries were added at the application, dashboard and booking levels. None existed before, meaning any server-component failure produced Next.js's unstyled default page with no branding and no route back. Each boundary now surfaces the error digest so support can locate the exact failure rather than asking a member to describe a blank screen.

Mobile navigation was rebuilt. The dashboard sidebar was previously hidden entirely below the medium breakpoint, stranding members on whichever page they had landed on — untenable when most of this audience is on a phone. It is now a scrollable horizontal strip with live attention badges for unread messages and open recalls.

---

## Verification results

Executed against the live Openbay staging environment on 21 August 2026.

| Area | Check | Result |
| --- | --- | --- |
| Foundation | Platform connectivity | Pass |
| Foundation | Free membership registration | Pass |
| Foundation | Member sign-in | Pass |
| Rules | Quotes gated behind membership | Pass — anonymous request refused |
| P2 | Vehicle registration | Pass |
| P2 | Service catalog and interview tree | Pass — 3 categories, 387 services |
| P2 | Facility comparison | Pass — 66 facilities near 02116 |
| P2 | View Details | Pass |
| P2 | Live appointment availability | Pass — 180 slots across 12 days |
| P2 | Appointment booking | Pass — created and confirmed |
| P2 | Appointment detail | Pass |
| P2 | Reschedule | Pass |
| P2 | Cancellation | Pass |
| P3 | DSN+ vehicle enrollment | Pass |
| P3 | Membership status tracking | Pass |
| P3 | Flat 10% discount applied | Pass |
| P4 | Facility messaging | Pass |
| P4 | Message reply | Pass |
| P4 | Support requests | Pass |
| P4 | Safety recalls | Pass — 6 genuine campaigns found |
| P5 | Funnel event ingestion | Pass |
| P5 | Unknown events rejected | Pass |
| P5 | Funnel report | Pass |
| P5 | Funnel report protected | Pass |

**24 passed · 0 failed · 0 blocked**

---

## What remains blocked

| Flag | Constraint | Consequence and workaround |
| --- | --- | --- |
| **F-1** | Partner 116 is refused `POST /service-requests` (403) | Competitive priced estimates from multiple facilities cannot be shown. Booking is unaffected — the standalone appointments path works. The facility comparison states plainly that priced estimates are not yet available rather than displaying a placeholder. **Openbay must grant the service-request entitlement to Partner 116.** |
| **F-8** | Offers return a single price with no member/standard pair | The flat 10 percent DSN+ discount is computed by Drive Service Network from the returned price. Sound as an interim measure; a true member rate from the network would be preferable. |
| **F-9** | Openbay subscriptions attach to a user, not a vehicle | Vehicle-level DSN+ enrollment is owned by DSN's own database. No functional loss; enrollments are held pending activation until the commercial arrangement is settled. |
| **F-7** (new) | No messaging endpoints exist anywhere in the Platform API | Drive Service Network operates threads and relays them to facilities. Requires a DSN operations process to action relays; the software side is complete. |
| — | No recall data in the Platform API | Sourced from NHTSA. Working and attributed; no action needed from Openbay. |

Two items also require a commercial rather than technical decision before they can go further: DSN+ enrollment currently records intent and holds it pending activation, because no payment processor is connected; and facility message relay needs an operational owner on the DSN side.

---

## Absolute rules

| Rule | Status |
| --- | --- |
| Drive Service Network remains the customer-facing brand | Held. Openbay identifiers are stripped from every API response; no upstream branding is exposed anywhere in the member interface. |
| No quotes without FREE membership | Held and verified — anonymous facility requests are refused. |
| All quotes associated with registered vehicles | Held. The booking flow cannot start without a selected vehicle, and every appointment is written against one. |
| Approved website content and branding not redesigned | Held. Existing pages, copy and visual identity are untouched; new surfaces adopt the established navy, teal and gold system. |

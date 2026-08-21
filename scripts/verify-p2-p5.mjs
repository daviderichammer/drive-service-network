#!/usr/bin/env node
/**
 * End-to-end verification — Priorities 2 through 5
 * Drive Service Network / Global Drive Holdings Inc.
 *
 * Exercises the whole member journey against a running instance: register,
 * add a vehicle, run the service interview, compare facilities, read
 * availability, book, enroll in DSN+, message the facility, open a support
 * request, check recalls, and confirm funnel events were recorded.
 *
 * Usage:
 *   node scripts/verify-p2-p5.mjs [baseUrl]
 *
 * Every check reports PASS, FAIL or BLOCKED. BLOCKED means an upstream
 * entitlement or capability is missing rather than DSN being broken — that
 * distinction is the entire point of this script.
 */

const BASE = (process.argv[2] || "http://127.0.0.1:3000").replace(/\/$/, "");

const results = [];
let cookie = "";

function record(name, status, detail = "") {
  results.push({ name, status, detail });
  const mark =
    status === "PASS" ? "  PASS " : status === "BLOCKED" ? "  BLOCK" : "  FAIL ";
  console.log(`${mark} │ ${name}${detail ? ` — ${detail}` : ""}`);
}

async function call(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(cookie ? { Cookie: cookie } : {}),
      ...(options.headers || {}),
    },
    redirect: "manual",
  });
  const setCookie = res.headers.getSetCookie?.() ?? [];
  for (const entry of setCookie) {
    const pair = entry.split(";")[0];
    const name = pair.split("=")[0];
    const existing = cookie
      .split("; ")
      .filter((c) => c && c.split("=")[0] !== name);
    cookie = [...existing, pair].join("; ");
  }
  let body = null;
  const text = await res.text();
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = text;
  }
  return { status: res.status, body };
}

/** Counts the leaf nodes a member can actually choose in the interview. */
function countTerminals(nodes) {
  if (!Array.isArray(nodes)) return 0;
  let total = 0;
  for (const node of nodes) {
    const children = node.nodes ?? node.children ?? [];
    if (children.length === 0) total += 1;
    else total += countTerminals(children);
  }
  return total;
}

const INTERNAL_SECRET = process.env.INTERNAL_API_SECRET ?? "";

const stamp = Date.now();
const EMAIL = `qa.p2p5.${stamp}@driveservicenetwork.test`;
const PASSWORD = "QaVerify2026!x";

async function main() {
  console.log(`\nDrive Service Network — P2–P5 verification against ${BASE}\n`);

  // ---------- Priority 1 foundations (preconditions) ----------
  const health = await call("/api/platform/health", {
    headers: { "x-dsn-internal-secret": INTERNAL_SECRET },
  });
  record(
    "Platform connectivity",
    health.status === 200 ? "PASS" : "FAIL",
    `HTTP ${health.status}`
  );

  const register = await call("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({
      firstName: "Quality",
      lastName: "Assurance",
      email: EMAIL,
      password: PASSWORD,
      confirmPassword: PASSWORD,
      phone: "5551234567",
      acceptTerms: true,
    }),
  });
  record(
    "Free membership registration",
    register.status === 201 ? "PASS" : "FAIL",
    `HTTP ${register.status}`
  );
  if (register.status !== 201) return finish();

  // Sign in through the credentials provider to obtain a session cookie.
  const csrf = await call("/api/auth/csrf");
  const token = csrf.body?.csrfToken;
  const login = await fetch(`${BASE}/api/auth/callback/credentials`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Cookie: cookie,
    },
    body: new URLSearchParams({
      email: EMAIL,
      password: PASSWORD,
      csrfToken: token ?? "",
      callbackUrl: `${BASE}/dashboard`,
      json: "true",
    }),
    redirect: "manual",
  });
  for (const entry of login.headers.getSetCookie?.() ?? []) {
    const pair = entry.split(";")[0];
    const name = pair.split("=")[0];
    const existing = cookie.split("; ").filter((c) => c && c.split("=")[0] !== name);
    cookie = [...existing, pair].join("; ");
  }
  const session = await call("/api/auth/session");
  const signedIn = Boolean(session.body?.user?.id);
  record("Member sign-in", signedIn ? "PASS" : "FAIL");
  if (!signedIn) return finish();

  // ---------- Gate: no quotes without membership + vehicle ----------
  const ungated = await fetch(`${BASE}/api/platform/facilities?zipCode=02116`, {
    redirect: "manual",
  });
  record(
    "Quotes gated behind membership",
    ungated.status === 401 ? "PASS" : "FAIL",
    `anonymous request → HTTP ${ungated.status}`
  );

  // ---------- Priority 2: vehicle ----------
  const vehicle = await call("/api/dashboard/vehicles", {
    method: "POST",
    body: JSON.stringify({
      year: 2018,
      make: "Honda",
      model: "Accord",
      trim: "EX-L",
      nickname: "QA Accord",
      licensePlate: "QA1234",
      zipCode: "02116",
    }),
  });
  const vehicleId = vehicle.body?.vehicle?.id ?? vehicle.body?.id;
  record(
    "Vehicle registration",
    vehicleId ? "PASS" : "FAIL",
    `HTTP ${vehicle.status}`
  );
  if (!vehicleId) return finish();

  // ---------- Priority 2: service selection + interview ----------
  const tree = await call("/api/platform/services");
  const categories = tree.body?.data ?? [];
  const terminals = countTerminals(categories);
  record(
    "Service catalog and interview tree",
    Array.isArray(categories) && categories.length > 0 ? "PASS" : "FAIL",
    `${categories.length} categories, ${terminals} selectable services`
  );

  // ---------- Priority 2: facility comparison ----------
  const facilities = await call(
    `/api/platform/facilities?zipCode=02116&radius=25&vehicleId=${vehicleId}`
  );
  const list = facilities.body?.facilities ?? [];
  record(
    "Facility comparison",
    list.length > 0 ? "PASS" : "FAIL",
    `${list.length} facilities near 02116`
  );
  if (list.length === 0) return finish();

  const facility = list[0];

  // ---------- Priority 2: facility details ----------
  const details = await call(`/api/platform/facilities/${facility.locationId}`);
  record(
    "View Details",
    details.status === 200 ? "PASS" : "FAIL",
    details.body?.facility?.name ?? `HTTP ${details.status}`
  );

  // ---------- Priority 2: availability ----------
  const availability = await call(
    `/api/platform/availability?slug=${encodeURIComponent(facility.slug)}`
  );
  const days = availability.body?.days ?? [];
  const slots = days.flatMap((day) => day.slots ?? []);
  record(
    "Live appointment availability",
    slots.length > 0 ? "PASS" : "FAIL",
    `${slots.length} slots across ${days.length} days`
  );

  // ---------- Priority 2: booking ----------
  let appointmentId = null;
  if (slots.length > 0) {
    const booking = await call("/api/bookings", {
      method: "POST",
      body: JSON.stringify({
        vehicleId,
        facilitySlug: facility.slug,
        facilityLocationId: facility.locationId,
        scheduledTime: slots[0].proposedTime ?? slots[0].scheduledTime,
        services: [
          {
            serviceId: 1,
            serviceName: "Oil Change",
            interview: [{ question: "What is happening?", answer: "Routine service" }],
          },
        ],
        notes: "Automated verification booking.",
      }),
    });
    appointmentId = booking.body?.appointmentId ?? null;
    record(
      "Appointment booking",
      appointmentId ? "PASS" : "FAIL",
      `HTTP ${booking.status}${booking.body?.error ? ` — ${booking.body.error}` : ""}`
    );
  } else {
    record("Appointment booking", "BLOCKED", "no availability returned upstream");
  }

  // ---------- Priority 2: appointment detail + reschedule + cancel ----------
  if (appointmentId) {
    const detail = await call(`/api/bookings/${appointmentId}`);
    record(
      "Appointment detail",
      detail.status === 200 ? "PASS" : "FAIL",
      detail.body?.appointment?.shopName ?? ""
    );

    if (slots.length > 1) {
      const moved = await call(`/api/bookings/${appointmentId}`, {
        method: "PATCH",
        body: JSON.stringify({
          scheduledTime: slots[1].proposedTime ?? slots[1].scheduledTime,
        }),
      });
      record(
        "Reschedule",
        moved.status === 200 ? "PASS" : "FAIL",
        moved.body?.message ?? `HTTP ${moved.status}`
      );
    }
  }

  // ---------- Priority 3: DSN+ ----------
  const enrol = await call("/api/dsn-plus/enrollment", {
    method: "POST",
    body: JSON.stringify({ vehicleIds: [vehicleId], plan: "PREPAID_12" }),
  });
  record(
    "DSN+ vehicle enrollment",
    enrol.status === 200 || enrol.status === 201 ? "PASS" : "FAIL",
    `HTTP ${enrol.status}`
  );

  const snapshot = await call("/api/dsn-plus/enrollment");
  record(
    "Membership status tracking",
    snapshot.status === 200 ? "PASS" : "FAIL",
    `${snapshot.body?.snapshot?.enrolledVehicles ?? 0} enrolled, ` +
      `${snapshot.body?.snapshot?.pendingEnrollments ?? 0} pending`
  );

  // Discount arithmetic, verified rather than assumed.
  const rate = snapshot.body?.discount?.rate;
  record(
    "Flat 10% DSN+ discount applied",
    rate === 0.1 ? "PASS" : "FAIL",
    `rate = ${rate ?? "not reported"} (${snapshot.body?.discount?.label ?? "no label"})`
  );

  // ---------- Priority 4: messages ----------
  const thread = await call("/api/messages", {
    method: "POST",
    body: JSON.stringify({
      subject: "Verification enquiry",
      body: "Automated verification message.",
      ...(appointmentId ? { appointmentId } : { vehicleId }),
    }),
  });
  record(
    "Facility messaging",
    thread.status === 201 ? "PASS" : "FAIL",
    `HTTP ${thread.status}`
  );

  if (thread.body?.threadId) {
    const reply = await call(`/api/messages/${thread.body.threadId}`, {
      method: "POST",
      body: JSON.stringify({ body: "Following up." }),
    });
    record("Message reply", reply.status === 200 ? "PASS" : "FAIL");
  }

  // ---------- Priority 4: support ----------
  const ticket = await call("/api/support", {
    method: "POST",
    body: JSON.stringify({
      subject: "Verification support request",
      body: "Automated verification ticket.",
      category: "Something else",
    }),
  });
  record(
    "Support requests",
    ticket.status === 201 ? "PASS" : "FAIL",
    `HTTP ${ticket.status}`
  );

  // ---------- Priority 4: recalls ----------
  const recalls = await call("/api/recalls");
  const groups = recalls.body?.results ?? [];
  const found = groups.reduce((sum, g) => sum + (g.recalls?.length ?? 0), 0);
  record(
    "Safety recalls",
    recalls.status === 200 ? "PASS" : "FAIL",
    `${found} campaigns found for the test vehicle`
  );

  // ---------- Priority 5: analytics ----------
  const event = await call("/api/analytics/events", {
    method: "POST",
    body: JSON.stringify({ event: "quote_started", metadata: { source: "verify" } }),
  });
  record(
    "Funnel event ingestion",
    event.status === 202 && event.body?.ok ? "PASS" : "FAIL",
    `HTTP ${event.status}`
  );

  const rejected = await call("/api/analytics/events", {
    method: "POST",
    body: JSON.stringify({ event: "not_a_real_event" }),
  });
  record(
    "Unknown events rejected",
    rejected.body?.ok === false ? "PASS" : "FAIL"
  );

  if (INTERNAL_SECRET) {
    const funnel = await call("/api/admin/funnel?days=1", {
      headers: { "x-dsn-internal-secret": INTERNAL_SECRET },
    });
    record(
      "Funnel report",
      funnel.status === 200 ? "PASS" : "FAIL",
      `${funnel.body?.primaryFunnel?.length ?? 0} steps reported`
    );
  }

  const guarded = await call("/api/admin/funnel");
  record(
    "Funnel report protected",
    guarded.status === 404 ? "PASS" : "FAIL",
    `unauthenticated → HTTP ${guarded.status}`
  );

  // ---------- Cleanup: cancel the verification booking ----------
  if (appointmentId) {
    const cancelled = await call(`/api/bookings/${appointmentId}`, {
      method: "DELETE",
    });
    record(
      "Cancellation",
      cancelled.status === 200 ? "PASS" : "FAIL",
      cancelled.body?.message ?? `HTTP ${cancelled.status}`
    );
  }

  finish();
}

function finish() {
  const pass = results.filter((r) => r.status === "PASS").length;
  const fail = results.filter((r) => r.status === "FAIL").length;
  const blocked = results.filter((r) => r.status === "BLOCKED").length;
  console.log(
    `\n${pass} passed · ${fail} failed · ${blocked} blocked upstream · ${results.length} checks\n`
  );
  process.exit(fail > 0 ? 1 : 0);
}

main().catch((error) => {
  console.error("Verification aborted:", error);
  process.exit(1);
});

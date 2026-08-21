/**
 * DSN Membership → Google Sheet Synchronisation
 * Drive Service Network / Global Drive Holdings Inc.
 *
 * REVAMP BUILD section 8:
 *   "The membership information collected during registration should populate
 *    the designated DSN Google Sheet supplied separately by Mitch. The Google
 *    Sheet should function as an operational/administrative record available to
 *    the DSN team. However, do not architect the Google Sheet as the underlying
 *    relational database for DSN."
 *
 * Accordingly this module is a strictly one-way, best-effort MIRROR. The DSN
 * database is the system of record. A sheet failure must never block a member
 * from completing registration; failures are recorded in sheet_sync_log and
 * retried by the reconciliation job.
 *
 * CONFIGURATION (all optional — the module degrades to a no-op when unset):
 *   DSN_MEMBERSHIP_SHEET_ID              the spreadsheet id from its URL
 *   DSN_MEMBERSHIP_SHEET_TAB             worksheet/tab name (default "Members")
 *   GOOGLE_SERVICE_ACCOUNT_EMAIL         service-account client_email
 *   GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY   service-account private_key (\n escaped)
 *
 * Mitch has not yet supplied the sheet. Until DSN_MEMBERSHIP_SHEET_ID is set,
 * every member is written to sheet_sync_log with status PENDING and can be
 * backfilled in order by running the reconciliation endpoint. No member data is
 * lost in the interim.
 */
import "server-only";

import { GoogleAuth } from "google-auth-library";
import { prisma } from "@/lib/prisma";

const SHEETS_SCOPE = "https://www.googleapis.com/auth/spreadsheets";
const SHEETS_API = "https://sheets.googleapis.com/v4/spreadsheets";

/** Column order of the DSN membership sheet. */
export const MEMBERSHIP_SHEET_HEADERS = [
  "DSN Member ID",
  "Registered At",
  "First Name",
  "Last Name",
  "Email",
  "Phone",
  "Company",
  "Operator Type",
  "Fleet Size Band",
  "Primary Market",
  "City",
  "State",
  "ZIP Code",
  "Membership Tier",
  "Vehicles Registered",
  "Vehicles Enrolled in DSN+",
  "Openbay Driver ID",
  "Last Updated",
] as const;

export interface MembershipSheetRow {
  memberId: string;
  registeredAt: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  companyName: string;
  operatorType: string;
  fleetSizeBand: string;
  primaryMarket: string;
  city: string;
  state: string;
  zipCode: string;
  membershipTier: string;
  vehiclesRegistered: number;
  vehiclesEnrolled: number;
  openbayUserId: string;
  lastUpdated: string;
}

export function isSheetSyncConfigured(): boolean {
  return Boolean(
    process.env.DSN_MEMBERSHIP_SHEET_ID &&
      process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL &&
      process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY
  );
}

function sheetTab(): string {
  return process.env.DSN_MEMBERSHIP_SHEET_TAB || "Members";
}

async function accessToken(): Promise<string> {
  const auth = new GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: (process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY || "").replace(
        /\\n/g,
        "\n"
      ),
    },
    scopes: [SHEETS_SCOPE],
  });
  const client = await auth.getClient();
  const token = await client.getAccessToken();
  if (!token.token) {
    throw new Error("Unable to obtain a Google Sheets access token");
  }
  return token.token;
}

function rowValues(row: MembershipSheetRow): (string | number)[] {
  return [
    row.memberId,
    row.registeredAt,
    row.firstName,
    row.lastName,
    row.email,
    row.phone,
    row.companyName,
    row.operatorType,
    row.fleetSizeBand,
    row.primaryMarket,
    row.city,
    row.state,
    row.zipCode,
    row.membershipTier,
    row.vehiclesRegistered,
    row.vehiclesEnrolled,
    row.openbayUserId,
    row.lastUpdated,
  ];
}

/** Ensures the header row exists and matches the expected column order. */
export async function ensureSheetHeaders(): Promise<void> {
  if (!isSheetSyncConfigured()) return;
  const sheetId = process.env.DSN_MEMBERSHIP_SHEET_ID!;
  const tab = sheetTab();
  const token = await accessToken();

  const readUrl = `${SHEETS_API}/${sheetId}/values/${encodeURIComponent(`${tab}!A1:R1`)}`;
  const existing = await fetch(readUrl, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (existing.ok) {
    const body = (await existing.json()) as { values?: string[][] };
    if (body.values && body.values.length > 0 && body.values[0].length > 0) {
      return;
    }
  }

  const writeUrl =
    `${SHEETS_API}/${sheetId}/values/${encodeURIComponent(`${tab}!A1`)}` +
    `?valueInputOption=RAW`;
  await fetch(writeUrl, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ values: [MEMBERSHIP_SHEET_HEADERS] }),
  });
}

/** Locates the 1-based sheet row for a DSN member id, if already present. */
async function findRowIndex(memberId: string, token: string): Promise<number | null> {
  const sheetId = process.env.DSN_MEMBERSHIP_SHEET_ID!;
  const tab = sheetTab();
  const url = `${SHEETS_API}/${sheetId}/values/${encodeURIComponent(`${tab}!A:A`)}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) return null;
  const body = (await res.json()) as { values?: string[][] };
  const values = body.values ?? [];
  for (let i = 0; i < values.length; i += 1) {
    if (values[i]?.[0] === memberId) return i + 1;
  }
  return null;
}

async function appendRow(row: MembershipSheetRow, token: string): Promise<void> {
  const sheetId = process.env.DSN_MEMBERSHIP_SHEET_ID!;
  const tab = sheetTab();
  const url =
    `${SHEETS_API}/${sheetId}/values/${encodeURIComponent(`${tab}!A1`)}:append` +
    `?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ values: [rowValues(row)] }),
  });
  if (!res.ok) {
    throw new Error(`Sheets append failed: ${res.status} ${await res.text()}`);
  }
}

async function updateRow(
  row: MembershipSheetRow,
  rowIndex: number,
  token: string
): Promise<void> {
  const sheetId = process.env.DSN_MEMBERSHIP_SHEET_ID!;
  const tab = sheetTab();
  const range = `${tab}!A${rowIndex}:R${rowIndex}`;
  const url =
    `${SHEETS_API}/${sheetId}/values/${encodeURIComponent(range)}` +
    `?valueInputOption=USER_ENTERED`;
  const res = await fetch(url, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ values: [rowValues(row)] }),
  });
  if (!res.ok) {
    throw new Error(`Sheets update failed: ${res.status} ${await res.text()}`);
  }
}

/** Builds the sheet row for a member directly from the DSN system of record. */
export async function buildMembershipRow(
  userId: string
): Promise<MembershipSheetRow | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      vehicles: {
        where: { status: { not: "REMOVED" } },
        select: { programStatus: true },
      },
    },
  });
  if (!user) return null;

  return {
    memberId: user.id,
    registeredAt: user.createdAt.toISOString(),
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone ?? "",
    companyName: user.companyName ?? "",
    operatorType: user.operatorType ?? "",
    fleetSizeBand: user.fleetSizeBand ?? "",
    primaryMarket: user.primaryMarket ?? "",
    city: user.city ?? "",
    state: user.state ?? "",
    zipCode: user.zipCode ?? "",
    membershipTier: user.membershipTier,
    vehiclesRegistered: user.vehicles.length,
    vehiclesEnrolled: user.vehicles.filter((v) => v.programStatus === "DSN_PLUS").length,
    openbayUserId: user.openbayUserId ?? "",
    lastUpdated: new Date().toISOString(),
  };
}

/**
 * Mirror one member into the sheet. Never throws — a sheet failure must not
 * affect the member's experience (BUILD section 8).
 */
export async function syncMemberToSheet(
  userId: string,
  operation: "CREATE" | "UPDATE" = "CREATE"
): Promise<{ status: "SYNCED" | "PENDING" | "FAILED"; message?: string }> {
  const row = await buildMembershipRow(userId);
  if (!row) {
    return { status: "FAILED", message: "Member not found" };
  }

  if (!isSheetSyncConfigured()) {
    // Sheet not yet supplied by Mitch — queue for backfill, do not fail.
    await prisma.sheetSyncLog.create({
      data: {
        entityType: "MEMBER",
        entityId: userId,
        operation,
        status: "PENDING",
        errorMessage: "DSN membership Google Sheet is not configured yet.",
        payload: row as unknown as object,
      },
    });
    await prisma.user.update({
      where: { id: userId },
      data: { sheetSyncStatus: "PENDING" },
    });
    return { status: "PENDING", message: "Sheet not configured" };
  }

  try {
    await ensureSheetHeaders();
    const token = await accessToken();
    const existingRow = await findRowIndex(row.memberId, token);
    if (existingRow && existingRow > 1) {
      await updateRow(row, existingRow, token);
    } else {
      await appendRow(row, token);
    }

    await prisma.$transaction([
      prisma.sheetSyncLog.create({
        data: {
          entityType: "MEMBER",
          entityId: userId,
          operation,
          status: "SYNCED",
          payload: row as unknown as object,
        },
      }),
      prisma.user.update({
        where: { id: userId },
        data: {
          sheetSyncStatus: "SYNCED",
          sheetSyncedAt: new Date(),
          sheetSyncError: null,
        },
      }),
    ]);
    return { status: "SYNCED" };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown sheet error";
    console.error("[SheetSync] failed", { userId, message });
    await prisma.sheetSyncLog.create({
      data: {
        entityType: "MEMBER",
        entityId: userId,
        operation,
        status: "FAILED",
        errorMessage: message,
        payload: row as unknown as object,
      },
    });
    await prisma.user.update({
      where: { id: userId },
      data: { sheetSyncStatus: "FAILED", sheetSyncError: message },
    });
    return { status: "FAILED", message };
  }
}

/**
 * Replays every member the sheet has not yet received, oldest first. Safe to
 * run repeatedly; used once Mitch supplies the sheet id.
 */
export async function reconcileMembershipSheet(limit = 500): Promise<{
  attempted: number;
  synced: number;
  failed: number;
  skipped: boolean;
}> {
  if (!isSheetSyncConfigured()) {
    return { attempted: 0, synced: 0, failed: 0, skipped: true };
  }

  const pending = await prisma.user.findMany({
    where: { sheetSyncStatus: { in: ["PENDING", "FAILED"] } },
    orderBy: { createdAt: "asc" },
    take: limit,
    select: { id: true },
  });

  let synced = 0;
  let failed = 0;
  for (const user of pending) {
    const result = await syncMemberToSheet(user.id, "UPDATE");
    if (result.status === "SYNCED") synced += 1;
    else failed += 1;
  }

  return { attempted: pending.length, synced, failed, skipped: false };
}

/**
 * GET  /api/admin/sheet-sync — membership sheet sync status
 * POST /api/admin/sheet-sync — replay members the sheet has not yet received
 *
 * BUILD section 8: the Google Sheet is an operational mirror for the DSN team,
 * never the underlying database. This endpoint exists so that when Mitch
 * supplies the sheet, every member registered before that point can be
 * backfilled in registration order with a single call.
 *
 * Protected by INTERNAL_API_SECRET (header: x-dsn-internal-secret) or a
 * signed-in DSN ADMIN / SUPER_ADMIN session.
 */
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  isSheetSyncConfigured,
  reconcileMembershipSheet,
} from "@/lib/google-sheets/membership-sync";

export const dynamic = "force-dynamic";

async function authorise(request: NextRequest): Promise<boolean> {
  const secret = process.env.INTERNAL_API_SECRET;
  const provided = request.headers.get("x-dsn-internal-secret");
  if (secret && provided && provided === secret) return true;

  const session = await auth();
  return session?.user?.role === "ADMIN" || session?.user?.role === "SUPER_ADMIN";
}

export async function GET(request: NextRequest) {
  if (!(await authorise(request))) {
    return NextResponse.json({ error: "Not authorised" }, { status: 401 });
  }

  const [pending, synced, failed, lastLog] = await Promise.all([
    prisma.user.count({ where: { sheetSyncStatus: "PENDING" } }),
    prisma.user.count({ where: { sheetSyncStatus: "SYNCED" } }),
    prisma.user.count({ where: { sheetSyncStatus: "FAILED" } }),
    prisma.sheetSyncLog.findFirst({ orderBy: { createdAt: "desc" } }),
  ]);

  return NextResponse.json({
    configured: isSheetSyncConfigured(),
    sheetId: process.env.DSN_MEMBERSHIP_SHEET_ID ? "set" : "not set",
    tab: process.env.DSN_MEMBERSHIP_SHEET_TAB || "Members",
    members: { pending, synced, failed },
    lastEvent: lastLog
      ? {
          entityId: lastLog.entityId,
          operation: lastLog.operation,
          status: lastLog.status,
          at: lastLog.createdAt,
          error: lastLog.errorMessage,
        }
      : null,
  });
}

export async function POST(request: NextRequest) {
  if (!(await authorise(request))) {
    return NextResponse.json({ error: "Not authorised" }, { status: 401 });
  }

  if (!isSheetSyncConfigured()) {
    return NextResponse.json(
      {
        error:
          "The DSN membership Google Sheet is not configured. Set DSN_MEMBERSHIP_SHEET_ID, GOOGLE_SERVICE_ACCOUNT_EMAIL and GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY.",
        configured: false,
      },
      { status: 409 }
    );
  }

  const result = await reconcileMembershipSheet();
  return NextResponse.json({ ok: true, ...result });
}

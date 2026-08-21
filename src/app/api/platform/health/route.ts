/**
 * GET /api/platform/health — Platform API connectivity diagnostics.
 *
 * Internal operations aid. Confirms the Platform API credential is live and
 * that each capability DSN depends on is reachable, so that a DSN outage can be
 * distinguished from an upstream one without reading application logs.
 *
 * Protected by INTERNAL_API_SECRET or an ADMIN session — the response reveals
 * infrastructure detail and must never be public.
 */
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getPlatformClient, PlatformApiRequestError } from "@/lib/platform";
import { isSheetSyncConfigured } from "@/lib/google-sheets/membership-sync";

export const dynamic = "force-dynamic";

async function authorise(request: NextRequest): Promise<boolean> {
  const secret = process.env.INTERNAL_API_SECRET;
  const provided = request.headers.get("x-dsn-internal-secret");
  if (secret && provided && provided === secret) return true;
  const session = await auth();
  return session?.user?.role === "ADMIN" || session?.user?.role === "SUPER_ADMIN";
}

async function probe(
  name: string,
  fn: () => Promise<unknown>
): Promise<{ name: string; ok: boolean; detail: string }> {
  const started = Date.now();
  try {
    const result = await fn();
    const count = Array.isArray(result)
      ? `${result.length} records`
      : "ok";
    return { name, ok: true, detail: `${count} in ${Date.now() - started}ms` };
  } catch (err) {
    if (err instanceof PlatformApiRequestError) {
      return {
        name,
        ok: false,
        detail: `${err.statusCode} ${err.message}${err.entitlement ? " [ENTITLEMENT]" : ""}`,
      };
    }
    return { name, ok: false, detail: String(err) };
  }
}

export async function GET(request: NextRequest) {
  if (!(await authorise(request))) {
    return NextResponse.json({ error: "Not authorised" }, { status: 401 });
  }

  const client = getPlatformClient();

  const checks = await Promise.all([
    probe("services.catalog", () => client.getServices()),
    probe("services.categories", () => client.getServiceCategories()),
    probe("services.selection", () => client.getServiceSelection()),
    probe("vehicles.catalog.years", () => client.getCatalogYears()),
    probe("locations.search", () => client.searchLocations("02138", 20)),
  ]);

  return NextResponse.json({
    environment: client.environment,
    partnerId: client.partnerId,
    baseUrlConfigured: Boolean(process.env.OPENBAY_PLATFORM_API_BASE_URL),
    apiKeyConfigured: Boolean(process.env.OPENBAY_PLATFORM_API_KEY),
    sheetSyncConfigured: isSheetSyncConfigured(),
    checks,
    knownLimitations: [
      "Service-request creation is blocked: partner is not entitled to the service-request-generation feature (FLAG F-1).",
      "No DSN+ member-vs-standard price pair is returned on offers (FLAG F-8).",
      "No messaging API is available (FLAG F-7).",
      "Vehicle colour has no Platform API field; engine derives from the style name (FLAG F-4).",
    ],
  });
}

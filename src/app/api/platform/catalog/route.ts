/**
 * GET /api/platform/catalog — Vehicle catalog cascade proxy.
 *
 * Drives the Year → Make → Model → Sub-model → Trim picker on the Add Vehicle
 * form. The Platform API key never leaves the server (BUILD section 36).
 *
 *   ?step=years
 *   ?step=makes&year=2024
 *   ?step=models&year=2024&makeId=200005453
 *   ?step=subModels&year=2024&makeId=…&modelId=…
 *   ?step=trims&year=2024&makeId=…&modelId=…&subModelId=…
 *   ?step=zipcode&term=02138
 */
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getPlatformClient, safePlatformCall } from "@/lib/platform";

export const dynamic = "force-dynamic";

function intParam(req: NextRequest, name: string): number | null {
  const raw = req.nextUrl.searchParams.get(name);
  if (!raw) return null;
  const value = Number(raw);
  return Number.isFinite(value) ? value : null;
}

export async function GET(request: NextRequest) {
  // BUILD section 6 — the vehicle catalogue is only reachable by members,
  // because vehicles can only exist inside a membership.
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Membership required" }, { status: 401 });
  }

  const step = request.nextUrl.searchParams.get("step") ?? "years";
  const client = getPlatformClient();
  const year = intParam(request, "year");
  const makeId = intParam(request, "makeId");
  const modelId = intParam(request, "modelId");
  const subModelId = intParam(request, "subModelId");

  const missing = (fields: string) =>
    NextResponse.json({ error: `Missing required parameter(s): ${fields}` }, { status: 400 });

  let call: (() => Promise<unknown>) | null = null;

  switch (step) {
    case "years":
      call = () => client.getCatalogYears();
      break;
    case "makes":
      if (!year) return missing("year");
      call = () => client.getCatalogMakes(year);
      break;
    case "models":
      if (!year || !makeId) return missing("year, makeId");
      call = () => client.getCatalogModels(year, makeId);
      break;
    case "subModels":
      if (!year || !makeId || !modelId) return missing("year, makeId, modelId");
      call = () => client.getCatalogSubModels(year, makeId, modelId);
      break;
    case "trims":
      if (!year || !makeId || !modelId || !subModelId) {
        return missing("year, makeId, modelId, subModelId");
      }
      call = () => client.getCatalogTrims(year, makeId, modelId, subModelId);
      break;
    case "zipcode": {
      const term = request.nextUrl.searchParams.get("term");
      if (!term) return missing("term");
      call = () => client.lookupZipcode(term);
      break;
    }
    default:
      return NextResponse.json({ error: "Unknown catalog step" }, { status: 400 });
  }

  const { data, error, status } = await safePlatformCall(call);
  if (error) {
    return NextResponse.json({ error }, { status });
  }

  return NextResponse.json({ step, data });
}

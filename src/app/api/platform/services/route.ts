/**
 * GET /api/platform/services — Service catalogue and guided-selection tree.
 *
 * BUILD section 12: "The follow-up interview questions are already defined in
 * the Platform API. Do not invent DSN's own interview logic." This route is the
 * only source of that tree; DSN never hard-codes questions.
 *
 *   ?view=catalog     → 515 bookable services
 *   ?view=categories  → 18 service categories
 *   ?view=selection   → guided interview tree (default)
 */
import { NextRequest, NextResponse } from "next/server";
import { getPlatformClient, safePlatformCall } from "@/lib/platform";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: NextRequest) {
  const view = request.nextUrl.searchParams.get("view") ?? "selection";
  const client = getPlatformClient();

  const call: () => Promise<unknown> =
    view === "catalog"
      ? () => client.getServices()
      : view === "categories"
        ? () => client.getServiceCategories()
        : () => client.getServiceSelection();

  const { data, error, status } = await safePlatformCall(call);
  if (error) {
    return NextResponse.json({ error }, { status });
  }

  return NextResponse.json(
    { view, data },
    {
      headers: {
        // The catalogue is stable; cache at the edge to keep the picker fast.
        "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=3600",
      },
    }
  );
}

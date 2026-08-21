/**
 * POST /api/platform/vin-decode — resolve a VIN to Year / Make / Model / Engine.
 *
 * BUILD section 9 wants vehicle entry to be quick and accurate. The Platform
 * API decodes a VIN when an owned vehicle is created, so this route creates a
 * scratch vehicle against the member's own Openbay driver, reads the decode,
 * and removes the scratch record. The member's real vehicle is then created
 * from the confirmed details.
 *
 * The decode is asynchronous upstream, so a short poll is required.
 */
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import {
  engineFromStyleName,
  getPlatformClient,
  memberFacingError,
  waitForVehicleDecode,
} from "@/lib/platform";
import { ensureOpenbayDriver } from "@/lib/membership/service";
import { isValidVin, normaliseVin } from "@/lib/vehicles/service";

export const dynamic = "force-dynamic";

const schema = z.object({
  vin: z.string().min(17).max(17),
  zipCode: z.string().regex(/^\d{5}$/),
});

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Membership required" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Please enter a 17-character VIN and a five-digit ZIP code." },
      { status: 400 }
    );
  }

  const vin = normaliseVin(parsed.data.vin);
  if (!vin || !isValidVin(vin)) {
    return NextResponse.json(
      { error: "That VIN does not look right. A VIN is 17 characters." },
      { status: 400 }
    );
  }

  const openbayUserId = await ensureOpenbayDriver(session.user.id);
  if (!openbayUserId) {
    return NextResponse.json(
      {
        error:
          "We could not look up that VIN right now. Please enter the vehicle details manually.",
      },
      { status: 503 }
    );
  }

  const client = getPlatformClient();
  let scratchId: number | null = null;

  try {
    const created = await client.createVehicle({
      userId: Number(openbayUserId),
      vin,
      zipCode: parsed.data.zipCode,
    });
    scratchId = created.ownedVehicleId;

    const decoded = (await waitForVehicleDecode(created.ownedVehicleId)) ?? created;

    if (!decoded.year || !decoded.make || !decoded.model) {
      return NextResponse.json(
        {
          decoded: false,
          message:
            "We could not identify that VIN. Please choose the vehicle details manually.",
        },
        { status: 200 }
      );
    }

    return NextResponse.json({
      decoded: true,
      vehicle: {
        year: Number(decoded.year),
        make: decoded.make,
        model: decoded.model,
        trim: decoded.styleName ?? null,
        engine: engineFromStyleName(decoded.styleName),
        styleId: decoded.styleId ?? null,
        vin,
      },
    });
  } catch (err) {
    const mapped = memberFacingError(err);
    return NextResponse.json({ error: mapped.message }, { status: mapped.status });
  } finally {
    // Always clean up the scratch record so the member's Openbay fleet mirrors
    // their DSN fleet exactly.
    if (scratchId !== null) {
      try {
        await client.deleteVehicle(scratchId);
      } catch (err) {
        console.error("[VinDecode] scratch cleanup failed", {
          scratchId,
          err: String(err),
        });
      }
    }
  }
}

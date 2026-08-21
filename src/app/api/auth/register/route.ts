/**
 * POST /api/auth/register — Create a FREE Drive Service Network membership.
 *
 * REVAMP BUILD section 7:
 *   "Free Membership requires no payment. No credit card. No trial. No hidden
 *    upsell requirement at this stage."
 *
 * On success the member record is created in DSN's database (the system of
 * record), an Openbay driver is provisioned behind the scenes, and the member
 * is mirrored into the DSN membership Google Sheet. Neither of the latter two
 * can block or fail the registration.
 */
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { completeMembershipProvisioning, trackFunnelEvent } from "@/lib/membership/service";

export const dynamic = "force-dynamic";

const registerSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(100),
  lastName: z.string().min(1, "Last name is required").max(100),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  phone: z.string().max(32).optional(),
  companyName: z.string().max(200).optional(),
  operatorType: z.string().max(100).optional(),
  fleetSizeBand: z.string().max(50).optional(),
  primaryMarket: z.string().max(120).optional(),
  zipCode: z
    .string()
    .regex(/^\d{5}$/, "Please enter a five-digit ZIP code")
    .optional()
    .or(z.literal("")),
});

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const validation = registerSchema.safeParse(body);
  if (!validation.success) {
    return NextResponse.json(
      {
        error: "Please check the highlighted fields.",
        details: validation.error.flatten().fieldErrors,
      },
      { status: 400 }
    );
  }

  const {
    firstName,
    lastName,
    email,
    password,
    phone,
    companyName,
    operatorType,
    fleetSizeBand,
    primaryMarket,
    zipCode,
  } = validation.data;

  const normalisedEmail = email.trim().toLowerCase();

  try {
    const existing = await prisma.user.findUnique({ where: { email: normalisedEmail } });
    if (existing) {
      return NextResponse.json(
        {
          error: "An account with this email already exists. Please sign in instead.",
          code: "EMAIL_IN_USE",
        },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: normalisedEmail,
        password: hashedPassword,
        phone: phone?.trim() || null,
        companyName: companyName?.trim() || null,
        operatorType: operatorType?.trim() || null,
        fleetSizeBand: fleetSizeBand?.trim() || null,
        primaryMarket: primaryMarket?.trim() || null,
        zipCode: zipCode?.trim() || null,
        // FREE membership. No payment, no trial, no expiry.
        membershipTier: "FREE",
        role: "CUSTOMER",
        status: "ACTIVE",
        memberSince: new Date(),
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        membershipTier: true,
        memberSince: true,
      },
    });

    // Openbay provisioning + Google Sheet mirror. Best-effort by design.
    const provisioning = await completeMembershipProvisioning(user.id);

    return NextResponse.json(
      {
        message: "Welcome to Drive Service Network.",
        user,
        // Internal diagnostics only; not displayed to the member.
        provisioning: {
          serviceNetworkLinked: Boolean(provisioning.openbayUserId),
          recordSync: provisioning.sheetStatus,
        },
        // BUILD section 9 — registration flows straight into Add Your Vehicles.
        nextStep: "/dashboard/vehicles/new?welcome=1",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[Register] failed", error);
    await trackFunnelEvent("membership_failed", {
      metadata: { reason: "server_error" },
    });
    return NextResponse.json(
      { error: "We could not create your membership. Please try again." },
      { status: 500 }
    );
  }
}

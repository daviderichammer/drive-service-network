/**
 * POST /api/openbay/users — Create a new Openbay user
 * GET  /api/openbay/users?userId=xxx — Get user by ID
 *
 * Proxy: POST /partners/v2/partner-api/users
 * API key is NEVER exposed to the client.
 */
import { NextRequest, NextResponse } from "next/server";
import { getOpenbayClient, safeOpenbayCall } from "@/lib/openbay";
import { z } from "zod";

export const dynamic = "force-dynamic";

const createUserSchema = z.object({
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  email: z.string().email(),
  zipCode: z.string().min(5).max(10),
});

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parseResult = createUserSchema.safeParse(body);
  if (!parseResult.success) {
    return NextResponse.json(
      { error: "Invalid user parameters", details: parseResult.error.flatten() },
      { status: 400 }
    );
  }

  const client = getOpenbayClient();
  const { data, error } = await safeOpenbayCall(
    () => client.createUser(parseResult.data),
    null
  );

  if (error || !data) {
    return NextResponse.json(
      { error: "Failed to create user", message: error || "Unknown error" },
      { status: 503 }
    );
  }

  return NextResponse.json({ user: data, userId: data.id, success: true });
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "userId is required" }, { status: 400 });
  }

  const client = getOpenbayClient();
  const { data, error } = await safeOpenbayCall(
    () => client.getUser(userId),
    null
  );

  if (error || !data) {
    return NextResponse.json(
      { error: "Failed to fetch user", message: error || "User not found" },
      { status: 503 }
    );
  }

  return NextResponse.json({ user: data });
}

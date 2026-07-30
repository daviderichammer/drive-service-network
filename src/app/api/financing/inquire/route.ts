import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";

const inquirySchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  company: z.string().optional(),
  fleetSize: z.string().min(1, "Fleet size is required"),
  financingNeed: z.string().min(1, "Financing need is required"),
  notes: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const body = await request.json();
    const validation = inquirySchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error.errors },
        { status: 400 }
      );
    }

    const { firstName, lastName, email, phone, company, fleetSize, financingNeed, notes } =
      validation.data;

    const inquiry = await prisma.financingInquiry.create({
      data: {
        firstName,
        lastName,
        email,
        phone: phone || null,
        company: company || null,
        fleetSize,
        financingNeed,
        notes: notes || null,
        userId: session?.user?.id || null,
        status: "NEW",
      },
    });

    return NextResponse.json(
      { message: "Pre-qualification submitted successfully", id: inquiry.id },
      { status: 201 }
    );
  } catch (error) {
    console.error("Financing inquiry error:", error);
    return NextResponse.json(
      { error: "Failed to submit pre-qualification. Please try again." },
      { status: 500 }
    );
  }
}

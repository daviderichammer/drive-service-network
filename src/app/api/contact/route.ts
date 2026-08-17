/**
 * POST /api/contact
 * Handles contact form submissions
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export const dynamic = "force-dynamic";

const contactSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(100),
  lastName: z.string().min(1, "Last name is required").max(100),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  company: z.string().optional(),
  subject: z.string().min(1, "Subject is required").max(200),
  message: z.string().min(10, "Message must be at least 10 characters").max(5000),
  // CHANGE 004-A — "How Can We Help?" values used to route the inquiry
  // internally to the appropriate Drive company or team.
  inquiryType: z
    .enum([
      "maintenance-repairs",
      "tires-glass-collision",
      "parts",
      "tracking-theft-protection",
      "vehicle-protection",
      "vehicle-acquisition",
      "financing",
      "private-rentals",
      "growth-partner",
      "technology",
      "dsn-partnership",
      "general",
    ])
    .optional()
    .default("general"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parseResult = contactSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: parseResult.error.flatten(),
        },
        { status: 400 }
      );
    }

    const data = parseResult.data;

    // TODO: Phase 2 — Save to database via Prisma
    // TODO: Phase 2 — Send notification email via SMTP

    // Log in development
    if (process.env.NODE_ENV === "development") {
      console.log("[Contact Form Submission]", {
        name: `${data.firstName} ${data.lastName}`,
        email: data.email,
        subject: data.subject,
        inquiryType: data.inquiryType,
      });
    }

    return NextResponse.json(
      {
        success: true,
        message:
          "Thank you for contacting Drive Service Network. We will respond within 1 business day.",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[Contact API Error]", error);
    return NextResponse.json(
      { error: "Internal server error. Please try again." },
      { status: 500 }
    );
  }
}

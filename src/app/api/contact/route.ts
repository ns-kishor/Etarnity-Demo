import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";

/**
 * POST /api/contact
 * Persists an inbound corporate conversation.
 * Validation via zod; persistence via Prisma (SQLite).
 */

const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(120),
  email: z
    .string()
    .trim()
    .email("A valid email address is required")
    .max(200),
  organization: z.string().trim().max(160).optional().default(""),
  category: z.enum([
    "General",
    "Business",
    "Partnership",
    "Investment",
    "Careers",
    "Media",
  ]),
  message: z
    .string()
    .trim()
    .min(10, "Message must be at least 10 characters")
    .max(5000),
});

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    if (!body) {
      return NextResponse.json(
        { ok: false, error: "Invalid request body." },
        { status: 400 }
      );
    }

    const parsed = contactSchema.safeParse(body);
    if (!parsed.success) {
      const first = parsed.error.issues[0];
      return NextResponse.json(
        { ok: false, error: first?.message ?? "Validation failed." },
        { status: 422 }
      );
    }

    const { name, email, organization, category, message } = parsed.data;

    const submission = await db.contactSubmission.create({
      data: {
        name,
        email,
        organization: organization || null,
        category,
        message,
      },
    });

    return NextResponse.json(
      {
        ok: true,
        id: submission.id,
        message:
          "Message received. The leadership team will respond within two business days.",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[/api/contact] submission failed:", error);
    return NextResponse.json(
      { ok: false, error: "The message could not be saved. Please try again." },
      { status: 500 }
    );
  }
}

/** Lightweight health check for the corporate inbox pipeline. */
export async function GET() {
  try {
    const count = await db.contactSubmission.count();
    return NextResponse.json({ ok: true, total: count });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Database unavailable." },
      { status: 503 }
    );
  }
}

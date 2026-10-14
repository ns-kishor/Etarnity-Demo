import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { badRequest, tooManyRequests } from "@/app/api/_lib/http";
import { contactSchema } from "@/app/api/_lib/schemas";

/**
 * Public contact form.
 * - Hidden "website" honeypot: any request that fills it is silently
 *   accepted ({ ok: true }) and never stored.
 * - Rate limited: 5 submissions per hour per IP.
 */
export async function POST(req: Request) {
  try {
    let json: unknown;
    try {
      json = await req.json();
    } catch {
      return badRequest("Invalid request body.");
    }

    const raw =
      typeof json === "object" && json !== null && !Array.isArray(json)
        ? (json as Record<string, unknown>)
        : {};

    // Honeypot — checked before validation so bots always get a silent ok.
    const honeypot = raw.website;
    if (honeypot !== undefined && honeypot !== null && honeypot !== "") {
      return NextResponse.json({ ok: true });
    }

    const result = contactSchema.safeParse(json);
    if (!result.success) {
      return badRequest(
        result.error.issues[0]?.message ?? "Validation failed."
      );
    }
    const body = result.data;

    const ip = getClientIp(req);
    const limit = rateLimit(`contact:${ip}`, 5, 3_600_000);
    if (!limit.allowed) {
      return tooManyRequests(
        "Too many submissions. Please try again later.",
        limit.retryAfterSeconds
      );
    }

    await db.contactInquiry.create({
      data: {
        name: body.name,
        email: body.email,
        organization: body.organization || null,
        inquiryType: body.inquiryType,
        subject: body.subject,
        message: body.message,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[api/public/contact]", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

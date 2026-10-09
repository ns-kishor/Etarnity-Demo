import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createSession, SESSION_COOKIE } from "@/lib/auth";
import { verifyPassword } from "@/lib/password";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import {
  badRequest,
  serializeUser,
  tooManyRequests,
} from "@/app/api/_lib/http";
import { loginSchema } from "@/app/api/_lib/schemas";

const LOGIN_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const LOGIN_MAX_ATTEMPTS = 5;

/**
 * Admin login. Always answers 401 { error: "Invalid email or password." }
 * on any failure (unknown email, bad password, suspended account) so the
 * response never reveals which part was wrong.
 */
export async function POST(req: Request) {
  try {
    let json: unknown;
    try {
      json = await req.json();
    } catch {
      return badRequest("Invalid request body.");
    }

    const result = loginSchema.safeParse(json);
    if (!result.success) {
      return badRequest(
        result.error.issues[0]?.message ?? "Validation failed."
      );
    }
    const { email, password } = result.data;

    const ip = getClientIp(req);
    const limit = rateLimit(
      `login:${ip}:${email.toLowerCase()}`,
      LOGIN_MAX_ATTEMPTS,
      LOGIN_WINDOW_MS
    );
    if (!limit.allowed) {
      return tooManyRequests(
        "Too many login attempts. Please try again later.",
        limit.retryAfterSeconds
      );
    }

    const user = await db.user.findUnique({
      where: { email },
      include: { role: true },
    });

    if (
      !user ||
      user.status !== "ACTIVE" ||
      !verifyPassword(password, user.passwordHash)
    ) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    const token = await createSession(user.id);

    const response = NextResponse.json({ user: serializeUser(user) });
    response.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days (matches session TTL)
    });
    return response;
  } catch (error) {
    console.error("[api/admin/login]", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

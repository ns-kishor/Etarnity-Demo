import { NextResponse } from "next/server";
import { destroySession, SESSION_COOKIE } from "@/lib/auth";

/** Admin logout — idempotent: clearing an absent session is still ok. */
export async function POST() {
  try {
    await destroySession();
    const response = NextResponse.json({ ok: true });
    response.cookies.set(SESSION_COOKIE, "", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 0,
    });
    return response;
  } catch (error) {
    console.error("[api/admin/logout]", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

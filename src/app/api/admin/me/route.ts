import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { jsonError, serializeUser } from "@/app/api/_lib/http";

/** Current admin user (from the session cookie), or 401. */
export async function GET() {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return jsonError("Authentication required.", 401);
    }

    // Re-read from DB so suspended/deleted users are rejected immediately.
    const user = await db.user.findUnique({
      where: { id: sessionUser.id },
      include: { role: true },
    });
    if (!user || user.status !== "ACTIVE") {
      return jsonError("Authentication required.", 401);
    }

    return NextResponse.json({ user: serializeUser(user) });
  } catch (error) {
    console.error("[api/admin/me]", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

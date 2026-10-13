import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { audit, authErrorResponse, requireAdmin } from "@/lib/auth";
import { badRequest, notFound, parseId } from "@/app/api/_lib/http";

/** DELETE /api/admin/blocked-dates/[id] — un-block a single date. */
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAdmin(req, "CONTENT_MANAGER");

    const { id } = await params;
    const numId = parseId(id);
    if (numId === null) return badRequest("Invalid id.");

    const existing = await db.blockedDate.findUnique({ where: { id: numId } });
    if (!existing) return notFound("Blocked date not found.");

    await db.blockedDate.delete({ where: { id: numId } });
    await audit(user.id, "blockedDate.delete", "blocked_date", numId);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return authErrorResponse(error);
  }
}

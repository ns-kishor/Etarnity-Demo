import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { audit, authErrorResponse, requireAdmin } from "@/lib/auth";
import { badRequest, notFound, parseId, readJsonBody } from "@/app/api/_lib/http";
import { bookingPatchSchema } from "@/app/api/_lib/schemas";
import { minuteLabel } from "@/lib/bst";

/**
 * PATCH /api/admin/bookings/[id] { status: "CANCELLED" }
 * Cancelling frees the slot — the availability engine ignores CANCELLED rows,
 * and a later booking on the same (person, date, minute) resurrects the row.
 */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAdmin(req, "CONTENT_MANAGER");

    const { id } = await params;
    const numId = parseId(id);
    if (numId === null) return badRequest("Invalid id.");

    const parsed = await readJsonBody(req, bookingPatchSchema);
    if (!parsed.ok) return parsed.response;

    const existing = await db.booking.findUnique({ where: { id: numId } });
    if (!existing) return notFound("Booking not found.");

    const updated = await db.booking.update({
      where: { id: numId },
      data: { status: parsed.data.status },
    });

    await audit(user.id, "booking.cancel", "booking", numId);
    return NextResponse.json({
      id: updated.id,
      status: updated.status,
      date: updated.date,
      startMinute: updated.startMinute,
      label: minuteLabel(updated.startMinute),
    });
  } catch (error) {
    return authErrorResponse(error);
  }
}

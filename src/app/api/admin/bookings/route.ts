import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { authErrorResponse, requireAdmin } from "@/lib/auth";
import { badRequest } from "@/app/api/_lib/http";
import { minuteLabel } from "@/lib/bst";
import type { AdminBooking } from "@/lib/types";

/**
 * GET /api/admin/bookings?personId=N (personId optional → all founders)
 * → AdminBooking[] ordered by date desc, then startMinute desc.
 */
export async function GET(req: Request) {
  try {
    await requireAdmin(req, "VIEWER");

    const { searchParams } = new URL(req.url);
    const personIdRaw = searchParams.get("personId");

    let personId: number | undefined;
    if (personIdRaw !== null && personIdRaw !== "") {
      const n = Number(personIdRaw);
      if (!Number.isInteger(n) || n < 1) {
        return badRequest("personId must be a valid id.");
      }
      const person = await db.person.findUnique({
        where: { id: n },
        select: { id: true },
      });
      if (!person) return badRequest("Person not found.");
      personId = n;
    }

    const rows = await db.booking.findMany({
      where: personId ? { personId } : undefined,
      include: { person: { select: { name: true, slug: true } } },
      orderBy: [{ date: "desc" }, { startMinute: "desc" }, { id: "desc" }],
    });

    const bookings: AdminBooking[] = rows.map((b) => ({
      id: b.id,
      personId: b.personId,
      founderName: b.person.name,
      founderSlug: b.person.slug,
      date: b.date,
      startMinute: b.startMinute,
      label: minuteLabel(b.startMinute),
      durationMinutes: b.durationMinutes,
      name: b.name,
      email: b.email,
      mobile: b.mobile,
      status: b.status,
      createdAt: b.createdAt.toISOString(),
    }));

    return NextResponse.json(bookings);
  } catch (error) {
    return authErrorResponse(error);
  }
}

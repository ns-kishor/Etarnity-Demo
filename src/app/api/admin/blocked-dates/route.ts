import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { audit, authErrorResponse, requireAdmin } from "@/lib/auth";
import { badRequest, readJsonBody } from "@/app/api/_lib/http";
import { blockedDateCreateSchema } from "@/app/api/_lib/schemas";
import { isValidBstDate } from "@/lib/bst";

/**
 * POST /api/admin/blocked-dates { personId, date, note? }
 * Upsert on (personId, date) — re-posting a date updates its note.
 */
export async function POST(req: Request) {
  try {
    const user = await requireAdmin(req, "CONTENT_MANAGER");

    const parsed = await readJsonBody(req, blockedDateCreateSchema);
    if (!parsed.ok) return parsed.response;
    const { personId, date, note } = parsed.data;

    if (!isValidBstDate(date)) {
      return badRequest("Date is not a valid calendar date.");
    }

    const person = await db.person.findUnique({
      where: { id: personId },
      select: { id: true, isFounder: true },
    });
    if (!person || !person.isFounder) {
      return badRequest("Founder not found.");
    }

    const saved = await db.blockedDate.upsert({
      where: { personId_date: { personId, date } },
      create: { personId, date, note: note ?? null },
      update: { note: note ?? null },
    });

    await audit(user.id, "blockedDate.upsert", "blocked_date", saved.id);
    return NextResponse.json(saved);
  } catch (error) {
    return authErrorResponse(error);
  }
}

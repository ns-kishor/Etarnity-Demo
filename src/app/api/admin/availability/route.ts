import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { audit, authErrorResponse, requireAdmin } from "@/lib/auth";
import { badRequest, notFound, readJsonBody } from "@/app/api/_lib/http";
import { availabilityPutSchema } from "@/app/api/_lib/schemas";
import type {
  FounderAvailabilityRule,
  FounderBlockedDate,
} from "@/lib/types";

/** Default entry used for weekdays with no stored rule. */
function defaultRule(dayOfWeek: number): FounderAvailabilityRule {
  return {
    dayOfWeek,
    startMinute: 600, // 10:00
    endMinute: 1020, // 17:00
    slotMinutes: 30,
    bufferMinutes: 15,
    isActive: false,
  };
}

/**
 * GET /api/admin/availability?personId=N
 * → { personId, rules: FounderAvailabilityRule[7] (index 0 = Sunday),
 *     blockedDates: FounderBlockedDate[] }
 */
export async function GET(req: Request) {
  try {
    await requireAdmin(req, "VIEWER");

    const { searchParams } = new URL(req.url);
    const personId = Number(searchParams.get("personId"));
    if (!Number.isInteger(personId) || personId < 1) {
      return badRequest("A valid personId query parameter is required.");
    }

    const person = await db.person.findUnique({
      where: { id: personId },
      select: { id: true, isFounder: true },
    });
    if (!person || !person.isFounder) return notFound("Founder not found.");

    const [ruleRows, blockedRows] = await Promise.all([
      db.availabilityRule.findMany({ where: { personId } }),
      db.blockedDate.findMany({
        where: { personId },
        orderBy: { date: "asc" },
      }),
    ]);

    const rules: FounderAvailabilityRule[] = Array.from(
      { length: 7 },
      (_, day) => {
        const row = ruleRows.find((r) => r.dayOfWeek === day);
        if (!row) return defaultRule(day);
        return {
          dayOfWeek: row.dayOfWeek,
          startMinute: row.startMinute,
          endMinute: row.endMinute,
          slotMinutes: row.slotMinutes,
          bufferMinutes: row.bufferMinutes,
          isActive: row.isActive,
        };
      }
    );

    const blockedDates: FounderBlockedDate[] = blockedRows.map((b) => ({
      id: b.id,
      date: b.date,
      note: b.note,
    }));

    return NextResponse.json({ personId, rules, blockedDates });
  } catch (error) {
    return authErrorResponse(error);
  }
}

/**
 * PUT /api/admin/availability { personId, rules: FounderAvailabilityRule[7] }
 * Replace-all strategy: every stored rule for the person is deleted and the
 * submitted 7 weekday entries are created inside one transaction.
 */
export async function PUT(req: Request) {
  try {
    const user = await requireAdmin(req, "CONTENT_MANAGER");

    const parsed = await readJsonBody(req, availabilityPutSchema);
    if (!parsed.ok) return parsed.response;
    const { personId, rules } = parsed.data;

    const person = await db.person.findUnique({
      where: { id: personId },
      select: { id: true, isFounder: true },
    });
    if (!person || !person.isFounder) return notFound("Founder not found.");

    await db.$transaction([
      db.availabilityRule.deleteMany({ where: { personId } }),
      db.availabilityRule.createMany({
        data: rules.map((r) => ({
          personId,
          dayOfWeek: r.dayOfWeek,
          startMinute: r.startMinute,
          endMinute: r.endMinute,
          slotMinutes: r.slotMinutes,
          bufferMinutes: r.bufferMinutes,
          isActive: r.isActive,
        })),
      }),
    ]);

    await audit(user.id, "availability.update", "person", personId);

    const ruleRows = await db.availabilityRule.findMany({ where: { personId } });
    const serialized: FounderAvailabilityRule[] = Array.from(
      { length: 7 },
      (_, day) => {
        const row = ruleRows.find((r) => r.dayOfWeek === day);
        if (!row) return defaultRule(day);
        return {
          dayOfWeek: row.dayOfWeek,
          startMinute: row.startMinute,
          endMinute: row.endMinute,
          slotMinutes: row.slotMinutes,
          bufferMinutes: row.bufferMinutes,
          isActive: row.isActive,
        };
      }
    );
    return NextResponse.json({ personId, rules: serialized });
  } catch (error) {
    return authErrorResponse(error);
  }
}

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import {
  badRequest,
  isUniqueConstraintError,
  jsonError,
  notFound,
  tooManyRequests,
  readJsonBody,
} from "@/app/api/_lib/http";
import { bookingCreateSchema } from "@/app/api/_lib/schemas";
import { computeSlotsForDate, type BookedInterval } from "@/lib/availability";
import {
  addDaysBst,
  bstDayOfWeek,
  bstNow,
  compareBstDates,
  isValidBstDate,
  minuteLabel,
} from "@/lib/bst";
import type { BookingResult, FounderAvailabilityRule } from "@/lib/types";

/** Booking horizon (shared with the availability route). */
const BOOKING_HORIZON_DAYS = 90;

const BOOKING_RATE_LIMIT = 5; // requests …
const BOOKING_RATE_WINDOW_MS = 10 * 60 * 1000; // … per 10 minutes per IP

/** Marker thrown out of the create transaction on a unique-constraint hit. */
class BookingDuplicateError extends Error {}

type TxOutcome =
  | { kind: "created"; row: { id: number; durationMinutes: number } }
  | { kind: "notOffered" }
  | { kind: "blocked" }
  | { kind: "taken" }
  | { kind: "duplicate" };

function toRule(row: {
  dayOfWeek: number;
  startMinute: number;
  endMinute: number;
  slotMinutes: number;
  bufferMinutes: number;
  isActive: boolean;
}): FounderAvailabilityRule {
  return {
    dayOfWeek: row.dayOfWeek,
    startMinute: row.startMinute,
    endMinute: row.endMinute,
    slotMinutes: row.slotMinutes,
    bufferMinutes: row.bufferMinutes,
    isActive: row.isActive,
  };
}

function toInterval(row: {
  startMinute: number;
  durationMinutes: number;
  status: string;
}): BookedInterval {
  return {
    startMinute: row.startMinute,
    durationMinutes: row.durationMinutes,
    status: row.status,
  };
}

/**
 * POST /api/public/bookings — book a meeting with a founder.
 *
 * Race safety: the unique constraint on (personId, date, startMinute) is the
 * source of truth. Validation + the create attempt run inside one interactive
 * transaction; a constraint hit rolls it back and falls through to a
 * conditional updateMany that can only resurrect a CANCELLED row when this
 * request wins the race.
 */
export async function POST(req: Request) {
  try {
    const parsed = await readJsonBody(req, bookingCreateSchema);
    if (!parsed.ok) return parsed.response;
    const body = parsed.data;

    const ip = getClientIp(req);
    const limit = rateLimit(
      `bookings:${ip}`,
      BOOKING_RATE_LIMIT,
      BOOKING_RATE_WINDOW_MS
    );
    if (!limit.allowed) {
      return tooManyRequests(
        "Too many booking requests. Please try again later.",
        limit.retryAfterSeconds
      );
    }

    const founder = await db.person.findFirst({
      where: { slug: body.founderSlug, isPublic: true, isFounder: true },
      select: { id: true, slug: true, name: true },
    });
    if (!founder) return notFound("Founder not found.");

    if (!isValidBstDate(body.date)) {
      return badRequest("Date is not a valid calendar date.");
    }
    const nowBst = bstNow();
    const today = nowBst.date;
    if (compareBstDates(body.date, today) < 0) {
      return badRequest("That date has already passed.");
    }
    if (compareBstDates(body.date, addDaysBst(today, BOOKING_HORIZON_DAYS)) > 0) {
      return badRequest(
        `Bookings are only available within the next ${BOOKING_HORIZON_DAYS} days.`
      );
    }

    const dow = bstDayOfWeek(body.date)!;

    /* ----- atomic validation + create attempt ----- */
    const outcome: TxOutcome = await db
      .$transaction(async (tx) => {
        const ruleRows = await tx.availabilityRule.findMany({
          where: { personId: founder.id },
        });
        const ruleRow = ruleRows.find((r) => r.dayOfWeek === dow) ?? null;

        const onGrid =
          ruleRow !== null &&
          ruleRow.isActive &&
          body.startMinute >= ruleRow.startMinute &&
          body.startMinute + ruleRow.slotMinutes <= ruleRow.endMinute &&
          (body.startMinute - ruleRow.startMinute) % ruleRow.slotMinutes === 0;
        if (!onGrid) return { kind: "notOffered" } as const;

        const blocked = await tx.blockedDate.findUnique({
          where: { personId_date: { personId: founder.id, date: body.date } },
        });
        if (blocked) return { kind: "blocked" } as const;

        const bookings = await tx.booking.findMany({
          where: { personId: founder.id, date: body.date, status: "CONFIRMED" },
        });
        const slots = computeSlotsForDate(
          toRule(ruleRow!),
          bookings.map(toInterval),
          body.date,
          nowBst
        );
        const slot = slots.find((s) => s.minute === body.startMinute);
        if (!slot || !slot.available) return { kind: "taken" } as const;

        try {
          const row = await tx.booking.create({
            data: {
              personId: founder.id,
              date: body.date,
              startMinute: body.startMinute,
              durationMinutes: ruleRow!.slotMinutes,
              status: "CONFIRMED",
              name: body.name,
              email: body.email,
              mobile: body.mobile,
            },
            select: { id: true, durationMinutes: true },
          });
          return { kind: "created", row } as const;
        } catch (e) {
          if (isUniqueConstraintError(e)) throw new BookingDuplicateError();
          throw e;
        }
      })
      .catch((e) => {
        if (e instanceof BookingDuplicateError) {
          return { kind: "duplicate" } as const;
        }
        throw e;
      });

    const success = (id: number, durationMinutes: number): NextResponse<BookingResult> =>
      NextResponse.json(
        {
          reference: `ET-${String(id).padStart(5, "0")}`,
          founderName: founder.name,
          founderSlug: founder.slug,
          date: body.date,
          startMinute: body.startMinute,
          label: minuteLabel(body.startMinute),
          durationMinutes,
        },
        { status: 201 }
      );

    switch (outcome.kind) {
      case "created":
        return success(outcome.row.id, outcome.row.durationMinutes);

      case "notOffered":
        return badRequest("Selected time is not an offered slot.");

      case "blocked":
        return badRequest("This date is not available.");

      case "taken":
        return NextResponse.json(
          { error: "This time slot was just booked. Please choose another." },
          { status: 409 }
        );

      case "duplicate": {
        /* Someone already holds (person, date, minute). A CANCELLED row can
         * be resurrected — updateMany's status filter makes this race-safe:
         * count 1 → this request won it; count 0 → it was re-taken first. */
        const existing = await db.booking.findUnique({
          where: {
            personId_date_startMinute: {
              personId: founder.id,
              date: body.date,
              startMinute: body.startMinute,
            },
          },
        });
        if (existing && existing.status === "CANCELLED") {
          const ruleRows = await db.availabilityRule.findMany({
            where: { personId: founder.id },
          });
          const ruleRow = ruleRows.find((r) => r.dayOfWeek === dow);
          const duration = ruleRow?.slotMinutes ?? existing.durationMinutes;
          const res = await db.booking.updateMany({
            where: { id: existing.id, status: "CANCELLED" },
            data: {
              status: "CONFIRMED",
              name: body.name,
              email: body.email,
              mobile: body.mobile,
              durationMinutes: duration,
            },
          });
          if (res.count === 1) {
            return success(existing.id, duration);
          }
        }
        return NextResponse.json(
          { error: "This time slot was just booked. Please choose another." },
          { status: 409 }
        );
      }
    }
  } catch (error) {
    console.error("[api/public/bookings]", error);
    return jsonError("Internal server error.", 500);
  }
}

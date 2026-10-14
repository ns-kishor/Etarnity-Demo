import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { badRequest, jsonError, notFound, tooManyRequests } from "@/app/api/_lib/http";
import {
  BST_TIMEZONE_LABEL,
  addDaysBst,
  bstDayOfWeek,
  bstNow,
  compareBstDates,
  isValidBstDate,
} from "@/lib/bst";
import { computeSlotsForDate, type BookedInterval } from "@/lib/availability";
import type {
  AvailabilityDayResult,
  AvailabilityMonthResult,
  FounderAvailabilityRule,
} from "@/lib/types";

/** Booking horizon: dates may be looked up up to 90 days ahead (BST). */
export const BOOKING_HORIZON_DAYS = 90;

const MONTH_RE = /^\d{4}-(0[1-9]|1[0-2])$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

type RuleRow = {
  dayOfWeek: number;
  startMinute: number;
  endMinute: number;
  slotMinutes: number;
  bufferMinutes: number;
  isActive: boolean;
};

function toRule(row: RuleRow): FounderAvailabilityRule {
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
 * GET /api/public/availability?founder=<slug>&month=YYYY-MM
 * GET /api/public/availability?founder=<slug>&date=YYYY-MM-DD
 *
 * - month mode → dates of that month (BST) that still have ≥1 bookable slot.
 * - date mode  → the slot grid for that date (BST).
 * All times are Bangladesh Standard Time (UTC+06:00).
 */
export async function GET(req: Request) {
  try {
    const ip = getClientIp(req);
    const limit = rateLimit(`availability:${ip}`, 60, 60_000);
    if (!limit.allowed) {
      return tooManyRequests(
        "Too many requests. Please slow down.",
        limit.retryAfterSeconds
      );
    }

    const { searchParams } = new URL(req.url);
    const founderSlug = searchParams.get("founder");
    if (!founderSlug) return badRequest("Founder parameter is required.");

    const month = searchParams.get("month");
    const date = searchParams.get("date");
    if (!month && !date) {
      return badRequest("Provide either a month (YYYY-MM) or a date (YYYY-MM-DD).");
    }
    if (month && date) {
      return badRequest("Provide either a month or a date, not both.");
    }

    const founder = await db.person.findFirst({
      where: { slug: founderSlug, isPublic: true, isFounder: true },
      select: { id: true, slug: true },
    });
    if (!founder) return notFound("Founder not found.");

    const nowBst = bstNow();
    const today = nowBst.date;
    const maxDate = addDaysBst(today, BOOKING_HORIZON_DAYS);

    if (date) {
      /* ---------- date mode: slot grid for one day ---------- */
      if (!DATE_RE.test(date)) return badRequest("Date must be in YYYY-MM-DD format.");
      if (!isValidBstDate(date)) return badRequest("Date is not a valid calendar date.");
      if (compareBstDates(date, today) < 0) {
        return badRequest("That date has already passed.");
      }
      if (compareBstDates(date, maxDate) > 0) {
        return badRequest(
          `Bookings are only available within the next ${BOOKING_HORIZON_DAYS} days.`
        );
      }

      const [rules, blocked, bookings] = await Promise.all([
        db.availabilityRule.findMany({ where: { personId: founder.id } }),
        db.blockedDate.findUnique({
          where: { personId_date: { personId: founder.id, date } },
        }),
        db.booking.findMany({
          where: { personId: founder.id, date, status: "CONFIRMED" },
        }),
      ]);

      const hasActiveRules = rules.some((r) => r.isActive);
      if (!hasActiveRules) {
        const result: AvailabilityDayResult = {
          founderSlug: founder.slug,
          date,
          timezone: BST_TIMEZONE_LABEL,
          notConfigured: true,
          slots: [],
        };
        return NextResponse.json(result);
      }

      const dow = bstDayOfWeek(date)!;
      const ruleRow = rules.find((r) => r.dayOfWeek === dow) ?? null;
      let slots = computeSlotsForDate(
        ruleRow ? toRule(ruleRow) : null,
        bookings.map(toInterval),
        date,
        nowBst
      );
      if (blocked) {
        // Whole day blocked by the founder — keep the grid but disable it.
        slots = slots.map((s) => ({ ...s, available: false }));
      }

      const result: AvailabilityDayResult = {
        founderSlug: founder.slug,
        date,
        timezone: BST_TIMEZONE_LABEL,
        notConfigured: false,
        slots,
      };
      return NextResponse.json(result);
    }

    /* ---------- month mode: dates with ≥1 bookable slot ---------- */
    const monthValue = month!;
    if (!MONTH_RE.test(monthValue)) {
      return badRequest("Month must be in YYYY-MM format.");
    }
    const [year, monthNum] = monthValue.split("-").map(Number);
    const daysInMonth = new Date(Date.UTC(year, monthNum, 0)).getUTCDate();
    const firstDay = `${monthValue}-01`;
    const lastDay = `${monthValue}-${String(daysInMonth).padStart(2, "0")}`;

    const [rules, blockedDates, bookings] = await Promise.all([
      db.availabilityRule.findMany({ where: { personId: founder.id } }),
      db.blockedDate.findMany({
        where: { personId: founder.id, date: { gte: firstDay, lte: lastDay } },
      }),
      db.booking.findMany({
        where: {
          personId: founder.id,
          date: { gte: firstDay, lte: lastDay },
          status: "CONFIRMED",
        },
      }),
    ]);

    const blockedSet = new Set(blockedDates.map((b) => b.date));
    const bookingsByDate = new Map<string, BookedInterval[]>();
    for (const b of bookings) {
      const list = bookingsByDate.get(b.date) ?? [];
      list.push(toInterval(b));
      bookingsByDate.set(b.date, list);
    }

    const dates: string[] = [];
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${monthValue}-${String(day).padStart(2, "0")}`;
      if (compareBstDates(dateStr, today) < 0) continue;
      if (compareBstDates(dateStr, maxDate) > 0) continue;
      if (blockedSet.has(dateStr)) continue;
      const dow = bstDayOfWeek(dateStr)!;
      const rule = rules.find((r) => r.dayOfWeek === dow) ?? null;
      if (!rule) continue;
      const slots = computeSlotsForDate(
        toRule(rule),
        bookingsByDate.get(dateStr) ?? [],
        dateStr,
        nowBst
      );
      if (slots.some((s) => s.available)) dates.push(dateStr);
    }

    const result: AvailabilityMonthResult = {
      founderSlug: founder.slug,
      month: monthValue,
      timezone: BST_TIMEZONE_LABEL,
      dates,
    };
    return NextResponse.json(result);
  } catch (error) {
    console.error("[api/public/availability]", error);
    return jsonError("Internal server error.", 500);
  }
}

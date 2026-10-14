import type { FounderAvailabilityRule } from "./types";
import { compareBstDates, minuteLabel, type BstNow } from "./bst";

/**
 * Availability slot engine — pure & synchronous.
 *
 * All times are minutes from BST midnight; dates are "YYYY-MM-DD" BST strings.
 */

/** A booking occupying time on a date (status filters to CONFIRMED inside). */
export interface BookedInterval {
  startMinute: number;
  durationMinutes: number;
  status: string;
}

export interface ComputedSlot {
  minute: number;
  label: string;
  available: boolean;
}

/**
 * Compute the slot grid for one founder on one date.
 *
 * - No rule / inactive rule → [] (nothing offered that day).
 * - Grid: every `slotMinutes` step where the whole slot fits inside
 *   [startMinute, endMinute].
 * - Date entirely in the past (BST) → every slot present but unavailable.
 * - Today (BST) → a slot is available only when it starts strictly after
 *   the current minute.
 * - A slot is unavailable when it overlaps any CONFIRMED booking expanded
 *   by the rule's `bufferMinutes` on both sides:
 *   slotStart < bStart + bDur + buffer && bStart - buffer < slotStart + slot.
 *
 * Blocked dates are NOT handled here (they are a whole-day concern for the
 * routes) — pass bookings for the date and the weekday's rule.
 */
export function computeSlotsForDate(
  rule: FounderAvailabilityRule | null,
  bookings: BookedInterval[],
  dateStr: string,
  nowBst: BstNow
): ComputedSlot[] {
  if (!rule || !rule.isActive) return [];

  const confirmed = bookings.filter((b) => b.status === "CONFIRMED");
  const cmp = compareBstDates(dateStr, nowBst.date);
  const isPast = cmp < 0;
  const isToday = cmp === 0;

  const slots: ComputedSlot[] = [];
  for (
    let m = rule.startMinute;
    m + rule.slotMinutes <= rule.endMinute;
    m += rule.slotMinutes
  ) {
    let available = true;
    if (isPast) {
      available = false;
    } else if (isToday && m <= nowBst.minutes) {
      available = false;
    }
    if (available) {
      for (const b of confirmed) {
        const bStart = b.startMinute;
        const bEnd = b.startMinute + b.durationMinutes;
        if (
          m < bEnd + rule.bufferMinutes &&
          bStart - rule.bufferMinutes < m + rule.slotMinutes
        ) {
          available = false;
          break;
        }
      }
    }
    slots.push({ minute: m, label: minuteLabel(m), available });
  }
  return slots;
}

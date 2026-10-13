/**
 * Bangladesh Standard Time (BST, UTC+06:00) helpers.
 *
 * Every date in the booking system is a "YYYY-MM-DD" string in BST and every
 * time is "minutes from BST midnight". Bangladesh observes no DST, so all
 * arithmetic is pure UTC math — no date libraries needed.
 *
 * Implementation note: parse → epoch via Date.UTC → add the fixed offset →
 * read back with the getUTC* getters.
 */

export const BST_OFFSET_MINUTES = 360; // UTC+06:00

/** Human-readable timezone label used in API responses. */
export const BST_TIMEZONE_LABEL = "Asia/Dhaka (UTC+06:00)";

export interface BstNow {
  date: string; // "YYYY-MM-DD" (BST)
  minutes: number; // minutes from BST midnight
  dayOfWeek: number; // 0 = Sunday … 6 = Saturday
}

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

function formatDate(y: number, m: number, d: number): string {
  return `${String(y).padStart(4, "0")}-${pad2(m)}-${pad2(d)}`;
}

/** Current BST date/time. Pass `nowMs` to make it deterministic (tests). */
export function bstNow(nowMs?: number): BstNow {
  const shifted = new Date(
    (nowMs ?? Date.now()) + BST_OFFSET_MINUTES * 60_000
  );
  return {
    date: formatDate(
      shifted.getUTCFullYear(),
      shifted.getUTCMonth() + 1,
      shifted.getUTCDate()
    ),
    minutes: shifted.getUTCHours() * 60 + shifted.getUTCMinutes(),
    dayOfWeek: shifted.getUTCDay(),
  };
}

const BST_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Strict "YYYY-MM-DD" validation including real calendar dates
 * (rejects 2025-02-30, 2025-13-01, "2025-1-05", etc.).
 */
export function isValidBstDate(s: string): boolean {
  if (typeof s !== "string" || !BST_DATE_RE.test(s)) return false;
  const [y, m, d] = s.split("-").map(Number);
  if (m < 1 || m > 12) return false;
  if (d < 1 || d > 31) return false;
  // Date.UTC silently normalizes overflow (2025-02-30 → Mar 2) — only a
  // perfect round-trip is a real calendar date.
  const utc = new Date(Date.UTC(y, m - 1, d));
  return (
    utc.getUTCFullYear() === y &&
    utc.getUTCMonth() === m - 1 &&
    utc.getUTCDate() === d
  );
}

/** Day of week (0 = Sunday) for a BST date string, or null when invalid. */
export function bstDayOfWeek(dateStr: string): number | null {
  if (!isValidBstDate(dateStr)) return null;
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}

/** Lexicographic compare — correct for well-formed "YYYY-MM-DD" strings. */
export function compareBstDates(a: string, b: string): number {
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
}

/** Add `n` days to a BST date string (n may be negative). UTC math only. */
export function addDaysBst(dateStr: string, n: number): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const shifted = new Date(Date.UTC(y, m - 1, d) + n * 86_400_000);
  return formatDate(
    shifted.getUTCFullYear(),
    shifted.getUTCMonth() + 1,
    shifted.getUTCDate()
  );
}

/** 600 → "10:00", 930 → "15:30" (24-hour). */
export function minuteLabel(m: number): string {
  return `${pad2(Math.floor(m / 60))}:${pad2(m % 60)}`;
}

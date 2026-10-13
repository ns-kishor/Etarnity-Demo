"use client";

import * as React from "react";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Loader2,
  X,
} from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useApi } from "@/hooks/use-api";
import { addDaysBst, bstNow, compareBstDates } from "@/lib/bst";
import type {
  AvailabilityDayResult,
  AvailabilityMonthResult,
  BookingResult,
} from "@/lib/types";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/* Types & config                                                      */
/* ------------------------------------------------------------------ */

export interface BookingFounder {
  name: string;
  slug: string;
  position: string;
  positionAbbr?: string | null;
}

interface BookingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  founder: BookingFounder;
}

/** Matches the backend booking horizon (see /api/public/availability). */
const BOOKING_HORIZON_DAYS = 90;

const BST_NOTE = "All times are Bangladesh Standard Time (UTC+06:00)";

type Step = 1 | 2 | 3 | 4;

const STEP_LABELS = ["Date", "Time", "Details", "Confirm"] as const;

const STEP_ANNOUNCEMENTS: Record<Step, string> = {
  1: "Select a date",
  2: "Select a time",
  3: "Enter your details",
  4: "Review and confirm",
};

/* ---------- pure date helpers (UTC math only — same rules as lib/bst) ---------- */

const WEEKDAYS_SHORT = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const WEEKDAYS_LONG = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
const MONTHS_LONG = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const MONTHS_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

/** "2026-10-14" → "2026-10" */
function monthOf(dateStr: string): string {
  return dateStr.slice(0, 7);
}

/** Shift a "YYYY-MM" by ±n months. */
function shiftMonth(ym: string, delta: number): string {
  const [y, m] = ym.split("-").map(Number);
  const total = y * 12 + (m - 1) + delta;
  return `${Math.floor(total / 12)}-${pad2((total % 12) + 1)}`;
}

/** "2026-10-15" → "Thursday, 15 Oct 2026" (for review summaries). */
function humanDate(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const dow = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  return `${WEEKDAYS_LONG[dow]}, ${d} ${MONTHS_SHORT[m - 1]} ${y}`;
}

/** "2026-10-15" → "Thursday 15 October 2026" (for day-cell aria-labels). */
function fullDateLabel(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const dow = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  return `${WEEKDAYS_LONG[dow]} ${d} ${MONTHS_LONG[m - 1]} ${y}`;
}

function daysInMonth(ym: string): number {
  const [y, m] = ym.split("-").map(Number);
  return new Date(Date.UTC(y, m, 0)).getUTCDate();
}

/** Weekday (0 = Sunday) of the 1st of the month. */
function firstWeekdayOf(ym: string): number {
  const [y, m] = ym.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, 1)).getUTCDay();
}

/* ---------- form validation (mirrors the server exactly) ---------- */

type FormField = "name" | "email" | "mobile";
type BookingForm = Record<FormField, string>;
type FormErrors = Partial<Record<FormField, string>>;

const EMPTY_FORM: BookingForm = { name: "", email: "", mobile: "" };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MOBILE_RE = /^\+?[0-9][0-9\s\-()]{6,24}$/;

function validateField(field: FormField, value: string): string | null {
  const v = value.trim();
  switch (field) {
    case "name":
      if (v.length < 2 || v.length > 120) {
        return "Please enter your full name (2–120 characters).";
      }
      return null;
    case "email":
      if (!EMAIL_RE.test(v)) return "Please enter a valid email address.";
      return null;
    case "mobile": {
      const digits = (v.match(/\d/g) ?? []).length;
      if (!MOBILE_RE.test(v) || digits < 7) {
        return "Please enter a valid mobile number — at least 7 digits, e.g. +880 1712 345678.";
      }
      return null;
    }
  }
}

function validateForm(form: BookingForm): FormErrors {
  const errors: FormErrors = {};
  for (const field of ["name", "email", "mobile"] as FormField[]) {
    const error = validateField(field, form[field]);
    if (error) errors[field] = error;
  }
  return errors;
}

/* ------------------------------------------------------------------ */
/* Shared bits                                                         */
/* ------------------------------------------------------------------ */

const btnPrimary =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-graphite px-6 py-2.5 text-sm font-medium text-warmwhite transition-colors hover:bg-[#23262D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-warmwhite disabled:cursor-not-allowed disabled:opacity-60";

const btnSecondary =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-hairline bg-white px-6 py-2.5 text-sm font-medium text-graphite transition-colors hover:border-graphite focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-warmwhite disabled:cursor-not-allowed disabled:opacity-50";

/** Step panels fade/rise ~8px over 200ms — CSS only, and the site-wide
 * prefers-reduced-motion kill-switch in globals.css neutralizes it. */
const stepPanelClass =
  "animate-in fade-in-0 slide-in-from-bottom-2 duration-200 motion-reduce:animate-none";

function StepHeading({
  headingRef,
  children,
}: {
  headingRef: React.RefObject<HTMLHeadingElement | null>;
  children: React.ReactNode;
}) {
  return (
    <h3
      ref={headingRef}
      tabIndex={-1}
      className="text-lg font-semibold tracking-[-0.01em] text-graphite focus:outline-none"
    >
      {children}
    </h3>
  );
}

/** Compact inline error panel with a retry action (availability fetches). */
function FetchError({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div
      role="alert"
      className="rounded-xl border border-hairline bg-warmwhite px-5 py-6 text-center"
    >
      <AlertTriangle
        className="mx-auto size-5 text-ink-soft"
        aria-hidden="true"
      />
      <p className="mt-2 text-sm leading-relaxed text-ink-soft">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-4 inline-flex min-h-11 items-center justify-center rounded-full border border-hairline bg-white px-6 text-sm font-medium text-graphite transition-colors hover:border-graphite focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-warmwhite"
      >
        Try again
      </button>
    </div>
  );
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} role="alert" className="mt-1.5 text-xs text-red-600">
      {message}
    </p>
  );
}

/* ------------------------------------------------------------------ */
/* Step 1 — date calendar                                              */
/* ------------------------------------------------------------------ */

function DateStep({
  headingRef,
  founderName,
  viewMonth,
  bounds,
  data,
  loading,
  error,
  onRetry,
  selectedDate,
  onSelectDate,
  onMonthChange,
}: {
  headingRef: React.RefObject<HTMLHeadingElement | null>;
  founderName: string;
  viewMonth: string;
  bounds: { today: string; horizon: string };
  data: AvailabilityMonthResult | undefined;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  selectedDate: string | null;
  onSelectDate: (dateStr: string) => void;
  onMonthChange: (delta: number) => void;
}) {
  const [year, month] = viewMonth.split("-").map(Number);
  const availableSet = new Set(data?.dates ?? []);
  const prevDisabled = viewMonth <= monthOf(bounds.today);
  const nextDisabled = shiftMonth(viewMonth, 1) > monthOf(bounds.horizon);
  const leadingBlanks = firstWeekdayOf(viewMonth);
  const dayCount = daysInMonth(viewMonth);

  return (
    <section
      aria-label="Step 1 of 4 — select a date"
      className={stepPanelClass}
    >
      <StepHeading headingRef={headingRef}>Select a date</StepHeading>
      <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">
        Choose an available day for your meeting with {founderName}.
      </p>

      <div className="mt-5 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => onMonthChange(-1)}
          disabled={prevDisabled}
          aria-label="Previous month"
          className="flex size-11 shrink-0 items-center justify-center rounded-full border border-hairline bg-white text-ink-soft transition-colors hover:border-graphite hover:text-graphite focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-warmwhite disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft className="size-4" aria-hidden="true" />
        </button>
        <p
          aria-live="polite"
          className="font-mono text-[11px] uppercase tracking-[0.18em] text-graphite"
        >
          {MONTHS_LONG[month - 1]} {year}
        </p>
        <button
          type="button"
          onClick={() => onMonthChange(1)}
          disabled={nextDisabled}
          aria-label="Next month"
          className="flex size-11 shrink-0 items-center justify-center rounded-full border border-hairline bg-white text-ink-soft transition-colors hover:border-graphite hover:text-graphite focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-warmwhite disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronRight className="size-4" aria-hidden="true" />
        </button>
      </div>

      {loading && !data ? (
        <div className="mt-4">
          <div
            className="grid grid-cols-7 gap-1"
            role="status"
            aria-label="Loading availability"
          >
            {Array.from({ length: 35 }).map((_, i) => (
              <div
                key={i}
                className="h-10 animate-pulse rounded-lg bg-hairline/70 md:h-11"
              />
            ))}
          </div>
        </div>
      ) : error ? (
        <div className="mt-4">
          <FetchError message={error} onRetry={onRetry} />
        </div>
      ) : (
        <div className="mt-4">
          <div className="grid grid-cols-7 gap-1" aria-hidden="true">
            {WEEKDAYS_SHORT.map((day) => (
              <div
                key={day}
                className="flex h-6 items-center justify-center font-mono text-[9px] uppercase tracking-[0.15em] text-ink-soft/70"
              >
                {day}
              </div>
            ))}
          </div>
          <div className="mt-1.5 grid grid-cols-7 gap-1">
            {Array.from({ length: leadingBlanks }).map((_, i) => (
              <div key={`blank-${i}`} aria-hidden="true" />
            ))}
            {Array.from({ length: dayCount }).map((_, i) => {
              const day = i + 1;
              const dateStr = `${viewMonth}-${pad2(day)}`;
              const isToday = dateStr === bounds.today;
              const isSelected = dateStr === selectedDate;
              const isAvailable = availableSet.has(dateStr);
              return (
                <button
                  key={dateStr}
                  type="button"
                  disabled={!isAvailable}
                  onClick={() => onSelectDate(dateStr)}
                  aria-pressed={isSelected}
                  aria-label={`${fullDateLabel(dateStr)} — ${
                    isAvailable ? "available" : "unavailable"
                  }${isToday ? ", today" : ""}`}
                  className={cn(
                    "flex h-10 w-full items-center justify-center rounded-lg text-sm transition-colors md:h-11",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric",
                    isToday && "ring-1 ring-inset ring-electric/60",
                    isAvailable
                      ? isSelected
                        ? "bg-electric font-medium text-white hover:bg-electric hover:text-white"
                        : "text-graphite hover:bg-electric/10 hover:text-electric"
                      : "cursor-not-allowed text-ink-soft/40"
                  )}
                >
                  {day}
                </button>
              );
            })}
          </div>
          <p className="mt-4 text-xs leading-relaxed text-ink-soft">
            Dates shown are the next {BOOKING_HORIZON_DAYS} days with open
            meeting times.
          </p>
        </div>
      )}
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Step 2 — time slots                                                 */
/* ------------------------------------------------------------------ */

function TimeStep({
  headingRef,
  founderName,
  date,
  data,
  loading,
  error,
  onRetry,
  selectedSlot,
  onSelectSlot,
  onBack,
  conflict,
}: {
  headingRef: React.RefObject<HTMLHeadingElement | null>;
  founderName: string;
  date: string;
  data: AvailabilityDayResult | undefined;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  selectedSlot: { minute: number; label: string } | null;
  onSelectSlot: (slot: { minute: number; label: string }) => void;
  onBack: () => void;
  conflict: boolean;
}) {
  const slots = data?.slots ?? [];
  const anyAvailable = slots.some((slot) => slot.available);

  return (
    <section aria-label="Step 2 of 4 — select a time" className={stepPanelClass}>
      <StepHeading headingRef={headingRef}>Select a time</StepHeading>
      <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">
        {humanDate(date)} — meeting with {founderName}.
      </p>

      <button
        type="button"
        onClick={onBack}
        className="mt-3 inline-flex min-h-11 items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-electric transition-colors hover:text-graphite focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-warmwhite"
      >
        <ArrowLeft className="size-3.5" aria-hidden="true" />
        Change date
      </button>

      {conflict ? (
        <div
          role="alert"
          className="mt-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm leading-relaxed text-red-700"
        >
          This time slot was just booked. Please choose another.
        </div>
      ) : null}

      {loading && !data ? (
        <div className="mt-4" role="status" aria-label="Loading time slots">
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="h-11 animate-pulse rounded-lg bg-hairline/70"
              />
            ))}
          </div>
        </div>
      ) : error ? (
        <div className="mt-4">
          <FetchError message={error} onRetry={onRetry} />
        </div>
      ) : data && data.notConfigured ? (
        <div className="mt-4 rounded-xl border border-hairline bg-warmwhite px-5 py-6 text-center">
          <Clock className="mx-auto size-5 text-ink-soft" aria-hidden="true" />
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">
            Availability has not been configured yet.
          </p>
          <p className="mt-1 text-xs text-ink-soft">
            Please check back later — no meeting times have been published.
          </p>
        </div>
      ) : slots.length === 0 ? (
        <div className="mt-4 rounded-xl border border-hairline bg-warmwhite px-5 py-6 text-center">
          <Clock className="mx-auto size-5 text-ink-soft" aria-hidden="true" />
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">
            No meeting times on this date.
          </p>
          <button
            type="button"
            onClick={onBack}
            className="mt-4 inline-flex min-h-11 items-center justify-center rounded-full border border-hairline bg-white px-6 text-sm font-medium text-graphite transition-colors hover:border-graphite focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-warmwhite"
          >
            Choose another date
          </button>
        </div>
      ) : (
        <div className="mt-4">
          {!anyAvailable ? (
            <p className="mb-3 rounded-lg border border-hairline bg-warmwhite px-4 py-3 text-sm leading-relaxed text-ink-soft">
              No available times on this date — please choose another day.
            </p>
          ) : null}
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {slots.map((slot) => {
              const isSelected = selectedSlot?.minute === slot.minute;
              return (
                <button
                  key={slot.minute}
                  type="button"
                  disabled={!slot.available}
                  onClick={() => onSelectSlot(slot)}
                  aria-pressed={isSelected}
                  className={cn(
                    "flex min-h-11 items-center justify-center rounded-lg border px-2 text-sm transition-colors",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-1",
                    slot.available
                      ? isSelected
                        ? "border-electric bg-electric font-medium text-white"
                        : "border-hairline bg-white text-graphite hover:border-electric hover:text-electric"
                      : "cursor-not-allowed border-hairline bg-warmwhite text-ink-soft/50 line-through decoration-ink-soft/40"
                  )}
                >
                  {slot.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <p className="mt-5 flex items-center gap-2 font-mono text-[10px] uppercase leading-relaxed tracking-[0.12em] text-ink-soft">
        <Clock className="size-3.5 shrink-0" aria-hidden="true" />
        {BST_NOTE}
      </p>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Step 3 — visitor details                                            */
/* ------------------------------------------------------------------ */

function DetailsStep({
  headingRef,
  founderName,
  form,
  errors,
  onChange,
  onBlurField,
  onBack,
  onSubmit,
}: {
  headingRef: React.RefObject<HTMLHeadingElement | null>;
  founderName: string;
  form: BookingForm;
  errors: FormErrors;
  onChange: (field: FormField, value: string) => void;
  onBlurField: (field: FormField) => void;
  onBack: () => void;
  onSubmit: React.FormEventHandler<HTMLFormElement>;
}) {
  const inputClass = (invalid: boolean) =>
    cn(
      "h-11 rounded-lg border-hairline bg-warmwhite px-4 text-sm text-graphite shadow-none transition placeholder:text-ink-soft",
      "focus-visible:border-electric focus-visible:ring-2 focus-visible:ring-electric focus-visible:outline-none",
      invalid ? "border-red-300" : undefined
    );

  return (
    <section
      aria-label="Step 3 of 4 — your details"
      className={stepPanelClass}
    >
      <StepHeading headingRef={headingRef}>Your details</StepHeading>
      <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">
        Shared with {founderName} for the meeting.
      </p>

      <form onSubmit={onSubmit} noValidate className="mt-5">
        <div className="space-y-5">
          <div>
            <label
              htmlFor="booking-name"
              className="mb-1.5 block text-xs font-medium text-graphite"
            >
              Full Name<span className="ml-0.5 text-electric" aria-hidden="true">*</span>
            </label>
            <Input
              id="booking-name"
              name="name"
              type="text"
              autoComplete="name"
              value={form.name}
              onChange={(e) => onChange("name", e.target.value)}
              onBlur={() => onBlurField("name")}
              aria-invalid={Boolean(errors.name)}
              aria-describedby={errors.name ? "booking-name-error" : undefined}
              placeholder="Your name"
              className={inputClass(Boolean(errors.name))}
            />
            <FieldError id="booking-name-error" message={errors.name} />
          </div>

          <div>
            <label
              htmlFor="booking-mobile"
              className="mb-1.5 block text-xs font-medium text-graphite"
            >
              Mobile Number
              <span className="ml-0.5 text-electric" aria-hidden="true">*</span>
            </label>
            <Input
              id="booking-mobile"
              name="mobile"
              type="tel"
              autoComplete="tel"
              value={form.mobile}
              onChange={(e) => onChange("mobile", e.target.value)}
              onBlur={() => onBlurField("mobile")}
              aria-invalid={Boolean(errors.mobile)}
              aria-describedby={errors.mobile ? "booking-mobile-error" : undefined}
              placeholder="+880 1712 345678"
              className={inputClass(Boolean(errors.mobile))}
            />
            <FieldError id="booking-mobile-error" message={errors.mobile} />
          </div>

          <div>
            <label
              htmlFor="booking-email"
              className="mb-1.5 block text-xs font-medium text-graphite"
            >
              Email Address
              <span className="ml-0.5 text-electric" aria-hidden="true">*</span>
            </label>
            <Input
              id="booking-email"
              name="email"
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={(e) => onChange("email", e.target.value)}
              onBlur={() => onBlurField("email")}
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? "booking-email-error" : undefined}
              placeholder="you@company.com"
              className={inputClass(Boolean(errors.email))}
            />
            <FieldError id="booking-email-error" message={errors.email} />
          </div>
        </div>

        <div className="mt-7 flex items-center justify-between gap-3 border-t border-hairline pt-5">
          <button type="button" onClick={onBack} className={btnSecondary}>
            Back
          </button>
          <button type="submit" className={btnPrimary}>
            Continue
          </button>
        </div>
      </form>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Step 4 — review & confirm                                           */
/* ------------------------------------------------------------------ */

function SummaryRow({
  label,
  action,
  onAction,
  children,
}: {
  label: string;
  action?: string;
  onAction?: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 px-4 py-3 sm:px-5">
      <dt className="mt-1 shrink-0 font-mono text-[9px] uppercase tracking-[0.2em] text-ink-soft">
        {label}
      </dt>
      <dd className="min-w-0 flex-1 text-right text-sm leading-relaxed text-graphite">
        {children}
      </dd>
      {action && onAction ? (
        <button
          type="button"
          onClick={onAction}
          className="mt-0.5 inline-flex min-h-11 shrink-0 items-center font-mono text-[9px] uppercase tracking-[0.18em] text-electric transition-colors hover:text-graphite focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-warmwhite"
        >
          {action}
        </button>
      ) : null}
    </div>
  );
}

function ReviewStep({
  headingRef,
  founder,
  date,
  slot,
  durationMinutes,
  form,
  submitting,
  submitError,
  onConfirm,
  onBack,
  onGoToStep,
}: {
  headingRef: React.RefObject<HTMLHeadingElement | null>;
  founder: BookingFounder;
  date: string;
  slot: { minute: number; label: string };
  durationMinutes: number | null;
  form: BookingForm;
  submitting: boolean;
  submitError: string | null;
  onConfirm: () => void;
  onBack: () => void;
  onGoToStep: (step: Step) => void;
}) {
  const positionLine = founder.positionAbbr
    ? `${founder.position} · ${founder.positionAbbr}`
    : founder.position;

  return (
    <section
      aria-label="Step 4 of 4 — review and confirm"
      className={stepPanelClass}
    >
      <StepHeading headingRef={headingRef}>Review &amp; confirm</StepHeading>
      <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">
        Check the details before confirming your booking.
      </p>

      <dl className="mt-5 divide-y divide-hairline overflow-hidden rounded-xl border border-hairline bg-warmwhite">
        <SummaryRow label="Founder">
          <span className="font-medium">{founder.name}</span>
          <span className="block text-xs text-ink-soft">{positionLine}</span>
        </SummaryRow>
        <SummaryRow
          label="Date"
          action="Change"
          onAction={() => onGoToStep(1)}
        >
          {humanDate(date)}
        </SummaryRow>
        <SummaryRow
          label="Time"
          action="Change"
          onAction={() => onGoToStep(2)}
        >
          {slot.label} (BST)
          {durationMinutes ? (
            <span className="text-ink-soft"> · {durationMinutes} minutes</span>
          ) : null}
        </SummaryRow>
        <SummaryRow
          label="Name"
          action="Edit"
          onAction={() => onGoToStep(3)}
        >
          {form.name}
        </SummaryRow>
        <SummaryRow label="Email">
          <span className="break-all">{form.email}</span>
        </SummaryRow>
        <SummaryRow label="Mobile">{form.mobile}</SummaryRow>
      </dl>

      {submitError ? (
        <div
          role="alert"
          className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3"
        >
          <p className="text-sm leading-relaxed text-red-700">{submitError}</p>
          <button
            type="button"
            onClick={onConfirm}
            disabled={submitting}
            className="mt-1 inline-flex min-h-11 items-center text-sm font-medium text-red-700 underline underline-offset-4 transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-warmwhite disabled:cursor-not-allowed disabled:opacity-50"
          >
            Retry
          </button>
        </div>
      ) : null}

      <div className="mt-6 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBack}
          disabled={submitting}
          className={btnSecondary}
        >
          Back
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={submitting}
          className={btnPrimary}
        >
          {submitting ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              Confirming…
            </>
          ) : (
            "Confirm Booking"
          )}
        </button>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Success panel                                                       */
/* ------------------------------------------------------------------ */

function SuccessPanel({
  headingRef,
  result,
  founder,
  onDone,
}: {
  headingRef: React.RefObject<HTMLHeadingElement | null>;
  result: BookingResult;
  founder: BookingFounder;
  onDone: () => void;
}) {
  const positionLine = founder.positionAbbr
    ? `${founder.position} · ${founder.positionAbbr}`
    : founder.position;

  return (
    <section
      aria-label="Meeting booked"
      className={cn(stepPanelClass, "flex flex-col items-center py-2 text-center")}
    >
      <span className="flex size-12 items-center justify-center rounded-full bg-electric/10">
        <CheckCircle2 className="size-6 text-electric" aria-hidden="true" />
      </span>
      <h3
        ref={headingRef}
        tabIndex={-1}
        className="mt-5 text-xl font-semibold text-graphite focus:outline-none"
      >
        Meeting booked
      </h3>
      <p className="mt-5 font-mono text-3xl font-semibold tracking-[0.08em] text-graphite">
        {result.reference}
      </p>
      <p className="mt-1.5 font-mono text-[9px] uppercase tracking-[0.25em] text-ink-soft">
        Reference code
      </p>

      <div className="mt-6 w-full rounded-xl border border-hairline bg-warmwhite p-4 sm:p-5">
        <p className="text-sm font-medium text-graphite">
          {result.founderName}
          <span className="block text-xs font-normal text-ink-soft">
            {positionLine}
          </span>
        </p>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">
          {humanDate(result.date)} · {result.label} (BST)
          {result.durationMinutes
            ? ` · ${result.durationMinutes} minutes`
            : ""}
        </p>
      </div>

      <p className="mt-5 max-w-[40ch] text-[13px] leading-relaxed text-ink-soft">
        Please save your reference. Email confirmations are not enabled yet.
      </p>

      <button type="button" onClick={onDone} className={cn(btnPrimary, "mt-6")}>
        Done
      </button>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Step indicator                                                      */
/* ------------------------------------------------------------------ */

function StepIndicator({ step, done }: { step: Step; done: boolean }) {
  return (
    <ol
      className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1"
      aria-hidden="true"
    >
      {STEP_LABELS.map((label, i) => {
        const idx = (i + 1) as Step;
        const isDone = done || idx < step;
        const isCurrent = !done && idx === step;
        return (
          <React.Fragment key={label}>
            {i > 0 ? (
              <span className="h-px w-3 bg-hairline" aria-hidden="true" />
            ) : null}
            <li
              className={cn(
                "flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.15em]",
                isDone
                  ? "text-electric"
                  : isCurrent
                    ? "text-graphite"
                    : "text-ink-soft/60"
              )}
            >
              <span
                className={cn(
                  "size-1.5 rounded-full",
                  isDone
                    ? "bg-electric"
                    : isCurrent
                      ? "bg-graphite"
                      : "bg-hairline"
                )}
              />
              {label}
            </li>
          </React.Fragment>
        );
      })}
    </ol>
  );
}

/* ------------------------------------------------------------------ */
/* BookingModal                                                        */
/* ------------------------------------------------------------------ */

export function BookingModal({ open, onOpenChange, founder }: BookingModalProps) {
  const [step, setStep] = React.useState<Step>(1);
  const [bounds, setBounds] = React.useState(() => {
    const today = bstNow().date;
    return { today, horizon: addDaysBst(today, BOOKING_HORIZON_DAYS) };
  });
  const [viewMonth, setViewMonth] = React.useState(() => monthOf(bstNow().date));
  const [selectedDate, setSelectedDate] = React.useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = React.useState<{
    minute: number;
    label: string;
  } | null>(null);
  const [form, setForm] = React.useState<BookingForm>(EMPTY_FORM);
  const [errors, setErrors] = React.useState<FormErrors>({});
  const [submitting, setSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const [conflict, setConflict] = React.useState(false);
  const [result, setResult] = React.useState<BookingResult | null>(null);

  const monthUrl =
    open && !result
      ? `/api/public/availability?founder=${encodeURIComponent(
          founder.slug
        )}&month=${viewMonth}`
      : null;
  const monthApi = useApi<AvailabilityMonthResult>(monthUrl);

  const dayUrl =
    open && !result && selectedDate
      ? `/api/public/availability?founder=${encodeURIComponent(
          founder.slug
        )}&date=${selectedDate}`
      : null;
  const dayApi = useApi<AvailabilityDayResult>(dayUrl);

  const headingRef = React.useRef<HTMLHeadingElement | null>(null);

  /* Reset synchronously on open (and clear on close) so every session starts
   * at Step 1 with the current BST month and no stale selection. */
  const [hasOpened, setHasOpened] = React.useState(false);
  if (open && !hasOpened) {
    setHasOpened(true);
    const now = bstNow();
    setBounds({ today: now.date, horizon: addDaysBst(now.date, BOOKING_HORIZON_DAYS) });
    setViewMonth(monthOf(now.date));
    setStep(1);
    setSelectedDate(null);
    setSelectedSlot(null);
    setForm(EMPTY_FORM);
    setErrors({});
    setSubmitting(false);
    setSubmitError(null);
    setConflict(false);
    setResult(null);
  } else if (!open && hasOpened) {
    setHasOpened(false);
    setResult(null);
    setSelectedSlot(null);
  }

  /* Fresh availability on every open (bypasses the useApi cache). */
  const monthRefresh = monthApi.refresh;
  const openedOnce = React.useRef(false);
  React.useEffect(() => {
    if (!open) {
      openedOnce.current = false;
      return;
    }
    if (openedOnce.current) return;
    openedOnce.current = true;
    monthRefresh();
  }, [open, monthRefresh]);

  /* Focus the active step heading whenever the view changes — including the
   * initial open (onOpenAutoFocus below defers to this). */
  React.useEffect(() => {
    if (!open) return;
    headingRef.current?.focus();
  }, [open, step, result]);

  /* Always re-fetch the slot grid when the time step is shown — covers both
   * date (re)selection and the post-409 return to this step. */
  const dayRefresh = dayApi.refresh;
  React.useEffect(() => {
    if (open && step === 2 && !result) dayRefresh();
  }, [open, step, result, dayRefresh]);

  /* ---------- handlers ---------- */

  function handleMonthChange(delta: number) {
    setViewMonth((current) => shiftMonth(current, delta));
  }

  function handleSelectDate(dateStr: string) {
    setSelectedDate(dateStr);
    setConflict(false);
    setStep(2);
  }

  function handleSelectSlot(slot: { minute: number; label: string }) {
    setSelectedSlot(slot);
    setConflict(false);
    setStep(3);
  }

  function handleFormChange(field: FormField, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
    if (errors[field]) {
      setErrors((current) => ({ ...current, [field]: undefined }));
    }
  }

  function handleBlurField(field: FormField) {
    const error = validateField(field, form[field]);
    setErrors((current) => ({ ...current, [field]: error ?? undefined }));
  }

  const handleDetailsSubmit: React.FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();
    const nextErrors = validateForm(form);
    setErrors(nextErrors);
    if (nextErrors.name || nextErrors.email || nextErrors.mobile) return;
    setStep(4);
  }

  async function handleConfirm() {
    if (submitting || !selectedDate || !selectedSlot) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch("/api/public/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          founderSlug: founder.slug,
          date: selectedDate,
          startMinute: selectedSlot.minute,
          name: form.name.trim(),
          email: form.email.trim(),
          mobile: form.mobile.trim(),
        }),
      });

      if (res.status === 201) {
        const body = (await res.json()) as BookingResult;
        setResult(body);
        return;
      }

      if (res.status === 409) {
        /* Slot taken while the form was being filled in — return to the time
         * step with the same date; the step-2 effect refreshes the grid. */
        setConflict(true);
        setSelectedSlot(null);
        setStep(2);
        return;
      }

      if (res.status === 429) {
        setSubmitError(
          "Too many booking attempts. Please wait a few minutes and try again."
        );
        return;
      }

      let message = "Something went wrong. Please try again.";
      try {
        const body: unknown = await res.json();
        if (
          body &&
          typeof body === "object" &&
          typeof (body as { error?: unknown }).error === "string"
        ) {
          message = (body as { error: string }).error;
        }
      } catch {
        /* body was not JSON — keep the default message */
      }
      setSubmitError(message);
    } catch {
      setSubmitError(
        "Network error — please check your connection and try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  function handleDone() {
    onOpenChange(false);
  }

  /* ---------- derived ---------- */

  const slots = dayApi.data?.slots;
  const durationMinutes =
    slots && slots.length >= 2 ? slots[1].minute - slots[0].minute : null;

  const liveMessage = !open
    ? ""
    : result
      ? `Meeting booked. Reference ${result.reference}.`
      : `Step ${step} of 4: ${STEP_ANNOUNCEMENTS[step]}`;

  /* ---------- render ---------- */

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        onOpenAutoFocus={(event) => event.preventDefault()}
        className={cn(
          "flex max-h-[calc(100svh-2rem)] w-full max-w-[calc(100%-1rem)] flex-col gap-0 overflow-hidden rounded-2xl border-hairline p-0 sm:max-w-md md:max-w-md lg:max-w-lg"
        )}
      >
        <DialogClose
          className="absolute right-2.5 top-2.5 flex size-11 items-center justify-center rounded-full text-ink-soft transition-colors hover:bg-warmwhite hover:text-graphite focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-warmwhite"
        >
          <X className="size-4" aria-hidden="true" />
          <span className="sr-only">Close</span>
        </DialogClose>

        <div className="shrink-0 border-b border-hairline px-5 pb-4 pt-5 sm:px-6">
          <DialogTitle className="pr-10 text-lg font-semibold leading-tight text-graphite">
            Schedule a meeting with {founder.name}
          </DialogTitle>
          <DialogDescription className="mt-1 text-sm text-ink-soft">
            {founder.positionAbbr
              ? `${founder.position} · ${founder.positionAbbr}`
              : founder.position}
          </DialogDescription>
          <StepIndicator step={step} done={Boolean(result)} />
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">
          {result ? (
            <SuccessPanel
              headingRef={headingRef}
              result={result}
              founder={founder}
              onDone={handleDone}
            />
          ) : step === 1 ? (
            <DateStep
              headingRef={headingRef}
              founderName={founder.name}
              viewMonth={viewMonth}
              bounds={bounds}
              data={monthApi.data}
              loading={monthApi.loading}
              error={monthApi.error}
              onRetry={monthApi.refresh}
              selectedDate={selectedDate}
              onSelectDate={handleSelectDate}
              onMonthChange={handleMonthChange}
            />
          ) : step === 2 && selectedDate ? (
            <TimeStep
              headingRef={headingRef}
              founderName={founder.name}
              date={selectedDate}
              data={dayApi.data}
              loading={dayApi.loading}
              error={dayApi.error}
              onRetry={dayApi.refresh}
              selectedSlot={selectedSlot}
              onSelectSlot={handleSelectSlot}
              onBack={() => setStep(1)}
              conflict={conflict}
            />
          ) : step === 3 ? (
            <DetailsStep
              headingRef={headingRef}
              founderName={founder.name}
              form={form}
              errors={errors}
              onChange={handleFormChange}
              onBlurField={handleBlurField}
              onBack={() => setStep(2)}
              onSubmit={handleDetailsSubmit}
            />
          ) : step === 4 && selectedDate && selectedSlot ? (
            <ReviewStep
              headingRef={headingRef}
              founder={founder}
              date={selectedDate}
              slot={selectedSlot}
              durationMinutes={durationMinutes}
              form={form}
              submitting={submitting}
              submitError={submitError}
              onConfirm={handleConfirm}
              onBack={() => setStep(3)}
              onGoToStep={(next) => setStep(next)}
            />
          ) : null}
        </div>

        <p role="status" aria-live="polite" className="sr-only">
          {liveMessage}
        </p>
      </DialogContent>
    </Dialog>
  );
}

export default BookingModal;

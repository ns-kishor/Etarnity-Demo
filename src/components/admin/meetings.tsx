"use client";

import * as React from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";
import AdminHeader from "./admin-header";
import {
  AdminTable,
  api,
  ConfirmDelete,
  Field,
  formatDateTime,
  iconButtonClass,
  Td,
  Th,
  toastError,
  toastSuccess,
  Tr,
  useAdminData,
} from "./admin-utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoadingState, ErrorState, EmptyState } from "@/components/site/states";
import { useApi } from "@/hooks/use-api";
import { minuteLabel } from "@/lib/bst";
import type {
  AdminBooking,
  FounderAvailabilityRule,
  FounderBlockedDate,
  Person,
} from "@/lib/types";
import { cn } from "@/lib/utils";

/* ---------------------------------------------------------------- */
/* Constants                                                         */
/* ---------------------------------------------------------------- */

const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

const DURATION_OPTIONS = [15, 30, 45, 60] as const;
const BUFFER_OPTIONS = [0, 5, 10, 15, 30] as const;

/** Selectable times 06:00–22:00 in 30-minute steps (minutes from midnight). */
const BASE_TIME_OPTIONS: number[] = (() => {
  const options: number[] = [];
  for (let m = 6 * 60; m <= 22 * 60; m += 30) options.push(m);
  return options;
})();

/** Options for a time select — the base grid plus the current stored value. */
function timeOptions(current: number): number[] {
  if (BASE_TIME_OPTIONS.includes(current)) return BASE_TIME_OPTIONS;
  return [...BASE_TIME_OPTIONS, current].sort((a, b) => a - b);
}

/** GET /api/admin/availability?personId=N response shape. */
interface AvailabilityResponse {
  personId: number;
  rules: FounderAvailabilityRule[];
  blockedDates: FounderBlockedDate[];
}

/**
 * PATCH wrapper — the shared api() helper in admin-utils only types
 * GET/POST/PUT/DELETE, and booking cancellation is a PATCH endpoint.
 */
async function apiPatch<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    let message = `Request failed with status ${res.status}.`;
    try {
      const json: unknown = await res.json();
      if (
        json &&
        typeof json === "object" &&
        typeof (json as { error?: unknown }).error === "string"
      ) {
        message = (json as { error: string }).error;
      }
    } catch {
      /* non-JSON body */
    }
    throw new Error(message);
  }
  return (await res.json()) as T;
}

/* ---------------------------------------------------------------- */
/* Availability tab                                                  */
/* ---------------------------------------------------------------- */

function AvailabilityPanel({
  founder,
  data,
  loading,
  error,
  onSaved,
  onRetry,
}: {
  founder: Person;
  data: AvailabilityResponse | undefined;
  loading: boolean;
  error: string | null;
  onSaved: () => void;
  onRetry: () => void;
}) {
  const [rules, setRules] = React.useState<FounderAvailabilityRule[] | null>(
    null
  );
  // slotMinutes / bufferMinutes are stored per day by the API — the UI presents
  // them once and applies the chosen values to all 7 entries on save.
  const [slotMinutes, setSlotMinutes] = React.useState<number>(30);
  const [bufferMinutes, setBufferMinutes] = React.useState<number>(15);
  const [rowErrors, setRowErrors] = React.useState<Record<number, string>>({});
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (data) {
      setRules(data.rules.map((r) => ({ ...r })));
      const reference = data.rules.find((r) => r.isActive) ?? data.rules[0];
      setSlotMinutes(reference?.slotMinutes ?? 30);
      setBufferMinutes(reference?.bufferMinutes ?? 15);
      setRowErrors({});
    }
  }, [data]);

  const updateRule = (dayOfWeek: number, patch: Partial<FounderAvailabilityRule>) => {
    setRules((prev) =>
      prev
        ? prev.map((r) => (r.dayOfWeek === dayOfWeek ? { ...r, ...patch } : r))
        : prev
    );
  };

  const save = async () => {
    if (!rules) return;
    const errors: Record<number, string> = {};
    rules.forEach((rule) => {
      if (rule.startMinute >= rule.endMinute) {
        errors[rule.dayOfWeek] = "Start must be before end.";
      } else if (rule.endMinute - rule.startMinute < slotMinutes) {
        errors[rule.dayOfWeek] = `The window must fit at least one ${slotMinutes}-minute meeting.`;
      }
    });
    setRowErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setSaving(true);
    try {
      await api("/api/admin/availability", "PUT", {
        personId: founder.id,
        rules: rules.map((r) => ({ ...r, slotMinutes, bufferMinutes })),
      });
      toastSuccess("Availability saved");
      onSaved();
    } catch (e) {
      toastError(
        "Could not save availability.",
        e instanceof Error ? e.message : undefined
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading && !data) {
    return <LoadingState label={`Loading availability for ${founder.name}`} />;
  }

  if (error && !data) {
    return <ErrorState message={error} onRetry={onRetry} />;
  }

  if (!rules) {
    return <LoadingState label={`Loading availability for ${founder.name}`} />;
  }

  return (
    <div className="space-y-4">
      <p className="text-sm leading-relaxed text-ink-soft">
        Times are Bangladesh Standard Time (UTC+06:00). Bookings can be made up
        to 90 days ahead.
      </p>

      {/* Shared defaults */}
      <div className="rounded-xl border border-hairline bg-white p-5">
        <p className="font-mono text-[10px] font-medium uppercase tracking-[0.15em] text-ink-soft">
          Meeting Defaults
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="Meeting Duration" hint="Applied to every working day.">
            <Select
              value={String(slotMinutes)}
              onValueChange={(v) => setSlotMinutes(Number(v))}
            >
              <SelectTrigger className="h-10 w-full border-hairline bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DURATION_OPTIONS.map((minutes) => (
                  <SelectItem key={minutes} value={String(minutes)}>
                    {minutes} minutes
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field
            label="Buffer Between Meetings"
            hint="Kept free before and after each booking."
          >
            <Select
              value={String(bufferMinutes)}
              onValueChange={(v) => setBufferMinutes(Number(v))}
            >
              <SelectTrigger className="h-10 w-full border-hairline bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {BUFFER_OPTIONS.map((minutes) => (
                  <SelectItem key={minutes} value={String(minutes)}>
                    {minutes} minutes
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </div>
      </div>

      {/* Week editor */}
      <div className="overflow-hidden rounded-xl border border-hairline bg-white">
        <div className="divide-y divide-hairline">
          {rules.map((rule) => {
            const dayName = DAY_NAMES[rule.dayOfWeek] ?? `Day ${rule.dayOfWeek}`;
            const rowError = rowErrors[rule.dayOfWeek];
            return (
              <div
                key={rule.dayOfWeek}
                className={cn(
                  "px-5 py-3.5 transition-opacity",
                  !rule.isActive && "opacity-60"
                )}
              >
                <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                  <div className="flex w-40 shrink-0 items-center gap-3">
                    <Switch
                      checked={rule.isActive}
                      onCheckedChange={(v) =>
                        updateRule(rule.dayOfWeek, { isActive: v })
                      }
                      aria-label={`${dayName} availability`}
                    />
                    <span className="font-mono text-[10px] font-medium uppercase tracking-[0.15em] text-ink-soft">
                      {dayName}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Select
                      value={String(rule.startMinute)}
                      onValueChange={(v) =>
                        updateRule(rule.dayOfWeek, {
                          startMinute: Number(v),
                        })
                      }
                    >
                      <SelectTrigger
                        className="h-9 w-[104px] border-hairline bg-white font-mono text-[13px]"
                        aria-label={`${dayName} start time`}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {timeOptions(rule.startMinute).map((minute) => (
                          <SelectItem key={minute} value={String(minute)}>
                            {minuteLabel(minute)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <span aria-hidden="true" className="text-ink-soft">
                      –
                    </span>
                    <Select
                      value={String(rule.endMinute)}
                      onValueChange={(v) =>
                        updateRule(rule.dayOfWeek, {
                          endMinute: Number(v),
                        })
                      }
                    >
                      <SelectTrigger
                        className="h-9 w-[104px] border-hairline bg-white font-mono text-[13px]"
                        aria-label={`${dayName} end time`}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {timeOptions(rule.endMinute).map((minute) => (
                          <SelectItem key={minute} value={String(minute)}>
                            {minuteLabel(minute)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {rule.isActive ? (
                    <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-ink-soft">
                      {slotMinutes} min meetings
                    </span>
                  ) : (
                    <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-ink-soft">
                      Off
                    </span>
                  )}
                </div>
                {rowError ? (
                  <p className="mt-1.5 text-xs text-red-600">{rowError}</p>
                ) : null}
              </div>
            );
          })}
        </div>
        <div className="flex items-center justify-end border-t border-hairline px-5 py-4">
          <button
            type="button"
            onClick={() => void save()}
            disabled={saving}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-graphite px-5 text-sm font-medium text-white transition-colors hover:bg-[#23262D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 disabled:opacity-50"
          >
            {saving ? <Loader2 className="size-4 animate-spin" /> : null}
            {saving ? "Saving…" : "Save Availability"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- */
/* Blocked dates tab                                                 */
/* ---------------------------------------------------------------- */

function BlockedPanel({
  founder,
  blockedDates,
  loading,
  error,
  onChanged,
  onRetry,
}: {
  founder: Person;
  blockedDates: FounderBlockedDate[];
  loading: boolean;
  error: string | null;
  onChanged: () => void;
  onRetry: () => void;
}) {
  const [date, setDate] = React.useState("");
  const [note, setNote] = React.useState("");
  const [adding, setAdding] = React.useState(false);

  const add = async () => {
    if (date === "") {
      toastError("Pick a date first.");
      return;
    }
    setAdding(true);
    try {
      await api("/api/admin/blocked-dates", "POST", {
        personId: founder.id,
        date,
        note: note.trim() === "" ? null : note.trim(),
      });
      toastSuccess(`Blocked ${date}`);
      setDate("");
      setNote("");
      onChanged();
    } catch (e) {
      toastError(
        "Could not block the date.",
        e instanceof Error ? e.message : undefined
      );
    } finally {
      setAdding(false);
    }
  };

  const remove = async (entry: FounderBlockedDate) => {
    try {
      await api(`/api/admin/blocked-dates/${entry.id}`, "DELETE");
      toastSuccess(`Unblocked ${entry.date}.`);
      onChanged();
    } catch (e) {
      toastError(
        "Could not delete the blocked date.",
        e instanceof Error ? e.message : undefined
      );
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-sm leading-relaxed text-ink-soft">
        Blocked dates are excluded from {founder.name}&apos;s bookable calendar
        entirely — holidays, travel, focused work days.
      </p>

      {/* Add form */}
      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (!adding) void add();
        }}
        className="rounded-xl border border-hairline bg-white p-5"
      >
        <div className="grid gap-4 sm:grid-cols-[180px_1fr_auto] sm:items-end">
          <Field label="Date" required>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="h-10 border-hairline focus-visible:ring-electric"
            />
          </Field>
          <Field label="Note" hint="Optional — why this date is blocked.">
            <Input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              maxLength={300}
              placeholder="Public holiday"
              className="h-10 border-hairline focus-visible:ring-electric"
            />
          </Field>
          <button
            type="submit"
            disabled={adding}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-graphite px-5 text-sm font-medium text-white transition-colors hover:bg-[#23262D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 disabled:opacity-50"
          >
            {adding ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Plus className="size-4" />
            )}
            {adding ? "Adding…" : "Block Date"}
          </button>
        </div>
      </form>

      {loading && blockedDates.length === 0 ? (
        <LoadingState label="Loading blocked dates" />
      ) : null}

      {error && blockedDates.length === 0 ? (
        <ErrorState message={error} onRetry={onRetry} />
      ) : null}

      {!loading && !error && blockedDates.length === 0 ? (
        <EmptyState
          title="No blocked dates."
          description="All working days remain bookable for now."
        />
      ) : null}

      {blockedDates.length > 0 ? (
        <AdminTable>
          <thead>
            <tr className="border-b border-hairline">
              <Th>Date</Th>
              <Th>Note</Th>
              <Th className="text-right">Actions</Th>
            </tr>
          </thead>
          <tbody>
            {blockedDates.map((entry) => (
              <Tr key={entry.id}>
                <Td>
                  <span className="font-mono text-[13px] text-graphite">
                    {entry.date}
                  </span>
                </Td>
                <Td className="max-w-md">
                  <span className="text-sm text-ink-soft">
                    {entry.note ?? "—"}
                  </span>
                </Td>
                <Td>
                  <div className="flex items-center justify-end gap-1">
                    <ConfirmDelete
                      label={`This removes the blocked date — ${entry.date} becomes bookable again.`}
                      onConfirm={() => remove(entry)}
                    >
                      <button
                        type="button"
                        aria-label={`Unblock ${entry.date}`}
                        className={iconButtonClass}
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </ConfirmDelete>
                  </div>
                </Td>
              </Tr>
            ))}
          </tbody>
        </AdminTable>
      ) : null}
    </div>
  );
}

/* ---------------------------------------------------------------- */
/* Bookings tab                                                      */
/* ---------------------------------------------------------------- */

type BookingFilter = "ALL" | "CONFIRMED" | "CANCELLED";

const BOOKING_FILTERS: BookingFilter[] = ["ALL", "CONFIRMED", "CANCELLED"];

function BookingStatusBadge({ status }: { status: string }) {
  const cancelled = status === "CANCELLED";
  return (
    <span
      className={
        cancelled
          ? "inline-flex items-center rounded-full border border-hairline bg-white px-3 py-1 font-mono text-[10px] uppercase tracking-[0.15em] text-ink-soft"
          : "inline-flex items-center rounded-full border border-emerald-700/25 bg-emerald-50 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.15em] text-emerald-700"
      }
    >
      {cancelled ? "Cancelled" : "Confirmed"}
    </span>
  );
}

function BookingsPanel({
  founder,
  data,
  loading,
  error,
  onChanged,
  onRetry,
}: {
  founder: Person;
  data: AdminBooking[] | undefined;
  loading: boolean;
  error: string | null;
  onChanged: () => void;
  onRetry: () => void;
}) {
  const [filter, setFilter] = React.useState<BookingFilter>("ALL");
  const [cancelId, setCancelId] = React.useState<number | null>(null);
  const [cancelling, setCancelling] = React.useState(false);

  const items = data ?? [];
  const counts: Record<BookingFilter, number> = {
    ALL: items.length,
    CONFIRMED: 0,
    CANCELLED: 0,
  };
  for (const booking of items) {
    if (booking.status === "CONFIRMED" || booking.status === "CANCELLED") {
      counts[booking.status] += 1;
    }
  }
  const visible =
    filter === "ALL" ? items : items.filter((b) => b.status === filter);

  const cancel = async () => {
    if (cancelId === null) return;
    setCancelling(true);
    try {
      await apiPatch(`/api/admin/bookings/${cancelId}`, {
        status: "CANCELLED",
      });
      toastSuccess("Booking cancelled — the slot is bookable again.");
      setCancelId(null);
      onChanged();
    } catch (e) {
      toastError(
        "Could not cancel the booking.",
        e instanceof Error ? e.message : undefined
      );
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div>
      {/* Filter pills */}
      <div className="mb-6 flex flex-wrap items-center gap-2">
        {BOOKING_FILTERS.map((status) => (
          <button
            key={status}
            type="button"
            onClick={() => setFilter(status)}
            aria-pressed={filter === status}
            className={cn(
              "inline-flex h-8 items-center gap-2 rounded-full border px-4 font-mono text-[10px] uppercase tracking-[0.15em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2",
              filter === status
                ? "border-graphite bg-graphite text-warmwhite"
                : "border-hairline bg-white text-ink-soft hover:border-graphite hover:text-graphite"
            )}
          >
            {status === "ALL" ? "All" : status === "CONFIRMED" ? "Confirmed" : "Cancelled"}
            <span
              className={cn(
                "text-[10px]",
                filter === status ? "text-warmwhite/70" : "text-ink-soft/70"
              )}
            >
              {counts[status]}
            </span>
          </button>
        ))}
      </div>

      {loading ? <LoadingState label="Loading bookings" /> : null}

      {!loading && error ? (
        <ErrorState message={error} onRetry={onRetry} />
      ) : null}

      {!loading && !error && items.length === 0 ? (
        <EmptyState
          title="No bookings yet."
          description={`Meetings booked with ${founder.name} from the public site appear here.`}
        />
      ) : null}

      {!loading && !error && items.length > 0 && visible.length === 0 ? (
        <EmptyState
          title={`No ${filter.toLowerCase()} bookings.`}
          description="Try another filter."
        />
      ) : null}

      {!loading && !error && visible.length > 0 ? (
        <AdminTable>
          <thead>
            <tr className="border-b border-hairline">
              <Th>Date</Th>
              <Th>Time</Th>
              <Th>Visitor</Th>
              <Th>Status</Th>
              <Th>Booked At</Th>
              <Th className="text-right">Actions</Th>
            </tr>
          </thead>
          <tbody>
            {visible.map((booking) => (
              <Tr key={booking.id}>
                <Td>
                  <span className="font-mono text-[13px] text-graphite">
                    {booking.date}
                  </span>
                </Td>
                <Td>
                  <div className="flex flex-col">
                    <span className="font-mono text-[13px] text-graphite">
                      {booking.label}
                    </span>
                    <span className="text-xs text-ink-soft">
                      {booking.durationMinutes} min
                    </span>
                  </div>
                </Td>
                <Td>
                  <div className="flex max-w-[260px] flex-col">
                    <span className="font-medium text-graphite">
                      {booking.name}
                    </span>
                    <a
                      href={`mailto:${booking.email}`}
                      className="truncate text-xs text-electric underline-offset-4 hover:underline"
                    >
                      {booking.email}
                    </a>
                    <span className="font-mono text-[11px] text-ink-soft">
                      {booking.mobile}
                    </span>
                  </div>
                </Td>
                <Td>
                  <BookingStatusBadge status={booking.status} />
                </Td>
                <Td>
                  <span className="font-mono text-[11px] text-ink-soft">
                    {formatDateTime(booking.createdAt)}
                  </span>
                </Td>
                <Td>
                  <div className="flex items-center justify-end">
                    {booking.status === "CONFIRMED" ? (
                      <button
                        type="button"
                        onClick={() => setCancelId(booking.id)}
                        className="inline-flex h-8 items-center rounded-full border border-hairline bg-white px-3 text-xs font-medium text-ink-soft transition-colors hover:border-red-300 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2"
                      >
                        Cancel
                      </button>
                    ) : (
                      <span className="text-ink-soft">—</span>
                    )}
                  </div>
                </Td>
              </Tr>
            ))}
          </tbody>
        </AdminTable>
      ) : null}

      {/* Cancel confirmation */}
      <AlertDialog
        open={cancelId !== null}
        onOpenChange={(open) => {
          if (!open) setCancelId(null);
        }}
      >
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-semibold tracking-tight text-graphite">
              Cancel this meeting?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm leading-relaxed text-ink-soft">
              The time slot becomes bookable again.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={cancelling}>
              Keep Booking
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={cancelling}
              onClick={(event) => {
                event.preventDefault();
                void cancel();
              }}
              className="bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-600"
            >
              {cancelling ? (
                <Loader2 className="size-4 animate-spin" />
              ) : null}
              Cancel Meeting
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

/* ---------------------------------------------------------------- */
/* Section                                                           */
/* ---------------------------------------------------------------- */

export default function MeetingsSection() {
  const people = useAdminData<Person[]>("/api/admin/people");
  // The admin people list includes hidden demo people — the public scheduler
  // only serves PUBLIC founders, so cross-reference the public people list
  // (same derivation pattern as the People section uses for visibility).
  const pub = useApi<Person[]>("/api/public/people");
  const publicSlugs = React.useMemo(
    () => new Set((pub.data ?? []).map((p) => p.slug)),
    [pub.data]
  );
  const founders = (people.data ?? []).filter(
    (p) => p.isFounder && publicSlugs.has(p.slug)
  );

  const [founderId, setFounderId] = React.useState<number | null>(null);
  const founder =
    founders.find((f) => f.id === founderId) ?? founders[0] ?? null;

  const availabilityUrl = founder
    ? `/api/admin/availability?personId=${founder.id}`
    : null;
  const availability = useApi<AvailabilityResponse>(availabilityUrl);

  const bookingsUrl = founder
    ? `/api/admin/bookings?personId=${founder.id}`
    : null;
  const bookings = useApi<AdminBooking[]>(bookingsUrl);

  return (
    <div>
      <AdminHeader
        section="Meetings"
        title="Meetings"
        description="Founder availability, blocked dates and visitor bookings for the public meeting scheduler."
      />

      {people.loading || pub.loading ? (
        <LoadingState label="Loading founders" />
      ) : null}

      {!people.loading && !pub.loading && (people.error || pub.error) ? (
        <ErrorState message={people.error ?? pub.error ?? undefined} onRetry={people.refresh} />
      ) : null}

      {!people.loading && !pub.loading && !people.error && !pub.error && founders.length === 0 ? (
        <EmptyState
          title="No founders yet."
          description="Mark people as founders in the People section to manage their meetings."
        />
      ) : null}

      {!people.loading && !pub.loading && !people.error && !pub.error && founder ? (
        <div className="space-y-6">
          {/* Founder selector */}
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-mono text-[10px] font-medium uppercase tracking-[0.15em] text-ink-soft">
              Founder
            </span>
            <Select
              value={String(founder.id)}
              onValueChange={(v) => setFounderId(Number(v))}
            >
              <SelectTrigger
                className="h-10 w-full max-w-xs border-hairline bg-white sm:w-72"
                aria-label="Select founder"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {founders.map((f) => (
                  <SelectItem key={f.id} value={String(f.id)}>
                    {f.name}
                    {f.positionAbbr ? (
                      <span className="text-ink-soft"> · {f.positionAbbr}</span>
                    ) : null}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Tabs defaultValue="availability">
            <TabsList>
              <TabsTrigger value="availability">Availability</TabsTrigger>
              <TabsTrigger value="blocked">Blocked Dates</TabsTrigger>
              <TabsTrigger value="bookings">Bookings</TabsTrigger>
            </TabsList>
            <TabsContent value="availability" className="mt-6">
              <AvailabilityPanel
                key={founder.id}
                founder={founder}
                data={availability.data}
                loading={availability.loading}
                error={availability.error}
                onSaved={availability.refresh}
                onRetry={availability.refresh}
              />
            </TabsContent>
            <TabsContent value="blocked" className="mt-6">
              <BlockedPanel
                founder={founder}
                blockedDates={availability.data?.blockedDates ?? []}
                loading={availability.loading && !availability.data}
                error={availability.error}
                onChanged={availability.refresh}
                onRetry={availability.refresh}
              />
            </TabsContent>
            <TabsContent value="bookings" className="mt-6">
              <BookingsPanel
                founder={founder}
                data={bookings.data}
                loading={bookings.loading}
                error={bookings.error}
                onChanged={bookings.refresh}
                onRetry={bookings.refresh}
              />
            </TabsContent>
          </Tabs>
        </div>
      ) : null}
    </div>
  );
}

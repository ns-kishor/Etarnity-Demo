"use client";

import * as React from "react";
import { ChevronDown, Loader2, Save } from "lucide-react";
import AdminHeader from "./admin-header";
import {
  DeleteButton,
  formatDateTime,
  toastError,
  toastSuccess,
  useAdminData,
  api,
} from "./admin-utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { LoadingState, ErrorState, EmptyState } from "@/components/site/states";
import { StatusChip } from "@/components/site/status-chip";
import type { ContactInquiry, InquiryStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

const INQUIRY_STATUSES: InquiryStatus[] = [
  "NEW",
  "IN_PROGRESS",
  "RESOLVED",
  "ARCHIVED",
];

type Filter = "ALL" | InquiryStatus;

function InquiryCard({
  inquiry,
  onChanged,
}: {
  inquiry: ContactInquiry;
  onChanged: () => void;
}) {
  const [notesOpen, setNotesOpen] = React.useState(false);
  const [notes, setNotes] = React.useState(inquiry.internalNotes ?? "");
  const [savingNotes, setSavingNotes] = React.useState(false);
  const notesDirty = notes !== (inquiry.internalNotes ?? "");

  const setStatus = async (status: InquiryStatus) => {
    try {
      await api(`/api/admin/inquiries/${inquiry.id}`, "PUT", { status });
      toastSuccess(`Marked as ${status.replace("_", " ")}`);
      onChanged();
    } catch (e) {
      toastError(
        "Could not update status.",
        e instanceof Error ? e.message : undefined
      );
    }
  };

  const saveNotes = async () => {
    setSavingNotes(true);
    try {
      await api(`/api/admin/inquiries/${inquiry.id}`, "PUT", {
        internalNotes: notes.trim() === "" ? null : notes,
      });
      toastSuccess("Notes saved");
      onChanged();
      setNotesOpen(false);
    } catch (e) {
      toastError(
        "Could not save notes.",
        e instanceof Error ? e.message : undefined
      );
    } finally {
      setSavingNotes(false);
    }
  };

  const remove = async () => {
    try {
      await api(`/api/admin/inquiries/${inquiry.id}`, "DELETE");
      toastSuccess("Inquiry deleted");
      onChanged();
    } catch (e) {
      toastError(
        "Could not delete inquiry.",
        e instanceof Error ? e.message : undefined
      );
    }
  };

  return (
    <div className="rounded-xl border border-hairline bg-white p-5">
      {/* Header row */}
      <div className="flex flex-wrap items-center gap-3">
        <span className="rounded-full bg-graphite px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.15em] text-warmwhite">
          {inquiry.inquiryType}
        </span>
        <StatusChip status={inquiry.status} />
        <span className="ml-auto font-mono text-[10px] uppercase tracking-[0.15em] text-ink-soft">
          {formatDateTime(inquiry.createdAt)}
        </span>
      </div>

      {/* Contact row */}
      <div className="mt-4 flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span className="font-medium text-graphite">{inquiry.name}</span>
        {inquiry.organization ? (
          <span className="text-sm text-ink-soft">{inquiry.organization}</span>
        ) : null}
        <a
          href={`mailto:${inquiry.email}`}
          className="text-sm text-electric underline-offset-4 hover:underline"
        >
          {inquiry.email}
        </a>
      </div>

      {/* Content */}
      <h3 className="mt-4 text-sm font-semibold text-graphite">
        {inquiry.subject}
      </h3>
      <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-ink-soft">
        {inquiry.message}
      </p>

      {/* Actions row */}
      <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-hairline pt-4">
        <Select
          value={inquiry.status}
          onValueChange={(v) => void setStatus(v as InquiryStatus)}
        >
          <SelectTrigger
            aria-label="Set status"
            className="h-9 w-40 rounded-full border-hairline bg-white text-xs"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {INQUIRY_STATUSES.map((status) => (
              <SelectItem key={status} value={status}>
                {status}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <button
          type="button"
          onClick={() => setNotesOpen((open) => !open)}
          aria-expanded={notesOpen}
          className={cn(
            "inline-flex h-9 items-center gap-1.5 rounded-full border border-hairline bg-white px-4 text-xs font-medium text-graphite transition-colors hover:border-graphite focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2",
            notesOpen && "border-graphite"
          )}
        >
          <ChevronDown
            className={cn(
              "size-3.5 transition-transform",
              notesOpen && "rotate-180"
            )}
          />
          Internal Notes
          {inquiry.internalNotes ? (
            <span className="size-1.5 rounded-full bg-electric" aria-hidden="true" />
          ) : null}
        </button>

        <div className="ml-auto">
          <DeleteButton
            ariaLabel={`Delete inquiry from ${inquiry.name}`}
            onConfirm={() => remove()}
          />
        </div>
      </div>

      {/* Notes panel */}
      {notesOpen ? (
        <div className="mt-4 rounded-lg border border-hairline bg-warmwhite/60 p-3">
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            placeholder="Internal follow-up notes — never shown on the public site."
            aria-label="Internal notes"
            className="border-hairline bg-white text-sm focus-visible:ring-electric"
          />
          <div className="mt-2 flex items-center justify-end gap-2">
            {notesDirty ? (
              <span className="mr-auto text-xs text-ink-soft">Unsaved changes</span>
            ) : null}
            <button
              type="button"
              onClick={() => void saveNotes()}
              disabled={savingNotes || !notesDirty}
              className="inline-flex h-8 items-center gap-2 rounded-full bg-graphite px-4 text-xs font-medium text-white transition-colors hover:bg-[#23262D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 disabled:opacity-50"
            >
              {savingNotes ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Save className="size-3.5" />
              )}
              Save Notes
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default function InquiriesSection() {
  const { data, loading, error, refresh } = useAdminData<ContactInquiry[]>(
    "/api/admin/inquiries"
  );
  const [filter, setFilter] = React.useState<Filter>("ALL");

  const items = data ?? [];
  const counts = React.useMemo(() => {
    const map: Record<Filter, number> = {
      ALL: items.length,
      NEW: 0,
      IN_PROGRESS: 0,
      RESOLVED: 0,
      ARCHIVED: 0,
    };
    for (const item of items) map[item.status] += 1;
    return map;
  }, [items]);

  const visible = React.useMemo(
    () => (filter === "ALL" ? items : items.filter((i) => i.status === filter)),
    [items, filter]
  );

  return (
    <div>
      <AdminHeader
        section="Inquiries"
        title="Inquiries"
        description="Messages from the public contact form — triage, respond and archive."
      />

      {/* Filter pills */}
      <div className="mb-6 flex flex-wrap items-center gap-2">
        {(["ALL", ...INQUIRY_STATUSES] as Filter[]).map((status) => (
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
            {status.replace("_", " ")}
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

      {loading ? <LoadingState label="Loading inquiries" /> : null}

      {!loading && error ? <ErrorState message={error} onRetry={refresh} /> : null}

      {!loading && !error && items.length === 0 ? (
        <EmptyState
          title="No inquiries yet."
          description="Messages submitted through the public contact form will appear here."
        />
      ) : null}

      {!loading && !error && items.length > 0 && visible.length === 0 ? (
        <EmptyState
          title={`No ${filter.replace("_", " ").toLowerCase()} inquiries.`}
          description="Try another filter."
        />
      ) : null}

      {!loading && !error && visible.length > 0 ? (
        <div className="space-y-4">
          {visible.map((inquiry) => (
            <InquiryCard key={inquiry.id} inquiry={inquiry} onChanged={refresh} />
          ))}
        </div>
      ) : null}
    </div>
  );
}

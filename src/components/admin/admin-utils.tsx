"use client";

/**
 * ETARNITY admin — shared utilities and form primitives.
 *
 * Everything the admin sections reuse lives here:
 *   api()            JSON fetch wrapper (throws Error with the API message)
 *   uploadMedia()    multipart upload helper
 *   useAdminData()   typed useApi wrapper
 *   slugify()        name → slug
 *   AdminTable/Th/Td/Tr  consistent table chrome
 *   ConfirmDelete    destructive AlertDialog
 *   AdminDialog      consistent form dialog (header/scroll/footer/submit)
 *   Field            label + control + inline error
 *   SwitchField      label + Switch row
 *   MediaPickerField upload / choose / remove a media reference
 *   toastSuccess/toastError + date/size/format helpers
 */

import * as React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableCell as UiTableCell,
  TableHead as UiTableHead,
  TableRow as UiTableRow,
} from "@/components/ui/table";
import { Loader2, Trash2, Upload, X } from "lucide-react";
import { useApi } from "@/hooks/use-api";
import { toast as shadcnToast } from "@/hooks/use-toast";
import type { MediaItem } from "@/lib/types";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/* Toast sugar                                                         */
/* ------------------------------------------------------------------ */

export function toastSuccess(title: string, description?: string) {
  shadcnToast({ title, description });
}

export function toastError(title: string, description?: string) {
  shadcnToast({ title, description, variant: "destructive" });
}

/* ------------------------------------------------------------------ */
/* Fetch helpers                                                       */
/* ------------------------------------------------------------------ */

async function readErrorMessage(res: Response): Promise<string> {
  let json: unknown = null;
  try {
    json = await res.json();
  } catch {
    /* non-JSON body */
  }
  if (
    json &&
    typeof json === "object" &&
    typeof (json as { error?: unknown }).error === "string"
  ) {
    return (json as { error: string }).error;
  }
  return `Request failed with status ${res.status}.`;
}

/** JSON fetch wrapper — throws Error(message) with the API's error text. */
export async function api<T>(
  url: string,
  method: "GET" | "POST" | "PUT" | "DELETE" = "GET",
  body?: unknown
): Promise<T> {
  const res = await fetch(url, {
    method,
    headers:
      body !== undefined ? { "Content-Type": "application/json" } : undefined,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(await readErrorMessage(res));
  return (await res.json()) as T;
}

/** Multipart upload to /api/admin/media (field "file", optional "altText"). */
export async function uploadMedia(
  file: File,
  altText?: string
): Promise<MediaItem> {
  const form = new FormData();
  form.append("file", file);
  if (altText && altText.trim() !== "") form.append("altText", altText);
  const res = await fetch("/api/admin/media", { method: "POST", body: form });
  if (!res.ok) throw new Error(await readErrorMessage(res));
  return (await res.json()) as MediaItem;
}

/** Typed useApi passthrough for admin list endpoints. */
export function useAdminData<T>(url: string): {
  data: T | undefined;
  loading: boolean;
  error: string | null;
  refresh: () => void;
} {
  return useApi<T>(url);
}

/* ------------------------------------------------------------------ */
/* String / format helpers                                             */
/* ------------------------------------------------------------------ */

/** lowercase, spaces→hyphens, strip anything but [a-z0-9-]. */
export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function isValidSlug(value: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
}

/** "Not a URL" check that matches the backend (z.url or empty string). */
export function isValidUrl(value: string): boolean {
  if (value.trim() === "") return true;
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** Compact date — "Oct 9, 2026". */
export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/** Compact date + time — "Oct 9, 2026, 14:32". */
export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return `${d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })}, ${d.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })}`;
}

/** ISO string → value for <input type="datetime-local"> (local, minute precision). */
export function isoToLocalInput(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

/** datetime-local input value → ISO string (or null when empty). */
export function localInputToIso(value: string): string | null {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}

/** Split a comma-separated input into a clean string[]. */
export function splitList(value: string): string[] {
  return value
    .split(",")
    .map((part) => part.trim())
    .filter((part) => part !== "");
}

/* ------------------------------------------------------------------ */
/* Table chrome                                                        */
/* ------------------------------------------------------------------ */

/** Bordered white card wrapping a shadcn Table (scrolls horizontally). */
export function AdminTable({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-hairline bg-white",
        className
      )}
    >
      <div className="overflow-x-auto">
        <Table className="w-full min-w-[720px]">{children}</Table>
      </div>
    </div>
  );
}

/** Consistent header cell — mono, uppercase, small. */
export function Th({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <UiTableHead
      className={cn(
        "h-10 px-4 text-left align-middle font-mono text-[10px] font-medium uppercase tracking-[0.15em] text-ink-soft",
        className
      )}
    >
      {children}
    </UiTableHead>
  );
}

/** Consistent body cell. */
export function Td({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <UiTableCell
      className={cn("px-4 py-3 align-middle text-sm text-graphite", className)}
    >
      {children}
    </UiTableCell>
  );
}

export function Tr({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <UiTableRow className={cn("border-hairline hover:bg-warmwhite/60", className)}>
      {children}
    </UiTableRow>
  );
}

/* ------------------------------------------------------------------ */
/* Form primitives                                                     */
/* ------------------------------------------------------------------ */

/** Label + control + optional hint / inline error. */
export function Field({
  label,
  required,
  hint,
  error,
  children,
  className,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  error?: string | null;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <span className="font-mono text-[10px] font-medium uppercase tracking-[0.15em] text-ink-soft">
        {label}
        {required ? <span className="ml-1 text-electric">*</span> : null}
      </span>
      {children}
      {error ? (
        <span className="text-xs text-red-600">{error}</span>
      ) : hint ? (
        <span className="text-xs text-ink-soft">{hint}</span>
      ) : null}
    </div>
  );
}

/** Label + Switch in a bordered row (used for booleans in dialogs). */
export function SwitchField({
  label,
  hint,
  checked,
  onCheckedChange,
}: {
  label: string;
  hint?: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 rounded-lg border border-hairline bg-white px-4 py-3">
      <span className="flex flex-col">
        <span className="font-mono text-[10px] font-medium uppercase tracking-[0.15em] text-ink-soft">
          {label}
        </span>
        {hint ? <span className="mt-1 text-xs text-ink-soft">{hint}</span> : null}
      </span>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </label>
  );
}

/* ------------------------------------------------------------------ */
/* Dialogs                                                             */
/* ------------------------------------------------------------------ */

/**
 * Consistent form dialog: header (title + description), scrollable body
 * (max-h-[70vh], thin custom scrollbar via the global .overflow-y-auto rule),
 * footer with Cancel + submit (Loader2 while submitting).
 */
export function AdminDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  onSubmit,
  submitting,
  submitLabel = "Save",
  wide,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  onSubmit: () => void;
  submitting?: boolean;
  submitLabel?: string;
  wide?: boolean;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn("gap-0 p-0 sm:max-w-2xl", wide && "sm:max-w-3xl")}
      >
        <DialogHeader className="border-b border-hairline px-6 py-5">
          <DialogTitle className="text-lg font-semibold tracking-tight text-graphite">
            {title}
          </DialogTitle>
          {description ? (
            <DialogDescription className="text-sm leading-relaxed text-ink-soft">
              {description}
            </DialogDescription>
          ) : null}
        </DialogHeader>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            if (!submitting) onSubmit();
          }}
          className="flex min-h-0 flex-col"
        >
          <div className="max-h-[70vh] overflow-y-auto px-6 py-4">{children}</div>
          <div className="flex items-center justify-end gap-3 border-t border-hairline px-6 py-4">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
              className="inline-flex h-10 items-center justify-center rounded-full border border-hairline bg-white px-5 text-sm font-medium text-graphite transition-colors hover:border-graphite focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-graphite px-5 text-sm font-medium text-white transition-colors hover:bg-[#23262D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 disabled:opacity-50"
            >
              {submitting ? <Loader2 className="size-4 animate-spin" /> : null}
              {submitting ? "Saving…" : submitLabel}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/** Destructive confirmation used by every delete button. */
export function ConfirmDelete({
  label = "This cannot be undone.",
  onConfirm,
  onDone,
  children,
  className,
}: {
  label?: string;
  onConfirm: () => Promise<unknown> | void;
  onDone?: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  const [busy, setBusy] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-lg font-semibold tracking-tight text-graphite">
            Delete this record?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-sm leading-relaxed text-ink-soft">
            {label}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={busy}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={busy}
            onClick={(event) => {
              // Keep the dialog open while the request runs (busy state),
              // then close regardless of outcome — errors surface via toast.
              event.preventDefault();
              setBusy(true);
              Promise.resolve(onConfirm())
                .catch(() => undefined)
                .finally(() => {
                  setBusy(false);
                  setOpen(false);
                  onDone?.();
                });
            }}
            className="bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-600"
          >
            {busy ? <Loader2 className="size-4 animate-spin" /> : null}
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

/** Small icon-button styling shared by edit/delete row actions. */
export const iconButtonClass =
  "inline-flex size-8 items-center justify-center rounded-md border border-transparent text-ink-soft transition-colors hover:border-hairline hover:bg-white hover:text-graphite focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric disabled:opacity-50";

/** Row-action delete icon button (Trash2) wired to ConfirmDelete. */
export function DeleteButton({
  onConfirm,
  ariaLabel = "Delete",
}: {
  onConfirm: () => Promise<unknown> | void;
  ariaLabel?: string;
}) {
  return (
    <ConfirmDelete onConfirm={onConfirm}>
      <button
        type="button"
        aria-label={ariaLabel}
        className={iconButtonClass}
      >
        <Trash2 className="size-4" />
      </button>
    </ConfirmDelete>
  );
}

/* ------------------------------------------------------------------ */
/* Media picker                                                        */
/* ------------------------------------------------------------------ */

/**
 * Compact media reference picker: current thumbnail (or placeholder),
 * Upload… (immediate POST), Choose… (dropdown of existing media), Remove.
 */
export function MediaPickerField({
  value,
  onChange,
  label = "Media",
}: {
  value: number | null;
  onChange: (id: number | null) => void;
  label?: string;
}) {
  const { data: media } = useApi<MediaItem[]>("/api/admin/media");
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const current = React.useMemo(
    () => (media ?? []).find((item) => item.id === value) ?? null,
    [media, value]
  );

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const item = await uploadMedia(file);
      onChange(item.id);
      toastSuccess(`Uploaded "${item.fileName}".`);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Upload failed.";
      setError(message);
      toastError(message);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <Field label={label} error={error}>
      <div className="flex flex-wrap items-center gap-3">
        {current ? (
          <img
            src={current.url}
            alt={current.altText ?? current.fileName}
            className="h-16 w-24 rounded-md border border-hairline bg-warmwhite object-cover"
          />
        ) : (
          <div className="flex h-16 w-24 items-center justify-center rounded-md border border-dashed border-hairline bg-warmwhite font-mono text-[10px] uppercase tracking-[0.15em] text-ink-soft">
            None
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
          className="hidden"
          onChange={(event) => {
            void handleFile(event.target.files?.[0]);
          }}
        />
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex h-9 items-center gap-2 rounded-full border border-hairline bg-white px-4 text-xs font-medium text-graphite transition-colors hover:border-graphite focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 disabled:opacity-50"
          >
            {uploading ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Upload className="size-3.5" />
            )}
            {uploading ? "Uploading…" : "Upload…"}
          </button>
          <Select
            value={value === null ? "" : String(value)}
            onValueChange={(next) => onChange(next === "" ? null : Number(next))}
          >
            <SelectTrigger className="h-9 w-44 rounded-full border-hairline bg-white text-xs">
              <SelectValue placeholder="Choose…" />
            </SelectTrigger>
            <SelectContent>
              {(media ?? []).length === 0 ? (
                <div className="px-2 py-1.5 text-xs text-ink-soft">
                  No media yet — upload one first.
                </div>
              ) : (
                (media ?? []).map((item) => (
                  <SelectItem key={item.id} value={String(item.id)}>
                    <span className="max-w-[220px] truncate font-mono text-[11px]">
                      {item.fileName}
                    </span>
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
          {value !== null ? (
            <button
              type="button"
              onClick={() => onChange(null)}
              aria-label="Remove media"
              className="inline-flex size-9 items-center justify-center rounded-full border border-hairline bg-white text-ink-soft transition-colors hover:border-red-300 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2"
            >
              <X className="size-3.5" />
            </button>
          ) : null}
        </div>
      </div>
    </Field>
  );
}

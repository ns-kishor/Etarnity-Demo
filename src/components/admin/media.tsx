"use client";

import * as React from "react";
import { ImageUp, Loader2, Save } from "lucide-react";
import AdminHeader from "./admin-header";
import {
  api,
  DeleteButton,
  formatBytes,
  formatDate,
  toastError,
  toastSuccess,
  uploadMedia,
  useAdminData,
} from "./admin-utils";
import { Input } from "@/components/ui/input";
import { LoadingState, ErrorState, EmptyState } from "@/components/site/states";
import type { MediaItem } from "@/lib/types";
import { cn } from "@/lib/utils";

const ACCEPTED = "image/png,image/jpeg,image/webp,image/gif,image/svg+xml";

function formatMime(mime: string): string {
  return mime.replace("image/", "").toUpperCase();
}

/** One gallery card: preview, file meta, inline alt-text editor, delete. */
function MediaCard({
  item,
  onSaved,
  onDeleted,
}: {
  item: MediaItem;
  onSaved: () => void;
  onDeleted: () => void;
}) {
  const [alt, setAlt] = React.useState(item.altText ?? "");
  const [savingAlt, setSavingAlt] = React.useState(false);
  const dirty = alt !== (item.altText ?? "");

  const isSvg = item.mimeType === "image/svg+xml";

  const saveAlt = async () => {
    setSavingAlt(true);
    try {
      await api(`/api/admin/media/${item.id}`, "PUT", {
        altText: alt.trim() === "" ? null : alt,
      });
      toastSuccess("Alt text saved");
      onSaved();
    } catch (e) {
      toastError(
        "Could not save alt text.",
        e instanceof Error ? e.message : undefined
      );
    } finally {
      setSavingAlt(false);
    }
  };

  const remove = async () => {
    try {
      await api(`/api/admin/media/${item.id}`, "DELETE");
      toastSuccess(`Deleted "${item.fileName}".`);
      onDeleted();
    } catch (e) {
      toastError(
        "Could not delete media.",
        e instanceof Error ? e.message : undefined
      );
    }
  };

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-hairline bg-white">
      <div className="relative aspect-[4/3] border-b border-hairline bg-warmwhite">
        {isSvg ? (
          <div className="flex h-full w-full flex-col items-center justify-center gap-1 text-ink-soft">
            <ImageUp className="size-6" aria-hidden="true" />
            <span className="font-mono text-[10px] uppercase tracking-[0.15em]">
              SVG
            </span>
          </div>
        ) : (
          <img
            src={item.url}
            alt={item.altText ?? item.fileName}
            loading="lazy"
            className="h-full w-full object-cover"
          />
        )}
        <span className="absolute left-2 top-2 rounded-full bg-graphite/80 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.15em] text-warmwhite">
          {formatMime(item.mimeType)}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-3">
        <p
          className="truncate font-mono text-[10px] text-ink-soft"
          title={item.fileName}
        >
          {item.fileName}
        </p>
        <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-ink-soft">
          {formatBytes(item.size)} · {formatDate(item.createdAt)}
        </p>
        <div className="mt-auto flex items-center gap-2 pt-1">
          <Input
            value={alt}
            onChange={(e) => setAlt(e.target.value)}
            placeholder="Alt text…"
            aria-label={`Alt text for ${item.fileName}`}
            className="h-8 border-hairline text-xs focus-visible:ring-electric"
          />
          {dirty ? (
            <button
              type="button"
              onClick={() => void saveAlt()}
              disabled={savingAlt}
              aria-label="Save alt text"
              className="inline-flex size-8 shrink-0 items-center justify-center rounded-md bg-graphite text-white transition-colors hover:bg-[#23262D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 disabled:opacity-50"
            >
              {savingAlt ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Save className="size-3.5" />
              )}
            </button>
          ) : null}
        </div>
        <DeleteButton onConfirm={() => remove()} ariaLabel={`Delete ${item.fileName}`} />
      </div>
    </div>
  );
}

export default function MediaSection() {
  const { data, loading, error, refresh } = useAdminData<MediaItem[]>(
    "/api/admin/media"
  );

  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = React.useState(false);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    let ok = 0;
    for (const file of Array.from(files)) {
      try {
        await uploadMedia(file);
        ok += 1;
      } catch (e) {
        toastError(
          `Could not upload "${file.name}".`,
          e instanceof Error ? e.message : undefined
        );
      }
    }
    if (ok > 0) {
      toastSuccess(
        ok === 1 ? "Uploaded 1 file." : `Uploaded ${ok} files.`,
        ok === files.length ? undefined : `${files.length - ok} failed.`
      );
      refresh();
    }
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div>
      <AdminHeader
        section="Media"
        title="Media"
        description="Uploaded images — PNG, JPEG, WebP, GIF and SVG up to 5 MB each."
        action={
          <>
            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPTED}
              multiple
              className="hidden"
              onChange={(event) => {
                void handleFiles(event.target.files);
              }}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className={cn(
                "inline-flex h-10 items-center gap-2 rounded-full bg-graphite px-5 text-sm font-medium text-white transition-colors hover:bg-[#23262D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2",
                uploading && "cursor-wait opacity-70"
              )}
            >
              {uploading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <ImageUp className="size-4" />
              )}
              {uploading ? "Uploading…" : "Upload Images"}
            </button>
          </>
        }
      />

      {loading ? <LoadingState label="Loading media" /> : null}

      {!loading && error ? <ErrorState message={error} onRetry={refresh} /> : null}

      {!loading && !error && (data ?? []).length === 0 ? (
        <EmptyState
          title="No media yet."
          description="Upload the first image — it becomes available in every content form."
        />
      ) : null}

      {!loading && !error && (data ?? []).length > 0 ? (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {(data ?? []).map((item) => (
            <MediaCard
              key={item.id}
              item={item}
              onSaved={refresh}
              onDeleted={refresh}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

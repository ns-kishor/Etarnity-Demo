import * as React from "react";
import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

/** Centered loading state — three pulsing skeleton rows in a card. */
export function LoadingState({
  label = "Loading",
  className,
}: {
  label?: string;
  className?: string;
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn("mx-auto flex w-full max-w-md flex-col items-center", className)}
    >
      <div className="w-full rounded-xl border border-hairline bg-white p-6">
        <div className="space-y-3">
          <div className="h-4 w-3/4 animate-pulse rounded-full bg-hairline" />
          <div className="h-4 w-full animate-pulse rounded-full bg-hairline" />
          <div className="h-4 w-5/6 animate-pulse rounded-full bg-hairline" />
        </div>
      </div>
      <span className="sr-only">{label}</span>
      <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.22em] text-ink-soft">
        {label}
      </p>
    </div>
  );
}

/** Centered error state with optional retry action. */
export function ErrorState({
  message = "Something went wrong while loading this content.",
  onRetry,
  className,
}: {
  message?: string;
  onRetry?: () => void;
  className?: string;
}) {
  return (
    <div
      role="alert"
      className={cn(
        "mx-auto flex w-full max-w-md flex-col items-center text-center",
        className
      )}
    >
      <div className="flex h-11 w-11 items-center justify-center rounded-full border border-hairline bg-white">
        <AlertTriangle className="h-5 w-5 text-ink-soft" aria-hidden="true" />
      </div>
      <p className="mt-4 text-sm leading-relaxed text-ink-soft">{message}</p>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="mt-6 inline-flex min-h-11 items-center justify-center rounded-full border border-hairline bg-white px-6 text-sm font-medium text-graphite transition-colors hover:border-graphite"
        >
          Try again
        </button>
      ) : null}
    </div>
  );
}

/** Centered empty state in a dashed-border card. */
export function EmptyState({
  title,
  description,
  icon,
  className,
}: {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mx-auto flex w-full max-w-md flex-col items-center rounded-xl border border-dashed border-hairline bg-white/60 px-8 py-12 text-center",
        className
      )}
    >
      {icon ? (
        <div
          className="mb-4 flex h-11 w-11 items-center justify-center rounded-full border border-hairline bg-white text-ink-soft"
          aria-hidden="true"
        >
          {icon}
        </div>
      ) : null}
      <h3 className="text-base font-semibold text-graphite">{title}</h3>
      {description ? (
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">{description}</p>
      ) : null}
    </div>
  );
}

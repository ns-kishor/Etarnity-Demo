import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Status pill — mono, uppercase, with a 4px dot in the current text color so
 * status is never communicated by color alone (dot + text label).
 */

const EMERALD = "text-emerald-700 border-emerald-700/25 bg-emerald-50";
const ELECTRIC = "text-electric border-electric/25 bg-electric/[0.06]";
const NEUTRAL = "text-ink-soft border-hairline bg-white";
const NEUTRAL_DASHED = "text-ink-soft border-hairline border-dashed bg-white";
const AMBER = "text-[#B45309] border-amber-600/25 bg-amber-50";
const VIOLET = "text-violet-700 border-violet-700/25 bg-violet-50";
const CYAN = "text-[#0E7490] border-cyan-700/25 bg-cyan-50";
const NEUTRAL_SOLID = "bg-[#6B7280] text-white border-transparent";

const STATUS_STYLES: Record<string, string> = {
  // Operational (Business.operationalStatus, Project.projectStatus)
  ACTIVE: EMERALD,
  LIVE: EMERALD,
  IN_DEVELOPMENT: ELECTRIC,
  MAINTENANCE: AMBER,
  PLANNED: NEUTRAL,
  ARCHIVED: NEUTRAL_DASHED,
  // Ownership (Project.ownershipType)
  INTERNAL_PRODUCT: CYAN,
  CLIENT_PROJECT: NEUTRAL_SOLID,
  DEMONSTRATION: AMBER,
  EXPERIMENT: VIOLET,
  PERSONAL_PROJECT: VIOLET,
  PARTNER: NEUTRAL_SOLID,
  // Articles
  DRAFT: NEUTRAL_DASHED,
  SCHEDULED: ELECTRIC,
  PUBLISHED: EMERALD,
  // Inquiries
  NEW: ELECTRIC,
  IN_PROGRESS: ELECTRIC,
  RESOLVED: EMERALD,
};

const FALLBACK = NEUTRAL;

export interface StatusChipProps {
  status: string;
  className?: string;
}

function formatLabel(status: string): string {
  return status
    .split("_")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

export function StatusChip({ status, className }: StatusChipProps) {
  const style = STATUS_STYLES[status] ?? FALLBACK;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.15em]",
        style,
        className
      )}
    >
      <span
        aria-hidden="true"
        className="h-1 w-1 shrink-0 rounded-full bg-current"
      />
      {formatLabel(status)}
    </span>
  );
}

export default StatusChip;

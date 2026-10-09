"use client";

import * as React from "react";

/**
 * Small shared header for every admin section:
 * mono eyebrow `ADMIN / {SECTION}` + title + description + action slot.
 */
export default function AdminHeader({
  section,
  title,
  description,
  action,
}: {
  section: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-electric">
          Admin / {section}
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-graphite">
          {title}
        </h1>
        {description ? (
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-soft">
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="flex shrink-0 items-center gap-3">{action}</div> : null}
    </div>
  );
}

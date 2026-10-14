"use client";

/**
 * ETARNITY — ventures & investments (ecosystem block).
 * Four modes of deploying capital and capability as quiet panels in an
 * asymmetric two-column rhythm. The building mode carries today's focus.
 */

import { ArrowUpRight, Plus } from "lucide-react";
import { ventures } from "@/content/site";
import {
  SectionHeading,
  SectionShell,
  Stagger,
  StaggerItem,
} from "@/components/etarnity/primitives";
import { cn } from "@/lib/utils";

/* Asymmetric 2-col rhythm — the focused panel leads wide, rows mirror */
const SPANS: Record<string, string> = {
  building: "md:col-span-7",
  investing: "md:col-span-5",
  partnering: "md:col-span-5",
  experimenting: "md:col-span-7",
};

export function Ventures() {
  return (
    <SectionShell id="ventures" ariaLabel="Ventures and investments">
      {/* Ambient: faint lavender wash, top right */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-[-8%] top-[6%] h-[46vh] w-[42vw] glow-faint"
      />

      <SectionHeading
        index={ventures.index}
        kicker={ventures.kicker}
        title={ventures.title}
        lead={ventures.lead}
      />

      <Stagger className="grid grid-cols-1 gap-4 md:grid-cols-12" stagger={0.09}>
        {ventures.activities.map((activity) => {
          const highlighted = activity.id === "building";
          return (
            <StaggerItem
              key={activity.id}
              as="article"
              className={cn(
                "rounded-[24px] border p-6 transition-colors duration-300 md:p-7",
                SPANS[activity.id] ?? "md:col-span-6",
                highlighted
                  ? "border-accent/30 bg-accent-soft/40"
                  : "border-border bg-card hover:border-accent/40 hover:bg-accent-soft/20"
              )}
            >
              <div className="flex items-center justify-between gap-4">
                <span className="label-mono text-accent-deep tabular-nums">
                  {activity.mode}
                </span>
                {highlighted && (
                  <span className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-card/60 px-3 py-1.5">
                    <span
                      className="h-1 w-1 rounded-full bg-accent"
                      aria-hidden="true"
                    />
                    <span className="label-mono text-accent-deep">
                      Focus today
                    </span>
                  </span>
                )}
              </div>

              <h3 className="mt-4 text-balance font-display text-2xl font-light tracking-[-0.02em] text-foreground md:text-[1.75rem]">
                {activity.title}
              </h3>
              <p className="mt-3 text-[14px] leading-relaxed text-muted-foreground">
                {activity.description}
              </p>

              <ul className="mt-6">
                {activity.items.map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-3 border-t border-border py-3.5"
                  >
                    {highlighted ? (
                      <Plus
                        className="h-3.5 w-3.5 shrink-0 text-accent"
                        strokeWidth={1.5}
                        aria-hidden="true"
                      />
                    ) : (
                      <ArrowUpRight
                        className="h-3.5 w-3.5 shrink-0 text-muted-foreground/70"
                        strokeWidth={1.5}
                        aria-hidden="true"
                      />
                    )}
                    <span className="text-[13.5px] font-medium tracking-tight text-foreground/75">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </StaggerItem>
          );
        })}
      </Stagger>
    </SectionShell>
  );
}

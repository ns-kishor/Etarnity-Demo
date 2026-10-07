"use client";

import { ArrowUpRight, Plus } from "lucide-react";
import { ventures } from "@/content/site";
import {
  SectionHeading,
  SectionShell,
  Stagger,
  StaggerItem,
} from "@/components/primitives/corporate";
import { cn } from "@/lib/utils";

/**
 * Ventures & Investments — the four modes in which the ecosystem grows.
 *
 * Bordered panels in a relaxed grid (gap-4). The "Building" panel is the
 * emphasized one: emerald-tinted surface + emerald border, mirroring the
 * lead's honest framing (activity is concentrated on building today).
 */

export function Ventures() {
  return (
    <SectionShell id="ventures" ariaLabel="Ventures and investments">
      <div className="py-20 md:py-28">
        <SectionHeading
          index={ventures.index}
          kicker={ventures.kicker}
          title={ventures.title}
          lead={ventures.lead}
        />

        <Stagger className="mt-12 grid gap-4 md:mt-16 md:grid-cols-2">
          {ventures.activities.map((activity) => {
            const highlighted = activity.id === "building";
            return (
              <StaggerItem
                key={activity.id}
                as="article"
                className={cn(
                  "rounded-sm border p-6 transition-colors duration-500 md:p-7",
                  highlighted
                    ? "border-emerald-corp/25 bg-emerald-corp/[0.04] hover:border-emerald-corp/40"
                    : "border-border/60 bg-background hover:border-emerald-corp/40 hover:bg-card/50"
                )}
              >
                {/* Mode number + focus marker */}
                <div className="flex items-baseline justify-between gap-4">
                  <span className="font-mono text-[11px] tracking-[0.22em] text-champagne/80">
                    {activity.mode}
                  </span>
                  {highlighted && (
                    <span className="label-mono text-emerald-corp/90">
                      Focus today
                    </span>
                  )}
                </div>

                <h3 className="mt-4 text-xl font-medium tracking-tight text-ivory">
                  {activity.title}
                </h3>
                <p className="mt-3 text-[13.5px] leading-relaxed text-muted-foreground">
                  {activity.description}
                </p>

                <ul
                  className={cn(
                    "mt-6 space-y-2.5 border-t pt-5",
                    highlighted ? "border-emerald-corp/15" : "border-border/60"
                  )}
                >
                  {activity.items.map((item) => (
                    <li key={item} className="flex items-start gap-2.5">
                      {highlighted ? (
                        <Plus
                          aria-hidden="true"
                          className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-corp"
                          strokeWidth={1.5}
                        />
                      ) : (
                        <ArrowUpRight
                          aria-hidden="true"
                          className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-corp/70"
                          strokeWidth={1.5}
                        />
                      )}
                      <span className="text-[13px] leading-relaxed text-foreground/80">
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              </StaggerItem>
            );
          })}
        </Stagger>
      </div>
    </SectionShell>
  );
}

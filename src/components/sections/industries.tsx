"use client";

import { industries, type Industry } from "@/content/site";
import {
  Reveal,
  SectionHeading,
  SectionShell,
  Stagger,
  StaggerItem,
} from "@/components/primitives/corporate";
import { cn } from "@/lib/utils";

/**
 * Industries — an ecosystem map.
 *
 * Eight cells on a hairline grid (2 cols mobile / 4 cols desktop), each
 * marked by its stage: Operating (emerald), Building (champagne),
 * Exploring (muted). A legend and a closing line sit below the map.
 */

const STAGE_STYLES: Record<Industry["stage"], { dot: string; text: string }> = {
  Operating: { dot: "bg-emerald-corp", text: "text-emerald-corp" },
  Building: { dot: "bg-champagne", text: "text-champagne" },
  Exploring: { dot: "bg-muted-foreground", text: "text-muted-foreground" },
};

const LEGEND: { stage: Industry["stage"]; note: string }[] = [
  { stage: "Operating", note: "active today" },
  { stage: "Building", note: "in development" },
  { stage: "Exploring", note: "early, deliberate" },
];

export function Industries() {
  return (
    <SectionShell id="industries" ariaLabel="Industries we operate in">
      <div className="py-20 md:py-28">
        <SectionHeading
          index="07"
          kicker="Industries"
          title="Where we operate — and where we're going."
          lead="A map of the ETARNITY ecosystem: industries we operate in today, industries we're building toward, and industries we're deliberately exploring."
        />

        <Stagger className="mt-12 grid grid-cols-2 gap-px overflow-hidden rounded-sm border border-border/60 bg-border/60 md:mt-16 md:grid-cols-4">
          {industries.map((industry) => {
            const stage = STAGE_STYLES[industry.stage];
            return (
              <StaggerItem
                key={industry.name}
                as="article"
                className="bg-background p-5 transition-colors duration-500 hover:bg-card/50"
              >
                {/* Stage marker */}
                <div className="flex items-center gap-2">
                  <span
                    aria-hidden="true"
                    className={cn("h-1.5 w-1.5 rounded-full", stage.dot)}
                  />
                  <span
                    className={cn(
                      "font-mono text-[10px] uppercase tracking-[0.18em]",
                      stage.text
                    )}
                  >
                    {industry.stage}
                  </span>
                </div>

                <h3 className="mt-4 min-h-14 text-lg font-medium tracking-tight text-ivory">
                  {industry.name}
                </h3>
                <p className="mt-2 text-[12.5px] leading-relaxed text-muted-foreground">
                  {industry.description}
                </p>
              </StaggerItem>
            );
          })}
        </Stagger>

        {/* Legend + closing line */}
        <Reveal delay={0.1}>
          <div className="mt-8 flex flex-col gap-4 border-t border-border/60 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <ul className="flex flex-wrap items-center gap-x-6 gap-y-2">
              {LEGEND.map(({ stage, note }) => (
                <li key={stage} className="flex items-center gap-2">
                  <span
                    aria-hidden="true"
                    className={cn(
                      "h-1.5 w-1.5 rounded-full",
                      STAGE_STYLES[stage].dot
                    )}
                  />
                  <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground/80">
                    {stage} · {note}
                  </span>
                </li>
              ))}
            </ul>
            <p className="text-[13px] italic font-editorial text-muted-foreground">
              One ecosystem — each industry strengthens the others.
            </p>
          </div>
        </Reveal>
      </div>
    </SectionShell>
  );
}

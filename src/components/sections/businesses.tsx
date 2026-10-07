"use client";

import { businesses, type BusinessEntity } from "@/content/site";
import {
  SectionHeading,
  SectionShell,
  Stagger,
  StaggerItem,
} from "@/components/primitives/corporate";
import { cn } from "@/lib/utils";

/**
 * Our Businesses — the portfolio of the group.
 *
 * Each business is presented as a distinct entity (not a service card):
 * monogram, status, industry, description, purpose and its relationship
 * to the parent structure. Hairline grid: cells sit on `bg-background`
 * inside a `gap-px bg-border/60` container.
 */

const STATUS_STYLES: Record<
  BusinessEntity["status"],
  { pill: string; dot: string }
> = {
  Operating: {
    pill: "border-emerald-corp/40 bg-emerald-corp/5 text-emerald-corp",
    dot: "bg-emerald-corp",
  },
  Building: {
    pill: "border-champagne/40 bg-champagne/5 text-champagne",
    dot: "bg-champagne",
  },
  "Early-stage": {
    pill: "border-border text-muted-foreground",
    dot: "bg-muted-foreground",
  },
};

/** Monogram letter — the distinctive initial of the entity name. */
function monogram(name: string): string {
  const stripped = name.replace(/^ETARNITY\s+/i, "").trim();
  return (stripped.charAt(0) || name.charAt(0)).toUpperCase();
}

export function Businesses() {
  return (
    <SectionShell id="businesses" ariaLabel="Our businesses">
      <div className="py-20 md:py-28">
        <SectionHeading
          index="05"
          kicker="Our Businesses"
          title="One company. A portfolio of businesses."
          lead="Each business inside ETARNITY operates with its own purpose and discipline — connected by shared engineering standards, shared values and one long-term structure."
        />

        <Stagger className="mt-12 grid gap-px overflow-hidden rounded-sm border border-border/60 bg-border/60 md:mt-16 md:grid-cols-2">
          {businesses.map((business) => {
            const status = STATUS_STYLES[business.status];
            return (
              <StaggerItem
                key={business.id}
                as="article"
                className="flex flex-col bg-background p-6 transition-colors duration-500 hover:bg-card/50 md:p-8"
              >
                {/* Identity row — monogram + status */}
                <div className="flex items-start justify-between gap-4">
                  <div
                    aria-hidden="true"
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-sm border border-border"
                  >
                    <span className="font-editorial text-xl text-emerald-corp">
                      {monogram(business.name)}
                    </span>
                  </div>
                  <span
                    className={cn(
                      "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.16em]",
                      status.pill
                    )}
                  >
                    <span
                      aria-hidden="true"
                      className={cn("h-1.5 w-1.5 rounded-full", status.dot)}
                    />
                    {business.status}
                  </span>
                </div>

                {/* Entity */}
                {business.url ? (
                  <h3 className="mt-6 text-2xl font-medium tracking-tight text-ivory">
                    <a
                      href={business.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="transition-colors hover:text-emerald-corp"
                    >
                      {business.name}
                    </a>
                  </h3>
                ) : (
                  <h3 className="mt-6 text-2xl font-medium tracking-tight text-ivory">
                    {business.name}
                  </h3>
                )}
                <p className="label-mono mt-1">{business.industry}</p>
                <p className="mt-4 text-[14px] leading-relaxed text-muted-foreground">
                  {business.description}
                </p>

                {/* Purpose */}
                <div className="mt-5">
                  <p className="label-mono text-emerald-corp/90">Purpose</p>
                  <p className="mt-1.5 text-[13px] italic leading-relaxed text-foreground/80">
                    “{business.purpose}”
                  </p>
                </div>

                {/* Footer — relationship + category */}
                <div className="mt-auto flex items-center justify-between gap-4 pt-6">
                  <span className="font-mono text-[10px] leading-snug text-muted-foreground/70">
                    {business.relationship}
                  </span>
                  <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.18em] text-champagne/80">
                    {business.category}
                  </span>
                </div>
              </StaggerItem>
            );
          })}
        </Stagger>
      </div>
    </SectionShell>
  );
}

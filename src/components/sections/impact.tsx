"use client";

import {
  Building2,
  Compass,
  Network,
  Shield,
  Sprout,
  Users,
} from "lucide-react";
import { impact } from "@/content/site";
import {
  Reveal,
  SectionHeading,
  SectionShell,
  Stagger,
  StaggerItem,
} from "@/components/primitives/corporate";

/**
 * Impact — the commitments the company measures itself against.
 *
 * Honest framing by design: no invented metrics, no counters. Six quiet
 * panels (one lucide icon each), closed by a plain statement of standard
 * instead of numbers we don't yet have.
 */

const AREA_ICONS = [Building2, Users, Compass, Network, Shield, Sprout];

export function Impact() {
  return (
    <SectionShell id="impact" ariaLabel="The impact we want to create">
      <div className="py-20 md:py-28">
        <SectionHeading
          index={impact.index}
          kicker={impact.kicker}
          title={impact.title}
          lead={impact.lead}
          serifTitle
        />

        <Stagger className="mt-12 grid gap-4 md:mt-16 md:grid-cols-2 lg:grid-cols-3">
          {impact.areas.map((area, i) => {
            const Icon = AREA_ICONS[i % AREA_ICONS.length];
            return (
              <StaggerItem
                key={area.title}
                as="article"
                className="rounded-sm border border-border/60 bg-background p-6 transition-colors duration-500 hover:border-emerald-corp/40 hover:bg-card/50"
              >
                <Icon
                  aria-hidden="true"
                  className="h-4 w-4 text-emerald-corp"
                  strokeWidth={1.5}
                />
                <h3 className="mt-4 text-[15px] font-medium tracking-tight text-ivory">
                  {area.title}
                </h3>
                <p className="mt-3 text-[13.5px] leading-relaxed text-muted-foreground">
                  {area.body}
                </p>
              </StaggerItem>
            );
          })}
        </Stagger>

        {/* Honest closing statement — numbers will live here, when they're real. */}
        <Reveal delay={0.1}>
          <div className="mt-14 border-t border-border/60 py-8 md:flex md:items-baseline md:gap-12">
            <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.22em] text-champagne/80">
              Our standard
            </span>
            <p className="mt-4 max-w-2xl text-[13px] leading-relaxed text-muted-foreground md:mt-0">
              We're early in our history. When we have real numbers to report,
              you'll find them here — not before.
            </p>
          </div>
        </Reveal>
      </div>
    </SectionShell>
  );
}

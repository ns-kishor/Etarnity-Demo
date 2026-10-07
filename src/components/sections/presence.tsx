"use client";

import { MapPin } from "lucide-react";
import { presence } from "@/content/site";
import {
  Reveal,
  SectionHeading,
  SectionShell,
} from "@/components/primitives/corporate";

/**
 * Presence — honest, single-location framing.
 *
 * One headquarters, stated plainly: no invented global footprint. The
 * section stays atmospheric but quiet — a faint masked system grid, a
 * soft emerald glow behind the HQ card, and a minimal radar mark that
 * simply says "we are here".
 */
export function Presence() {
  return (
    <SectionShell
      id="presence"
      ariaLabel="Global presence"
      className="overflow-hidden bg-card/30"
    >
      {/* Faint system grid, masked to a soft ellipse at the center */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-grid-faint [mask-image:radial-gradient(ellipse_at_center,black_35%,transparent_75%)]"
      />

      <div className="relative py-16 md:py-24">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Left — heading + building ledger */}
          <div>
            <SectionHeading
              index={presence.index}
              kicker={presence.kicker}
              title={presence.title}
              lead={presence.lead}
              serifTitle
            />

            <Reveal delay={0.2}>
              <dl className="mt-10">
                {presence.building.map((row) => (
                  <div
                    key={row.label}
                    className="flex items-baseline justify-between gap-6 border-t border-border/60 py-4"
                  >
                    <dt className="label-mono">{row.label}</dt>
                    <dd className="text-right font-mono text-[12px] text-ivory/90">
                      {row.value}
                    </dd>
                  </div>
                ))}
                <div aria-hidden="true" className="border-t border-border/60" />
              </dl>
            </Reveal>
          </div>

          {/* Right — the HQ coordinates card */}
          <Reveal
            direction="left"
            distance={24}
            delay={0.15}
            className="relative"
          >
            {/* Faint white glow behind the card */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-24 -top-20 h-96 w-96 rounded-full bg-[radial-gradient(circle,var(--glow-faint),transparent_70%)]"
            />

            <div className="relative rounded-sm border border-border/60 bg-background/60 p-6 md:p-8">
              {/* Minimal radar — three quiet rings, one steady pulse */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute right-5 top-5 h-16 w-16 md:right-6 md:top-6 md:h-24 md:w-24"
              >
                <span className="absolute inset-0 rounded-full border border-emerald-corp/20" />
                <span className="absolute inset-[17%] rounded-full border border-emerald-corp/25" />
                <span className="absolute inset-[33%] rounded-full border border-emerald-corp/30" />
                <span className="absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 animate-pulse rounded-full bg-emerald-corp" />
              </div>

              <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-champagne">
                {presence.hq.label}
              </span>

              <h3 className="mt-4 text-4xl font-medium tracking-tight text-ivory md:text-5xl">
                {presence.hq.city}
              </h3>
              <p className="mt-1 text-lg text-muted-foreground">
                {presence.hq.country}
              </p>

              <p className="mt-8 flex items-center gap-2.5 font-mono text-[12px] tracking-[0.08em] text-emerald-corp/80">
                <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                {presence.hq.coordinates}
              </p>
            </div>
          </Reveal>
        </div>

        {/* Closing line */}
        <Reveal delay={0.1}>
          <div className="mt-14">
            <div aria-hidden="true" className="hairline" />
            <p className="pt-6 font-editorial text-[13px] italic text-muted-foreground">
              One headquarters. A global standard of work. The footprint will
              follow the work — not the other way around.
            </p>
          </div>
        </Reveal>
      </div>
    </SectionShell>
  );
}

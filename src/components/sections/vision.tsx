"use client";

import { vision } from "@/content/site";
import { Reveal, SectionShell } from "@/components/primitives/corporate";

/**
 * Vision — the cinematic peak of the page.
 *
 * A full-bleed editorial statement set at display scale over a
 * masked system grid, with "global ecosystem" carried by the
 * brand emerald. The three-horizon timeline grounds the ambition
 * in near / mid / long arcs divided by hairlines.
 */

/** The phrase the vision statement carries in emerald. */
const EMPHASIS = "global ecosystem";

/**
 * Deterministic, SSR-safe split of the statement around the
 * emphasized phrase. Falls back to the plain statement if the
 * copy ever changes — no hydration mismatch possible.
 */
function VisionStatement() {
  const statement = vision.statement;
  const at = statement.indexOf(EMPHASIS);

  if (at === -1) {
    return <>{statement}</>;
  }

  return (
    <>
      {statement.slice(0, at)}
      <span className="text-emerald-corp">{EMPHASIS}</span>
      {statement.slice(at + EMPHASIS.length)}
    </>
  );
}

export function Vision() {
  return (
    <SectionShell
      id="vision"
      ariaLabel="Our vision"
      className="overflow-hidden bg-background"
    >
      {/* Faint system grid, masked so it dissolves toward the edges */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-grid-faint [mask-image:radial-gradient(ellipse_65%_55%_at_50%_42%,black_25%,transparent_72%)]"
      />
      {/* Soft gray glow, low center — the horizon the section points to */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-[-12%] left-1/2 h-[420px] w-[min(92vw,900px)] -translate-x-1/2 bg-[radial-gradient(closest-side,var(--glow-deep),transparent)] blur-3xl"
      />

      <div className="relative py-20 md:py-28">
        {/* Centered kicker */}
        <Reveal>
          <div className="flex items-baseline justify-center gap-4">
            <span className="font-mono text-[11px] tracking-[0.22em] text-champagne/80">
              {vision.index}
            </span>
            <span className="label-mono text-emerald-corp/90">
              {vision.kicker}
            </span>
          </div>
        </Reveal>

        {/* The statement, at full display scale */}
        <Reveal blur delay={0.12} duration={1.15}>
          <h2 className="mx-auto max-w-5xl py-16 text-balance text-center font-editorial font-light text-3xl leading-[1.08] text-ivory sm:text-4xl md:py-24 md:text-5xl lg:text-[4.2rem]">
            <VisionStatement />
          </h2>
        </Reveal>

        <Reveal delay={0.24}>
          <p className="mx-auto max-w-2xl text-pretty text-center text-[15px] leading-relaxed text-muted-foreground md:text-base">
            {vision.supporting}
          </p>
        </Reveal>

        {/* Horizon — near / mid / long, divided by hairlines */}
        <Reveal delay={0.08} distance={18}>
          <div className="mt-16 grid border-t border-border/60 md:mt-20 md:grid-cols-3 md:divide-x md:divide-border/60">
            {vision.horizon.map((horizon) => (
              <div
                key={horizon.label}
                className="border-t border-border/60 py-7 first:border-t-0 md:border-t-0 md:px-8 md:first:pl-0 md:last:pr-0"
              >
                <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-champagne/80">
                  {horizon.label}
                </span>
                <p className="mt-3 text-[13.5px] leading-relaxed text-muted-foreground">
                  {horizon.body}
                </p>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </SectionShell>
  );
}

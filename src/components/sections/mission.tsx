"use client";

import { mission } from "@/content/site";
import { Reveal, SectionShell } from "@/components/primitives/corporate";

/**
 * Mission — the centered editorial moment.
 *
 * No section title: the statement itself is the display, set in
 * Fraunces and blurred-in like a page being turned. Below it, the
 * three focus blocks read as footnotes to the statement, and the
 * four operating principles close the section as quiet panels.
 */
export function Mission() {
  return (
    <SectionShell
      id="mission"
      ariaLabel="Our mission"
      className="overflow-hidden bg-background"
    >
      {/* Faint emerald glow behind the statement — barely there */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-14 h-[440px] w-[min(92vw,740px)] -translate-x-1/2 bg-[radial-gradient(closest-side,oklch(0.66_0.105_163/0.07),transparent)] blur-2xl"
      />

      <div className="relative py-20 md:py-28">
        {/* Centered kicker — mirrors the SectionHeading structure, centered */}
        <Reveal>
          <div className="flex items-baseline justify-center gap-4">
            <span className="font-mono text-[11px] tracking-[0.22em] text-champagne/80">
              {mission.index}
            </span>
            <span className="label-mono text-emerald-corp/90">
              {mission.kicker}
            </span>
          </div>
        </Reveal>

        {/* The statement is the display */}
        <Reveal blur delay={0.12} duration={1}>
          <h2 className="mx-auto mt-10 max-w-4xl text-balance text-center font-editorial font-light text-3xl leading-[1.15] text-ivory md:mt-14 md:text-4xl lg:text-[3.2rem]">
            {mission.statement}
          </h2>
        </Reveal>

        <Reveal delay={0.24}>
          <p className="mx-auto mt-8 max-w-2xl text-pretty text-center text-[15px] leading-relaxed text-muted-foreground md:text-base">
            {mission.lead}
          </p>
        </Reveal>

        {/* Three focus blocks — footnotes under a hairline */}
        <div className="mt-16 grid gap-10 md:mt-20 md:grid-cols-3 md:gap-8">
          {mission.focus.map((focus, i) => (
            <Reveal key={focus.title} delay={0.08 + i * 0.08} distance={20}>
              <div className="border-t border-border/60 pt-6">
                <h3 className="font-mono text-[11px] uppercase tracking-[0.18em] text-ivory">
                  {focus.title}
                </h3>
                <p className="mt-3 text-[13.5px] leading-relaxed text-muted-foreground">
                  {focus.body}
                </p>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Four operating principles — quiet panels */}
        <div className="mt-12 grid gap-4 sm:grid-cols-2 md:mt-16">
          {mission.principles.map((principle, i) => (
            <Reveal key={principle.id} delay={i * 0.06} distance={16}>
              <div className="rounded-sm border border-border/60 p-5 transition-colors duration-500 hover:border-emerald-corp/40 hover:bg-card/40">
                <div className="flex items-baseline gap-3">
                  <span className="font-mono text-[11px] tracking-[0.22em] text-champagne/80">
                    {principle.id}
                  </span>
                  <h3 className="text-[15px] font-medium text-ivory">
                    {principle.title}
                  </h3>
                </div>
                <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
                  {principle.body}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </SectionShell>
  );
}

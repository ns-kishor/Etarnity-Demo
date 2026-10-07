"use client";

import { problems } from "@/content/site";
import {
  Reveal,
  SectionHeading,
  SectionShell,
} from "@/components/primitives/corporate";

/**
 * Problems — the editorial index of standing problems.
 *
 * Not a card grid: a ledger. Each row pairs one problem with our
 * response to it, separated by hairlines. Rows breathe on hover
 * with a background shift and a two-pixel padding settle — no
 * transforms, no theatrics.
 */
export function Problems() {
  return (
    <SectionShell
      id="problems"
      ariaLabel="The problems we're working to solve"
      className="bg-background"
    >
      <div className="py-20 md:py-28">
        <SectionHeading
          index={problems.index}
          kicker={problems.kicker}
          title={problems.title}
          lead={problems.lead}
          serifTitle
        />

        {/* The index — one row per problem, problem left, response right */}
        <ul className="mt-12 md:mt-16">
          {problems.areas.map((area, i) => (
            <Reveal
              as="li"
              key={area.id}
              delay={i * 0.05}
              distance={14}
              className="group -mx-4 grid gap-4 border-t border-border/60 px-4 py-7 transition-[padding,background-color] duration-500 hover:bg-card/40 hover:px-[18px] md:-mx-6 md:grid-cols-12 md:items-baseline md:px-6 md:py-8 md:hover:px-[26px]"
            >
              <span className="font-mono text-[11px] tracking-[0.22em] text-champagne/80 md:col-span-1">
                {area.id}
              </span>
              <h3 className="text-lg font-medium tracking-tight text-ivory transition-colors duration-500 group-hover:text-emerald-corp md:col-span-3 md:text-xl">
                {area.title}
              </h3>
              <p className="text-[13.5px] leading-relaxed text-muted-foreground md:col-span-4">
                {area.body}
              </p>
              <div className="md:col-span-4">
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-emerald-corp/70">
                  Our Response
                </span>
                <p className="mt-2 text-[13px] leading-relaxed text-foreground/80">
                  {area.response}
                </p>
              </div>
            </Reveal>
          ))}
        </ul>

        {/* Close the ledger */}
        <Reveal direction="none" duration={0.8}>
          <div className="hairline" />
        </Reveal>
      </div>
    </SectionShell>
  );
}

"use client";

/**
 * ETARNITY — problems worth solving.
 * PRD §18: each problem appears as an editorial statement. A numbered ledger
 * (01 → 07) that reveals sequentially as the user scrolls — large light
 * numerals, quiet titles, and our response set plainly against them.
 * PROBLEM 01 → 02 → 03 as the page moves.
 */

import { problems } from "@/content/site";
import {
  Reveal,
  SectionHeading,
  SectionShell,
} from "@/components/etarnity/primitives";

export function Problems() {
  return (
    <SectionShell id="problems" ariaLabel="Problems worth solving" alt>
      <SectionHeading
        index={problems.index}
        kicker={problems.kicker}
        title={problems.title}
        lead={problems.lead}
      />

      {/* Editorial ledger — one problem per row, numbered and answered */}
      <ul
        className="border-b border-border"
        aria-label="The problems we organize around"
      >
        {problems.areas.map((area, i) => (
          <Reveal
            key={area.id}
            as="li"
            delay={i * 0.06}
            className="group grid grid-cols-1 gap-4 border-t border-border py-8 transition-[padding,background-color] duration-500 hover:bg-card/60 hover:px-2 md:grid-cols-12 md:items-baseline md:py-10"
          >
            <p className="font-display text-4xl font-light tabular-nums text-accent-deep/70 md:col-span-2 md:text-5xl">
              {area.id}
            </p>
            <h3 className="font-display text-xl font-light text-foreground transition-colors duration-500 group-hover:text-accent-deep md:col-span-4 md:text-2xl">
              {area.title}
            </h3>
            <p className="text-[14px] leading-relaxed text-muted-foreground md:col-span-3">
              {area.body}
            </p>
            <div className="md:col-span-3">
              <p className="label-mono text-accent-deep">Our response</p>
              <p className="mt-2 text-[13.5px] leading-relaxed text-foreground/75">
                {area.response}
              </p>
            </div>
          </Reveal>
        ))}
      </ul>
    </SectionShell>
  );
}

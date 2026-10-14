"use client";

/**
 * ETARNITY — company scale.
 * The shape of the company today, as an asymmetric editorial grid with
 * quiet count-ups. Real information only — restrained, not inflated.
 */

import { scale } from "@/content/site";
import {
  Counter,
  Reveal,
  SectionShell,
} from "@/components/etarnity/primitives";
import { cn } from "@/lib/utils";

/* Asymmetric spans — an art-directed ledger, not a uniform card grid */
const SPANS = [
  "md:col-span-3",
  "md:col-span-4",
  "md:col-span-5",
  "md:col-span-5 md:col-start-2",
  "md:col-span-4",
  "md:col-span-3",
];

export function CompanyScale() {
  return (
    <SectionShell id="scale" ariaLabel="Company scale" alt>
      <Reveal>
        <p className="label-mono mb-10 text-accent-deep">{scale.kicker}</p>
      </Reveal>
      {scale.lead && (
        <Reveal delay={0.08}>
          <p className="mb-14 max-w-md text-[14.5px] leading-relaxed text-muted-foreground md:mb-20">
            {scale.lead}
          </p>
        </Reveal>
      )}

      <div className="grid grid-cols-1 gap-y-12 border-t border-border pt-10 md:grid-cols-12 md:gap-x-8 md:gap-y-16 md:pt-12">
        {scale.items.map((item, i) => (
          <Reveal
            key={item.label}
            delay={0.08 + i * 0.06}
            className={cn(
              "flex flex-row items-baseline justify-between gap-6 border-b border-border/60 pb-8 md:flex-col md:items-start md:justify-start md:border-b-0 md:pb-0",
              SPANS[i % SPANS.length]
            )}
          >
            <div>
              <p className="label-mono text-muted-foreground">{item.label}</p>
              <p className="font-display mt-3 text-5xl font-light tracking-[-0.03em] text-foreground md:text-6xl">
                <Counter
                  value={item.value}
                  suffix={item.suffix}
                  isYear={item.isYear}
                />
              </p>
            </div>
            {item.note && (
              <p className="text-[12.5px] leading-snug text-muted-foreground/80 md:mt-2">
                {item.note}
              </p>
            )}
          </Reveal>
        ))}
      </div>
    </SectionShell>
  );
}

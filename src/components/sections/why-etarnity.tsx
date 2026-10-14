"use client";

/**
 * ETARNITY — why the ecosystem works.
 * PRD §24: a clean numbered advantage section — large numbered statements in
 * a quiet two-column editorial ledger with a staggered right column. Not a
 * "why choose us" sales section: six reasons, set plainly, the first among
 * them slightly larger. No icons, no cards.
 */

import { why } from "@/content/site";
import {
  Reveal,
  SectionHeading,
  SectionShell,
} from "@/components/etarnity/primitives";
import { cn } from "@/lib/utils";

export function WhyEternity() {
  return (
    <SectionShell id="why" ariaLabel="Why ETARNITY">
      <SectionHeading index={why.index} kicker={why.kicker} title={why.title} />

      {/* Asymmetric two-column ledger — the right column sits lower */}
      <div className="grid grid-cols-1 gap-y-0 md:grid-cols-2 md:gap-x-12">
        {why.items.map((item, i) => (
          <Reveal
            key={item.id}
            as="article"
            delay={0.05 + i * 0.05}
            className={cn(
              "group border-t border-border py-7",
              i % 2 === 1 && "md:mt-12"
            )}
          >
            <div className="flex items-baseline gap-3">
              <span className="label-mono text-accent-deep tabular-nums">
                {item.id}
              </span>
              <h3
                className={cn(
                  "font-display font-normal text-foreground transition-colors duration-300 group-hover:text-accent-deep",
                  i === 0 ? "text-xl md:text-2xl" : "text-lg md:text-xl"
                )}
              >
                {item.title}
              </h3>
            </div>
            <p
              className={cn(
                "mt-2.5 max-w-md text-[14px] leading-relaxed text-muted-foreground",
                i === 0 && "text-[14.5px]"
              )}
            >
              {item.body}
            </p>
          </Reveal>
        ))}
      </div>
    </SectionShell>
  );
}

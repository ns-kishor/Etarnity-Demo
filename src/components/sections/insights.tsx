"use client";

import * as React from "react";
import { ArrowUpRight } from "lucide-react";
import { insights, insightCategories } from "@/content/site";
import {
  Reveal,
  SectionHeading,
  SectionShell,
} from "@/components/primitives/corporate";
import { cn } from "@/lib/utils";

/**
 * Insights — the ETARNITY knowledge platform.
 *
 * Editorial and quiet by design. Pieces are rendered as non-interactive
 * records until real article URLs exist — nothing pretends to be a link.
 * The category filter is the single interactive control: real state,
 * exact-match filtering, honest empty state.
 */
export function Insights() {
  const [activeCategory, setActiveCategory] = React.useState("All");

  const filtered =
    activeCategory === "All"
      ? insights
      : insights.filter((piece) => piece.category === activeCategory);

  return (
    <SectionShell id="insights" ariaLabel="Insights from ETARNITY">
      <div className="py-16 md:py-24">
        <SectionHeading
          index="14"
          kicker="Insights"
          title="How we think."
          lead="Notes from inside the ecosystem — on technology, business, AI, design, security and building companies that last."
        />

        <Reveal delay={0.12}>
          <div
            role="group"
            aria-label="Filter insights by category"
            className="mt-10 flex flex-wrap gap-2"
          >
            {["All", ...insightCategories].map((category) => {
              const isActive = category === activeCategory;
              return (
                <button
                  key={category}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => setActiveCategory(category)}
                  className={cn(
                    "rounded-full border px-3.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] transition-colors",
                    isActive
                      ? "border-emerald-corp/50 bg-emerald-corp/10 text-emerald-corp"
                      : "border-border text-muted-foreground hover:border-border/80 hover:text-foreground"
                  )}
                >
                  {category}
                </button>
              );
            })}
          </div>
        </Reveal>

        <div aria-live="polite" className="mt-8">
          {filtered.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((piece, i) => (
                <Reveal
                  key={piece.title}
                  as="article"
                  delay={(i % 3) * 0.06}
                  distance={18}
                  className="group flex flex-col rounded-sm border border-border/60 p-6 transition-colors hover:border-emerald-corp/40 hover:bg-card/40"
                >
                  <div className="flex items-baseline justify-between gap-4">
                    <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-emerald-corp">
                      {piece.category}
                    </span>
                    <span className="font-mono text-[10px] text-muted-foreground/70">
                      {piece.readTime}
                    </span>
                  </div>

                  <h3 className="mt-4 text-balance text-[16.5px] font-medium leading-snug tracking-tight text-ivory transition-colors group-hover:text-emerald-corp">
                    {piece.title}
                  </h3>

                  <p className="mt-3 text-[13px] leading-relaxed text-muted-foreground">
                    {piece.excerpt}
                  </p>

                  <footer className="mt-auto flex items-center justify-between gap-4 pt-5">
                    <time
                      dateTime={piece.date}
                      className="font-mono text-[10.5px] tracking-[0.1em] text-muted-foreground/70"
                    >
                      {piece.date}
                    </time>
                    <ArrowUpRight
                      className="h-3.5 w-3.5 text-emerald-corp/50"
                      aria-hidden="true"
                    />
                  </footer>
                </Reveal>
              ))}
            </div>
          ) : (
            <p className="rounded-sm border border-border/60 px-6 py-12 text-center font-mono text-[11px] tracking-[0.12em] text-muted-foreground/70">
              No pieces in this category yet.
            </p>
          )}
        </div>
      </div>
    </SectionShell>
  );
}

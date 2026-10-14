"use client";

/**
 * ETARNITY — Insights.
 * Editorial article cards that read like magazine covers: typographic faces
 * with tinted cover fields (category + issue number), big display headlines,
 * quiet excerpts. Articles have no URLs yet, so cards are honest
 * non-interactive records — no cursor affordances, no fake links.
 */

import { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { insights, insightCategories } from "@/content/site";
import {
  Reveal,
  SectionHeading,
  SectionShell,
  Stagger,
  StaggerItem,
} from "@/components/etarnity/primitives";
import { cn } from "@/lib/utils";

/* Cover tints cycle through the quiet tonal family */
const COVER_TINTS = ["bg-accent-soft/60", "bg-secondary", "bg-muted"] as const;

/* Issue numbers + tints are bound to the master list (stable under filtering) */
const ISSUES = insights.map((item, i) => ({
  ...item,
  issue: String(i + 1).padStart(2, "0"),
  tint: COVER_TINTS[i % COVER_TINTS.length],
}));

export function Insights() {
  const [active, setActive] = useState<string | null>(null);
  const filtered = active
    ? ISSUES.filter((item) => item.category === active)
    : ISSUES;

  const chipClass = (isActive: boolean) =>
    cn(
      "label-mono rounded-full border px-4 py-2.5 transition-colors duration-300",
      isActive
        ? "border-primary bg-primary text-primary-foreground"
        : "border-border bg-card text-muted-foreground hover:border-foreground/25 hover:text-foreground"
    );

  return (
    <SectionShell id="insights" ariaLabel="Insights — how we think" alt>
      <SectionHeading
        index="18"
        kicker="Insights"
        title="How we think."
        lead="Notes from inside the ecosystem — on engineering, business and the long term."
      />

      {/* Category filter */}
      <Reveal delay={0.12}>
        <div
          role="group"
          aria-label="Filter insights by category"
          className="flex flex-wrap gap-2"
        >
          <button
            type="button"
            aria-pressed={active === null}
            onClick={() => setActive(null)}
            className={chipClass(active === null)}
          >
            All
          </button>
          {insightCategories.map((category) => (
            <button
              key={category}
              type="button"
              aria-pressed={active === category}
              onClick={() => setActive(active === category ? null : category)}
              className={chipClass(active === category)}
            >
              {category}
            </button>
          ))}
        </div>
      </Reveal>

      {/* Grid — polite live region so filter changes are announced */}
      <div aria-live="polite" className="mt-8 md:mt-10">
        <p className="sr-only">
          Showing {filtered.length} of {insights.length} pieces
        </p>

        {filtered.length === 0 ? (
          <Reveal className="rounded-[24px] border border-dashed border-foreground/20 bg-card/60 p-10 text-center md:p-14">
            <p className="label-mono text-accent-deep">{active}</p>
            <p className="mt-3 font-display text-xl font-light tracking-tight text-foreground">
              Nothing in this lane yet.
            </p>
          </Reveal>
        ) : (
          <Stagger
            key={active ?? "all"}
            stagger={0.06}
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          >
            {filtered.map((item) => (
              <StaggerItem
                as="article"
                key={item.title}
                className="card-quiet group flex min-h-[240px] flex-col rounded-[24px] p-6 transition-[box-shadow,translate] duration-300 hover:-translate-y-0.5 hover:shadow-ambient-lg"
              >
                {/* Cover field — tinted masthead: category + issue number */}
                <div
                  className={cn(
                    "mb-5 flex min-h-[104px] flex-col justify-between rounded-[18px] p-4",
                    item.tint
                  )}
                >
                  <p className="label-mono text-accent-deep/70 transition-colors duration-300 group-hover:text-accent-deep">
                    {item.category}
                  </p>
                  <span
                    aria-hidden="true"
                    className="self-end font-display text-4xl font-light leading-none tracking-tight text-accent-deep/25"
                  >
                    {item.issue}
                  </span>
                </div>

                {/* Headline — the magazine cover type */}
                <h3 className="font-display text-xl font-light tracking-tight text-foreground transition-transform duration-300 group-hover:translate-x-1">
                  {item.title}
                </h3>

                <p className="mt-3 line-clamp-3 text-[13.5px] leading-relaxed text-muted-foreground">
                  {item.excerpt}
                </p>

                <div className="mt-auto flex items-center justify-between border-t border-border/60 pt-4">
                  <time
                    className="label-mono text-muted-foreground/80"
                    dateTime={item.date}
                  >
                    {item.date}
                  </time>
                  <span className="flex items-center gap-3">
                    <span className="label-mono text-muted-foreground/70">
                      {item.readTime}
                    </span>
                    <ArrowUpRight
                      className="h-3.5 w-3.5 text-muted-foreground opacity-50"
                      strokeWidth={1.5}
                      aria-hidden="true"
                    />
                  </span>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        )}
      </div>
    </SectionShell>
  );
}

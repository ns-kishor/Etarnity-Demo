"use client";

import * as React from "react";
import {
  FloatCard,
  Kicker,
  MonoLabel,
  MfSection,
  Pill,
  Reveal,
  SectionTitle,
} from "@/components/machina/mf-primitives";
import {
  newsroom,
  newsroomCategories,
  type NewsroomItem,
} from "@/content/machina";
import { cn } from "@/lib/utils";

/**
 * Newsroom — the group's journal of record.
 *
 * A category-filtered pill row above a grid of floating entry cards.
 * Cards are honest archive records: no links, no invented URLs. The
 * grid caps its height on large screens (PRD long-list rule) with the
 * ambient global scrollbar, flows naturally on small screens, and
 * announces filter changes through a polite live region.
 */
export function Newsroom() {
  const [category, setCategory] = React.useState<string>("All");

  const entries = React.useMemo(
    () =>
      category === "All"
        ? newsroom
        : newsroom.filter((item) => item.category === category),
    [category]
  );

  return (
    <MfSection id="newsroom" ariaLabel="MachinaFusion — news and insights">
      <Reveal y={18}>
        <Kicker index="04" label="News & Insights" />
      </Reveal>

      <Reveal y={24} delay={0.08} className="mt-6">
        <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-4">
          <SectionTitle>
            Signal over <span className="editorial-accent">noise</span>.
          </SectionTitle>
          <MonoLabel className="shrink-0 pb-3 text-muted-foreground">
            {String(newsroom.length).padStart(2, "0")} entries
          </MonoLabel>
        </div>
      </Reveal>

      {/* Category filter — interactive pill chips */}
      <Reveal y={16} delay={0.16} className="mt-10">
        <div
          role="group"
          aria-label="Filter newsroom by category"
          className="flex flex-wrap items-center gap-2"
        >
          {newsroomCategories.map((cat) => {
            const isActive = cat === category;
            return (
              <Pill
                key={cat}
                as="button"
                aria-pressed={isActive}
                onClick={() => setCategory(cat)}
                className={cn(
                  "px-4 py-2",
                  isActive
                    ? "border-transparent bg-primary text-primary-foreground"
                    : "border-border text-muted-foreground hover:text-foreground"
                )}
              >
                {cat}
              </Pill>
            );
          })}
        </div>
      </Reveal>

      {/* Entries — height-capped with ambient scrollbar on lg+ (long-list rule),
          flows naturally on small screens. Live region announces filtering. */}
      <div
        aria-live="polite"
        className="mt-8 grid gap-4 sm:grid-cols-2 lg:max-h-[32rem] lg:grid-cols-3 lg:overflow-y-auto lg:pb-1 lg:pr-2"
      >
        <p className="sr-only">
          Showing {entries.length} of {newsroom.length} entries.
        </p>
        {entries.length === 0 ? (
          <EmptyLane category={category} />
        ) : (
          entries.map((item, i) => (
            <NewsCard key={item.title} item={item} delay={(i % 3) * 0.07} />
          ))
        )}
      </div>
    </MfSection>
  );
}

/** One archive record — a non-interactive card (no link affordances). */
function NewsCard({ item, delay }: { item: NewsroomItem; delay: number }) {
  return (
    <Reveal y={22} delay={delay} className="h-full">
      <FloatCard hover className="group flex h-full flex-col p-6">
        <div className="flex items-center justify-between gap-4">
          <MonoLabel className="text-[var(--accent)]">
            {item.category}
          </MonoLabel>
          <MonoLabel className="text-muted-foreground">{item.date}</MonoLabel>
        </div>

        <h3 className="mt-5 font-display text-lg font-medium leading-snug text-foreground/90 transition-all duration-500 ease-out group-hover:translate-x-1 group-hover:text-foreground">
          {item.title}
        </h3>

        <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
          {item.summary}
        </p>

        {item.readTime && (
          <div className="mt-auto flex items-center gap-2 pt-5">
            <span
              className="h-1 w-1 rounded-full bg-[var(--accent)]"
              aria-hidden="true"
            />
            <MonoLabel className="text-muted-foreground">
              {item.readTime} read
            </MonoLabel>
          </div>
        )}
      </FloatCard>
    </Reveal>
  );
}

/** Honest empty state for a lane with no records yet. */
function EmptyLane({ category }: { category: string }) {
  return (
    <div className="flex flex-col items-start gap-3 rounded-[28px] border border-dashed border-border p-8 sm:col-span-2 lg:col-span-3">
      <p className="text-sm leading-relaxed text-muted-foreground">
        Nothing in this lane yet.
      </p>
      <MonoLabel className="text-muted-foreground">
        {category} · 0 entries
      </MonoLabel>
    </div>
  );
}

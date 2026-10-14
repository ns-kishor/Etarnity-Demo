"use client";

import * as React from "react";
import Image from "next/image";
import { format } from "date-fns";
import { ArrowRight } from "lucide-react";
import type { Article } from "@/lib/types";
import { Link } from "@/lib/router";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/* Monochromatic editorial utilities shared by the Insights landing    */
/* page and the article detail pages. Black/white/neutral grays only — */
/* no accent colors are used anywhere in the Insights experience.      */
/* ------------------------------------------------------------------ */

/** Consistent date display across the whole journal. */
export function formatDate(
  iso: string | null,
  style: "short" | "long" = "short"
): string {
  if (!iso) return "Unscheduled";
  try {
    return format(
      new Date(iso),
      style === "long" ? "MMMM d, yyyy" : "MMM d, yyyy"
    );
  } catch {
    return "Unscheduled";
  }
}

/** Reading time calculated from the actual article body (~200 wpm). */
export function estimateReadingMinutes(body: string): number {
  const words = body.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

/** Month + day as used by the list rows ("Nov 05"). */
export function formatDay(iso: string | null): string {
  if (!iso) return "—";
  try {
    return format(new Date(iso), "MMM d");
  } catch {
    return "—";
  }
}

export function formatYear(iso: string | null): string {
  if (!iso) return "—";
  try {
    return format(new Date(iso), "yyyy");
  } catch {
    return "—";
  }
}

/* -------------------------- Headings / TOC ------------------------- */

export interface ArticleHeading {
  depth: 2 | 3;
  text: string;
  id: string;
}

/** Deterministic, URL-safe id for a heading. */
export function slugifyHeading(text: string): string {
  const base = text
    .toLowerCase()
    .replace(/[''"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return base || "section";
}

/**
 * Extract H2/H3 headings from the raw markdown body. Ids are deduplicated
 * (`-2`, `-3`, …) so the table of contents and the rendered heading ids
 * always match.
 */
export function extractHeadings(body: string): ArticleHeading[] {
  const out: ArticleHeading[] = [];
  const seen = new Map<string, number>();
  for (const line of body.split(/\r?\n/)) {
    const match = /^(#{2,3})\s+(.*)$/.exec(line);
    if (!match) continue;
    const text = match[2].replace(/[*_`]/g, "").trim();
    if (!text) continue;
    const base = slugifyHeading(text);
    const count = seen.get(base) ?? 0;
    seen.set(base, count + 1);
    out.push({
      depth: match[1].length as 2 | 3,
      text,
      id: count === 0 ? base : `${base}-${count + 1}`,
    });
  }
  return out;
}

/* --------------------------- Visual pieces ------------------------- */

/**
 * Editorial underline reveal: a 1px currentColor rule that sweeps from the
 * left on group-hover. Uses only the text color, so it stays monochromatic.
 */
export const inkSweep =
  "bg-[linear-gradient(currentColor,currentColor)] bg-[length:0%_1px] bg-left-bottom bg-no-repeat transition-[background-size] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:bg-[length:100%_1px]";

/** Minimal monochromatic topic label. */
export function Tag({ label, className }: { label: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-hairline bg-white px-3 py-1 font-mono text-[10px] uppercase tracking-[0.15em] text-ink-soft",
        className
      )}
    >
      {label}
    </span>
  );
}

/** Monochrome cover placeholder for articles without an uploaded cover. */
export function CoverFallbackMono({ label }: { label: string }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-graphite">
      <span
        className="font-mono text-[10px] uppercase tracking-[0.35em] text-warmwhite/60"
        aria-hidden="true"
      >
        ETARNITY — Journal
      </span>
      <span className="sr-only">Cover image for {label}</span>
    </div>
  );
}

/* ------------------------- The article row ------------------------- */

export interface ArticleEntryRowProps {
  article: Article;
  /** Index within the visible list — used for staggered reveal delays. */
  index?: number;
}

/**
 * Editorial list entry used by the Insights landing page and the
 * "Related reading" block on article pages: date column, quiet metadata,
 * sweeping title underline, excerpt, and a gently sliding arrow — all in
 * black, white, and neutral grays.
 */
export function ArticleEntryRow({ article }: ArticleEntryRowProps) {
  const minutes = estimateReadingMinutes(article.body ?? "");
  return (
    <Link
      to={`/insights/${article.slug}`}
      className="group block border-t border-hairline py-7 focus-visible:outline-graphite md:py-9"
    >
      <div className="grid grid-cols-[1fr_auto] items-start gap-5 md:grid-cols-[104px_1fr_auto] md:gap-10">
        {/* Date column — desktop */}
        <div className="hidden flex-col pt-1 md:flex" aria-hidden="true">
          <span className="font-mono text-[13px] font-medium tracking-[0.06em] text-graphite transition-colors group-hover:text-graphite">
            {formatDay(article.publishedAt)}
          </span>
          <span className="mt-0.5 font-mono text-[11px] tracking-[0.12em] text-ink-dark-soft">
            {formatYear(article.publishedAt)}
          </span>
        </div>

        <div className="min-w-0">
          <p className="flex flex-wrap items-center gap-x-2.5 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-soft">
            <span className="md:hidden">{formatDay(article.publishedAt)} {formatYear(article.publishedAt)}</span>
            <span className="md:hidden" aria-hidden="true">·</span>
            <span>{article.category}</span>
            <span aria-hidden="true">·</span>
            <span>{minutes} min read</span>
          </p>
          <h3
            className={cn(
              "mt-2.5 text-xl font-semibold leading-snug tracking-[-0.015em] text-graphite md:text-[1.4rem] md:leading-[1.25]",
              inkSweep
            )}
          >
            {article.title}
          </h3>
          {article.summary ? (
            <p className="mt-2.5 line-clamp-2 max-w-2xl text-[15px] leading-relaxed text-ink-soft">
              {article.summary}
            </p>
          ) : null}
          <p className="mt-3.5 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-dark-soft transition-colors duration-300 group-hover:text-graphite md:hidden">
            Read article
          </p>
        </div>

        <span
          className="mt-1 flex size-10 items-center justify-center justify-self-end rounded-full border border-hairline text-ink-soft transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-0.5 group-hover:border-graphite group-hover:text-graphite"
          aria-hidden="true"
        >
          <ArrowRight className="size-4" />
        </span>
      </div>
    </Link>
  );
}

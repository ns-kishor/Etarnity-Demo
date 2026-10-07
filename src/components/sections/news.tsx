"use client";

import { news } from "@/content/site";
import {
  Reveal,
  SectionHeading,
  SectionShell,
} from "@/components/primitives/corporate";

/**
 * News — a corporate timeline of announcements.
 *
 * Deliberately not cards: a quiet ledger of dated records, newest first,
 * closed with a bottom hairline. Years render as <time> for semantics.
 */
export function News() {
  return (
    <SectionShell id="news" ariaLabel="ETARNITY company news">
      <div className="py-16 md:py-24">
        <SectionHeading
          index="15"
          kicker="News"
          title="ETARNITY updates."
          lead="Company announcements — business launches, products, milestones and leadership."
        />

        <div className="mt-12">
          {news.map((item, i) => (
            <Reveal
              key={item.title}
              as="article"
              delay={i * 0.08}
              distance={20}
              className="grid items-baseline gap-3 border-t border-border/60 py-7 md:grid-cols-12"
            >
              <div className="md:col-span-3">
                <time
                  dateTime={item.date}
                  className="block font-mono text-[10.5px] tracking-[0.14em] text-muted-foreground"
                >
                  {item.date}
                </time>
                <span className="mt-1.5 inline-block rounded-full border border-champagne/35 bg-champagne/5 px-2.5 py-1 font-mono text-[9.5px] uppercase tracking-[0.16em] text-champagne">
                  {item.type}
                </span>
              </div>

              <div className="md:col-span-9">
                <h3 className="text-balance text-lg font-medium tracking-tight text-ivory md:text-xl">
                  {item.title}
                </h3>
                <p className="mt-2 max-w-2xl text-[13.5px] leading-relaxed text-muted-foreground">
                  {item.summary}
                </p>
              </div>
            </Reveal>
          ))}

          <div aria-hidden="true" className="border-t border-border/60" />
        </div>
      </div>
    </SectionShell>
  );
}

"use client";

import * as React from "react";
import { stats } from "@/content/site";
import {
  Counter,
  Reveal,
  SectionShell,
} from "@/components/primitives/corporate";

/**
 * Company scale signals — real numbers only.
 * Each statistic counts up once when it enters the viewport.
 * Structure is deliberately reserved for future data: if a metric
 * does not exist yet, it is removed here rather than invented.
 */
export function Stats() {
  return (
    <SectionShell
      ariaLabel="ETARNITY by the numbers"
      bordered={false}
      className="bg-background"
    >
      <div className="py-16 md:py-20">
        <Reveal>
          <div className="flex items-center gap-4">
            <span className="font-mono text-[11px] tracking-[0.22em] text-champagne/80">01</span>
            <span className="label-mono text-emerald-corp/90">The Company at a Glance</span>
          </div>
        </Reveal>

        <dl className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-sm border border-border/60 bg-border/60 sm:grid-cols-3 lg:grid-cols-6">
          {stats.map((stat, i) => (
            <Reveal
              key={stat.label}
              delay={i * 0.06}
              distance={18}
              className="bg-background"
              as="div"
            >
              <div className="group flex h-full flex-col justify-between gap-6 p-5 transition-colors duration-500 hover:bg-card md:p-6">
                <dt className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  {stat.label}
                </dt>
                <dd>
                  {stat.isYear ? (
                    <span className="font-mono text-[2.1rem] font-light leading-none tracking-tight text-ivory md:text-4xl">
                      {stat.value}
                    </span>
                  ) : (
                    <Counter
                      value={stat.value}
                      suffix={stat.suffix}
                      className="font-mono text-[2.1rem] font-light leading-none tracking-tight text-ivory md:text-4xl"
                    />
                  )}
                  {stat.note && (
                    <p className="mt-2 text-[11.5px] leading-snug text-muted-foreground/80">
                      {stat.note}
                    </p>
                  )}
                </dd>
              </div>
            </Reveal>
          ))}
        </dl>
      </div>
    </SectionShell>
  );
}

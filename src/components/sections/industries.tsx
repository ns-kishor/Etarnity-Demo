"use client";

/**
 * ETARNITY — industries (ecosystem block).
 * The ecosystem map: eight floating nodes by stage. Selecting a node
 * expands a quiet panel below the grid; Escape collapses it again.
 */

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { industries, type Industry } from "@/content/site";
import {
  EASE,
  Reveal,
  SectionHeading,
  SectionShell,
} from "@/components/etarnity/primitives";
import { cn } from "@/lib/utils";

const STAGE_DOT: Record<Industry["stage"], string> = {
  Operating: "bg-accent",
  Building: "bg-periwinkle",
  Exploring: "bg-foreground/25",
};

const STAGES: Industry["stage"][] = ["Operating", "Building", "Exploring"];

export function Industries() {
  const reduced = useReducedMotion();
  const [selected, setSelected] = useState<string | null>(null);
  const active =
    industries.find((industry) => industry.name === selected) ?? null;

  return (
    <SectionShell
      id="industries"
      ariaLabel="Industries — where the ecosystem operates"
      alt
    >
      <SectionHeading
        index="06"
        kicker="Industries"
        title="Where the ecosystem operates."
        lead="Eight industries across three stages — operating, building and exploring. Select a node to see where each one stands."
      />

      {/* The map — eight floating nodes */}
      <ul
        className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4"
        aria-label="Industries by stage"
      >
        {industries.map((industry, i) => {
          const isSelected = selected === industry.name;
          const dimmed = selected !== null && !isSelected;
          return (
            <Reveal key={industry.name} as="li" delay={i * 0.05}>
              <button
                type="button"
                aria-pressed={isSelected}
                onClick={() =>
                  setSelected(isSelected ? null : industry.name)
                }
                onKeyDown={(event) => {
                  if (event.key === "Escape") setSelected(null);
                }}
                className={cn(
                  "flex w-full items-center gap-3 rounded-[18px] border border-border bg-card px-4 py-3.5 text-left transition-all duration-300",
                  isSelected
                    ? "border-accent/40 bg-accent-soft/40"
                    : "hover:border-accent/35 hover:bg-accent-soft/25",
                  dimmed && "opacity-70"
                )}
              >
                <span
                  className={cn(
                    "h-1.5 w-1.5 shrink-0 rounded-full",
                    STAGE_DOT[industry.stage]
                  )}
                  aria-hidden="true"
                />
                <span className="text-[13px] font-medium leading-snug tracking-tight text-foreground">
                  {industry.name}
                </span>
              </button>
            </Reveal>
          );
        })}
      </ul>

      {/* Expanded panel — changes are announced politely; Escape collapses */}
      <div aria-live="polite" className="mt-4">
        {active ? (
          <motion.div
            key={active.name}
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: 10 }}
            animate={reduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: EASE }}
            className="rounded-[24px] border border-accent/30 bg-accent-soft/40 p-6 md:p-7"
          >
            <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
              <h3 className="text-balance font-display text-2xl font-light tracking-[-0.02em] text-foreground md:text-[1.75rem]">
                {active.name}
              </h3>
              <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5">
                <span
                  className={cn(
                    "h-1.5 w-1.5 rounded-full",
                    STAGE_DOT[active.stage]
                  )}
                  aria-hidden="true"
                />
                <span className="label-mono text-muted-foreground">
                  {active.stage}
                </span>
              </span>
            </div>
            <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-muted-foreground">
              {active.description}
            </p>
          </motion.div>
        ) : (
          <p className="label-mono py-3 text-muted-foreground/70">
            Select a node to expand — Escape collapses.
          </p>
        )}
      </div>

      {/* Stage legend */}
      <Reveal delay={0.1} className="mt-10">
        <div
          className="flex flex-wrap items-center gap-x-6 gap-y-2"
          aria-label="Stage legend"
        >
          {STAGES.map((stage) => (
            <span key={stage} className="flex items-center gap-2">
              <span
                className={cn("h-1.5 w-1.5 rounded-full", STAGE_DOT[stage])}
                aria-hidden="true"
              />
              <span className="label-mono text-muted-foreground">{stage}</span>
            </span>
          ))}
        </div>
      </Reveal>

      {/* Closing line */}
      <Reveal delay={0.12} className="mt-12">
        <div className="hairline w-full" aria-hidden="true" />
        <p className="mt-5 text-[14px] leading-relaxed text-muted-foreground">
          One ecosystem — each industry strengthens the others.
        </p>
      </Reveal>
    </SectionShell>
  );
}

"use client";

import {
  BrainCircuit,
  Lightbulb,
  Telescope,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { innovation } from "@/content/site";
import {
  Reveal,
  SectionHeading,
  SectionShell,
  Stagger,
  StaggerItem,
} from "@/components/primitives/corporate";
import { cn } from "@/lib/utils";

/**
 * Innovation — ETARNITY Labs.
 *
 * Four research tracks as quiet panels: icon, title, a mono status pill
 * (Active / In exploration) and one honest paragraph each. The section
 * closes on the Labs principle — the reason most experiments are allowed
 * to fail.
 */

const TRACK_ICONS: Record<string, LucideIcon> = {
  "Applied AI": BrainCircuit,
  "Internal Platforms": Wrench,
  "Product Concepts": Lightbulb,
  "Emerging Technology": Telescope,
};

export function Innovation() {
  return (
    <SectionShell id="innovation" ariaLabel="Innovation at ETARNITY Labs">
      <div className="py-20 md:py-28">
        <SectionHeading
          index={innovation.index}
          kicker={innovation.kicker}
          title={innovation.title}
          lead={innovation.lead}
          serifTitle
        />

        {/* Research tracks */}
        <Stagger className="mt-12 grid gap-4 md:mt-16 md:grid-cols-2">
          {innovation.tracks.map((track) => {
            const Icon = TRACK_ICONS[track.title] ?? BrainCircuit;
            const active = track.status === "Active";
            return (
              <StaggerItem
                key={track.title}
                as="article"
                className="flex h-full flex-col rounded-sm border border-border/60 p-6 transition-colors duration-500 hover:border-emerald-corp/40 hover:bg-card/50 md:p-7"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <Icon
                      className="h-4 w-4 shrink-0 text-emerald-corp"
                      aria-hidden="true"
                    />
                    <h3 className="text-lg font-medium tracking-tight text-ivory">
                      {track.title}
                    </h3>
                  </div>
                  <span
                    className={cn(
                      "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.16em]",
                      active
                        ? "border-emerald-corp/40 bg-emerald-corp/5 text-emerald-corp"
                        : "border-champagne/40 bg-champagne/5 text-champagne"
                    )}
                  >
                    <span
                      aria-hidden="true"
                      className={cn(
                        "h-1.5 w-1.5 rounded-full",
                        active ? "bg-emerald-corp" : "bg-champagne"
                      )}
                    />
                    {track.status}
                  </span>
                </div>
                <p className="mt-3 text-[13.5px] leading-relaxed text-muted-foreground">
                  {track.body}
                </p>
              </StaggerItem>
            );
          })}
        </Stagger>

        {/* Labs principle */}
        <Reveal>
          <div className="mt-8 border-t border-border/60 pt-6">
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-champagne/80">
              Labs Principle
            </p>
            <p className="mt-3 max-w-2xl font-editorial text-[13px] italic leading-relaxed text-muted-foreground">
              Most experiments fail. The ones that matter get the capital and
              the people to become real businesses.
            </p>
          </div>
        </Reveal>
      </div>
    </SectionShell>
  );
}

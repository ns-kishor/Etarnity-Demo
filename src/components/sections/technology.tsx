"use client";

import {
  BrainCircuit,
  Code2,
  Database,
  Layers,
  MonitorSmartphone,
  Server,
  ShieldCheck,
  Workflow,
  type LucideIcon,
} from "lucide-react";
import { technology } from "@/content/site";
import {
  Reveal,
  SectionHeading,
  SectionShell,
} from "@/components/primitives/corporate";
import { cn } from "@/lib/utils";

/**
 * Technology — the shared engineering foundation of the ecosystem.
 *
 * Two movements:
 *  1. The capabilities matrix — a hairline grid of the eight disciplines
 *     every ETARNITY business is built on.
 *  2. The delivery pipeline (Idea → Scale) — a horizontal system on
 *     desktop, a vertical rail on mobile.
 *
 * A faint engineering grid sits behind the whole section, masked out
 * toward the edges for a quiet "system" atmosphere.
 */

const CAPABILITY_ICONS: Record<string, LucideIcon> = {
  "Software Engineering": Code2,
  "AI & Intelligent Systems": BrainCircuit,
  Automation: Workflow,
  "Infrastructure & Cloud": Server,
  Security: ShieldCheck,
  Data: Database,
  "Product Engineering": Layers,
  "Digital Experience": MonitorSmartphone,
};

const PIPELINE_FINAL_INDEX = technology.pipeline.length - 1;

export function Technology() {
  return (
    <SectionShell id="technology" ariaLabel="Technology at our core">
      {/* System atmosphere — a faint engineering grid, faded at the edges */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-grid-faint [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_75%)] [-webkit-mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_75%)]"
      />

      <div className="relative py-20 md:py-28">
        <SectionHeading
          index={technology.index}
          kicker={technology.kicker}
          title={technology.title}
          lead={technology.lead}
          serifTitle
        />

        {/* Capabilities — hairline grid */}
        <ul className="mt-12 grid gap-px overflow-hidden rounded-sm border border-border/60 bg-border/60 sm:grid-cols-2 md:mt-16 lg:grid-cols-4">
          {technology.capabilities.map((capability, i) => {
            const Icon = CAPABILITY_ICONS[capability.title] ?? Layers;
            return (
              <Reveal
                key={capability.title}
                as="li"
                delay={(i % 4) * 0.05}
                distance={18}
                className="bg-background"
              >
                <div className="h-full p-5 transition-colors duration-500 hover:bg-card/50">
                  <Icon className="h-4 w-4 text-emerald-corp" aria-hidden="true" />
                  <h3 className="mt-3.5 text-[14.5px] font-medium text-ivory">
                    {capability.title}
                  </h3>
                  <p className="mt-2.5 text-[12.5px] leading-relaxed text-muted-foreground">
                    {capability.body}
                  </p>
                </div>
              </Reveal>
            );
          })}
        </ul>

        {/* The pipeline — how an idea becomes a running system */}
        <div className="mt-14 md:mt-20">
          <Reveal>
            <div className="flex items-center gap-5">
              <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-champagne/80">
                How we build
              </p>
              <div aria-hidden="true" className="h-px flex-1 bg-border/60" />
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground/60">
                Idea → Scale
              </p>
            </div>
          </Reveal>

          {/* Desktop — the pipeline as a horizontal system */}
          <Reveal delay={0.08}>
            <ol className="mt-10 hidden md:grid md:grid-cols-7">
              {technology.pipeline.map((stage, i) => {
                const isFinal = i === PIPELINE_FINAL_INDEX;
                return (
                  <li key={stage.step} className="relative pr-3 lg:pr-6">
                    {/* Hairline connector — runs from this node to the next */}
                    {!isFinal && (
                      <span
                        aria-hidden="true"
                        className="absolute left-0 top-[5px] h-px w-full bg-border/60"
                      />
                    )}
                    <span
                      aria-hidden="true"
                      className={cn(
                        "relative z-10 block h-2.5 w-2.5 rounded-full border",
                        isFinal
                          ? "border-champagne/60 bg-champagne/20"
                          : "border-emerald-corp/60 bg-emerald-corp/20"
                      )}
                    />
                    <span className="mt-4 block font-mono text-[10px] tracking-[0.18em] text-muted-foreground/70">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <p className="mt-1.5 text-[13px] font-medium text-ivory">
                      {stage.step}
                    </p>
                    <p className="mt-1.5 text-[11.5px] leading-snug text-muted-foreground">
                      {stage.body}
                    </p>
                  </li>
                );
              })}
            </ol>
          </Reveal>

          {/* Mobile — the pipeline as a vertical rail */}
          <Reveal delay={0.08}>
            <ol className="mt-8 md:hidden">
              {technology.pipeline.map((stage, i) => {
                const isFinal = i === PIPELINE_FINAL_INDEX;
                return (
                  <li
                    key={stage.step}
                    className="relative border-l border-border/60 pb-7 pl-6 last:pb-0"
                  >
                    <span
                      aria-hidden="true"
                      className={cn(
                        "absolute -left-[5px] top-[3px] block h-2.5 w-2.5 rounded-full border",
                        isFinal
                          ? "border-champagne/60 bg-champagne/20"
                          : "border-emerald-corp/60 bg-emerald-corp/20"
                      )}
                    />
                    <span className="font-mono text-[10px] tracking-[0.18em] text-muted-foreground/70">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <p className="mt-1 text-[13px] font-medium text-ivory">
                      {stage.step}
                    </p>
                    <p className="mt-1.5 text-[11.5px] leading-snug text-muted-foreground">
                      {stage.body}
                    </p>
                  </li>
                );
              })}
            </ol>
          </Reveal>
        </div>
      </div>
    </SectionShell>
  );
}

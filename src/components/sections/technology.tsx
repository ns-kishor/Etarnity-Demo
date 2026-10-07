"use client";

/**
 * ETARNITY — Technology (§19-20).
 *
 * Part A: the eight capabilities as floating visual panels.
 * Part B (signature interaction): the layered architecture —
 * IDEA → PRODUCT → EXPERIENCE → APPLICATION → INTELLIGENCE → DATA →
 * INFRASTRUCTURE → SECURITY — rendered as a vertical stack whose
 * connecting rail draws with scroll, filling a node dot per layer as the
 * line passes it, while the layer nearest the viewport centre is
 * highlighted live. Desktop-only live behaviour; mobile keeps a quiet
 * static hairline. Reduced-motion safe throughout.
 */

import { useEffect, useRef, useState } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import {
  BrainCircuit,
  CloudCog,
  Code2,
  Cuboid,
  Database,
  MonitorSmartphone,
  ShieldCheck,
  Workflow,
} from "lucide-react";
import { technology } from "@/content/site";
import {
  Reveal,
  SectionHeading,
  SectionShell,
  Stagger,
  StaggerItem,
} from "@/components/etarnity/primitives";
import { cn } from "@/lib/utils";

const ICON_PROPS = {
  className: "h-4 w-4",
  strokeWidth: 1.5,
  "aria-hidden": true,
} as const;

/* One small lucide icon per capability, chosen to match the title. */
function CapabilityIcon({ index }: { index: number }) {
  switch (index) {
    case 0:
      return <Code2 {...ICON_PROPS} />;
    case 1:
      return <BrainCircuit {...ICON_PROPS} />;
    case 2:
      return <Workflow {...ICON_PROPS} />;
    case 3:
      return <CloudCog {...ICON_PROPS} />;
    case 4:
      return <ShieldCheck {...ICON_PROPS} />;
    case 5:
      return <Database {...ICON_PROPS} />;
    case 6:
      return <Cuboid {...ICON_PROPS} />;
    default:
      return <MonitorSmartphone {...ICON_PROPS} />;
  }
}

/* A node on the architecture rail — fills with accent as the drawn line
   passes its position along the stack. */
function LayerDot({
  progress,
  threshold,
}: {
  progress: MotionValue<number>;
  threshold: number;
}) {
  const reduced = useReducedMotion();
  const fill = useTransform(
    progress,
    [Math.max(0, threshold - 0.07), threshold],
    [0, 1]
  );

  return (
    <span
      aria-hidden="true"
      className="absolute -left-[42px] top-1/2 hidden h-3 w-3 -translate-y-1/2 md:block"
    >
      <span className="absolute inset-0 rounded-full border border-border bg-card" />
      <motion.span
        className="absolute inset-0 rounded-full bg-accent"
        style={reduced ? { scale: 0 } : { scale: fill }}
      />
    </span>
  );
}

export function Technology() {
  const reduced = useReducedMotion();
  const stackRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(-1);

  /* The rail draws as the stack itself is scrolled through. */
  const { scrollYProgress } = useScroll({
    target: stackRef,
    offset: ["start 0.8", "end 0.4"],
  });

  /* Live highlight — the layer nearest the viewport centre (desktop only).
     State is only ever set from inside the observer callback. */
  useEffect(() => {
    const root = stackRef.current;
    if (!root || !window.matchMedia("(min-width: 768px)").matches) return;

    const rows = Array.from(root.querySelectorAll<HTMLElement>("ol > li"));
    if (rows.length === 0) return;

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const i = rows.indexOf(entry.target as HTMLElement);
          if (i !== -1) setActiveIndex(i);
        }
      },
      { rootMargin: "-45% 0px -45% 0px" }
    );

    for (const row of rows) io.observe(row);
    return () => io.disconnect();
  }, []);

  const layers = technology.layers;
  const foundationIndex = layers.length - 1;

  return (
    <SectionShell
      id="technology"
      ariaLabel="Technology — capabilities and layered architecture"
    >
      <SectionHeading
        index={technology.index}
        kicker={technology.kicker}
        title={technology.title}
        lead={technology.lead}
      />

      {/* Part A — capabilities as floating visual panels */}
      <Stagger
        as="ul"
        stagger={0.06}
        className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4"
      >
        {technology.capabilities.map((capability, i) => (
          <StaggerItem
            key={capability.title}
            as="li"
            className="rounded-[20px] border border-border bg-card p-5 shadow-ambient transition-colors duration-300 hover:border-accent/40 hover:bg-accent-soft/30"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-[12px] bg-accent-soft text-accent-deep">
              <CapabilityIcon index={i} />
            </div>
            <h3 className="mt-4 text-[15px] font-medium tracking-tight text-foreground">
              {capability.title}
            </h3>
            <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
              {capability.body}
            </p>
          </StaggerItem>
        ))}
      </Stagger>

      {/* Part B — the layered architecture, IDEA → SECURITY */}
      <div className="mt-20 md:mt-28">
        <Reveal>
          <div className="flex items-center gap-5">
            <span className="hairline w-10 md:w-16" aria-hidden="true" />
            <p className="label-mono text-accent-deep">
              HOW WE BUILD — IDEA → SECURITY
            </p>
          </div>
        </Reveal>

        <div ref={stackRef} className="relative mt-8 pl-5 md:mt-10 md:pl-12">
          {/* Rail — static hairline (stays as the quiet mobile guide) */}
          <div
            aria-hidden="true"
            className="absolute inset-y-3 left-[11.5px] w-px bg-border"
          />
          {/* Rail — the accent line, drawn by scroll (desktop, motion-safe) */}
          {!reduced && (
            <motion.div
              aria-hidden="true"
              style={{ scaleY: scrollYProgress }}
              className="absolute inset-y-3 left-[11.5px] hidden w-px origin-top bg-accent md:block"
            />
          )}

          <ol className="space-y-3 md:space-y-4">
            {layers.map((layer, i) => {
              const active = i === activeIndex;
              const isFoundation = i === foundationIndex;
              return (
                <Reveal
                  as="li"
                  key={layer.name}
                  delay={0.04 * i}
                  className={cn(
                    "relative rounded-[20px] border px-5 py-4 transition-colors duration-300 md:px-7 md:py-5",
                    isFoundation
                      ? active
                        ? "border-accent/60 bg-accent-soft/50"
                        : "border-accent/40 bg-accent-soft/25"
                      : active
                        ? "border-accent/40 bg-accent-soft/40"
                        : "border-border bg-card"
                  )}
                >
                  <LayerDot
                    progress={scrollYProgress}
                    threshold={(i + 0.5) / layers.length}
                  />

                  <div className="grid gap-y-1.5 md:grid-cols-12 md:items-baseline md:gap-x-6">
                    <div className="flex items-baseline gap-4 md:col-span-4">
                      <span className="label-mono tabular-nums text-muted-foreground/70">
                        L{i + 1}
                      </span>
                      <h3 className="font-display text-lg font-normal uppercase tracking-tight text-foreground md:text-xl">
                        {layer.name}
                      </h3>
                      {isFoundation && (
                        <span className="label-mono hidden shrink-0 rounded-full border border-accent/30 bg-accent-soft px-2.5 py-1 text-accent-deep sm:inline-block">
                          Foundation
                        </span>
                      )}
                    </div>
                    <p className="text-[13.5px] leading-relaxed text-muted-foreground md:col-span-6">
                      {layer.body}
                    </p>
                    {/* Depth indicator — the stack thickens toward the foundation */}
                    <div
                      className="mt-2 flex md:col-span-2 md:mt-0 md:justify-end"
                      aria-hidden="true"
                    >
                      <span
                        className={cn(
                          "block h-[3px] rounded-full",
                          isFoundation ? "bg-accent/45" : "bg-accent/30"
                        )}
                        style={{ width: `${26 + i * 9}px` }}
                      />
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </ol>
        </div>
      </div>
    </SectionShell>
  );
}

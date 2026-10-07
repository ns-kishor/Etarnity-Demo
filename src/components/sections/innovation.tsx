"use client";

/**
 * ETARNITY — Innovation (§25).
 *
 * A large floating technology object beside the Labs track list. The object
 * drifts on a very slow float (with a gentler scroll-linked drift) while
 * small informational mono labels mark it; the tracks render as quiet
 * ruled rows with status pills. Closes on the Labs principle.
 */

import { useRef } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import Image from "next/image";
import { innovation } from "@/content/site";
import {
  Reveal,
  SectionHeading,
  SectionShell,
  Stagger,
  StaggerItem,
} from "@/components/etarnity/primitives";
import { cn } from "@/lib/utils";

/* Track status → quiet mono pill with a coloured dot. */
function StatusPill({ status }: { status: string }) {
  const active = status === "Active";
  return (
    <span className="inline-flex shrink-0 items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5">
      <span
        aria-hidden="true"
        className={cn("h-1.5 w-1.5 rounded-full", active ? "bg-accent" : "bg-periwinkle")}
      />
      <span className="label-mono text-muted-foreground">{status}</span>
    </span>
  );
}

/* Small informational label pinned to the floating object. */
function ObjectChip({
  label,
  className,
  dotClassName,
  float,
}: {
  label: string;
  className?: string;
  dotClassName?: string;
  float?: { duration: number; delay: number };
}) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      animate={reduced || !float ? undefined : { y: [0, -6, 0] }}
      transition={
        float ? { ...float, repeat: Infinity, ease: "easeInOut" } : undefined
      }
      className={cn(
        "absolute z-10 inline-flex items-center gap-2.5 rounded-full border border-border bg-card px-4 py-2 shadow-ambient",
        className
      )}
    >
      <span
        aria-hidden="true"
        className={cn("h-1.5 w-1.5 rounded-full", dotClassName)}
      />
      <span className="label-mono text-muted-foreground">{label}</span>
    </motion.div>
  );
}

export function Innovation() {
  const reduced = useReducedMotion();
  const visualRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: visualRef,
    offset: ["start end", "end start"],
  });

  /* Slow scroll-linked drift — the object moves with intention. */
  const driftY = useTransform(scrollYProgress, [0, 1], [32, -32]);

  return (
    <SectionShell id="innovation" ariaLabel="Innovation — ETARNITY Labs" alt>
      <div className="grid grid-cols-1 items-start gap-16 lg:grid-cols-12 lg:gap-12 xl:gap-16">
        {/* LEFT — the large floating object of study */}
        <div ref={visualRef} className="relative lg:col-span-5">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -inset-16 glow-deep"
          />
          <motion.div
            style={reduced ? undefined : { y: driftY }}
            className="relative"
          >
            <motion.div
              animate={reduced ? undefined : { y: [0, -10, 0] }}
              transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
              className="relative aspect-[4/5]"
            >
              {/* Offset hairline frame — quiet editorial composition */}
              <div
                aria-hidden="true"
                className="absolute inset-0 translate-x-3 translate-y-3 rounded-[32px] border border-border"
              />
              <div className="absolute inset-0 overflow-hidden rounded-[32px] shadow-ambient-lg">
                <Image
                  src={innovation.visual.image}
                  alt={innovation.visual.alt}
                  fill
                  sizes="(max-width: 1024px) 100vw, 42vw"
                  className="object-cover"
                />
              </div>

              <ObjectChip
                label="ETARNITY Labs"
                className="-right-3 top-10"
                dotClassName="bg-periwinkle"
                float={{ duration: 9, delay: 1.2 }}
              />
              <ObjectChip
                label={innovation.visual.label}
                className="-bottom-4 -left-3"
                dotClassName="bg-accent"
              />
            </motion.div>
          </motion.div>
        </div>

        {/* RIGHT — heading, the four Labs tracks, closing principle */}
        <div className="lg:col-span-7">
          <SectionHeading
            index={innovation.index}
            kicker={innovation.kicker}
            title={innovation.title}
            lead={innovation.lead}
          />

          <Stagger as="ul" className="border-b border-border" stagger={0.1}>
            {innovation.tracks.map((track) => (
              <StaggerItem
                key={track.title}
                as="li"
                className="border-t border-border py-6 md:py-7"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2.5">
                  <h3 className="font-display text-lg font-normal tracking-tight text-foreground md:text-xl">
                    {track.title}
                  </h3>
                  <StatusPill status={track.status} />
                </div>
                <p className="mt-2.5 max-w-lg text-[14.5px] leading-relaxed text-muted-foreground">
                  {track.body}
                </p>
              </StaggerItem>
            ))}
          </Stagger>

          <Reveal className="mt-14 md:mt-20">
            <div className="flex items-center gap-5">
              <span className="hairline w-10 md:w-14" aria-hidden="true" />
              <p className="label-mono text-accent-deep">LABS PRINCIPLE</p>
            </div>
            <p className="mt-5 max-w-md text-[15px] leading-relaxed text-muted-foreground">
              Some will become businesses. Most won&apos;t. That&apos;s the
              point.
            </p>
          </Reveal>
        </div>
      </div>
    </SectionShell>
  );
}

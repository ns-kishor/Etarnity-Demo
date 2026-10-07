"use client";

/**
 * ETARNITY — who we are (ecosystem block).
 * Editorial statement + hairline pillar ledger + one large ecosystem visual,
 * offset right on desktop, with a slow scroll parallax inside its frame.
 * "More than one business. One ecosystem."
 */

import { useRef } from "react";
import Image from "next/image";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { businesses, whoWeAre } from "@/content/site";
import {
  Reveal,
  SectionHeading,
  SectionShell,
} from "@/components/etarnity/primitives";
import { cn } from "@/lib/utils";

export function WhoWeAre() {
  const reduced = useReducedMotion();

  /* Slow image parallax — the picture drifts ±20px inside its rounded frame */
  const figureRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: figureRef,
    offset: ["start end", "end start"],
  });
  const imageY = useTransform(scrollYProgress, [0, 1], [20, -20]);
  const drift = !reduced;

  return (
    <SectionShell
      id="company"
      ariaLabel="Who we are — more than one business, one ecosystem"
    >
      {/* Ambient: soft lavender wash behind the ecosystem visual */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-[2%] right-[-8%] h-[55vh] w-[46vw] glow-deep"
      />

      <SectionHeading
        index={whoWeAre.index}
        kicker={whoWeAre.kicker}
        title={whoWeAre.title}
      />

      <div className="grid grid-cols-1 gap-y-12 md:grid-cols-12 md:gap-x-12">
        {/* Left — the statement, sequential reveals */}
        <div className="md:col-span-7">
          <Reveal>
            <p className="font-display text-xl font-light leading-[1.4] tracking-[-0.01em] text-foreground/90 md:text-2xl">
              {whoWeAre.paragraphs[0]}
            </p>
          </Reveal>
          {whoWeAre.paragraphs.slice(1).map((paragraph, i) => (
            <Reveal key={i} delay={0.1 + i * 0.07} className="mt-6">
              <p className="text-[15px] leading-relaxed text-muted-foreground">
                {paragraph}
              </p>
            </Reveal>
          ))}
        </div>

        {/* Right — the four pillars, a hairline ledger */}
        <ul className="md:col-span-5 md:mt-2" aria-label="What defines ETARNITY">
          {whoWeAre.pillars.map((pillar, i) => (
            <Reveal
              key={pillar.id}
              as="li"
              delay={0.12 + i * 0.07}
              className="border-t border-border py-6 last:border-b"
            >
              <div className="flex items-baseline gap-4">
                <span className="label-mono text-accent-deep tabular-nums">
                  {pillar.id}
                </span>
                <h3 className="text-[15px] font-semibold tracking-tight text-foreground">
                  {pillar.title}
                </h3>
              </div>
              <p className="mt-2 text-[13.5px] leading-relaxed text-muted-foreground">
                {pillar.body}
              </p>
            </Reveal>
          ))}
        </ul>
      </div>

      {/* One large visual — asymmetric, offset right on desktop */}
      <Reveal delay={0.1} className="mt-16 md:mt-24">
        <figure ref={figureRef} className="relative w-full md:ml-auto md:w-[78%]">
          <div className="relative aspect-[4/3] overflow-hidden rounded-[32px] shadow-ambient">
            <motion.div
              style={drift ? { y: imageY } : undefined}
              className={cn("absolute", drift ? "-inset-[24px]" : "inset-0")}
            >
              <Image
                src={whoWeAre.visual.image}
                alt={whoWeAre.visual.alt}
                fill
                sizes="(min-width: 768px) 900px, 100vw"
                className="object-cover"
              />
            </motion.div>
          </div>

          {/* Metadata chip — a small white card breaking the image edge */}
          <div className="absolute -top-5 left-6 z-10 flex items-center gap-2.5 rounded-full border border-border bg-card py-2 pl-3.5 pr-4 shadow-ambient md:left-10">
            <span
              className="h-1.5 w-1.5 rounded-full bg-accent"
              aria-hidden="true"
            />
            <span className="label-mono text-foreground/70">
              {whoWeAre.visual.label}
            </span>
          </div>

          <figcaption className="mt-5 flex items-center gap-4">
            <span className="hairline w-8" aria-hidden="true" />
            <span className="label-mono text-muted-foreground">
              {String(businesses.length).padStart(2, "0")} businesses — one
              ecosystem
            </span>
          </figcaption>
        </figure>
      </Reveal>
    </SectionShell>
  );
}

"use client";

/**
 * ETARNITY — vision.
 * PRD §17: a visually stronger section than Mission. Full-screen cinematic
 * composition — the layered horizon planes sit full-bleed behind fixed
 * warm-white masks and drift with a slow parallax, so the canvas breathes
 * into the adjacent sections. Large typography, quiet horizons, and the long
 * horizon carries the soft accent.
 */

import { useRef } from "react";
import Image from "next/image";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { vision } from "@/content/site";
import { Reveal } from "@/components/etarnity/primitives";
import { cn } from "@/lib/utils";

export function Vision() {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  /* Slow parallax — the horizon drifts against the scroll, never with it */
  const y = useTransform(scrollYProgress, [0, 1], [40, -40]);

  return (
    <section
      id="vision"
      ref={ref}
      aria-label="Our vision"
      className="relative flex min-h-[90svh] w-full items-center overflow-hidden"
    >
      {/* Cinematic ground — layered horizon planes, over-scanned for parallax */}
      <motion.div
        style={reduced ? undefined : { y }}
        className="pointer-events-none absolute inset-x-0 -inset-y-[10%]"
      >
        <Image
          src={vision.visual.image}
          alt={vision.visual.alt}
          fill
          sizes="100vw"
          className="object-cover opacity-70"
        />
      </motion.div>

      {/* Fixed blend masks — the warm-white canvas breathes at the edges */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[45%] bg-gradient-to-b from-background via-background/75 to-transparent"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[55%] bg-gradient-to-t from-background via-background/75 to-transparent"
      />

      {/* Centered cinematic typography */}
      <div className="relative mx-auto w-full max-w-[1200px] px-6 py-28 md:px-10 md:py-40">
        <Reveal className="flex items-center justify-center gap-4">
          <span className="label-mono text-accent-deep tabular-nums">
            {vision.index}
          </span>
          <span className="hairline w-8" aria-hidden="true" />
          <span className="label-mono text-muted-foreground">
            {vision.kicker}
          </span>
        </Reveal>

        <Reveal delay={0.12} duration={1.2} blur className="mt-8 md:mt-10">
          <h2 className="display-1 mx-auto max-w-4xl text-balance text-center text-foreground">
            {vision.headline}
          </h2>
        </Reveal>

        <Reveal delay={0.24} className="mt-7">
          <p className="mx-auto max-w-2xl text-pretty text-center text-[15px] leading-relaxed text-foreground/85 md:text-[16px]">
            {vision.statement}
          </p>
        </Reveal>

        <Reveal delay={0.32}>
          <p className="mx-auto mt-4 max-w-xl text-center text-[13.5px] leading-relaxed text-muted-foreground">
            {vision.supporting}
          </p>
        </Reveal>

        {/* Near / Mid / Long — the long horizon takes the accent */}
        <Reveal delay={0.2} className="mt-16 md:mt-24">
          <dl className="grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-x-8">
            {vision.horizon.map((horizon) => {
              const isLong = horizon.label.toLowerCase() === "long";
              return (
                <div
                  key={horizon.label}
                  className={cn(
                    isLong
                      ? "rounded-2xl border border-accent/25 bg-accent-soft/30 p-5"
                      : "border-t border-border pt-4"
                  )}
                >
                  <dt
                    className={cn(
                      "label-mono",
                      isLong ? "text-accent-deep" : "text-muted-foreground"
                    )}
                  >
                    {horizon.label}
                  </dt>
                  <dd className="mt-2.5 text-[13.5px] leading-relaxed text-muted-foreground">
                    {horizon.body}
                  </dd>
                </div>
              );
            })}
          </dl>
        </Reveal>
      </div>
    </section>
  );
}

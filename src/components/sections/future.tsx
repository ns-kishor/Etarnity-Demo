"use client";

/**
 * ETARNITY — What comes next.
 * The cinematic close of the narrative: hero-scale typography with the last
 * line resolving into the lavender accent, the horizon visual drifting on a
 * slow parallax at the asymmetric right, and Now / Next / Later statements
 * in hairline rows. The company is still becoming something larger.
 */

import { useRef } from "react";
import Image from "next/image";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { future } from "@/content/site";
import { EASE, Pill, Reveal } from "@/components/etarnity/primitives";
import { scrollToHash } from "@/components/providers/smooth-scroll-provider";
import { cn } from "@/lib/utils";

export function Future() {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  /* Slow vertical drift for the horizon visual (±30px, reduced-motion safe) */
  const visualY = useTransform(scrollYProgress, [0, 1], [30, -30]);

  return (
    <section
      id="future"
      ref={ref}
      aria-label={future.kicker}
      className="relative w-full overflow-x-clip"
    >
      {/* Soft lavender atmosphere behind the visual */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-[-10%] top-1/2 h-[70vh] w-[55vw] -translate-y-1/2 glow-deep"
      />

      <div className="relative mx-auto w-full max-w-[1200px] px-6 py-28 md:px-10 md:py-44">
        {/* Kicker */}
        <Reveal className="relative z-10 mb-10 flex items-center gap-4 md:mb-14">
          <span className="label-mono tabular-nums text-accent-deep">
            {future.index}
          </span>
          <span className="hairline w-8" aria-hidden="true" />
          <span className="label-mono text-muted-foreground">
            {future.kicker}
          </span>
        </Reveal>

        {/* Headline — progressive mask reveal per line; last line in accent */}
        <h2 className="relative z-10 font-display text-[clamp(2.8rem,7vw,6.5rem)] font-light leading-[1.02] tracking-[-0.03em] text-foreground">
          {future.headline.map((line, i) => (
            <span
              key={i}
              className="block overflow-hidden pb-[0.08em] -mb-[0.08em]"
            >
              <motion.span
                className={cn(
                  "block",
                  i === future.headline.length - 1 && "text-accent-deep"
                )}
                initial={reduced ? { opacity: 0 } : { y: "108%" }}
                whileInView={reduced ? { opacity: 1 } : { y: "0%" }}
                viewport={{ once: true, margin: "-12% 0px -12% 0px" }}
                transition={{
                  duration: 1.2,
                  delay: 0.08 + i * 0.12,
                  ease: EASE,
                }}
              >
                {line}
              </motion.span>
            </span>
          ))}
        </h2>

        {/* Lead */}
        <Reveal delay={0.4} className="relative z-10 mt-8 max-w-md">
          <p className="text-[15px] leading-relaxed text-muted-foreground">
            {future.lead}
          </p>
        </Reveal>

        {/* Horizon visual — in flow on mobile, asymmetric right on lg */}
        <div className="relative mt-12 lg:absolute lg:right-0 lg:top-1/2 lg:z-0 lg:mt-0 lg:w-[46%] lg:-translate-y-1/2">
          <motion.div style={reduced ? undefined : { y: visualY }}>
            <div className="overflow-hidden rounded-[32px] border border-border/60 shadow-ambient-lg">
              <div className="relative aspect-[7/4]">
                <Image
                  src="/images/og-base.png"
                  alt="Abstract cluster of translucent lavender orbs"
                  fill
                  sizes="(min-width: 1024px) 552px, (min-width: 640px) 90vw, 100vw"
                  className="object-cover"
                />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Now / Next / Later — hairline-separated statements */}
        <div className="relative z-10 mt-16 max-w-xl md:mt-24">
          {future.statements.map((statement, i) => {
            const isLast = i === future.statements.length - 1;
            return (
              <Reveal
                key={statement.label}
                delay={0.15 + i * 0.1}
                className={cn(
                  "grid gap-2 border-t border-border py-6 sm:grid-cols-12 sm:gap-6 sm:py-7",
                  isLast && "border-b"
                )}
              >
                <div className="sm:col-span-4">
                  {isLast ? (
                    <span className="label-mono inline-flex rounded-full bg-accent-soft px-3 py-1 text-accent-deep">
                      {statement.label}
                    </span>
                  ) : (
                    <span
                      className={cn(
                        "label-mono",
                        i === 1 ? "text-accent-deep" : "text-muted-foreground"
                      )}
                    >
                      {statement.label}
                    </span>
                  )}
                </div>
                <p
                  className={cn(
                    "leading-relaxed sm:col-span-8",
                    isLast
                      ? "font-display text-xl font-light tracking-tight text-foreground md:text-2xl"
                      : "text-[14.5px] text-muted-foreground"
                  )}
                >
                  {statement.body}
                </p>
              </Reveal>
            );
          })}
        </div>

        {/* CTA */}
        <Reveal delay={0.35} className="relative z-10 mt-10 md:mt-12">
          <Pill variant="accent" onClick={() => scrollToHash(future.cta.href)}>
            {future.cta.label}
            <ArrowUpRight
              className="h-4 w-4"
              strokeWidth={1.5}
              aria-hidden="true"
            />
          </Pill>
        </Reveal>
      </div>
    </section>
  );
}

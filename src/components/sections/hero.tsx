"use client";

/**
 * ETARNITY — hero.
 * Cinematic editorial opening: background → nav → kicker → headline lines
 * (mask reveal) → the ECOSYSTEM visual scales in → statement, CTAs, meta
 * settle → floating info layer arrives last. Scroll exit parallax.
 */

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowDown } from "lucide-react";
import { hero, site, businesses } from "@/content/site";
import { EASE, Pill } from "@/components/etarnity/primitives";
import { HeroVisual } from "@/components/etarnity/hero-visual";
import { scrollToHash } from "@/components/providers/smooth-scroll-provider";
import { cn } from "@/lib/utils";

/* Floating information layer — quiet chips naming parts of the ecosystem. */
const FLOAT_CHIPS = [
  { label: "ETARNITY Technology", value: "Operating", pos: "left-[2%] top-[14%]", delay: 1.35 },
  { label: "ETARNITY Labs", value: "Building", pos: "right-[0%] top-[38%]", delay: 1.5 },
  { label: "Est. " + site.founded, value: site.hq.city, pos: "left-[8%] bottom-[16%]", delay: 1.65 },
  { label: "4 businesses", value: "One ecosystem", pos: "right-[6%] bottom-[8%]", delay: 1.8 },
];

function FloatChip({
  label,
  value,
  className,
  delay,
}: {
  label: string;
  value: string;
  className?: string;
  delay: number;
}) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1.1, delay, ease: EASE }}
      className={cn(
        "pointer-events-none absolute z-10 hidden select-none md:block",
        className
      )}
    >
      <motion.div
        animate={reduced ? undefined : { y: [0, -7, 0] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: delay % 3 }}
        className="rounded-2xl border border-border bg-card/85 px-4 py-2.5 shadow-ambient backdrop-blur-md"
      >
        <p className="label-mono text-[9px] text-muted-foreground">{label}</p>
        <p className="mt-1 text-[12.5px] font-medium tracking-tight text-foreground">
          {value}
        </p>
      </motion.div>
    </motion.div>
  );
}

export function Hero() {
  const reduced = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  /* Cinematic scroll exit — layered parallax, no bounce */
  const headlineY = useTransform(scrollYProgress, [0, 1], [0, reduced ? 0 : -70]);
  const visualY = useTransform(scrollYProgress, [0, 1], [0, reduced ? 0 : 90]);
  const fade = useTransform(scrollYProgress, [0, 0.75], [1, 0.25]);

  const go = (href: string) => scrollToHash(href);

  return (
    <section
      id="top"
      ref={sectionRef}
      aria-label="ETARNITY — Building what comes next"
      className="relative flex min-h-svh w-full flex-col justify-center overflow-x-clip pb-24 pt-32 md:pb-32 md:pt-36"
    >
      {/* Ambient: faint editorial grid + soft lavender wash, right of canvas */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-grid-faint opacity-40 [mask-image:radial-gradient(ellipse_70%_60%_at_60%_45%,black_10%,transparent_75%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-[-10%] top-1/2 h-[70vh] w-[55vw] -translate-y-1/2 glow-deep"
      />

      {/* The ETARNITY ECOSYSTEM — behind and right of the typography */}
      <motion.div
        style={{ y: visualY }}
        className="pointer-events-none absolute inset-y-0 right-[-18%] w-[78%] sm:right-[-8%] sm:w-[62%] lg:right-[-4%] lg:w-[52%]"
        aria-hidden="true"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.6, delay: 0.5, ease: EASE }}
          className="h-full w-full"
        >
          <HeroVisual className="h-full w-full" />
        </motion.div>
      </motion.div>

      {/* Floating information layer (desktop) */}
      <div className="absolute inset-0 hidden lg:block">
        {FLOAT_CHIPS.map((chip) => (
          <FloatChip
            key={chip.label}
            label={chip.label}
            value={chip.value}
            className={chip.pos}
            delay={chip.delay}
          />
        ))}
      </div>

      {/* Editorial composition */}
      <motion.div
        style={{ y: headlineY, opacity: fade }}
        className="relative mx-auto w-full max-w-[1200px] px-6 md:px-10"
      >
        <div className="max-w-2xl">
          {/* Kicker */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.3, ease: EASE }}
            className="label-mono text-accent-deep"
          >
            {hero.kicker}
          </motion.p>

          {/* Headline — progressive mask reveal per line */}
          <h1 className="display-hero mt-7 text-foreground">
            {hero.headline.map((line, i) => (
              <span key={i} className="block overflow-hidden pb-[0.08em] -mb-[0.08em]">
                <motion.span
                  className={cn(
                    "block",
                    i === hero.headline.length - 1 && "text-accent-deep"
                  )}
                  initial={reduced ? { opacity: 0 } : { y: "108%" }}
                  animate={reduced ? { opacity: 1 } : { y: "0%" }}
                  transition={{
                    duration: 1.2,
                    delay: 0.42 + i * 0.13,
                    ease: EASE,
                  }}
                >
                  {line}
                </motion.span>
              </span>
            ))}
          </h1>

          {/* Statement */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.1, delay: 0.95, ease: EASE }}
            className="mt-8 max-w-md text-[15.5px] leading-relaxed text-muted-foreground"
          >
            {hero.statement}
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.1, delay: 1.08, ease: EASE }}
            className="mt-10 flex flex-wrap items-center gap-4"
          >
            <Pill variant="solid" onClick={() => go(hero.primaryCta.href)}>
              {hero.primaryCta.label}
            </Pill>
            <Pill variant="outline" onClick={() => go(hero.secondaryCta.href)}>
              {hero.secondaryCta.label}
              <ArrowDown className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />
            </Pill>
          </motion.div>

          {/* Corporate metadata baseline */}
          <motion.dl
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2, delay: 1.25, ease: EASE }}
            className="mt-14 flex flex-wrap gap-x-10 gap-y-4"
          >
            {hero.meta.map((m) => (
              <div key={m.label}>
                <dt className="label-mono text-muted-foreground">{m.label}</dt>
                <dd className="mt-1.5 text-[13.5px] font-medium tracking-tight text-foreground">
                  {m.value}
                </dd>
              </div>
            ))}
          </motion.dl>
        </div>
      </motion.div>

      {/* Scroll cue */}
      <motion.button
        type="button"
        onClick={() => go("#intro")}
        aria-label="Scroll to the introduction"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.9, ease: EASE }}
        className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 md:flex"
      >
        <span className="label-mono text-muted-foreground">Scroll</span>
        <motion.span
          animate={reduced ? undefined : { y: [0, 6, 0] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          className="block h-8 w-px bg-gradient-to-b from-accent/60 to-transparent"
        />
      </motion.button>

      {/* Visual label — bottom right, ties the canvas to the brand */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2, delay: 1.75, ease: EASE }}
        className="label-mono absolute bottom-8 right-6 hidden text-muted-foreground md:right-10 lg:block"
      >
        {hero.visualLabel}
      </motion.p>

      {/* Ecosystem quick-facts on mobile (replaces floating chips) */}
      <motion.ul
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 1.35, ease: EASE }}
        className="mx-auto mt-10 flex w-full max-w-[1200px] flex-wrap gap-2 px-6 md:hidden"
        aria-label="Ecosystem at a glance"
      >
        {businesses.map((b) => (
          <li
            key={b.id}
            className="rounded-full border border-border bg-card px-3.5 py-1.5"
          >
            <span className="text-[11.5px] font-medium tracking-tight text-foreground/80">
              {b.name}
            </span>
            <span className="ml-2 text-[10px] text-accent-deep">{b.status}</span>
          </li>
        ))}
      </motion.ul>
    </section>
  );
}

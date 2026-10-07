"use client";

import * as React from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowDown, ArrowRight } from "lucide-react";
import { hero } from "@/content/site";
import { HeroVisual } from "./hero-visual";

const easeOut = [0.21, 0.47, 0.32, 0.98] as const;

export function Hero() {
  const sectionRef = React.useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  /* Cinematic exit — the corporate statement rises and settles as you scroll */
  const contentY = useTransform(scrollYProgress, [0, 1], [0, -120]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.75], [1, 0]);

  return (
    <section
      ref={sectionRef}
      id="top"
      data-hero
      aria-label="ETARNITY — introduction"
      className="relative flex min-h-svh flex-col overflow-hidden"
    >
      {/* The ETARNITY CORE — signature generative visual */}
      <div className="absolute inset-0" aria-hidden="true">
        <HeroVisual />
      </div>

      {/* Readability gradient over the visual */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_18%_45%,rgba(10,10,10,0.72)_0%,rgba(10,10,10,0.25)_45%,transparent_75%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-48 bg-gradient-to-b from-transparent via-background/60 to-background"
      />

      <motion.div
        style={reduce ? undefined : { y: contentY, opacity: contentOpacity }}
        className="relative z-10 mx-auto flex w-full max-w-[1280px] flex-1 flex-col justify-center px-6 pt-28 pb-16 md:px-10 md:pt-32 lg:px-14"
      >
        {/* System label */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15, ease: easeOut }}
          className="label-mono flex items-center gap-3 text-emerald-corp/90"
        >
          <span aria-hidden="true" className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-corp" />
          {hero.kicker}
        </motion.p>

        {/* The statement */}
        <h1 className="mt-7 max-w-4xl text-balance text-[13.5vw] font-medium leading-[0.98] tracking-[-0.035em] text-ivory sm:text-6xl md:text-7xl lg:text-[5.6rem]">
          <span className="block overflow-hidden">
            <motion.span
              className="block"
              initial={{ y: "108%" }}
              animate={{ y: 0 }}
              transition={{ duration: 1.05, delay: 0.3, ease: easeOut }}
            >
              {hero.headline[0]}
            </motion.span>
          </span>
          <span className="block overflow-hidden">
            <motion.span
              className="block font-editorial font-light italic text-emerald-corp"
              initial={{ y: "108%" }}
              animate={{ y: 0 }}
              transition={{ duration: 1.05, delay: 0.42, ease: easeOut }}
            >
              {hero.headline[1]}
            </motion.span>
          </span>
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.65, ease: easeOut }}
          className="mt-8 max-w-xl text-pretty text-[15px] leading-relaxed text-muted-foreground md:text-base"
        >
          {hero.statement}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.8, ease: easeOut }}
          className="mt-10 flex flex-wrap items-center gap-4"
        >
          <a
            href={hero.primaryCta.href}
            className="group inline-flex h-12 items-center gap-2.5 rounded-sm bg-ivory px-6 text-[14px] font-semibold tracking-tight text-background transition-colors hover:bg-emerald-corp hover:text-background"
          >
            {hero.primaryCta.label}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
          </a>
          <a
            href={hero.secondaryCta.href}
            className="inline-flex h-12 items-center rounded-sm border border-border px-6 text-[14px] font-medium tracking-tight text-foreground/90 transition-colors hover:border-emerald-corp/60 hover:text-emerald-corp"
          >
            {hero.secondaryCta.label}
          </a>
        </motion.div>

        {/* Corporate metadata baseline */}
        <motion.dl
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.1, delay: 1.05 }}
          className="mt-16 md:mt-24"
        >
          <div className="hairline" aria-hidden="true" />
          <div className="grid grid-cols-1 gap-3 pt-5 sm:grid-cols-3 sm:gap-8">
            {hero.meta.map((m) => (
              <div key={m.label} className="flex items-baseline gap-3 sm:flex-col sm:gap-1">
                <dt className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground/70">
                  {m.label}
                </dt>
                <dd className="font-mono text-[12px] tracking-[0.04em] text-ivory/90">{m.value}</dd>
              </div>
            ))}
          </div>
        </motion.dl>
      </motion.div>

      {/* Scroll cue */}
      <motion.a
        href="#company"
        aria-label="Scroll to company overview"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6, duration: 1 }}
        className="absolute bottom-7 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-2.5 text-muted-foreground/70 transition-colors hover:text-emerald-corp md:flex"
      >
        <span className="font-mono text-[9.5px] uppercase tracking-[0.3em]">Scroll</span>
        <motion.span
          animate={reduce ? undefined : { y: [0, 6, 0] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
        >
          <ArrowDown className="h-3.5 w-3.5" aria-hidden="true" />
        </motion.span>
      </motion.a>
    </section>
  );
}

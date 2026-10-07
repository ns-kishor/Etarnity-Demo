"use client";

/**
 * ETARNITY — mission.
 * PRD §16: almost no unnecessary UI. Huge typography, large whitespace, one
 * subtle visual (a drifting soft-lavender radial), soft accent, slow scroll
 * animation. The statement reads like an announcement from a serious
 * organization — nothing competes with it.
 */

import { useRef } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { mission } from "@/content/site";
import {
  Reveal,
  SectionShell,
  Stagger,
  StaggerItem,
} from "@/components/etarnity/primitives";

export function Mission() {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  /* Whisper-quiet scroll drift — the statement settles as you pass it */
  const y = useTransform(scrollYProgress, [0, 1], [18, -18]);
  const glowY = useTransform(scrollYProgress, [0, 1], [60, -60]);

  return (
    <SectionShell id="mission" ariaLabel="Our mission">
      {/* The one subtle visual — a soft lavender radial behind the statement */}
      <motion.div
        aria-hidden="true"
        style={reduced ? undefined : { y: glowY }}
        className="pointer-events-none absolute inset-x-0 top-8 h-[560px] glow-faint md:top-14"
      />

      <div ref={ref} className="relative">
        <motion.div style={reduced ? undefined : { y }}>
          {/* Centered opener — mono index, hairline, kicker */}
          <Reveal className="flex items-center justify-center gap-4">
            <span className="label-mono text-accent-deep tabular-nums">
              {mission.index}
            </span>
            <span className="hairline w-8" aria-hidden="true" />
            <span className="label-mono text-muted-foreground">
              {mission.kicker}
            </span>
          </Reveal>

          {/* The mission statement — huge, slow, blurred into focus */}
          <Reveal delay={0.12} duration={1.2} blur className="mt-8 md:mt-10">
            <h2 className="display-1 mx-auto max-w-4xl text-balance text-center text-foreground">
              {mission.statement}
            </h2>
          </Reveal>

          <Reveal delay={0.24}>
            <p className="mx-auto mt-7 max-w-2xl text-pretty text-center text-[15px] leading-relaxed text-muted-foreground">
              {mission.lead}
            </p>
          </Reveal>
        </motion.div>
      </div>

      {/* Three focus blocks — hairline-topped, small mono titles */}
      <Stagger
        as="div"
        className="mt-20 grid grid-cols-1 gap-10 md:mt-28 md:grid-cols-3 md:gap-x-10 md:gap-y-0"
      >
        {mission.focus.map((focus) => (
          <StaggerItem
            key={focus.title}
            className="border-t border-border pt-6"
          >
            <h3 className="label-mono text-foreground">{focus.title}</h3>
            <p className="mt-3.5 text-[14px] leading-relaxed text-muted-foreground">
              {focus.body}
            </p>
          </StaggerItem>
        ))}
      </Stagger>

      {/* Four operating principles — quiet panels, lavender on approach */}
      <Stagger
        as="ul"
        delay={0.1}
        className="mt-16 grid grid-cols-1 gap-4 sm:grid-cols-2 md:mt-24 md:gap-5"
      >
        {mission.principles.map((principle) => (
          <StaggerItem
            key={principle.id}
            as="li"
            className="rounded-2xl border border-border p-5 transition-colors duration-500 hover:border-accent/40 hover:bg-accent-soft/30"
          >
            <div className="flex items-baseline gap-3">
              <span className="label-mono text-accent-deep">
                {principle.id}
              </span>
              <h3 className="text-[15px] font-medium tracking-tight text-foreground">
                {principle.title}
              </h3>
            </div>
            <p className="mt-2.5 text-[13.5px] leading-relaxed text-muted-foreground">
              {principle.body}
            </p>
          </StaggerItem>
        ))}
      </Stagger>
    </SectionShell>
  );
}

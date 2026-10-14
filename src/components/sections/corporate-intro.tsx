"use client";

/**
 * ETARNITY — corporate introduction.
 * The large editorial statement. While the user scrolls through the section
 * the headline drifts slowly and key words resolve from charcoal into the
 * soft lavender accent — dark → accent, one word at a time.
 */

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { intro } from "@/content/site";
import { Reveal, EASE } from "@/components/etarnity/primitives";

const INK = "#1b1c20";
const ACCENT = "#5c4f82";

function ShiftWord({
  word,
  accent,
  progress,
  start,
}: {
  word: string;
  accent: boolean;
  progress: MotionValue<number>;
  start: number;
}) {
  const color = useTransform(progress, [start, start + 0.28], [INK, ACCENT]);
  if (!accent) {
    return <span>{word}</span>;
  }
  return <motion.span style={{ color }}>{word}</motion.span>;
}

export function CorporateIntro() {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.85", "end 0.35"],
  });

  /* Slow positional drift while scrolling — the text moves with intention */
  const y = useTransform(scrollYProgress, [0, 1], [30, -30]);
  const x = useTransform(scrollYProgress, [0, 1], [0, -18]);

  const words = intro.statement.split(" ");
  const cleaned = (w: string) => w.replace(/[^a-zA-Z]/g, "").toLowerCase();
  const n = words.length;

  return (
    <section
      id="intro"
      ref={ref}
      aria-label="Corporate introduction"
      className="relative w-full overflow-x-clip bg-surface-alt"
    >
      <div className="mx-auto w-full max-w-[1200px] px-6 py-28 md:px-10 md:py-44">
        <Reveal>
          <p className="label-mono mb-12 text-accent-deep md:mb-16">
            {intro.kicker}
          </p>
        </Reveal>

        <motion.p
          style={reduced ? undefined : { y, x }}
          className="display-1 max-w-5xl text-foreground"
        >
          {words.map((word, i) => (
            <span key={i} className="inline-block whitespace-pre">
              <ShiftWord
                word={word}
                accent={intro.accentWords.includes(cleaned(word))}
                progress={scrollYProgress}
                start={(i / n) * 0.72}
              />
              {i < n - 1 ? " " : ""}
            </span>
          ))}
        </motion.p>

        <Reveal delay={0.15} className="mt-16 md:mt-24">
          <div className="flex items-center gap-5">
            <span className="hairline w-16" aria-hidden="true" />
            <p className="text-[14.5px] tracking-tight text-muted-foreground">
              {intro.closing}
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

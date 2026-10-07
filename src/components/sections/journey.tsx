"use client";

/**
 * ETARNITY — company journey.
 * A vertical timeline of real events only. The base rail is a quiet hairline;
 * a soft lavender overlay draws down it as the user scrolls (reduced motion
 * keeps the full static line). The open chapter ("next") gets a dashed node
 * and a link to #future.
 */

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { journey } from "@/content/site";
import {
  Pill,
  Reveal,
  SectionHeading,
  SectionShell,
} from "@/components/etarnity/primitives";
import { scrollToHash } from "@/components/providers/smooth-scroll-provider";

export function Journey() {
  const reduced = useReducedMotion();
  const timelineRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: timelineRef,
    offset: ["start 0.8", "end 0.55"],
  });

  /* The accent rail draws with scroll, top-down; still and complete when the
     user prefers reduced motion. */
  const railScale = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <SectionShell id="journey" ariaLabel="Company journey">
      <SectionHeading
        index={journey.index}
        kicker={journey.kicker}
        title={journey.title}
        lead={journey.lead}
      />

      <div ref={timelineRef} className="relative">
        {/* Base rail */}
        <span
          aria-hidden="true"
          className="absolute bottom-0 left-[7px] top-0 w-px bg-border"
        />
        {/* Accent overlay — draws with scroll */}
        <motion.span
          aria-hidden="true"
          className="absolute bottom-0 left-[7px] top-0 w-px origin-top bg-accent"
          style={reduced ? { scaleY: 1 } : { scaleY: railScale }}
        />

        <ul aria-label="Company milestones">
          {journey.milestones.map((milestone) => (
            <Reveal
              key={milestone.title}
              as="li"
              className="relative border-b border-border/60 py-6 pl-10 md:py-8 md:pl-14"
            >
              <span
                aria-hidden="true"
                className="absolute left-0 top-8 h-3.5 w-3.5 rounded-full border-2 border-accent bg-card md:top-10"
              />
              <p className="label-mono text-accent-deep">{milestone.period}</p>
              <h3 className="mt-2 font-display text-lg font-normal tracking-tight text-foreground">
                {milestone.title}
              </h3>
              <p className="mt-2 max-w-lg text-[14px] leading-relaxed text-muted-foreground">
                {milestone.body}
              </p>
            </Reveal>
          ))}

          {/* The open chapter — distinct treatment, dashed node */}
          <Reveal
            as="li"
            delay={0.05}
            className="relative py-6 pl-10 md:py-8 md:pl-14"
          >
            <span
              aria-hidden="true"
              className="absolute left-0 top-8 h-3.5 w-3.5 rounded-full border-2 border-dashed border-accent/60 bg-card md:top-10"
            />
            <p className="label-mono text-accent-deep">{journey.next.period}</p>
            <h3 className="mt-2 font-display text-lg font-normal tracking-tight text-foreground">
              {journey.next.title}
            </h3>
            <p className="mt-2 max-w-lg text-[14px] leading-relaxed text-muted-foreground">
              {journey.next.body}
            </p>
            <div className="mt-6">
              <Pill
                variant="outline"
                onClick={() => scrollToHash(journey.next.href)}
              >
                See where we&rsquo;re heading
                <ArrowRight
                  className="h-4 w-4"
                  strokeWidth={1.5}
                  aria-hidden="true"
                />
              </Pill>
            </div>
          </Reveal>
        </ul>
      </div>
    </SectionShell>
  );
}

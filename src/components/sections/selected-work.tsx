"use client";

/**
 * ETARNITY — Selected Work (§26-27).
 *
 * Cinematic editorial blocks, not a portfolio grid. Each project enters the
 * viewport as a large visual panel: scroll-driven image scale + inner
 * parallax (the image moves at a different speed from the text), an
 * alternating asymmetric layout, and a quiet expandable story —
 * Problem / The Idea / Design / Outcome. As the next block enters, the
 * previous image recedes (scale down, opacity settling to 0.9) — the
 * per-block scroll transforms provide the exit. No links: the case studies
 * are presented, not pointed at. Reduced-motion safe.
 */

import { useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import Image from "next/image";
import { ArrowUpRight, Minus, Plus } from "lucide-react";
import { projects, type Project } from "@/content/site";
import {
  EASE,
  Reveal,
  SectionHeading,
  SectionShell,
} from "@/components/etarnity/primitives";
import { cn } from "@/lib/utils";

/* The four narrative fields of the expandable story. */
const STORY_FIELDS = [
  { key: "problem", label: "Problem" },
  { key: "idea", label: "The Idea" },
  { key: "design", label: "Design" },
  { key: "outcome", label: "Outcome" },
] as const;

function ProjectBlock({ project, index }: { project: Project; index: number }) {
  const reduced = useReducedMotion();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLElement>(null);

  /* One scroll timeline per block — ENTER → EXPAND → FOCUS → EXIT. */
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  /* The image scales up through the middle of the block, then recedes;
     its inner parallax runs at a different speed from the text column. */
  const imageY = useTransform(scrollYProgress, [0, 1], ["-5%", "5%"]);
  const imageScale = useTransform(scrollYProgress, [0, 0.5, 1], [1, 1.04, 0.98]);
  const imageOpacity = useTransform(scrollYProgress, [0.55, 0.95], [1, 0.9]);
  const textY = useTransform(scrollYProgress, [0, 1], [24, -24]);

  const flipped = index % 2 === 1;
  const detailId = `${project.id}-story`;

  return (
    <article
      ref={ref}
      aria-label={`${project.name} — ${project.sector}, ${project.year}`}
      className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-14"
    >
      {/* IMAGE — the large visual panel */}
      <Reveal distance={28} className={cn("lg:col-span-7", flipped && "lg:order-2")}>
        <motion.figure
          style={reduced ? undefined : { opacity: imageOpacity }}
          className="relative aspect-[16/10] overflow-hidden rounded-[32px] shadow-ambient-lg"
        >
          <motion.div
            style={reduced ? undefined : { y: imageY, scale: imageScale }}
            className="absolute inset-x-0 inset-y-[-8%]"
          >
            <Image
              src={project.image}
              alt={project.imageAlt}
              fill
              sizes="(max-width: 1024px) 100vw, 58vw"
              className="object-cover"
            />
          </motion.div>
        </motion.figure>
      </Reveal>

      {/* TEXT — index, name, sector, summary, stack, story */}
      <Reveal delay={0.12} className={cn("lg:col-span-5", flipped && "lg:order-1")}>
        <motion.div style={reduced ? undefined : { y: textY }}>
          {/* Minimal metadata row */}
          <div className="flex items-baseline justify-between gap-4">
            <div className="flex items-baseline gap-3">
              <span className="label-mono tabular-nums text-accent-deep">
                {project.index}
              </span>
              <span className="hairline w-6" aria-hidden="true" />
              <span className="label-mono tabular-nums text-muted-foreground">
                {project.year}
              </span>
            </div>
            {/* All project URLs are null — a quiet decorative gesture only */}
            <ArrowUpRight
              className="h-4 w-4 text-muted-foreground/40"
              strokeWidth={1.5}
              aria-hidden="true"
            />
          </div>

          <h3 className="display-2 mt-6 text-balance text-foreground">
            {project.name}
          </h3>
          <p className="label-mono mt-4 text-muted-foreground">{project.sector}</p>
          <p className="mt-4 max-w-md text-[15px] leading-relaxed text-muted-foreground">
            {project.summary}
          </p>

          <ul className="mt-6 flex flex-wrap gap-2" aria-label="Technology stack">
            {project.technology.map((item) => (
              <li
                key={item}
                className="rounded-full border border-border bg-card px-3 py-1 font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground"
              >
                {item}
              </li>
            ))}
          </ul>

          {/* DETAIL — the quiet expandable story */}
          <div className="mt-8">
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls={detailId}
              className="group inline-flex items-center gap-2.5 rounded-full border border-border bg-card px-4 py-2.5 transition-colors duration-300 hover:border-accent/40"
            >
              <span className="flex h-4 w-4 items-center justify-center text-accent-deep">
                {open ? (
                  <Minus className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />
                ) : (
                  <Plus className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />
                )}
              </span>
              <span className="label-mono text-muted-foreground transition-colors duration-300 group-hover:text-accent-deep">
                Read the story
              </span>
            </button>

            <AnimatePresence initial={false}>
              {open && (
                <motion.div
                  key="story"
                  id={detailId}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: reduced ? 0.2 : 0.5, ease: EASE }}
                  className="overflow-hidden"
                >
                  <dl className="mt-6">
                    {STORY_FIELDS.map((field) => (
                      <div
                        key={field.key}
                        className="grid gap-1.5 border-t border-border py-4 md:grid-cols-[110px_1fr] md:gap-6"
                      >
                        <dt className="label-mono pt-1 text-accent-deep">
                          {field.label}
                        </dt>
                        <dd className="text-[13.5px] leading-relaxed text-muted-foreground">
                          {project[field.key]}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </Reveal>
    </article>
  );
}

export function SelectedWork() {
  return (
    <SectionShell id="work" ariaLabel="Selected work">
      <SectionHeading
        index="13"
        kicker="Selected Work"
        title="What we've built."
        lead="Built by our businesses — engineered to be operated, not abandoned."
      />

      <div className="space-y-24 md:space-y-36">
        {projects.map((project, i) => (
          <ProjectBlock key={project.id} project={project} index={i} />
        ))}
      </div>
    </SectionShell>
  );
}

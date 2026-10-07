"use client";

import * as React from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { projects, type Project } from "@/content/site";
import {
  Reveal,
  SectionHeading,
  SectionShell,
} from "@/components/primitives/corporate";
import { cn } from "@/lib/utils";

/**
 * Selected Work — a cinematic editorial index of what we've built.
 *
 * Each project is a full block: a sticky identity column (index, year,
 * name, sector, stack) and a sequence of narrative fields that settle
 * in one after another as the block scrolls past. A 1px emerald
 * progress hairline tracks reading position through each block.
 */

const FIELDS: Array<{
  key: "problem" | "idea" | "design" | "outcome";
  label: string;
  wide: boolean;
}> = [
  { key: "problem", label: "Problem", wide: true },
  { key: "idea", label: "The Idea", wide: true },
  { key: "design", label: "Design", wide: false },
  { key: "outcome", label: "Outcome", wide: false },
];

function ProjectBlock({ project }: { project: Project }) {
  const ref = React.useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end center"],
  });
  const scaleX = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <article
      ref={ref}
      aria-labelledby={`work-${project.id}-name`}
      className="relative mt-10 border-t border-border/60 pt-10 first:mt-0 md:mt-14 md:pt-14"
    >
      {/* Reading progress through this block */}
      <motion.div
        aria-hidden="true"
        className="absolute inset-x-0 top-[-1px] h-px origin-left bg-emerald-corp/50"
        style={{ scaleX }}
      />

      <div className="lg:grid lg:grid-cols-12 lg:gap-12">
        {/* Identity column — sticky on desktop */}
        <div className="lg:col-span-5 lg:sticky lg:top-24 lg:self-start">
          <Reveal distance={20}>
            <div className="flex items-baseline gap-3 font-mono text-[11px] tracking-[0.22em]">
              <span className="text-champagne/80">{project.index}</span>
              <span className="text-muted-foreground/70">{project.year}</span>
            </div>
            <h3
              id={`work-${project.id}-name`}
              className="mt-4 text-balance text-3xl font-medium tracking-tight text-ivory md:text-4xl"
            >
              {project.name}
            </h3>
            <p className="label-mono mt-3 text-emerald-corp/90">
              {project.sector}
            </p>
            <ul
              className="mt-6 flex flex-wrap gap-2"
              aria-label="Technology stack"
            >
              {project.technology.map((item) => (
                <li
                  key={item}
                  className="rounded-full border border-border/60 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground"
                >
                  {item}
                </li>
              ))}
            </ul>
            {project.url && (
              <a
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-8 inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.18em] text-emerald-corp transition-colors hover:text-emerald-corp/80"
              >
                View project
                <ArrowUpRight
                  className="h-3.5 w-3.5"
                  aria-hidden="true"
                />
              </a>
            )}
          </Reveal>
        </div>

        {/* Narrative fields — settle in sequence */}
        <dl className="mt-10 lg:col-span-7 lg:mt-0">
          {FIELDS.map((field, i) => (
            <Reveal
              key={field.key}
              as="div"
              direction="up"
              distance={20}
              delay={i * 0.08}
              className={cn(i > 0 && "mt-6 border-t border-border/60 pt-6")}
            >
              <dt className="font-mono text-[10px] uppercase tracking-[0.2em] text-emerald-corp/80">
                {field.label}
              </dt>
              <dd
                className={cn(
                  "mt-2.5 leading-relaxed text-muted-foreground",
                  field.wide ? "text-[14px] md:text-[15px]" : "text-[13.5px]"
                )}
              >
                {project[field.key]}
              </dd>
            </Reveal>
          ))}
        </dl>
      </div>
    </article>
  );
}

export function SelectedWork() {
  return (
    <SectionShell id="work" ariaLabel="What we've built">
      <div className="py-20 md:py-28">
        <SectionHeading
          index="12"
          kicker="Selected Work"
          title="What we've built."
          lead="A selection of systems, platforms and programs designed and engineered inside the ecosystem — each solving a real problem for a real organization."
          serifTitle
        />

        <div className="mt-12 md:mt-16">
          {projects.map((project) => (
            <ProjectBlock key={project.id} project={project} />
          ))}
        </div>
      </div>
    </SectionShell>
  );
}

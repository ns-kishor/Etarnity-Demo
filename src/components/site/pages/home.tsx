"use client";

import * as React from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import type { HomePayload } from "@/lib/queries";
import type {
  Business,
  CompanyProfile,
  Project,
} from "@/lib/types";
import { Link } from "@/lib/router";
import ChromeOrbit from "../chrome-orbit";
import { Reveal, EASE } from "../reveal";
import { Section } from "../section";
import { StatusChip } from "../status-chip";
import { EmptyState } from "../states";

/* ------------------------------------------------------------------ */
/* Local constants                                                     */
/* ------------------------------------------------------------------ */

const CAPABILITIES = [
  "Software Engineering",
  "Product Design",
  "Applied AI",
  "Cybersecurity",
  "Cloud Infrastructure",
  "Research",
] as const;

const FALLBACK_OVERVIEW =
  "ETARNITY is a technology company from Dhaka, Bangladesh — built to design, engineer, and operate digital products and platforms for an international market.";

/**
 * Renders an editorial statement with the trailing clause (after the last
 * em-dash) softened to secondary ink — "graphite with key phrases softened".
 */
function EditorialStatement({ text }: { text: string }) {
  const parts = text
    .split("—")
    .map((part) => part.trim())
    .filter(Boolean);
  if (parts.length < 2) {
    return <>{text}</>;
  }
  return (
    <>
      {parts.map((part, i) => (
        <React.Fragment key={i}>
          {i > 0 ? "— " : null}
          <span className={i === parts.length - 1 ? "text-ink-soft" : undefined}>
            {part}
          </span>
        </React.Fragment>
      ))}
    </>
  );
}

/** Static orbit mark for cover placeholders — non-interactive (cards are links). */
function CoverMark() {
  const gradientId = React.useId().replace(/[:]/g, "");
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      aria-hidden="true"
      className="size-12 opacity-60"
    >
      <circle cx="32" cy="32" r="11" fill={`url(#${gradientId})`} />
      <ellipse
        cx="32"
        cy="32"
        rx="24"
        ry="9.5"
        stroke="#526BFF"
        strokeWidth="2.4"
        transform="rotate(-24 32 32)"
      />
      <circle cx="50.2" cy="22.4" r="3" fill="#AAB7FF" />
      <defs>
        <linearGradient
          id={gradientId}
          x1="24"
          y1="24"
          x2="40"
          y2="42"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#E9EDF5" />
          <stop offset="0.55" stopColor="#AAB7FF" />
          <stop offset="1" stopColor="#526BFF" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/** Project cover (or gradient placeholder with the orbit mark). */
function ProjectCover({
  project,
  sizes,
}: {
  project: Project;
  sizes: string;
}) {
  if (project.cover) {
    return (
      <Image
        src={project.cover.url}
        alt={project.cover.altText ?? project.title}
        fill
        sizes={sizes}
        className="object-cover transition duration-500 group-hover:scale-[1.02]"
      />
    );
  }
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-[linear-gradient(135deg,#15171B,#232936)]">
      <CoverMark />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Cards                                                               */
/* ------------------------------------------------------------------ */

function BusinessCard({
  business,
  delay,
}: {
  business: Business;
  delay: number;
}) {
  return (
    <Reveal delay={delay} className="h-full">
      <Link
        to={`/businesses/${business.slug}`}
        className="group relative flex h-full flex-col rounded-xl border border-hairline bg-white p-6 transition duration-300 hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(21,23,27,0.07)]"
      >
        <div className="flex items-center">
          {business.logo ? (
            <span className="relative size-10 overflow-hidden rounded-lg">
              <Image
                src={business.logo.url}
                alt={business.logo.altText ?? business.name}
                fill
                sizes="40px"
                className="object-cover"
              />
            </span>
          ) : (
            <span
              aria-hidden="true"
              className="flex size-10 items-center justify-center rounded-lg bg-graphite text-sm font-semibold text-warmwhite"
            >
              {business.name.charAt(0)}
            </span>
          )}
          <StatusChip status={business.operationalStatus} className="ml-auto" />
        </div>
        <h3 className="mt-4 text-[15px] font-semibold text-graphite">
          {business.name}
        </h3>
        <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.15em] text-ink-soft">
          {business.category}
        </p>
        <p className="mt-2 line-clamp-3 text-[13px] leading-relaxed text-ink-soft">
          {business.summary}
        </p>
        <p className="mt-auto inline-flex items-center gap-1 pt-4 text-xs font-medium text-electric">
          Explore
          <ArrowUpRight
            aria-hidden="true"
            className="size-3.5 -translate-x-1 opacity-0 transition group-hover:translate-x-0 group-hover:opacity-100"
          />
        </p>
      </Link>
    </Reveal>
  );
}

function ProjectRowCard({ project }: { project: Project }) {
  return (
    <Link
      to={`/work/${project.slug}`}
      className="group grid overflow-hidden rounded-xl border border-hairline bg-white transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_40px_rgba(21,23,27,0.07)] md:grid-cols-5"
    >
      <div className="relative aspect-[16/10] md:aspect-auto md:col-span-3 md:min-h-[320px]">
        <ProjectCover
          project={project}
          sizes="(min-width:1024px) 60vw, 100vw"
        />
      </div>
      <div className="flex flex-col p-6 md:col-span-2 md:p-8">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-electric">
            {project.category}
          </p>
          <StatusChip status={project.projectStatus} className="ml-auto" />
        </div>
        <h3 className="mt-3 text-xl font-semibold tracking-tight text-graphite md:text-2xl">
          {project.title}
        </h3>
        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-ink-soft">
          {project.summary}
        </p>
        <p className="mt-auto pt-6 font-mono text-xs uppercase tracking-[0.15em] text-electric">
          View Case Study →
        </p>
      </div>
    </Link>
  );
}

function ProjectCard({ project }: { project: Project }) {
  return (
    <Link
      to={`/work/${project.slug}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-hairline bg-white transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_40px_rgba(21,23,27,0.07)]"
    >
      <div className="relative aspect-[16/10]">
        <ProjectCover
          project={project}
          sizes="(min-width:768px) 33vw, 100vw"
        />
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center gap-2">
          <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-electric">
            {project.category}
          </p>
          <StatusChip status={project.projectStatus} className="ml-auto" />
        </div>
        <h3 className="mt-2 text-base font-semibold text-graphite">
          {project.title}
        </h3>
        <p className="mt-2 line-clamp-2 text-[13px] leading-relaxed text-ink-soft">
          {project.summary}
        </p>
      </div>
    </Link>
  );
}

/** Bottom-of-section "explore all" link — right aligned. */
function ExploreAllLink({
  to,
  label,
}: {
  to: string;
  label: string;
}) {
  return (
    <Reveal>
      <div className="mt-8 flex justify-end">
        <Link
          to={to}
          className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-ink-soft transition-colors hover:text-graphite"
        >
          {label}
          <ArrowRight aria-hidden="true" className="size-3.5" />
        </Link>
      </div>
    </Reveal>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function HomePage({
  initialData,
}: {
  initialData: HomePayload;
}) {
  // NOTE: HomePayload in queries.ts is annotated with the raw @prisma/client
  // model types, but its serializers actually emit the src/lib/types shapes
  // (logo/cover/gallery included — verified against the live route). Cast to
  // the public contract so this page stays type-safe against lib/types.
  const { company, businesses, projects } = initialData as unknown as {
    company: CompanyProfile | null;
    businesses: Business[];
    projects: Project[];
  };
  const reduceMotion = useReducedMotion();

  const featuredBusinesses = businesses.slice(0, 4);
  const [leadProject, ...restProjects] = projects;
  const secondaryProjects = restProjects.slice(0, 3);

  return (
    <>
      {/* ============ HERO ============ */}
      <section className="relative overflow-hidden pt-16 pb-16 md:pt-24 md:pb-24">
        <div className="container-site lg:grid lg:grid-cols-12 lg:items-center lg:gap-10">
          {/* Hero copy */}
          <div className="lg:col-span-6">
            <Reveal>
              <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-electric">
                ETARNITY / TECHNOLOGY COMPANY
              </p>
            </Reveal>
            <Reveal delay={0.1}>
              <h1 className="mt-6 text-[2.75rem] font-semibold leading-[1.04] tracking-[-0.03em] text-graphite sm:text-6xl lg:text-[4.25rem]">
                Building What Comes{" "}
                <span className="underline decoration-[#526BFF]/60 decoration-[3px] underline-offset-[10px]">
                  Next
                </span>
                .
              </h1>
            </Reveal>
            <Reveal delay={0.2}>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-soft">
                ETARNITY builds technology-driven products, digital platforms,
                and businesses designed to solve meaningful problems.
              </p>
            </Reveal>
            <Reveal delay={0.3}>
              <div className="flex flex-wrap gap-3 pt-2">
                <Link
                  to="/company"
                  className="group inline-flex items-center gap-2 rounded-full bg-graphite px-6 py-3.5 text-sm font-medium text-warmwhite transition hover:bg-[#23262D]"
                >
                  Explore ETARNITY
                  <ArrowRight
                    aria-hidden="true"
                    className="size-4 transition-transform group-hover:translate-x-0.5"
                  />
                </Link>
                <Link
                  to="/businesses"
                  className="inline-flex items-center rounded-full border border-hairline bg-white px-6 py-3.5 text-sm font-medium text-graphite transition hover:border-graphite"
                >
                  Explore Our Businesses
                </Link>
              </div>
            </Reveal>
            <Reveal delay={0.4}>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-8 font-mono text-[11px] uppercase tracking-[0.18em] text-ink-soft">
                <span>
                  EST. {company?.foundingYear ?? 2025} —{" "}
                  {company?.headquarters ?? "Dhaka, Bangladesh"}
                </span>
                <span className="flex items-center gap-2">
                  <span aria-hidden="true" className="text-electric">
                    ●
                  </span>
                  {company?.operatingStatus ?? "Operating — early stage"}
                </span>
              </div>
            </Reveal>
          </div>

          {/* Signature visual — chrome orbit */}
          <motion.div
            className="relative mt-12 h-[360px] overflow-hidden rounded-2xl border border-graphite bg-graphite sm:h-[420px] lg:mt-0 lg:h-[560px] lg:col-span-6"
            initial={reduceMotion ? false : { opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, ease: EASE, delay: 0.15 }}
          >
            <ChromeOrbit bandWidth={0.09} />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(60%_50%_at_70%_40%,rgba(170,183,255,0.14),transparent)]"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 z-10 rounded-2xl ring-1 ring-inset ring-white/10"
            />
            <p
              aria-hidden="true"
              className="pointer-events-none absolute top-5 left-5 z-10 font-mono text-[10px] tracking-[0.18em] text-periwinkle/70"
            >
              ETR.ORB / 01 — CHROME
            </p>
            <p
              aria-hidden="true"
              className="pointer-events-none absolute right-5 bottom-5 z-10 font-mono text-[10px] tracking-[0.18em] text-periwinkle/70"
            >
              SYS.ACTIVE{" "}
              <span className="text-electric" aria-hidden="true">
                ●
              </span>
            </p>
          </motion.div>
        </div>
      </section>

      {/* ============ 01 / THE COMPANY ============ */}
      <Section
        bordered
        eyebrow="01 / THE COMPANY"
        title="A Technology Company. A Broader Vision."
      >
        <div className="lg:grid lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-7">
            <Reveal>
              <p className="max-w-[36ch] text-2xl leading-[1.35] font-medium tracking-[-0.01em] text-graphite md:text-[2rem]">
                <EditorialStatement
                  text={company?.overview ?? FALLBACK_OVERVIEW}
                />
              </p>
            </Reveal>
          </div>
          <div className="mt-10 lg:col-span-5 lg:mt-0 lg:self-end">
            <Reveal delay={0.08}>
              <p className="text-sm leading-relaxed text-ink-soft">
                We combine software engineering, product design, and applied
                intelligence — and we hold ourselves to the standard of
                companies much larger than us.
              </p>
              <Link
                to="/company"
                className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-electric underline-offset-4 hover:underline"
              >
                Learn about ETARNITY
                <ArrowRight aria-hidden="true" className="size-3.5" />
              </Link>
            </Reveal>
          </div>
        </div>
        <div className="mt-14 grid grid-cols-2 gap-4 border-t border-hairline pt-8 sm:grid-cols-3 lg:grid-cols-6">
          {CAPABILITIES.map((capability, i) => (
            <Reveal key={capability} delay={i * 0.08}>
              <div className="flex items-start gap-2.5">
                <span
                  aria-hidden="true"
                  className="mt-[7px] size-[5px] shrink-0 rounded-full bg-electric"
                />
                <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-soft">
                  {capability}
                </span>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* ============ 02 / THE ECOSYSTEM ============ */}
      <Section
        bordered
        eyebrow="02 / THE ECOSYSTEM"
        title="Explore the ETARNITY Ecosystem."
        lede="The businesses and initiatives ETARNITY builds and operates — with honest status labels."
      >
        {featuredBusinesses.length === 0 ? (
          <EmptyState
            title="The ecosystem is forming"
            description="Business profiles will appear here as they launch."
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {featuredBusinesses.map((business, i) => (
              <BusinessCard
                key={business.id}
                business={business}
                delay={i * 0.08}
              />
            ))}
          </div>
        )}
        <ExploreAllLink to="/businesses" label="Explore All Businesses" />
      </Section>

      {/* ============ 03 / SELECTED WORK ============ */}
      <Section
        bordered
        eyebrow="03 / SELECTED WORK"
        title="Technology in Practice."
        lede="Selected projects and products — real work, real status."
      >
        {projects.length === 0 ? (
          <EmptyState
            title="Selected work is being prepared"
            description="Published case studies will appear here as projects mature."
          />
        ) : (
          <>
            <Reveal>
              <ProjectRowCard project={leadProject} />
            </Reveal>
            {secondaryProjects.length > 0 ? (
              <div className="mt-4 grid gap-4 md:grid-cols-3">
                {secondaryProjects.map((project, i) => (
                  <Reveal key={project.id} delay={(i + 1) * 0.08}>
                    <ProjectCard project={project} />
                  </Reveal>
                ))}
              </div>
            ) : null}
          </>
        )}
        <ExploreAllLink to="/work" label="View All Work" />
      </Section>

      {/* ============ 04 / NEXT — FINAL CTA ============ */}
      <section className="relative overflow-hidden bg-graphite text-warmwhite">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(50%_60%_at_50%_100%,rgba(170,183,255,0.13),transparent)]"
        />
        <div className="container-site relative py-24 text-center md:py-32">
          <Reveal>
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-periwinkle">
              04 / NEXT
            </p>
          </Reveal>
          <Reveal delay={0.08}>
            <h2 className="mx-auto mt-6 max-w-2xl text-3xl font-semibold tracking-[-0.02em] md:text-5xl">
              The next chapter starts with an idea.
            </h2>
          </Reveal>
          <Reveal delay={0.16}>
            <p className="mt-4 text-sm text-ink-dark-soft md:text-base">
              Tell us what you want to build — we&apos;ll bring the engineering.
            </p>
          </Reveal>
          <Reveal delay={0.24}>
            <Link
              to="/contact"
              className="mt-8 inline-flex items-center rounded-full bg-warmwhite px-7 py-3.5 text-sm font-semibold text-graphite transition hover:bg-[#E8E9EC]"
            >
              Contact ETARNITY
            </Link>
          </Reveal>
        </div>
      </section>
    </>
  );
}

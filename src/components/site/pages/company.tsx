"use client";

import * as React from "react";
import { useApi } from "@/hooks/use-api";
import type { CompanyProfile, Milestone, Principle } from "@/lib/types";
import { Link } from "@/lib/router";
import { PageHeader } from "../page-header";
import { Reveal } from "../reveal";
import { Section } from "../section";
import { ErrorState, LoadingState } from "../states";

/* ------------------------------------------------------------------ */
/* Fallback content (rendered when the DB has no seeded profile)       */
/* ------------------------------------------------------------------ */

const FALLBACK_LEDE =
  "ETARNITY develops and operates technology-driven products, digital platforms, and businesses — founded in Dhaka, Bangladesh.";

const FALLBACK_OVERVIEW: string[] = [
  "ETARNITY exists to build technology that outlasts trends.",
  "We are a technology company founded in Dhaka, Bangladesh — designing, engineering, and operating digital products, platforms, and businesses for clients and for our own portfolio. Our practice combines software engineering, product design, and applied intelligence.",
  "We are deliberately early-stage, and we say so. This site describes what exists, labels what is in progress, and keeps ambition clearly marked as ambition — because trust is the foundation everything else is built on.",
];

const FALLBACK_MISSION =
  "To build technology that solves meaningful problems — engineered with precision, designed with clarity, and delivered with integrity.";

const FALLBACK_VISION =
  "To grow from a focused engineering studio into a technology group operating a portfolio of digital products serving an international market.";

const FALLBACK_PRINCIPLES: Principle[] = [
  {
    id: -1,
    title: "Engineering First",
    description:
      "Every decision — product, design, or business — starts from what is technically true and buildable.",
  },
  {
    id: -2,
    title: "Honest Status",
    description:
      "We label work for what it is: live, in development, or planned. No inflated claims, no borrowed credibility.",
  },
  {
    id: -3,
    title: "Design With Clarity",
    description:
      "Interfaces and documents alike should communicate intent with as little noise as possible.",
  },
  {
    id: -4,
    title: "Own the Outcome",
    description:
      "Responsibility does not end at delivery — we stay through operation, iteration, and maintenance.",
  },
  {
    id: -5,
    title: "Small, Senior, Focused",
    description:
      "A compact team of experienced people moving deliberately beats a large team moving slowly.",
  },
  {
    id: -6,
    title: "Build for Longevity",
    description:
      "We choose durable technology and write things down so systems outlive individual contributors.",
  },
];

const FALLBACK_MILESTONES: Milestone[] = [
  {
    id: -1,
    year: "2025",
    title: "ETARNITY is founded",
    description:
      "The company is established in Dhaka, Bangladesh as a technology company focused on software engineering and product design.",
  },
  {
    id: -2,
    year: "2025",
    title: "First client engagements",
    description:
      "Early engineering and design engagements establish the operating rhythm: scoped honestly, built carefully, shipped and documented.",
  },
  {
    id: -3,
    year: "2025",
    title: "Internal products enter development",
    description:
      "The first ETARNITY-owned products move from concept into active development — labeled here as they progress.",
  },
  {
    id: -4,
    year: "NOW",
    title: "Building what comes next",
    description:
      "The ecosystem continues to take shape — new products, partnerships, and capabilities, announced when they are real.",
  },
];

/** First sentence of a text, for the header lede. */
function firstSentence(text: string): string {
  const match = text.match(/^\s*[\s\S]*?[.!?](?=\s|$)/);
  return match ? match[0].trim() : text.trim();
}

/* ------------------------------------------------------------------ */
/* Page body                                                           */
/* ------------------------------------------------------------------ */

function CompanyBody({ company }: { company: CompanyProfile | null }) {
  const overviewParagraphs =
    company?.overview && company.overview.trim().length > 0
      ? company.overview
          .split(/\n\n+/)
          .map((p) => p.trim())
          .filter(Boolean)
      : FALLBACK_OVERVIEW;

  const principles =
    company?.principles && company.principles.length > 0
      ? company.principles
      : FALLBACK_PRINCIPLES;

  const milestones =
    company?.milestones && company.milestones.length > 0
      ? company.milestones
      : FALLBACK_MILESTONES;

  const contactEmail = company?.contactEmail ?? "hello@etarnity.com";

  return (
    <>
      {/* ---------- OVERVIEW ---------- */}
      <Section>
        <h2 className="sr-only">Overview</h2>
        <div className="lg:grid lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-3">
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-ink-soft lg:sticky lg:top-24 lg:self-start">
              Overview
            </p>
          </div>
          <div className="mt-8 lg:col-span-9 lg:mt-0">
            {overviewParagraphs.map((paragraph, i) => (
              <Reveal key={i} delay={i * 0.08}>
                <p
                  className={
                    i === 0
                      ? "max-w-[65ch] text-xl leading-[1.7] font-medium text-graphite"
                      : "mt-6 max-w-[65ch] text-base leading-[1.85] text-ink-soft md:text-lg"
                  }
                >
                  {paragraph}
                </p>
              </Reveal>
            ))}
            <Reveal delay={0.16}>
              <Link
                to="/technology"
                className="mt-8 inline-flex items-center gap-1.5 text-sm font-medium text-electric underline-offset-4 hover:underline"
              >
                See how we work technically →
              </Link>
            </Reveal>
          </div>
        </div>
      </Section>

      {/* ---------- MISSION & VISION ---------- */}
      <Section bordered>
        <h2 className="sr-only">Mission &amp; Vision</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <Reveal className="h-full">
            <div className="h-full rounded-xl border border-hairline bg-white p-8">
              <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-electric">
                Mission
              </p>
              <p className="mt-4 text-xl leading-[1.4] font-medium tracking-[-0.01em] text-graphite md:text-[1.35rem]">
                {company?.mission ?? FALLBACK_MISSION}
              </p>
            </div>
          </Reveal>
          <Reveal delay={0.08} className="h-full">
            <div className="h-full rounded-xl border border-hairline bg-white p-8">
              <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-electric">
                Vision
              </p>
              <p className="mt-4 text-xl leading-[1.4] font-medium tracking-[-0.01em] text-graphite md:text-[1.35rem]">
                {company?.vision ?? FALLBACK_VISION}
              </p>
            </div>
          </Reveal>
        </div>
        <Reveal delay={0.16}>
          <div className="mt-8 text-center">
            <Link
              to="/company/mission-vision"
              className="text-sm text-electric underline-offset-4 hover:underline"
            >
              Read the full Mission &amp; Vision →
            </Link>
          </div>
        </Reveal>
      </Section>

      {/* ---------- CORE PRINCIPLES ---------- */}
      <Section bordered eyebrow="PRINCIPLES" title="How We Operate.">
        <div className="grid gap-x-8 gap-y-10 md:grid-cols-2 lg:grid-cols-3">
          {principles.map((principle, i) => (
            <Reveal key={principle.id} delay={(i % 3) * 0.08}>
              <article className="border-t border-graphite pt-4">
                <p className="font-mono text-[11px] text-electric">
                  {String(i + 1).padStart(2, "0")}
                </p>
                <h3 className="mt-2 text-[15px] font-semibold text-graphite">
                  {principle.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                  {principle.description}
                </p>
              </article>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* ---------- COMPANY JOURNEY ---------- */}
      <Section bordered eyebrow="JOURNEY" title="The Road So Far.">
        <ol className="relative before:absolute before:top-2 before:bottom-2 before:left-[7px] before:w-px before:bg-hairline">
          {milestones.map((milestone, i) => (
            <li
              key={milestone.id}
              className="relative pb-10 pl-10 last:pb-0"
            >
              <Reveal delay={i * 0.08}>
                <span
                  aria-hidden="true"
                  className="absolute top-1.5 left-0 size-[15px] rounded-full border-2 border-electric bg-warmwhite"
                />
                <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-electric">
                  {milestone.year}
                </p>
                <h3 className="mt-1 font-semibold text-graphite">
                  {milestone.title}
                </h3>
                <p className="mt-1 max-w-[55ch] text-sm leading-relaxed text-ink-soft">
                  {milestone.description}
                </p>
              </Reveal>
            </li>
          ))}
        </ol>
      </Section>

      {/* ---------- CORPORATE FACTS ---------- */}
      <Section bordered eyebrow="FACTS" title="At a Glance.">
        <dl className="grid gap-x-10 sm:grid-cols-2">
          <div className="flex items-baseline justify-between gap-6 border-t border-hairline py-4">
            <dt className="font-mono text-[10px] uppercase tracking-[0.15em] text-ink-soft">
              Founded
            </dt>
            <dd className="text-right text-sm font-medium text-graphite">
              {company?.foundingYear ?? 2025}
            </dd>
          </div>
          <div className="flex items-baseline justify-between gap-6 border-t border-hairline py-4">
            <dt className="font-mono text-[10px] uppercase tracking-[0.15em] text-ink-soft">
              Headquarters
            </dt>
            <dd className="text-right text-sm font-medium text-graphite">
              {company?.headquarters ?? "Dhaka, Bangladesh"}
            </dd>
          </div>
          <div className="flex items-baseline justify-between gap-6 border-t border-hairline py-4">
            <dt className="font-mono text-[10px] uppercase tracking-[0.15em] text-ink-soft">
              Status
            </dt>
            <dd className="text-right text-sm font-medium text-graphite">
              {company?.operatingStatus ?? "Operating — early stage"}
            </dd>
          </div>
          <div className="flex items-baseline justify-between gap-6 border-t border-hairline py-4">
            <dt className="font-mono text-[10px] uppercase tracking-[0.15em] text-ink-soft">
              Contact
            </dt>
            <dd className="text-right text-sm font-medium">
              <a
                href={`mailto:${contactEmail}`}
                className="text-electric underline-offset-4 hover:underline"
              >
                {contactEmail}
              </a>
            </dd>
          </div>
          <div className="flex items-baseline justify-between gap-6 border-t border-hairline py-4">
            <dt className="font-mono text-[10px] uppercase tracking-[0.15em] text-ink-soft">
              Focus
            </dt>
            <dd className="text-right text-sm font-medium text-graphite">
              Technology &amp; Digital Businesses
            </dd>
          </div>
        </dl>
        <p className="pt-6 font-mono text-[10px] tracking-[0.12em] text-ink-soft">
          ETARNITY presents only verifiable information. Metrics such as revenue
          or headcount are intentionally omitted.
        </p>
      </Section>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function CompanyPage() {
  const { data, loading, error, refresh } = useApi<CompanyProfile>(
    "/api/public/company"
  );

  const lede = data?.overview
    ? firstSentence(data.overview)
    : FALLBACK_LEDE;

  return (
    <>
      <PageHeader
        eyebrow="01 / COMPANY"
        title="A Technology Company."
        lede={lede}
        backTo={{ to: "/", label: "Home" }}
      />
      {/* Fetch errors degrade to the fallback content below (data ?? null),
          so the page always renders complete — live data upgrades it in place. */}
      {loading ? (
        <section className="container-site py-20 md:py-28">
          <LoadingState label="Loading company profile" />
        </section>
      ) : (
        <CompanyBody company={data ?? null} />
      )}
    </>
  );
}

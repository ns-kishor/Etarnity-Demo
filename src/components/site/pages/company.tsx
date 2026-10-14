"use client";

import * as React from "react";
import { useApi } from "@/hooks/use-api";
import type { CompanyProfile, Milestone, Principle } from "@/lib/types";
import { Link } from "@/lib/router";
import { PageHeader } from "../page-header";
import { Reveal } from "../reveal";
import { Section } from "../section";
import { ErrorState, LoadingState } from "../states";
import Company3DCore from "../company-3d-core";
import { 
  ShieldCheck, 
  Cpu, 
  Layers, 
  CheckCircle2, 
  Sparkles, 
  Target, 
  Users, 
  Zap, 
  ArrowRight 
} from "lucide-react";

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

const PRINCIPLE_ICONS = [
  Cpu,
  ShieldCheck,
  Layers,
  Target,
  Users,
  Zap,
];

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
      {/* ---------- OVERVIEW WITH 3D INTERACTIVE CORE ---------- */}
      <Section>
        <h2 className="sr-only">Overview</h2>
        <div className="lg:grid lg:grid-cols-12 lg:gap-12 items-center">
          <div className="lg:col-span-5">
            <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-electric">
              01 // THE MOTHER GROUP
            </p>
            <h2 className="mt-4 text-3xl sm:text-4xl font-bold tracking-tight text-graphite leading-[1.15]">
              Architecting the Deep-Tech Frontier.
            </h2>
            <div className="mt-6 space-y-4">
              {overviewParagraphs.map((paragraph, i) => (
                <Reveal key={i} delay={i * 0.08}>
                  <p
                    className={
                      i === 0
                        ? "text-lg font-medium leading-[1.7] text-graphite"
                        : "text-[15px] leading-[1.8] text-ink-soft"
                    }
                  >
                    {paragraph}
                  </p>
                </Reveal>
              ))}
            </div>

            <Reveal delay={0.24}>
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link
                  to="/technology"
                  className="inline-flex items-center gap-2 rounded-full bg-graphite px-6 py-3 text-sm font-semibold text-warmwhite transition hover:bg-[#23262D]"
                >
                  Explore Tech Stack
                  <ArrowRight className="size-4" />
                </Link>
                <Link
                  to="/businesses"
                  className="inline-flex items-center gap-2 rounded-full border border-hairline bg-white px-6 py-3 text-sm font-semibold text-graphite transition hover:border-graphite"
                >
                  View Ecosystem
                </Link>
              </div>
            </Reveal>
          </div>

          {/* 3D Visual Core Element */}
          <div className="mt-10 lg:col-span-7 lg:mt-0">
            <Reveal delay={0.15}>
              <Company3DCore />
            </Reveal>
          </div>
        </div>
      </Section>

      {/* ---------- MISSION & VISION ---------- */}
      <Section bordered>
        <h2 className="sr-only">Mission &amp; Vision</h2>
        <div className="grid gap-6 md:grid-cols-2">
          <Reveal className="h-full">
            <div className="relative overflow-hidden h-full rounded-2xl border border-hairline bg-gradient-to-br from-white to-[#F8F8F6] p-8 md:p-10 shadow-[0_4px_24px_rgba(0,0,0,0.03)] transition-all hover:border-graphite/40 hover:shadow-md">
              <span className="absolute top-0 right-0 h-1 w-24 bg-electric rounded-bl-full" />
              <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.22em] text-electric">
                <Sparkles className="size-3.5" />
                <span>Our Mandate</span>
              </div>
              <h3 className="mt-3 text-2xl font-bold tracking-tight text-graphite">
                Mission
              </h3>
              <p className="mt-4 text-lg leading-[1.65] font-medium text-graphite/90">
                {company?.mission ?? FALLBACK_MISSION}
              </p>
            </div>
          </Reveal>

          <Reveal delay={0.08} className="h-full">
            <div className="relative overflow-hidden h-full rounded-2xl border border-hairline bg-gradient-to-br from-white to-[#F8F8F6] p-8 md:p-10 shadow-[0_4px_24px_rgba(0,0,0,0.03)] transition-all hover:border-graphite/40 hover:shadow-md">
              <span className="absolute top-0 right-0 h-1 w-24 bg-[#10b981] rounded-bl-full" />
              <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.22em] text-[#10b981]">
                <Target className="size-3.5" />
                <span>Long-Term Horizon</span>
              </div>
              <h3 className="mt-3 text-2xl font-bold tracking-tight text-graphite">
                Vision
              </h3>
              <p className="mt-4 text-lg leading-[1.65] font-medium text-graphite/90">
                {company?.vision ?? FALLBACK_VISION}
              </p>
            </div>
          </Reveal>
        </div>

        <Reveal delay={0.16}>
          <div className="mt-8 text-center">
            <Link
              to="/company/mission-vision"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-electric underline-offset-4 hover:underline"
            >
              Read the full Mission &amp; Vision statement →
            </Link>
          </div>
        </Reveal>
      </Section>

      {/* ---------- CORE PRINCIPLES (VISUAL 3D CARDS) ---------- */}
      <Section bordered eyebrow="PRINCIPLES" title="How We Operate.">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {principles.map((principle, i) => {
            const Icon = PRINCIPLE_ICONS[i % PRINCIPLE_ICONS.length];
            return (
              <Reveal key={principle.id} delay={(i % 3) * 0.08}>
                <div className="group relative h-full rounded-2xl border border-hairline bg-white p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-electric/40 hover:shadow-[0_14px_40px_rgba(21,23,27,0.07)]">
                  <div className="flex items-center justify-between">
                    <span className="flex size-10 items-center justify-center rounded-xl bg-graphite text-white transition-transform duration-300 group-hover:scale-110">
                      <Icon className="size-5 text-electric" />
                    </span>
                    <span className="font-mono text-[11px] font-semibold text-electric">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>

                  <h3 className="mt-5 text-lg font-bold tracking-tight text-graphite transition-colors group-hover:text-electric">
                    {principle.title}
                  </h3>

                  <p className="mt-2.5 text-sm leading-[1.7] text-ink-soft">
                    {principle.description}
                  </p>

                  <div className="mt-6 flex items-center gap-1.5 font-mono text-[10px] text-ink-soft/70 border-t border-hairline/80 pt-3">
                    <CheckCircle2 className="size-3 text-emerald-500" />
                    <span>OPERATIONAL STANDARD</span>
                  </div>
                </div>
              </Reveal>
            );
          })}
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

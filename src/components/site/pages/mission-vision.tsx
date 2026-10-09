"use client";

import * as React from "react";
import { ArrowUpRight, Check } from "lucide-react";
import { useApi } from "@/hooks/use-api";
import type { CompanyProfile } from "@/lib/types";
import { Link } from "@/lib/router";
import { PageHeader } from "../page-header";
import { Reveal } from "../reveal";
import { Section } from "../section";
import { LoadingState } from "../states";

/* ------------------------------------------------------------------ */
/* Fallback statements                                                 */
/* ------------------------------------------------------------------ */

const FALLBACK_MISSION =
  "To build technology that solves meaningful problems — engineered with precision, designed with clarity, and delivered with integrity.";

const FALLBACK_VISION =
  "To grow from a focused engineering studio into a technology group operating a portfolio of digital products serving an international market.";

const WHERE_WE_ARE: string[] = [
  "A focused founding team of engineers and designers",
  "Active client engineering and design engagements",
  "First internal products in active development",
  "A corporate platform with managed content",
];

const WHERE_WE_ARE_GOING: string[] = [
  "Operating a portfolio of digital products and platforms",
  "International clients and partnerships",
  "Applied AI and automation in production use",
  "Research contributions from real engineering",
];

/* ------------------------------------------------------------------ */
/* Statement block                                                     */
/* ------------------------------------------------------------------ */

function StatementBlock({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-b border-hairline">
      <div className="container-site py-16 md:py-24">
        <Reveal>
          <h2 className="font-mono text-[11px] uppercase tracking-[0.22em] text-electric">
            {label}
          </h2>
        </Reveal>
        <Reveal delay={0.08}>
          <p className="mt-6 max-w-4xl text-2xl leading-[1.3] font-medium tracking-[-0.01em] text-graphite md:text-4xl">
            {children}
          </p>
        </Reveal>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Page body                                                           */
/* ------------------------------------------------------------------ */

function MissionVisionBody({
  company,
}: {
  company: CompanyProfile | null;
}) {
  const mission = company?.mission ?? FALLBACK_MISSION;
  const vision = company?.vision ?? FALLBACK_VISION;

  return (
    <>
      <StatementBlock label="Mission">{mission}</StatementBlock>
      <StatementBlock label="Vision">{vision}</StatementBlock>

      {/* ---------- WHERE WE ARE / WHERE WE'RE GOING ---------- */}
      <Section
        eyebrow="DIRECTION"
        title="Ambition, Stated Honestly."
        lede="What exists today, and what we are working toward — kept distinct on purpose."
      >
        <div className="grid gap-4 md:grid-cols-2">
          <Reveal className="h-full">
            <div className="h-full rounded-xl border border-hairline bg-white p-8">
              <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-ink-soft">
                Where We Are Today
              </p>
              <ul className="mt-6 space-y-4">
                {WHERE_WE_ARE.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <Check
                      aria-hidden="true"
                      className="mt-0.5 size-3.5 shrink-0 text-electric"
                    />
                    <span className="text-sm leading-relaxed text-ink-soft">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
          <Reveal delay={0.08} className="h-full">
            <div className="h-full rounded-xl border border-hairline bg-white p-8">
              <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-ink-soft">
                Where We&apos;re Going
              </p>
              <ul className="mt-6 space-y-4">
                {WHERE_WE_ARE_GOING.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <ArrowUpRight
                      aria-hidden="true"
                      className="mt-0.5 size-3.5 shrink-0 text-electric"
                    />
                    <span className="text-sm leading-relaxed text-ink-soft">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
        <Reveal delay={0.16}>
          <p className="pt-8 text-center font-mono text-[11px] uppercase tracking-[0.18em] text-ink-soft">
            Long-term ambitions ≠ current achievements. We keep them distinct.
          </p>
        </Reveal>
        <Reveal delay={0.2}>
          <div className="pt-10">
            <Link
              to="/company"
              className="inline-flex min-h-11 items-center gap-2 font-mono text-[11px] uppercase tracking-[0.22em] text-ink-soft transition-colors hover:text-graphite"
            >
              <span aria-hidden="true">←</span> Back to Company
            </Link>
          </div>
        </Reveal>
      </Section>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function MissionVisionPage() {
  const { data, loading } = useApi<CompanyProfile>("/api/public/company");

  return (
    <>
      <PageHeader
        eyebrow="02 / PURPOSE"
        title="Mission & Vision."
        lede="Why ETARNITY exists — and where it is going."
        backTo={{ to: "/company", label: "Company" }}
      />
      {loading ? (
        <section className="container-site py-20 md:py-28">
          <LoadingState label="Loading mission & vision" />
        </section>
      ) : (
        /* Fetch errors degrade to fallback statements (data ?? null). */
        <MissionVisionBody company={data ?? null} />
      )}
    </>
  );
}

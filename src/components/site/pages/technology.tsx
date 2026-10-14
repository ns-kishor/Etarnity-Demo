"use client";

import * as React from "react";
import { useApi } from "@/hooks/use-api";
import type { TechnologyArea } from "@/lib/types";
import { Link } from "@/lib/router";
import { PageHeader } from "../page-header";
import { Reveal } from "../reveal";
import { Section } from "../section";
import { EmptyState, LoadingState } from "../states";

import TechnologyMatrix from "../technology-matrix";
import { Cpu, Terminal, CheckCircle2 } from "lucide-react";

/* ------------------------------------------------------------------ */
/* Constants                                                           */
/* ------------------------------------------------------------------ */

const CORE_STACK: string[] = [
  "TypeScript",
  "React",
  "Next.js",
  "Node.js",
  "PostgreSQL",
  "SQLite",
  "Prisma",
  "Tailwind CSS",
  "Three.js",
  "Python",
  "Docker",
  "Linux",
];

/* ------------------------------------------------------------------ */
/* Area block — alternating editorial rows                              */
/* ------------------------------------------------------------------ */

function TechnologyAreaRow({
  area,
  index,
}: {
  area: TechnologyArea;
  index: number;
}) {
  // Even areas: text LEFT / items RIGHT. Odd areas: toggled via order.
  const flipped = index % 2 === 1;

  return (
    <Section bordered>
      <div className="lg:grid lg:grid-cols-12 lg:gap-10 items-start">
        <div
          className={`lg:col-span-4 lg:self-start lg:sticky lg:top-24 ${
            flipped ? "lg:order-2" : ""
          }`}
        >
          <Reveal>
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-electric animate-pulse" />
              <p className="font-mono text-[11px] uppercase tracking-widest text-electric">
                DOMAIN {String(index + 1).padStart(2, "0")}
              </p>
            </div>
            <h2 className="mt-3 text-2xl font-bold tracking-tight text-graphite md:text-[1.85rem]">
              {area.title}
            </h2>
            {area.description ? (
              <p className="mt-3.5 max-w-[38ch] text-[15px] leading-relaxed text-ink-soft">
                {area.description}
              </p>
            ) : null}
          </Reveal>
        </div>
        <div
          className={`mt-8 lg:col-span-8 lg:mt-0 ${
            flipped ? "lg:order-1" : ""
          }`}
        >
          {area.items.length === 0 ? (
            <p className="rounded-xl border border-hairline bg-white p-6 text-sm leading-relaxed text-ink-soft">
              Details for this area are currently undergoing architectural review.
            </p>
          ) : (
            <div className="space-y-4">
              {area.items.map((item) => (
                <Reveal key={item.title}>
                  <div className="group rounded-2xl border border-hairline bg-white p-6 shadow-sm transition-all duration-300 hover:border-electric/40 hover:shadow-[0_10px_30px_rgba(21,23,27,0.06)] hover:-translate-y-0.5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <span className="mt-1 flex size-7 shrink-0 items-center justify-center rounded-lg bg-graphite text-white transition-colors group-hover:bg-electric">
                          <Cpu className="size-3.5" />
                        </span>
                        <div>
                          <h3 className="text-base font-bold text-graphite transition-colors group-hover:text-electric">
                            {item.title}
                          </h3>
                          <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                            {item.description}
                          </p>
                        </div>
                      </div>
                      <span className="hidden sm:inline-flex items-center gap-1 font-mono text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        <CheckCircle2 className="size-3" />
                        VERIFIED
                      </span>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </div>
    </Section>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                 */
/* ------------------------------------------------------------------ */

export default function TechnologyPage() {
  const { data: areas, loading } = useApi<TechnologyArea[]>(
    "/api/public/technology"
  );

  return (
    <>
      <PageHeader
        eyebrow="03 / TECHNOLOGY"
        title="Technology, in Practice."
        lede="How we engineer software, products, and platforms — explained without the jargon."
        backTo={{ to: "/", label: "Home" }}
      />

      {/* Interactive Core Architecture Matrix */}
      <section className="container-site pt-12 pb-6">
        <Reveal>
          <TechnologyMatrix />
        </Reveal>
      </section>

      {/* ---------- Intro statement ---------- */}
      <section className="container-site py-12 md:py-16">
        <Reveal>
          <p className="max-w-[40ch] text-2xl leading-[1.4] font-medium tracking-[-0.01em] text-graphite md:text-[1.9rem]">
            Every capability we claim is one we practice daily on real products
            — this page describes how.
          </p>
        </Reveal>
        <Reveal delay={0.08}>
          <p className="mt-6 max-w-[60ch] text-sm leading-relaxed text-ink-soft">
            Nothing here is aspirational marketing. Each area below maps to work
            we do for clients or inside our own products — and where something
            is still early, we say so. The{" "}
            <Link
              to="/work"
              className="font-medium text-electric underline-offset-4 hover:underline"
            >
              selected work
            </Link>{" "}
            pages carry the evidence.
          </p>
        </Reveal>
      </section>

      {/* ---------- Areas ---------- */}
      {/* Fetch errors degrade to the designed empty state — the static
          sections (intro, core stack, CTA) still render either way. */}
      {loading ? (
        <section className="container-site pb-20 md:pb-28">
          <LoadingState label="Loading technology areas" />
        </section>
      ) : !areas || areas.length === 0 ? (
        <section className="container-site pb-20 md:pb-28">
          <EmptyState
            title="Technology areas are being documented"
            description="Capability details will appear here as they are written."
          />
        </section>
      ) : (
        areas.map((area, index) => (
          <TechnologyAreaRow key={area.id} area={area} index={index} />
        ))
      )}

      {/* ---------- Core stack + CTA ---------- */}
      <Section bordered eyebrow="TOOLING" title="The Core Stack.">
        <Reveal>
          <ul className="flex flex-wrap gap-2">
            {CORE_STACK.map((tool) => (
              <li key={tool}>
                <span className="inline-block rounded-full border border-hairline bg-white px-4 py-2 font-mono text-[11px] uppercase tracking-[0.12em] text-ink-soft transition-colors hover:border-graphite">
                  {tool}
                </span>
              </li>
            ))}
          </ul>
        </Reveal>
        <Reveal delay={0.08}>
          <div className="mt-12 flex flex-wrap items-center gap-4 pt-4">
            <Link
              to="/work"
              className="inline-flex items-center rounded-full bg-graphite px-6 py-3 text-sm font-medium text-warmwhite transition hover:bg-[#23262D]"
            >
              See the Evidence →
            </Link>
            <Link
              to="/contact"
              className="text-sm font-medium text-electric underline-offset-4 hover:underline"
            >
              Discuss an Engineering Need
            </Link>
          </div>
        </Reveal>
      </Section>
    </>
  );
}

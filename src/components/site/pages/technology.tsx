"use client";

import * as React from "react";
import { useApi } from "@/hooks/use-api";
import type { TechnologyArea } from "@/lib/types";
import { Link } from "@/lib/router";
import { PageHeader } from "../page-header";
import { Reveal } from "../reveal";
import { Section } from "../section";
import { EmptyState, LoadingState } from "../states";

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
      <div className="lg:grid lg:grid-cols-12 lg:gap-8">
        <div
          className={`lg:col-span-4 lg:self-start lg:sticky lg:top-24 ${
            flipped ? "lg:order-2" : ""
          }`}
        >
          <Reveal>
            <p className="font-mono text-[11px] text-electric">
              {String(index + 1).padStart(2, "0")}
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-graphite md:text-[1.75rem]">
              {area.title}
            </h2>
            {area.description ? (
              <p className="mt-3 max-w-[38ch] text-sm leading-relaxed text-ink-soft">
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
            <p className="border-t border-hairline py-5 text-sm leading-relaxed text-ink-soft">
              Details for this area are being documented.
            </p>
          ) : (
            area.items.map((item) => (
              <Reveal key={item.title}>
                <div className="grid gap-2 border-t border-hairline py-5 md:grid-cols-[220px_1fr] md:gap-8">
                  <h3 className="flex items-start gap-2.5 text-sm font-semibold text-graphite">
                    <span
                      aria-hidden="true"
                      className="mt-[7px] size-1 shrink-0 rounded-full bg-electric"
                    />
                    {item.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-ink-soft">
                    {item.description}
                  </p>
                </div>
              </Reveal>
            ))
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

      {/* ---------- Intro statement ---------- */}
      <section className="container-site py-14 md:py-20">
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

"use client";

import * as React from "react";
import { ArrowRight } from "lucide-react";
import type { HomePayload } from "@/lib/queries";
import type { Business } from "@/lib/types";
import { Link } from "@/lib/router";
import { Reveal } from "../reveal";
import TypingPhrase from "../typing-phrase";
import { Section } from "../section";
import { EmptyState } from "../states";
import CompanyScrolly from "../company-scrolly";
import EcosystemCard from "../ecosystem-card";
import ProcessSection from "../process-section";

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

/* ------------------------------------------------------------------ */
/* Shared pieces                                                       */
/* ------------------------------------------------------------------ */

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
  const { businesses } = initialData as unknown as {
    businesses: Business[];
  };

  const featuredBusinesses = businesses.slice(0, 4);

  return (
    <>
      {/* ============ HERO — typography-driven ============ */}
      <section className="relative pt-20 pb-16 md:pt-28 md:pb-24">
        <div className="container-site">
          <div className="mx-auto max-w-4xl text-center">
            <Reveal>
              <h1 className="text-[2.125rem] font-semibold leading-[1.08] tracking-[-0.03em] text-graphite sm:text-5xl md:text-6xl lg:text-[4.25rem]">
                {/* Static, accessible headline for screen readers and SEO. */}
                <span className="sr-only">
                  We don&apos;t just solve problems. We rethink what&apos;s
                  possible.
                </span>
                {/* Visual headline — only the middle phrase animates. */}
                <span aria-hidden="true">
                  <span className="block">We don&apos;t just</span>
                  <span className="block">
                    <TypingPhrase />
                  </span>
                  <span className="mt-2 block md:mt-3">
                    We rethink what&apos;s possible.
                  </span>
                </span>
              </h1>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="mx-auto mt-8 max-w-xl text-lg leading-relaxed text-ink-soft">
                ETARNITY builds technology-driven products, digital platforms,
                and businesses designed to solve meaningful problems.
              </p>
            </Reveal>
            <Reveal delay={0.2}>
              <div className="flex flex-wrap justify-center gap-3 pt-2">
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
          </div>
        </div>
      </section>

      {/* ============ 01 / THE COMPANY — scroll-driven points ============ */}
      <Section
        bordered
        eyebrow="01 / THE COMPANY"
        title="A Technology Company. A Broader Vision."
      >
        <CompanyScrolly />
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
              <Reveal key={business.id} delay={i * 0.08}>
                <EcosystemCard business={business} index={i} />
              </Reveal>
            ))}
          </div>
        )}
        <ExploreAllLink to="/businesses" label="Explore All Businesses" />
      </Section>

      {/* ============ 03 / OUR WORKING PROCESS ============ */}
      <ProcessSection />

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

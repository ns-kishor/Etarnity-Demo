"use client";

import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { useApi } from "@/hooks/use-api";
import type { Business } from "@/lib/types";
import { Link } from "@/lib/router";
import { PageHeader } from "../page-header";
import { Section } from "../section";
import { Reveal } from "../reveal";
import { StatusChip } from "../status-chip";
import { EmptyState, ErrorState, LoadingState } from "../states";

/** Human phrasing for each ecosystem relationship type. */
const RELATIONSHIP_LABELS: Record<string, string> = {
  OWNED: "Owned by ETARNITY",
  SUBSIDIARY: "Subsidiary",
  OPERATED_BRAND: "Operated brand",
  PARTNER: "Strategic partner",
  CLIENT_PROJECT: "Client project",
  PLANNED_INITIATIVE: "Planned initiative",
};

export function relationshipLabel(type: string): string {
  return RELATIONSHIP_LABELS[type] ?? type.replaceAll("_", " ");
}

export default function BusinessesPage() {
  const { data, loading, error, refresh } = useApi<Business[]>(
    "/api/public/businesses"
  );

  const businesses = data ?? [];

  return (
    <>
      <PageHeader
        eyebrow="01 / ECOSYSTEM"
        title="The ETARNITY Ecosystem."
        lede="The businesses, products, and platforms ETARNITY builds and operates. Every relationship is stated honestly."
      />

      <Section className="py-14 md:py-20">
        {loading && businesses.length === 0 ? (
          <LoadingState label="Loading the ecosystem" />
        ) : error && businesses.length === 0 ? (
          <ErrorState
            message="The ecosystem directory could not be loaded."
            onRetry={refresh}
          />
        ) : businesses.length === 0 ? (
          <EmptyState
            title="The ecosystem is forming"
            description="Business profiles will appear here as they launch."
          />
        ) : (
          <>
            <Reveal>
              <div className="border-y border-hairline">
                <ul className="divide-y divide-hairline">
                  {businesses.map((business) => (
                    <li key={business.id}>
                      <Link
                        to={`/businesses/${business.slug}`}
                        className="group -mx-4 grid grid-cols-[auto_1fr_auto] items-center gap-5 rounded-lg px-4 py-6 transition hover:bg-white md:py-7"
                      >
                        {/* Monogram / logo tile */}
                        <span
                          className="relative size-12 shrink-0 overflow-hidden rounded-xl bg-graphite"
                          aria-hidden="true"
                        >
                          {business.logo ? (
                            <Image
                              src={business.logo.url}
                              alt={business.logo.altText ?? business.name}
                              fill
                              sizes="48px"
                              className="object-cover"
                              unoptimized={business.logo.mimeType === "image/svg+xml"}
                            />
                          ) : (
                            <span className="flex h-full w-full items-center justify-center text-lg font-semibold text-warmwhite">
                              {business.name.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </span>

                        {/* Name, relationship, category, summary */}
                        <span className="min-w-0">
                          <span className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                            <span className="text-base font-semibold text-graphite md:text-lg">
                              {business.name}
                            </span>
                            <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-ink-soft">
                              {relationshipLabel(business.relationshipType)}
                            </span>
                          </span>
                          <span className="mt-1 block">
                            <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-electric">
                              {business.category}
                            </span>
                            <span className="mt-1 block text-sm leading-relaxed text-ink-soft line-clamp-1">
                              {business.summary}
                            </span>
                          </span>
                        </span>

                        {/* Status + arrow */}
                        <span className="flex shrink-0 items-center gap-4">
                          <StatusChip status={business.operationalStatus} />
                          <ArrowUpRight
                            className="size-4 text-ink-soft transition group-hover:text-graphite"
                            aria-hidden="true"
                          />
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>

            <p className="mt-6 font-mono text-[10px] uppercase leading-relaxed tracking-[0.15em] text-ink-soft">
              Relationships — Owned · Subsidiary · Operated · Partner · Client ·
              Planned. Status chips reflect operational reality.
            </p>
          </>
        )}
      </Section>
    </>
  );
}

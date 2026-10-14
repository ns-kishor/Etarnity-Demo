"use client";

import { ArrowUpRight } from "lucide-react";
import { useApi } from "@/hooks/use-api";
import type { Business } from "@/lib/types";
import { Link } from "@/lib/router";
import { PageHeader } from "../page-header";
import { Reveal } from "../reveal";
import { StatusChip } from "../status-chip";
import { ErrorState, LoadingState } from "../states";
import { relationshipLabel } from "./businesses";

export default function BusinessDetailPage({ slug }: { slug: string }) {
  const { data, loading, error, refresh } = useApi<Business | null>(
    `/api/public/businesses/${slug}`
  );

  if (loading && !data) {
    return (
      <section className="container-site py-20 md:py-28">
        <LoadingState label="Loading business profile" />
      </section>
    );
  }

  if ((error && !data) || (!loading && !error && data === null)) {
    return (
      <section className="container-site py-20 md:py-28">
        <ErrorState
          message="Business not found. It may be unpublished or the link is incorrect."
          onRetry={refresh}
        />
        <div className="mt-6 flex justify-center">
          <Link
            to="/businesses"
            className="inline-flex min-h-11 items-center rounded-full bg-graphite px-6 text-sm font-medium text-warmwhite transition-colors hover:bg-[#23262D]"
          >
            Back to Businesses
          </Link>
        </div>
      </section>
    );
  }

  if (!data) {
    return (
      <section className="container-site py-20 md:py-28">
        <ErrorState message="Business not found." onRetry={refresh} />
      </section>
    );
  }

  const business = data;
  const paragraphs = (business.description ?? "").split(/\n\n+/).filter(Boolean);
  const metaRows: { label: string; value: string }[] = [
    { label: "Category", value: business.category },
    { label: "Relationship", value: relationshipLabel(business.relationshipType) },
  ];

  return (
    <>
      <PageHeader
        eyebrow={business.category.toUpperCase()}
        title={business.name}
        backTo={{ to: "/businesses", label: "Businesses" }}
      />

      <div className="container-site grid gap-10 pb-20 lg:grid-cols-12">
        {/* Main column */}
        <div className="lg:col-span-8">
          <Reveal>
            <div className="flex flex-wrap items-center gap-3 pt-10">
              <StatusChip status={business.operationalStatus} />
              <StatusChip status={business.relationshipType} />
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-soft">
                Relationship: {relationshipLabel(business.relationshipType)}
              </span>
            </div>
          </Reveal>

          <Reveal delay={0.05}>
            <p className="border-b border-hairline py-8 text-xl font-medium leading-[1.45] tracking-[-0.01em] text-graphite md:text-[1.4rem]">
              {business.summary}
            </p>
          </Reveal>

          {paragraphs.length > 0 ? (
            <Reveal delay={0.1}>
              <div className="max-w-[65ch] space-y-6 py-8">
                {paragraphs.map((paragraph, index) => (
                  <p
                    key={index}
                    className="text-base leading-[1.85] text-ink-soft"
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            </Reveal>
          ) : (
            <div className="py-8" />
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4">
          <Reveal delay={0.1}>
            <aside className="space-y-5 self-start rounded-xl border border-hairline bg-white p-6 lg:sticky lg:top-24">
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-soft">
                    Status
                  </span>
                  <StatusChip status={business.operationalStatus} />
                </div>
                {metaRows.map((row) => (
                  <div
                    key={row.label}
                    className="flex items-baseline justify-between gap-3"
                  >
                    <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-soft">
                      {row.label}
                    </span>
                    <span className="text-sm font-medium text-graphite">
                      {row.value}
                    </span>
                  </div>
                ))}
                <div className="flex items-baseline justify-between gap-3">
                  <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-soft">
                    Website
                  </span>
                  {business.websiteUrl ? (
                    <a
                      href={business.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm font-medium text-electric underline-offset-4 transition hover:underline"
                    >
                      Visit site
                      <ArrowUpRight className="size-3" aria-hidden="true" />
                    </a>
                  ) : (
                    <span className="text-sm font-medium text-ink-soft">—</span>
                  )}
                </div>
              </div>

              <div className="border-t border-hairline pt-5">
                <Link
                  to="/contact"
                  className="inline-flex w-full justify-center rounded-full bg-graphite px-5 py-3 text-sm font-medium text-warmwhite transition-colors hover:bg-[#23262D]"
                >
                  Discuss This Business
                </Link>
                <p className="mt-3 text-center font-mono text-[10px] uppercase tracking-[0.15em] text-ink-soft">
                  Business inquiries welcome
                </p>
              </div>
            </aside>
          </Reveal>
        </div>
      </div>
    </>
  );
}

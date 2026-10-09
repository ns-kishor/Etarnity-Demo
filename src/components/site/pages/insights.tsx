"use client";

import * as React from "react";
import Image from "next/image";
import { format } from "date-fns";
import { useApi } from "@/hooks/use-api";
import type { Article } from "@/lib/types";
import { Link } from "@/lib/router";
import { cn } from "@/lib/utils";
import { PageHeader } from "../page-header";
import { Section } from "../section";
import { Reveal } from "../reveal";
import { EmptyState, ErrorState, LoadingState } from "../states";
import { CoverFallback } from "./work";

export function formatDate(iso: string | null): string {
  if (!iso) return "Unscheduled";
  try {
    return format(new Date(iso), "MMM d, yyyy");
  } catch {
    return "Unscheduled";
  }
}

export default function InsightsPage() {
  const { data, loading, error, refresh } = useApi<Article[]>(
    "/api/public/articles"
  );
  const [category, setCategory] = React.useState<string>("ALL");

  const articles = data ?? [];

  const categories = React.useMemo(() => {
    const seen: string[] = [];
    for (const article of articles) {
      if (article.category && !seen.includes(article.category)) {
        seen.push(article.category);
      }
    }
    return seen;
  }, [articles]);

  const filtered =
    category === "ALL"
      ? articles
      : articles.filter((article) => article.category === category);

  // Prefer the explicitly featured article; fall back to the newest.
  const featured =
    filtered.find((a) => a.isFeatured) ?? filtered[0];
  const rest = filtered.filter((a) => a !== featured);

  return (
    <>
      <PageHeader
        eyebrow="04 / INSIGHTS"
        title="Insights & Research."
        lede="Engineering perspectives and company announcements — written by the team, for practitioners."
      />

      <Section className="py-14 md:py-20">
        {loading && articles.length === 0 ? (
          <LoadingState label="Loading insights" />
        ) : error && articles.length === 0 ? (
          <ErrorState
            message="The article archive could not be loaded."
            onRetry={refresh}
          />
        ) : articles.length === 0 ? (
          <EmptyState
            title="Insights are being drafted"
            description="Long-form engineering writing will appear here soon."
          />
        ) : (
          <>
            {categories.length > 0 ? (
              <Reveal>
                <div
                  className="mb-10 flex flex-wrap gap-2"
                  role="group"
                  aria-label="Filter articles by category"
                >
                  {["ALL", ...categories].map((item) => {
                    const active = category === item;
                    return (
                      <button
                        key={item}
                        type="button"
                        aria-pressed={active}
                        onClick={() => setCategory(item)}
                        className={cn(
                          "min-h-11 rounded-full border px-4 py-2 font-mono text-[11px] uppercase tracking-[0.15em] transition",
                          active
                            ? "border-graphite bg-graphite text-warmwhite"
                            : "border-hairline text-ink-soft hover:border-graphite"
                        )}
                      >
                        {item}
                      </button>
                    );
                  })}
                </div>
              </Reveal>
            ) : null}

            {filtered.length === 0 ? (
              <EmptyState
                title={`No articles in ${category}`}
                description="Try another category or view everything."
              />
            ) : (
              <div className="space-y-12">
                {/* Featured article — first of the current list */}
                <Reveal>
                  <Link
                    to={`/insights/${featured.slug}`}
                    className="group grid overflow-hidden rounded-xl border border-hairline bg-white transition hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(21,23,27,0.07)] md:grid-cols-2"
                  >
                    <div className="relative aspect-[16/10] overflow-hidden md:aspect-auto md:min-h-[280px]">
                      {featured.cover ? (
                        <Image
                          src={featured.cover.url}
                          alt={featured.cover.altText ?? featured.title}
                          fill
                          sizes="(min-width:768px) 50vw, 100vw"
                          className="object-cover transition duration-500 group-hover:scale-[1.03]"
                          unoptimized={
                            featured.cover.mimeType === "image/svg+xml"
                          }
                        />
                      ) : (
                        <CoverFallback label={featured.title} />
                      )}
                    </div>
                    <div className="flex flex-col p-6 md:p-8">
                      <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-electric">
                        Featured
                        <span className="mx-2 text-ink-soft">·</span>
                        <span className="text-ink-soft">{featured.category}</span>
                      </p>
                      <h2 className="mt-2 text-xl font-semibold leading-snug tracking-tight text-graphite md:text-2xl">
                        {featured.title}
                      </h2>
                      <p className="mt-2 text-sm leading-relaxed text-ink-soft line-clamp-2">
                        {featured.summary}
                      </p>
                      <p className="mt-auto pt-4 font-mono text-[11px] uppercase tracking-[0.15em] text-ink-soft">
                        {featured.author ? featured.author.name : "ETARNITY"}
                        <span className="mx-2">·</span>
                        {formatDate(featured.publishedAt)}
                      </p>
                    </div>
                  </Link>
                </Reveal>

                {/* Remaining articles */}
                {rest.length > 0 ? (
                  <Reveal>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {rest.map((article) => (
                        <Link
                          key={article.id}
                          to={`/insights/${article.slug}`}
                          className="group overflow-hidden rounded-xl border border-hairline bg-white transition hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(21,23,27,0.07)]"
                        >
                          <div className="relative aspect-[16/9] overflow-hidden">
                            {article.cover ? (
                              <Image
                                src={article.cover.url}
                                alt={article.cover.altText ?? article.title}
                                fill
                                sizes="(min-width:1024px) 33vw, (min-width:768px) 50vw, 100vw"
                                className="object-cover transition duration-500 group-hover:scale-[1.03]"
                                unoptimized={
                                  article.cover.mimeType === "image/svg+xml"
                                }
                              />
                            ) : (
                              <CoverFallback label={article.title} />
                            )}
                          </div>
                          <div className="p-5">
                            <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-ink-soft">
                              <span className="text-electric">
                                {article.category}
                              </span>
                              <span className="mx-2">·</span>
                              {formatDate(article.publishedAt)}
                            </p>
                            <h3 className="mt-1.5 text-[15px] font-semibold leading-snug text-graphite">
                              {article.title}
                            </h3>
                            <p className="mt-1 text-[13px] leading-relaxed text-ink-soft line-clamp-2">
                              {article.summary}
                            </p>
                            <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.15em] text-ink-soft">
                              {article.author ? article.author.name : "ETARNITY"}
                            </p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </Reveal>
                ) : null}
              </div>
            )}
          </>
        )}
      </Section>
    </>
  );
}

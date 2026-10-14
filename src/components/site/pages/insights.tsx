"use client";

import * as React from "react";
import Image from "next/image";
import { useApi } from "@/hooks/use-api";
import type { Article } from "@/lib/types";
import { Link } from "@/lib/router";
import { cn } from "@/lib/utils";
import { Reveal } from "../reveal";
import { EmptyState, ErrorState, LoadingState } from "../states";
import {
  ArticleEntryRow,
  CoverFallbackMono,
  estimateReadingMinutes,
  formatDate,
  inkSweep,
} from "../insights-shared";

/** Articles shown in the list before "Load more" expands it. */
const PAGE_SIZE = 7;

export default function InsightsPage() {
  const { data, loading, error, refresh } = useApi<Article[]>(
    "/api/public/articles"
  );
  const [category, setCategory] = React.useState<string>("ALL");
  const [visibleCount, setVisibleCount] = React.useState<number>(PAGE_SIZE);

  const articles = data ?? [];

  // Topics actually assigned to published articles, in order of appearance.
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

  // Reset the listing depth whenever the filter changes.
  React.useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [category]);

  // The explicitly featured article leads the page (falls back to newest).
  const featured =
    filtered.find((a) => a.isFeatured) ?? filtered[0];
  const restAll = filtered.filter((a) => a !== featured);
  const rest = restAll.slice(0, visibleCount);
  const hasMore = restAll.length > visibleCount;

  const latest = articles[0]?.publishedAt ?? null;
  const hasData = articles.length > 0;

  return (
    <>
      {/* ---------------- Section A — Editorial header ---------------- */}
      <header className="border-b border-hairline">
        <div className="container-site pb-14 pt-28 md:pb-18 md:pt-36">
          <Reveal>
            <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-ink-soft">
              ETARNITY <span className="mx-1 text-ink-dark-soft" aria-hidden="true">/</span> Journal
            </p>
          </Reveal>
          <Reveal delay={0.08}>
            <h1 className="mt-6 text-[3.4rem] font-semibold leading-[0.95] tracking-[-0.045em] text-graphite sm:text-7xl lg:text-8xl">
              Insights
            </h1>
          </Reveal>
          <Reveal delay={0.16}>
            <p className="mt-8 max-w-xl text-lg leading-relaxed text-ink-soft md:text-xl">
              Ideas, perspectives, and observations on the technology shaping
              what comes next.
            </p>
          </Reveal>

          {hasData ? (
            <Reveal delay={0.24}>
              <div className="mt-12 flex flex-wrap items-baseline gap-x-10 gap-y-2 border-t border-graphite pt-5 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-soft md:mt-16">
                <span>
                  <span className="font-medium text-graphite">{articles.length}</span>{" "}
                  {articles.length === 1 ? "Article" : "Articles"}
                </span>
                <span>
                  Latest <span className="text-ink-dark-soft" aria-hidden="true">·</span>{" "}
                  <span className="font-medium text-graphite">{formatDate(latest)}</span>
                </span>
                <span className="hidden sm:inline">
                  <span className="font-medium text-graphite">{categories.length}</span>{" "}
                  {categories.length === 1 ? "Topic" : "Topics"}
                </span>
              </div>
            </Reveal>
          ) : null}
        </div>
      </header>

      {/* ---------------- Section B — Article collection ---------------- */}
      <section className="container-site py-14 md:py-20" aria-label="Published articles">
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
            description="Long-form writing on technology, design, and products will appear here."
          />
        ) : (
          <>
            {/* Topic filter — every control is functional */}
            {categories.length > 0 ? (
              <Reveal>
                <div
                  className="mb-12 flex flex-wrap items-center gap-2 md:mb-16"
                  role="group"
                  aria-label="Filter articles by topic"
                >
                  <span className="mr-2 font-mono text-[10px] uppercase tracking-[0.22em] text-ink-dark-soft">
                    Filter
                  </span>
                  {["ALL", ...categories].map((item) => {
                    const active = category === item;
                    return (
                      <button
                        key={item}
                        type="button"
                        aria-pressed={active}
                        onClick={() => setCategory(item)}
                        className={cn(
                          "inline-flex min-h-11 items-center rounded-full border px-4 font-mono text-[11px] uppercase tracking-[0.15em] transition-colors duration-300 focus-visible:outline-graphite",
                          active
                            ? "border-graphite bg-graphite text-warmwhite"
                            : "border-hairline bg-white text-ink-soft hover:border-graphite hover:text-graphite"
                        )}
                      >
                        {item === "ALL" ? "All" : item}
                      </button>
                    );
                  })}
                </div>
              </Reveal>
            ) : null}

            {/* Screen-reader feedback for the active filter */}
            <p className="sr-only" role="status">
              {category === "ALL"
                ? `Showing all ${filtered.length} articles.`
                : `Showing ${filtered.length} ${filtered.length === 1 ? "article" : "articles"} in ${category}.`}
            </p>

            {filtered.length === 0 ? (
              <EmptyState
                title={`No articles in ${category}`}
                description="Try another topic or view the full archive."
              />
              ) : (
                <>
                  {/* Featured entry */}
                  {featured ? (
                    <Reveal>
                      <Link
                        to={`/insights/${featured.slug}`}
                        className="group block focus-visible:outline-graphite"
                      >
                        <div className="grid items-center gap-8 lg:grid-cols-12 lg:gap-12">
                          <div className="relative aspect-[16/10] overflow-hidden rounded-md border border-hairline lg:col-span-7">
                            {featured.cover ? (
                              <Image
                                src={featured.cover.url}
                                alt={featured.cover.altText ?? featured.title}
                                fill
                                sizes="(min-width:1024px) 55vw, 100vw"
                                priority
                                className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.015]"
                                unoptimized={featured.cover.mimeType === "image/svg+xml"}
                              />
                            ) : (
                              <CoverFallbackMono label={featured.title} />
                            )}
                          </div>
                          <div className="lg:col-span-5">
                            <p className="flex flex-wrap items-center gap-x-2.5 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-soft">
                              <span className="font-medium text-graphite">{featured.category}</span>
                              <span aria-hidden="true">·</span>
                              <span>{formatDate(featured.publishedAt)}</span>
                              <span aria-hidden="true">·</span>
                              <span>{estimateReadingMinutes(featured.body)} min read</span>
                            </p>
                            <h2
                              className={cn(
                                "mt-4 text-2xl font-semibold leading-[1.18] tracking-[-0.02em] text-graphite md:text-[2.1rem]",
                                inkSweep
                              )}
                            >
                              {featured.title}
                            </h2>
                            {featured.summary ? (
                              <p className="mt-4 line-clamp-3 text-[15px] leading-relaxed text-ink-soft md:text-base">
                                {featured.summary}
                              </p>
                            ) : null}
                            <p className="mt-7 inline-flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.2em] text-graphite">
                              Read article
                              <span
                                className="inline-block transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-1"
                                aria-hidden="true"
                              >
                                →
                              </span>
                            </p>
                          </div>
                        </div>
                      </Link>
                    </Reveal>
                  ) : null}

                  {/* Remaining articles — editorial rows */}
                  {rest.length > 0 ? (
                    <div className="mt-14 border-b border-hairline md:mt-20">
                      {rest.map((article, i) => (
                        <Reveal key={article.id} delay={Math.min(i * 0.06, 0.24)}>
                          <ArticleEntryRow article={article} index={i} />
                        </Reveal>
                      ))}
                    </div>
                  ) : null}

                  {/* Section C — load more (only when content overflows) */}
                  {hasMore ? (
                    <div className="mt-14 flex flex-col items-center gap-4">
                      <button
                        type="button"
                        onClick={() => setVisibleCount((n) => n + PAGE_SIZE)}
                        className="inline-flex min-h-11 items-center rounded-full border border-hairline bg-white px-7 font-mono text-[11px] uppercase tracking-[0.18em] text-graphite transition-colors duration-300 hover:border-graphite focus-visible:outline-graphite"
                      >
                        Load more articles
                      </button>
                      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-dark-soft">
                        Showing {rest.length} of {restAll.length}
                      </p>
                    </div>
                  ) : null}
                </>
              )}
          </>
        )}
      </section>
    </>
  );
}

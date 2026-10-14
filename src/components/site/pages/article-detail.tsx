"use client";

import * as React from "react";
import Image from "next/image";
import ReactMarkdown, { type Components } from "react-markdown";
import { useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight, ChevronDown } from "lucide-react";
import { useApi } from "@/hooks/use-api";
import type { Article } from "@/lib/types";
import { Link } from "@/lib/router";
import { cn } from "@/lib/utils";
import { Reveal } from "../reveal";
import { ErrorState, LoadingState } from "../states";
import {
  ArticleEntryRow,
  CoverFallbackMono,
  estimateReadingMinutes,
  extractHeadings,
  formatDate,
  slugifyHeading,
  Tag,
} from "../insights-shared";

/* ------------------------------------------------------------------ */
/* Markdown helpers                                                    */
/* ------------------------------------------------------------------ */

/** Flatten rendered React children back to plain text (for heading ids). */
function textOf(node: React.ReactNode): string {
  if (node == null || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(textOf).join("");
  if (React.isValidElement(node)) {
    return textOf((node.props as { children?: React.ReactNode }).children);
  }
  return "";
}

/**
 * Markdown → styled elements. Every element maps to the monochromatic
 * editorial system: black, white, and neutral grays only.
 */
function buildMarkdownComponents(headingIds: Map<string, string>): Components {
  return {
    h2: ({ children }) => {
      const text = textOf(children);
      const id = headingIds.get(text) ?? slugifyHeading(text);
      return (
        <h2
          id={id}
          className="mb-5 mt-14 scroll-mt-28 text-[1.55rem] font-semibold leading-tight tracking-[-0.02em] text-graphite"
        >
          {children}
        </h2>
      );
    },
    h3: ({ children }) => {
      const text = textOf(children);
      const id = headingIds.get(text) ?? slugifyHeading(text);
      return (
        <h3
          id={id}
          className="mb-3 mt-10 scroll-mt-28 text-xl font-semibold tracking-[-0.01em] text-graphite"
        >
          {children}
        </h3>
      );
    },
    p: ({ children }) => (
      <p className="mb-6 text-[17px] leading-[1.85] text-ink-soft">{children}</p>
    ),
    ul: ({ children }) => (
      <ul className="mb-7 list-disc space-y-2.5 pl-6 marker:text-ink-dark-soft">
        {children}
      </ul>
    ),
    ol: ({ children }) => (
      <ol className="mb-7 list-decimal space-y-2.5 pl-6 marker:font-mono marker:text-ink-dark-soft">
        {children}
      </ol>
    ),
    li: ({ children }) => (
      <li className="text-[16px] leading-[1.8] text-ink-soft">{children}</li>
    ),
    strong: ({ children }) => (
      <strong className="font-semibold text-graphite">{children}</strong>
    ),
    em: ({ children }) => <em className="italic">{children}</em>,
    a: ({ href, children }) => {
      const external =
        typeof href === "string" && /^https?:\/\//.test(href);
      return (
        <a
          href={href}
          {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          className="font-medium text-graphite underline decoration-ink-dark-soft decoration-1 underline-offset-4 transition-[text-decoration-color] duration-300 hover:decoration-graphite focus-visible:outline-graphite"
        >
          {children}
        </a>
      );
    },
    blockquote: ({ children }) => (
      <blockquote className="my-10 border-l-2 border-graphite pl-6 text-[17px] italic leading-[1.8] text-ink-soft">
        {children}
      </blockquote>
    ),
    code: ({ className, children }) => {
      const text =
        typeof children === "string"
          ? children
          : Array.isArray(children)
            ? children.join("")
            : "";
      // Fenced blocks (or language-tagged code) are styled by <pre>;
      // everything else is inline code.
      const isBlock = Boolean(className) || text.includes("\n");
      if (isBlock) {
        return <code className={className}>{children}</code>;
      }
      return (
        <code className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-[0.84em] text-graphite">
          {children}
        </code>
      );
    },
    pre: ({ children }) => (
      <pre className="my-8 overflow-x-auto rounded-md bg-graphite p-5 font-mono text-[13px] leading-[1.7] text-warmwhite">
        {children}
      </pre>
    ),
    hr: () => <hr className="my-12 border-hairline" />,
    // Body markdown may reference remote images — those render as plain,
    // lazy-loaded <img> elements (unknown hosts can't use the optimizer).
    img: ({ src, alt }) => (
      <img
        src={typeof src === "string" ? src : ""}
        alt={alt ?? ""}
        loading="lazy"
        className="my-8 h-auto w-full rounded-md border border-hairline"
      />
    ),
  };
}

/* ------------------------------------------------------------------ */
/* Table of contents                                                   */
/* ------------------------------------------------------------------ */

function TocList({
  headings,
  activeId,
  onNavigate,
}: {
  headings: { depth: 2 | 3; text: string; id: string }[];
  activeId: string | null;
  onNavigate: (id: string) => void;
}) {
  return (
    <ul className="space-y-0.5">
      {headings.map((heading) => {
        const active = heading.id === activeId;
        return (
          <li key={heading.id}>
            <button
              type="button"
              onClick={() => onNavigate(heading.id)}
              aria-current={active ? "true" : undefined}
              className={cn(
                "w-full border-l py-1.5 pr-2 text-left text-[13px] leading-snug transition-colors duration-300 focus-visible:outline-graphite",
                heading.depth === 3 ? "pl-8" : "pl-4",
                active
                  ? "border-graphite font-medium text-graphite"
                  : "border-transparent text-ink-soft hover:text-graphite"
              )}
            >
              {heading.text}
            </button>
          </li>
        );
      })}
    </ul>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function ArticlePage({ slug }: { slug: string }) {
  const reduceMotion = useReducedMotion();
  const { data, loading, error, refresh } = useApi<Article | null>(
    `/api/public/articles/${slug}`
  );
  // Silent companion fetch — cached with the landing page — powers the
  // prev/next and related-article navigation.
  const { data: list } = useApi<Article[]>("/api/public/articles");

  /* ----- Headings / TOC (only for genuinely long articles) ----- */
  const headings = React.useMemo(
    () => (data ? extractHeadings(data.body ?? "") : []),
    [data]
  );
  const showToc = headings.length >= 4;
  const markdownComponents = React.useMemo(
    () =>
      buildMarkdownComponents(
        new Map(headings.map((h) => [h.text, h.id]))
      ),
    [headings]
  );

  const [activeId, setActiveId] = React.useState<string | null>(null);
  // Before any scroll, the first heading reads as the current section.
  const currentId = activeId ?? headings[0]?.id ?? null;

  const scrollToHeading = React.useCallback(
    (id: string) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.scrollIntoView({
        behavior: reduceMotion ? "auto" : "smooth",
        block: "start",
      });
    },
    [reduceMotion]
  );

  // Scroll-spy — only mounted when the TOC is actually rendered.
  React.useEffect(() => {
    if (!data || !showToc) return;
    const els = headings
      .map((h) => document.getElementById(h.id))
      .filter((el): el is HTMLElement => el !== null);
    if (els.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId((entry.target as HTMLElement).id);
          }
        }
      },
      { rootMargin: "-10% 0px -80% 0px", threshold: 0 }
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [data, showToc, headings]);

  // Unique, honest <title> per article (set via rAF so it lands after the
  // router's generic title effect).
  React.useEffect(() => {
    if (!data) return;
    const raf = requestAnimationFrame(() => {
      document.title = `${data.title} — ETARNITY`;
    });
    return () => cancelAnimationFrame(raf);
  }, [data]);

  if (loading && !data) {
    return (
      <section className="container-site py-20 md:py-28">
        <LoadingState label="Loading article" />
      </section>
    );
  }

  if ((error && !data) || (!loading && !error && data === null)) {
    return (
      <section className="container-site py-20 md:py-28">
        <ErrorState
          message="Article not found. It may be unpublished or the link is incorrect."
          onRetry={refresh}
        />
        <div className="mt-6 flex justify-center">
          <Link
            to="/insights"
            className="inline-flex min-h-11 items-center rounded-full bg-graphite px-6 text-sm font-medium text-warmwhite transition-colors hover:bg-[#23262D] focus-visible:outline-warmwhite"
          >
            Back to Insights
          </Link>
        </div>
      </section>
    );
  }

  if (!data) {
    return (
      <section className="container-site py-20 md:py-28">
        <ErrorState message="Article not found." onRetry={refresh} />
      </section>
    );
  }

  const article: Article = data;
  const minutes = estimateReadingMinutes(article.body ?? "");
  const author = article.author;

  /* ----- Neighbours (list is newest-first) ----- */
  const index = list?.findIndex((a) => a.id === article.id) ?? -1;
  const newer = index > 0 && list ? list[index - 1] : null;
  const older =
    index >= 0 && list && index < list.length - 1 ? list[index + 1] : null;

  /* ----- Related: same topic first, then recent — never invented ----- */
  const related = list
    ? list
        .filter(
          (a) =>
            a.id !== article.id &&
            a.id !== newer?.id &&
            a.id !== older?.id
        )
        .sort((a, b) => {
          const aMatch = a.category === article.category ? 0 : 1;
          const bMatch = b.category === article.category ? 0 : 1;
          return aMatch - bMatch;
        })
        .slice(0, 2)
    : [];

  return (
    <div className="container-site pb-24 pt-10 md:pb-32 md:pt-14">
      <article className="mx-auto w-full max-w-[1060px]">
        {/* ---------------- Section A — Header ---------------- */}
        <header className="max-w-[820px]">
          <Reveal>
            <nav aria-label="Breadcrumb">
              <ol className="flex flex-wrap items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.2em]">
                <li>
                  <Link
                    to="/insights"
                    className="min-h-11 inline-flex items-center text-ink-soft transition-colors hover:text-graphite focus-visible:outline-graphite"
                  >
                    Insights
                  </Link>
                </li>
                <li className="text-ink-dark-soft" aria-hidden="true">/</li>
                <li
                  className="max-w-[60vw] truncate font-medium text-graphite"
                  aria-current="page"
                >
                  {article.title}
                </li>
              </ol>
            </nav>
          </Reveal>

          <Reveal delay={0.06}>
            <p className="mt-10 flex flex-wrap items-center gap-x-2.5 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-soft">
              <span className="font-medium text-graphite">{article.category}</span>
              <span aria-hidden="true">·</span>
              <span>{formatDate(article.publishedAt, "long")}</span>
              <span aria-hidden="true">·</span>
              <span>{minutes} min read</span>
            </p>
          </Reveal>

          <Reveal delay={0.12}>
            <h1 className="mt-5 text-[2.1rem] font-semibold leading-[1.12] tracking-[-0.03em] text-graphite sm:text-4xl md:text-[2.9rem] md:leading-[1.08]">
              {article.title}
            </h1>
          </Reveal>

          {article.summary ? (
            <Reveal delay={0.18}>
              <p className="mt-5 max-w-[680px] text-lg leading-relaxed text-ink-soft md:text-xl">
                {article.summary}
              </p>
            </Reveal>
          ) : null}

          <Reveal delay={0.24}>
            <p className="mt-8 flex flex-wrap items-baseline gap-x-2.5 text-sm text-ink-soft">
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-dark-soft">By</span>
              {author ? (
                author.isPublic ? (
                  <Link
                    to={`/people/${author.slug}`}
                    className="font-medium text-graphite underline decoration-ink-dark-soft decoration-1 underline-offset-4 transition-[text-decoration-color] hover:decoration-graphite focus-visible:outline-graphite"
                  >
                    {author.name}
                  </Link>
                ) : (
                  <span className="font-medium text-graphite">{author.name}</span>
                )
              ) : (
                <span className="font-medium text-graphite">ETARNITY Editorial</span>
              )}
              {author?.position ? (
                <>
                  <span aria-hidden="true" className="text-ink-dark-soft">·</span>
                  <span>{author.position}</span>
                </>
              ) : null}
            </p>
          </Reveal>
        </header>

        {/* Cover */}
        <Reveal delay={0.1}>
          <div className="relative mt-12 aspect-[16/8] overflow-hidden rounded-md border border-hairline md:mt-16">
            {article.cover ? (
              <Image
                src={article.cover.url}
                alt={article.cover.altText ?? article.title}
                fill
                sizes="(min-width:1060px) 820px, 100vw"
                priority
                className="object-cover"
                unoptimized={article.cover.mimeType === "image/svg+xml"}
              />
            ) : (
              <CoverFallbackMono label={article.title} />
            )}
          </div>
        </Reveal>

        {/* ---------------- Section B/C — Reading layout ---------------- */}
        <div
          className={cn(
            "mt-14 md:mt-20",
            showToc && "xl:grid xl:grid-cols-[200px_minmax(0,680px)] xl:gap-16"
          )}
        >
          {/* Sticky table of contents — desktop, long articles only */}
          {showToc ? (
            <aside className="hidden xl:block" aria-label="Table of contents">
              <nav className="sticky top-28">
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-dark-soft">
                  On this page
                </p>
                <div className="mt-4 border-l border-hairline">
                  <TocList
                    headings={headings}
                    activeId={currentId}
                    onNavigate={scrollToHeading}
                  />
                </div>
              </nav>
            </aside>
          ) : null}

          <div className="min-w-0">
            {/* Collapsible TOC — mobile/tablet */}
            {showToc ? (
              <details className="mb-10 rounded-md border border-hairline bg-white px-5 group xl:hidden">
                <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between font-mono text-[11px] uppercase tracking-[0.18em] text-graphite [&::-webkit-details-marker]:hidden">
                  On this page
                  <ChevronDown
                    className="size-4 text-ink-soft transition-transform duration-300 group-open:rotate-180"
                    aria-hidden="true"
                  />
                </summary>
                <div className="border-l border-hairline pb-4">
                  <TocList
                    headings={headings}
                    activeId={currentId}
                    onNavigate={scrollToHeading}
                  />
                </div>
              </details>
            ) : null}

            {/* Reading column */}
            <div className="max-w-[680px]">
              <ReactMarkdown components={markdownComponents}>
                {article.body || article.summary}
              </ReactMarkdown>
            </div>

            {/* ---------------- Section D — Article footer ---------------- */}
            <footer className="mt-16 max-w-[680px] md:mt-20">
              <div className="border-t border-graphite pt-7">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <Tag label={article.category} />
                  <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-soft">
                    Published {formatDate(article.publishedAt, "long")}
                  </p>
                </div>
                <Link
                  to="/insights"
                  className="mt-8 inline-flex min-h-11 items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.2em] text-ink-soft transition-colors hover:text-graphite focus-visible:outline-graphite"
                >
                  <span aria-hidden="true">←</span>
                  Back to Insights
                </Link>
              </div>

              {/* Previous / next article navigation */}
              {newer || older ? (
                <nav
                  aria-label="More articles"
                  className="mt-10 grid gap-px overflow-hidden rounded-md border border-hairline bg-hairline sm:grid-cols-2"
                >
                  {newer ? (
                    <Link
                      to={`/insights/${newer.slug}`}
                      className="group flex min-h-11 flex-col gap-2 bg-white p-5 transition-colors hover:bg-muted/50 focus-visible:outline-graphite"
                    >
                      <span className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-ink-dark-soft">
                        <ArrowLeft
                          className="size-3.5 transition-transform duration-300 group-hover:-translate-x-0.5"
                          aria-hidden="true"
                        />
                        Newer article
                      </span>
                      <span className="text-[15px] font-semibold leading-snug text-graphite">
                        {newer.title}
                      </span>
                    </Link>
                  ) : (
                    <div className="hidden bg-white sm:block" aria-hidden="true" />
                  )}
                  {older ? (
                    <Link
                      to={`/insights/${older.slug}`}
                      className="group flex min-h-11 flex-col gap-2 bg-white p-5 text-right transition-colors hover:bg-muted/50 focus-visible:outline-graphite"
                    >
                      <span className="flex items-center justify-end gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-ink-dark-soft">
                        Older article
                        <ArrowRight
                          className="size-3.5 transition-transform duration-300 group-hover:translate-x-0.5"
                          aria-hidden="true"
                        />
                      </span>
                      <span className="text-[15px] font-semibold leading-snug text-graphite">
                        {older.title}
                      </span>
                    </Link>
                  ) : (
                    <div className="hidden bg-white sm:block" aria-hidden="true" />
                  )}
                </nav>
              ) : null}

              {/* Related reading — same topic first, real articles only */}
              {related.length > 0 ? (
                <section aria-labelledby="related-reading" className="mt-14">
                  <h2
                    id="related-reading"
                    className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-dark-soft"
                  >
                    Related reading
                  </h2>
                  <div className="mt-5 border-b border-hairline">
                    {related.map((a, i) => (
                      <Reveal key={a.id} delay={Math.min(i * 0.06, 0.18)}>
                        <ArticleEntryRow article={a} index={i} />
                      </Reveal>
                    ))}
                  </div>
                </section>
              ) : null}
            </footer>
          </div>
        </div>
      </article>
    </div>
  );
}

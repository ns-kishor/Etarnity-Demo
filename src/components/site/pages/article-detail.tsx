"use client";

import Image from "next/image";
import ReactMarkdown, { type Components } from "react-markdown";
import { useApi } from "@/hooks/use-api";
import type { Article } from "@/lib/types";
import { Link } from "@/lib/router";
import { Reveal } from "../reveal";
import { ErrorState, LoadingState } from "../states";
import { initialsOf } from "./people";
import { formatDate } from "./insights";
import { CoverFallback } from "./work";

/**
 * Markdown → styled elements (no prose plugin; every element is mapped
 * explicitly to the ETARNITY editorial styles).
 */
const MARKDOWN_COMPONENTS: Components = {
  h2: ({ node: _node, children }) => (
    <h2 className="mb-4 mt-10 text-2xl font-semibold tracking-tight text-graphite">
      {children}
    </h2>
  ),
  h3: ({ node: _node, children }) => (
    <h3 className="mb-3 mt-8 text-lg font-semibold text-graphite">
      {children}
    </h3>
  ),
  p: ({ node: _node, children }) => (
    <p className="mb-6 text-[17px] leading-[1.85] text-ink-soft">{children}</p>
  ),
  ul: ({ node: _node, children }) => (
    <ul className="mb-6 list-disc space-y-2 pl-5 marker:text-electric">
      {children}
    </ul>
  ),
  ol: ({ node: _node, children }) => (
    <ol className="mb-6 list-decimal space-y-2 pl-5 marker:text-electric">
      {children}
    </ol>
  ),
  li: ({ node: _node, children }) => (
    <li className="text-[16px] leading-[1.75] text-ink-soft">{children}</li>
  ),
  strong: ({ node: _node, children }) => (
    <strong className="font-semibold text-graphite">{children}</strong>
  ),
  em: ({ node: _node, children }) => <em className="italic">{children}</em>,
  a: ({ node: _node, href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-electric underline underline-offset-4"
    >
      {children}
    </a>
  ),
  blockquote: ({ node: _node, children }) => (
    <blockquote className="my-8 border-l-2 border-electric pl-5 italic text-ink-soft">
      {children}
    </blockquote>
  ),
  code: ({ node: _node, className, children }) => {
    const text =
      typeof children === "string"
        ? children
        : Array.isArray(children)
          ? children.join("")
          : "";
    // Fenced blocks (or language-tagged code) are styled by the <pre> wrapper;
    // everything else is inline code.
    const isBlock = Boolean(className) || text.includes("\n");
    if (isBlock) {
      return <code className={className}>{children}</code>;
    }
    return (
      <code className="rounded bg-[#ECEDEF] px-1.5 py-0.5 font-mono text-[13px] text-graphite">
        {children}
      </code>
    );
  },
  pre: ({ node: _node, children }) => (
    <pre className="my-6 overflow-x-auto rounded-lg bg-graphite p-4 font-mono text-[13px] text-warmwhite">
      {children}
    </pre>
  ),
  hr: () => <hr className="my-10 border-hairline" />,
  // Body markdown can reference arbitrary remote images — those cannot go
  // through the Next.js image optimizer (unknown hosts), so they render as
  // plain, lazy-loaded <img> elements.
  img: ({ node: _node, src, alt }) => (
    <img
      src={typeof src === "string" ? src : ""}
      alt={alt ?? ""}
      loading="lazy"
      className="my-8 h-auto w-full rounded-xl border border-hairline"
    />
  ),
};

export default function ArticlePage({ slug }: { slug: string }) {
  const { data, loading, error, refresh } = useApi<Article | null>(
    `/api/public/articles/${slug}`
  );

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
            className="inline-flex min-h-11 items-center rounded-full bg-graphite px-6 text-sm font-medium text-warmwhite transition-colors hover:bg-[#23262D]"
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

  const article = data;
  const wordCount = article.body.split(/\s+/).filter(Boolean).length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));
  const author = article.author;

  return (
    <div className="container-site py-16 md:py-24">
      <article className="mx-auto max-w-[760px]">
        <Reveal>
          <Link
            to="/insights"
            className="inline-flex min-h-11 items-center font-mono text-[11px] uppercase tracking-[0.22em] text-ink-soft transition-colors hover:text-graphite"
          >
            <span aria-hidden="true" className="mr-2">←</span>
            Insights
          </Link>
        </Reveal>

        <Reveal delay={0.05}>
          <p className="mt-8 font-mono text-[11px] uppercase tracking-[0.15em] text-ink-soft">
            <span className="text-electric">{article.category}</span>
            <span className="mx-2">·</span>
            {formatDate(article.publishedAt)}
            <span className="mx-2">·</span>
            {readingTime} min read
          </p>
          <h1 className="mt-4 text-3xl font-semibold leading-[1.15] tracking-[-0.03em] text-graphite md:text-[2.6rem]">
            {article.title}
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-ink-soft">
            {article.summary}
          </p>
        </Reveal>

        {/* Author row */}
        <Reveal delay={0.1}>
          <div className="mt-8 flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-graphite text-sm font-semibold text-warmwhite" aria-hidden="true">
              {author ? initialsOf(author.name) : "E"}
            </span>
            {author ? (
              <div>
                <Link
                  to={`/people/${author.slug}`}
                  className="text-sm font-semibold text-graphite underline-offset-4 transition hover:text-electric hover:underline"
                >
                  {author.name}
                </Link>
                <p className="text-xs text-ink-soft">{author.position}</p>
              </div>
            ) : (
              <div>
                <p className="text-sm font-semibold text-graphite">ETARNITY</p>
                <p className="text-xs text-ink-soft">Editorial</p>
              </div>
            )}
          </div>
        </Reveal>

        {/* Cover */}
        <Reveal delay={0.1}>
          <div className="relative mt-10 aspect-[21/9] overflow-hidden rounded-xl border border-hairline">
            {article.cover ? (
              <Image
                src={article.cover.url}
                alt={article.cover.altText ?? article.title}
                fill
                sizes="(min-width:760px) 760px, 100vw"
                priority
                className="object-cover"
                unoptimized={article.cover.mimeType === "image/svg+xml"}
              />
            ) : (
              <CoverFallback label={article.title} />
            )}
          </div>
        </Reveal>

        {/* Body */}
        <Reveal delay={0.1}>
          <div className="mt-10">
            <ReactMarkdown components={MARKDOWN_COMPONENTS}>
              {article.body || article.summary}
            </ReactMarkdown>
          </div>
        </Reveal>

        {/* Footer */}
        <div className="mt-14 border-t border-hairline pt-8">
          <div className="flex items-center gap-4">
            <span
              className="flex size-12 items-center justify-center rounded-xl bg-graphite text-base font-semibold text-warmwhite"
              aria-hidden="true"
            >
              {author ? initialsOf(author.name) : "E"}
            </span>
            <div>
              {author ? (
                <>
                  <Link
                    to={`/people/${author.slug}`}
                    className="text-sm font-semibold text-graphite underline-offset-4 transition hover:text-electric hover:underline"
                  >
                    {author.name}
                  </Link>
                  <p className="mt-0.5 text-xs text-ink-soft">
                    {author.position}
                  </p>
                </>
              ) : (
                <>
                  <p className="text-sm font-semibold text-graphite">ETARNITY</p>
                  <p className="mt-0.5 text-xs text-ink-soft">Editorial</p>
                </>
              )}
            </div>
          </div>
          <Link
            to="/insights"
            className="mt-8 inline-flex min-h-11 items-center text-sm font-medium text-electric underline-offset-4 transition hover:underline"
          >
            Back to Insights →
          </Link>
        </div>
      </article>
    </div>
  );
}

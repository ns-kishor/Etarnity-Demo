"use client";

import { Link } from "@/lib/router";

export default function NotFoundPage() {
  return (
    <section className="container-site flex min-h-[60vh] flex-col items-center justify-center py-24 text-center">
      <p className="font-mono text-7xl font-semibold tracking-tight text-graphite">
        404<span className="text-electric" aria-hidden="true">.</span>
      </p>
      <h1 className="mt-6 text-xl font-semibold text-graphite">
        This page doesn&apos;t exist — yet.
      </h1>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-ink-soft">
        The URL may be mistyped, or the page is still being built.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
        <Link
          to="/"
          className="inline-flex min-h-11 items-center justify-center rounded-full bg-graphite px-6 py-3 text-sm font-medium text-warmwhite transition-colors hover:bg-[#23262D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-warmwhite"
        >
          Back to Home
        </Link>
        <Link
          to="/contact"
          className="inline-flex min-h-11 items-center justify-center rounded-full border border-hairline bg-white px-6 py-3 text-sm font-medium text-graphite transition-colors hover:border-graphite focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-warmwhite"
        >
          Report a Problem
        </Link>
      </div>
    </section>
  );
}

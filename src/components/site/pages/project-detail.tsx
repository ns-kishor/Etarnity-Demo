"use client";

import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { useApi } from "@/hooks/use-api";
import type { Project } from "@/lib/types";
import { Link } from "@/lib/router";
import { PageHeader } from "../page-header";
import { Reveal } from "../reveal";
import { StatusChip } from "../status-chip";
import { ErrorState, LoadingState } from "../states";
import { ownershipLabel } from "./work";
import { CoverFallback } from "./work";

interface BodySection {
  label: string;
  content: string | null;
}

export default function ProjectDetailPage({ slug }: { slug: string }) {
  const { data, loading, error, refresh } = useApi<Project | null>(
    `/api/public/projects/${slug}`
  );

  if (loading && !data) {
    return (
      <section className="container-site py-20 md:py-28">
        <LoadingState label="Loading project" />
      </section>
    );
  }

  if ((error && !data) || (!loading && !error && data === null)) {
    return (
      <section className="container-site py-20 md:py-28">
        <ErrorState
          message="Project not found. It may be unpublished or the link is incorrect."
          onRetry={refresh}
        />
        <div className="mt-6 flex justify-center">
          <Link
            to="/work"
            className="inline-flex min-h-11 items-center rounded-full bg-graphite px-6 text-sm font-medium text-warmwhite transition-colors hover:bg-[#23262D]"
          >
            Back to Work
          </Link>
        </div>
      </section>
    );
  }

  if (!data) {
    return (
      <section className="container-site py-20 md:py-28">
        <ErrorState message="Project not found." onRetry={refresh} />
      </section>
    );
  }

  const project = data;

  const sections: BodySection[] = [
    { label: "Overview", content: project.summary },
    { label: "The Problem", content: project.problem },
    { label: "The Solution", content: project.solution },
    { label: "Process", content: project.process },
    { label: "Outcomes", content: project.outcomes },
  ].filter((section) => Boolean(section.content));

  return (
    <>
      <PageHeader
        eyebrow={project.category.toUpperCase()}
        title={project.title}
        backTo={{ to: "/work", label: "Work" }}
      />

      <div className="container-site pb-20">
        {/* Meta row under the header */}
        <Reveal>
          <div className="flex flex-wrap items-center gap-3 pt-10">
            <StatusChip status={project.projectStatus} />
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-soft">
              {ownershipLabel(project.ownershipType)}
            </span>
            {project.liveUrl ? (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-hairline bg-white px-4 py-1.5 text-xs font-medium text-graphite transition-colors hover:border-graphite"
              >
                Visit Live Project
                <ArrowUpRight className="size-3.5" aria-hidden="true" />
              </a>
            ) : null}
          </div>
        </Reveal>

        {/* Cover */}
        <Reveal delay={0.05}>
          <div className="relative mt-8 aspect-[21/9] overflow-hidden rounded-2xl border border-hairline">
            {project.cover ? (
              <Image
                src={project.cover.url}
                alt={project.cover.altText ?? project.title}
                fill
                sizes="100vw"
                priority
                className="object-cover"
                unoptimized={project.cover.mimeType === "image/svg+xml"}
              />
            ) : (
              <CoverFallback label={project.title} />
            )}
          </div>
        </Reveal>

        {/* Body */}
        <div className="grid gap-10 py-14 lg:grid-cols-12">
          <div className="space-y-12 lg:col-span-8">
            {sections.map((section) => (
              <Reveal key={section.label}>
                <section>
                  <h2 className="font-mono text-[11px] uppercase tracking-[0.22em] text-electric">
                    {section.label}
                  </h2>
                  <div className="mt-4 max-w-[65ch] space-y-5">
                    {(section.content ?? "").split(/\n\n+/).filter(Boolean).map(
                      (paragraph, index) => (
                        <p
                          key={index}
                          className="text-base leading-[1.85] text-ink-soft md:text-lg"
                        >
                          {paragraph}
                        </p>
                      )
                    )}
                  </div>
                </section>
              </Reveal>
            ))}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4">
            <Reveal delay={0.1}>
              <aside className="space-y-6 self-start rounded-xl border border-hairline bg-white p-6 lg:sticky lg:top-24">
                {project.stack.length > 0 ? (
                  <div>
                    <h2 className="font-mono text-[11px] uppercase tracking-[0.22em] text-electric">
                      Tech Stack
                    </h2>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {project.stack.map((item) => (
                        <span
                          key={item}
                          className="rounded-full border border-hairline bg-warmwhite px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.1em] text-ink-soft"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null}

                <div className="space-y-4 border-t border-hairline pt-6">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-soft">
                      Status
                    </span>
                    <StatusChip status={project.projectStatus} />
                  </div>
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-soft">
                      Ownership
                    </span>
                    <span className="text-sm font-medium text-graphite">
                      {ownershipLabel(project.ownershipType)}
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-soft">
                      Category
                    </span>
                    <span className="text-sm font-medium text-graphite">
                      {project.category}
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-soft">
                      Live Link
                    </span>
                    {project.liveUrl ? (
                      <a
                        href={project.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm font-medium text-electric underline-offset-4 transition hover:underline"
                      >
                        Visit
                        <ArrowUpRight className="size-3" aria-hidden="true" />
                      </a>
                    ) : (
                      <span className="text-sm font-medium text-ink-soft">—</span>
                    )}
                  </div>
                </div>
              </aside>
            </Reveal>
          </div>
        </div>

        {/* Gallery */}
        {project.gallery.length > 0 ? (
          <Reveal>
            <div className="grid gap-4 pb-16 md:grid-cols-2">
              {project.gallery.map((asset) => (
                <div
                  key={asset.id}
                  className="relative aspect-[16/10] overflow-hidden rounded-xl border border-hairline"
                >
                  <Image
                    src={asset.url}
                    alt={asset.altText ?? project.title}
                    fill
                    sizes="(min-width:768px) 50vw, 100vw"
                    className="object-cover"
                    unoptimized={asset.mimeType === "image/svg+xml"}
                  />
                </div>
              ))}
            </div>
          </Reveal>
        ) : null}

        {/* Bottom CTA row */}
        <div className="flex flex-wrap items-center gap-6 border-t border-hairline pb-4 pt-8">
          <Link
            to="/contact"
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-graphite px-6 py-3 text-sm font-medium text-warmwhite transition-colors hover:bg-[#23262D]"
          >
            Start a Similar Project
          </Link>
          <Link
            to="/businesses"
            className="text-sm font-medium text-electric underline-offset-4 transition hover:underline"
          >
            Explore the Ecosystem →
          </Link>
        </div>
      </div>
    </>
  );
}

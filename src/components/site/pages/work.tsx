"use client";

import * as React from "react";
import Image from "next/image";
import { useApi } from "@/hooks/use-api";
import type { Project } from "@/lib/types";
import { Link } from "@/lib/router";
import { cn } from "@/lib/utils";
import { PageHeader } from "../page-header";
import { Section } from "../section";
import { Reveal } from "../reveal";
import { StatusChip } from "../status-chip";
import { EmptyState, ErrorState, LoadingState } from "../states";

/** Honest ownership micro-labels for project cards. */
const OWNERSHIP_LABELS: Record<string, string> = {
  INTERNAL_PRODUCT: "ETARNITY Internal",
  CLIENT_PROJECT: "Client Project",
  DEMONSTRATION: "Demonstration",
  EXPERIMENT: "Experiment",
  PERSONAL_PROJECT: "Independent",
};

export function ownershipLabel(type: string): string {
  return OWNERSHIP_LABELS[type] ?? type.replaceAll("_", " ");
}

/**
 * Standalone orbit mark (decorative) — used as the fallback cover graphic.
 * Inlined rather than importing <Logo/> so cards never nest anchor tags.
 */
function OrbitMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <circle cx="32" cy="32" r="11" fill="#3E465C" />
      <ellipse
        cx="32"
        cy="32"
        rx="24"
        ry="9.5"
        stroke="#526BFF"
        strokeWidth="2.4"
        transform="rotate(-24 32 32)"
      />
      <circle cx="50.2" cy="22.4" r="3" fill="#AAB7FF" />
    </svg>
  );
}

/** Dark gradient fallback panel with the orbit mark, for missing covers. */
export function CoverFallback({ label }: { label: string }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-[linear-gradient(135deg,#15171B,#242938)]">
      <OrbitMark className="size-10 opacity-50" />
      <span className="sr-only">{label}</span>
    </div>
  );
}

export default function WorkPage() {
  const { data, loading, error, refresh } = useApi<Project[]>(
    "/api/public/projects"
  );
  const [category, setCategory] = React.useState<string>("ALL");

  const projects = data ?? [];

  // Derive unique categories from the data (stable order of appearance).
  const categories = React.useMemo(() => {
    const seen: string[] = [];
    for (const project of projects) {
      if (project.category && !seen.includes(project.category)) {
        seen.push(project.category);
      }
    }
    return seen;
  }, [projects]);

  const filtered =
    category === "ALL"
      ? projects
      : projects.filter((project) => project.category === category);

  return (
    <>
      <PageHeader
        eyebrow="02 / WORK"
        title="Technology in Practice."
        lede="Selected projects and products. Ownership and status are always labeled."
      />

      <Section className="py-14 md:py-20">
        {loading && projects.length === 0 ? (
          <LoadingState label="Loading selected work" />
        ) : error && projects.length === 0 ? (
          <ErrorState
            message="The project archive could not be loaded."
            onRetry={refresh}
          />
        ) : projects.length === 0 ? (
          <EmptyState
            title="No projects published yet"
            description="Selected work will appear here as projects ship. Every entry will state its ownership and status."
          />
        ) : (
          <>
            {categories.length > 0 ? (
              <Reveal>
                <div
                  className="mb-10 flex flex-wrap gap-2"
                  role="group"
                  aria-label="Filter projects by category"
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
                title={`No projects in ${category}`}
                description="Try another category or view everything."
              />
            ) : (
              <Reveal>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {filtered.map((project) => (
                    <Link
                      key={project.id}
                      to={`/work/${project.slug}`}
                      className="group overflow-hidden rounded-xl border border-hairline bg-white transition hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(21,23,27,0.07)]"
                    >
                      <div className="relative aspect-[16/10] overflow-hidden">
                        {project.cover ? (
                          <Image
                            src={project.cover.url}
                            alt={project.cover.altText ?? project.title}
                            fill
                            sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw"
                            className="object-cover transition duration-500 group-hover:scale-[1.03]"
                            unoptimized={
                              project.cover.mimeType === "image/svg+xml"
                            }
                          />
                        ) : (
                          <CoverFallback label={project.title} />
                        )}
                      </div>
                      <div className="p-5">
                        <div className="flex items-center justify-between gap-3">
                          <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-electric">
                            {project.category}
                          </span>
                          <StatusChip
                            status={project.projectStatus}
                            className="ml-auto"
                          />
                        </div>
                        <h3 className="mt-2.5 text-[15px] font-semibold tracking-tight text-graphite">
                          {project.title}
                        </h3>
                        <p className="mt-1.5 text-[13px] leading-relaxed text-ink-soft line-clamp-2">
                          {project.summary}
                        </p>
                        <p className="mt-3 font-mono text-[9px] uppercase tracking-[0.18em] text-ink-soft">
                          {ownershipLabel(project.ownershipType)}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </Reveal>
            )}

            <p className="mt-8 font-mono text-[10px] uppercase leading-relaxed tracking-[0.15em] text-ink-soft">
              Ownership — Internal · Client · Demonstration · Experiment. We
              don&apos;t claim work that isn&apos;t ours.
            </p>
          </>
        )}
      </Section>
    </>
  );
}

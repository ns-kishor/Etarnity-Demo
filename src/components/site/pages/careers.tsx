"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { useApi } from "@/hooks/use-api";
import type { JobPosition } from "@/lib/types";
import { Link } from "@/lib/router";
import { cn } from "@/lib/utils";
import { PageHeader } from "../page-header";
import { Section } from "../section";
import { Reveal } from "../reveal";
import { EmptyState, ErrorState, LoadingState } from "../states";

/** Session-storage hand-off so /contact can preselect the inquiry type. */
export const INQUIRY_TYPE_STORAGE_KEY = "etarnity:inquiry-type";

const WORKING_PRINCIPLES = [
  "Small teams, real ownership",
  "Written communication first",
  "Craft over speed — but we ship",
  "Learning budget and time",
  "Honest status reporting",
];

const CULTURE_PARAGRAPHS = [
  "ETARNITY is deliberately small. Every engineer who joins early owns real systems — not tickets, not a corner of a backlog — and sees their decisions in production. We believe ownership is the only way people genuinely grow, so we structure work around it.",
  "We communicate in writing first. Decisions get documented, reasoning gets shared, and meetings exist to resolve what writing could not. This keeps the bar high and the record honest — anyone can reconstruct why something was built the way it was.",
  "We care about craft: measured trade-offs, code that reads well, and interfaces that respect the person using them. Craft over speed — but we ship. Finished, honest work beats polished intentions every time.",
];

export default function CareersPage() {
  const { data, loading, error, refresh } = useApi<JobPosition[]>(
    "/api/public/careers"
  );
  const [expandedId, setExpandedId] = React.useState<number | null>(null);

  const positions = data ?? [];

  return (
    <>
      <PageHeader
        eyebrow="05 / CAREERS"
        title="Build What's Next With Us."
        lede="We're a small team that ships real products — joining early means ownership of real engineering."
      />

      {/* Culture */}
      <Section eyebrow="Culture" title="How We Work." className="py-14 md:py-20">
        <div className="grid gap-10 lg:grid-cols-12">
          <Reveal className="lg:col-span-7">
            <div className="max-w-[60ch] space-y-5">
              {CULTURE_PARAGRAPHS.map((paragraph, index) => (
                <p key={index} className="text-base leading-[1.85] text-ink-soft">
                  {paragraph}
                </p>
              ))}
            </div>
          </Reveal>
          <Reveal delay={0.1} className="lg:col-span-5">
            <div className="rounded-xl border border-hairline bg-white p-6">
              <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-electric">
                Working Principles
              </p>
              <ul className="mt-4">
                {WORKING_PRINCIPLES.map((principle, index) => (
                  <li
                    key={principle}
                    className="flex items-baseline gap-4 border-t border-hairline py-3 first:border-t-0 first:pt-1"
                  >
                    <span className="font-mono text-[10px] text-electric">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="text-sm text-graphite">{principle}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </Section>

      {/* Open positions */}
      <Section
        eyebrow="Open Roles"
        title="Open Positions."
        bordered
        className="py-14 md:py-20"
      >
        {loading && positions.length === 0 ? (
          <LoadingState label="Loading open positions" />
        ) : error && positions.length === 0 ? (
          <ErrorState
            message="Open positions could not be loaded."
            onRetry={refresh}
          />
        ) : positions.length === 0 ? (
          <div className="flex flex-col items-center">
            <EmptyState
              title="No open positions right now."
              description="We're a small team and hire deliberately. Send a general introduction — we read everything."
            />
            <Link
              to="/contact"
              onClick={() => {
                try {
                  sessionStorage.setItem(INQUIRY_TYPE_STORAGE_KEY, "CAREERS");
                } catch {
                  /* storage unavailable — plain link still works */
                }
              }}
              className="mt-6 inline-flex min-h-11 items-center justify-center rounded-full bg-graphite px-6 py-3 text-sm font-medium text-warmwhite transition-colors hover:bg-[#23262D]"
            >
              Introduce Yourself
            </Link>
          </div>
        ) : (
          <>
            <Reveal>
              <div className="overflow-hidden rounded-xl border border-hairline bg-warmwhite">
                {positions.map((position, index) => {
                  const open = expandedId === position.id;
                  return (
                    <div
                      key={position.id}
                      className={cn(
                        index > 0 && "border-t border-hairline",
                        open && "bg-white"
                      )}
                    >
                      <button
                        type="button"
                        aria-expanded={open}
                        aria-controls={`position-panel-${position.id}`}
                        onClick={() =>
                          setExpandedId(open ? null : position.id)
                        }
                        className="flex w-full items-center justify-between gap-4 p-6 text-left transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-inset"
                      >
                        <span>
                          <span className="block text-base font-semibold text-graphite">
                            {position.title}
                          </span>
                          {position.department ? (
                            <span className="mt-1 block font-mono text-[10px] uppercase tracking-[0.15em] text-electric">
                              {position.department}
                            </span>
                          ) : null}
                        </span>
                        <span className="flex items-center gap-4">
                          <span className="hidden text-right font-mono text-[10px] uppercase leading-relaxed tracking-[0.15em] text-ink-soft sm:block">
                            {position.location ?? "Remote"}
                            {position.type ? ` · ${position.type}` : ""}
                          </span>
                          <ChevronDown
                            className={cn(
                              "size-4 shrink-0 text-ink-soft transition-transform duration-300",
                              open && "rotate-180"
                            )}
                            aria-hidden="true"
                          />
                        </span>
                      </button>

                      {open ? (
                        <div
                          id={`position-panel-${position.id}`}
                          className="border-t border-hairline p-6 pt-5"
                        >
                          {position.description ? (
                            <div className="max-w-[65ch] space-y-4">
                              {position.description
                                .split(/\n\n+/)
                                .filter(Boolean)
                                .map((paragraph, pIndex) => (
                                  <p
                                    key={pIndex}
                                    className="text-sm leading-[1.8] text-ink-soft"
                                  >
                                    {paragraph}
                                  </p>
                                ))}
                            </div>
                          ) : null}

                          {position.requirements.length > 0 ? (
                            <div className="mt-6">
                              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-soft">
                                Requirements
                              </p>
                              <ul className="mt-3 max-w-[65ch] list-disc space-y-2 pl-5 marker:text-electric">
                                {position.requirements.map((requirement) => (
                                  <li
                                    key={requirement}
                                    className="text-sm leading-[1.75] text-ink-soft"
                                  >
                                    {requirement}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ) : null}

                          <a
                            href={`mailto:hello@etarnity.com?subject=${encodeURIComponent(
                              `Application: ${position.title}`
                            )}`}
                            className="mt-6 inline-flex min-h-11 items-center justify-center rounded-full bg-graphite px-6 py-3 text-sm font-medium text-warmwhite transition-colors hover:bg-[#23262D]"
                          >
                            Apply for This Role
                          </a>
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </Reveal>

            <p className="mt-6 font-mono text-[10px] uppercase leading-relaxed tracking-[0.15em] text-ink-soft">
              We never post fake vacancies. If it&apos;s listed, it&apos;s real.
            </p>
          </>
        )}
      </Section>
    </>
  );
}

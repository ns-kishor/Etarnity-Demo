"use client";

import * as React from "react";
import { Github, Globe, Linkedin, Mail } from "lucide-react";
import { useApi } from "@/hooks/use-api";
import type { PersonLink } from "@/lib/types";
import type { Person } from "@/lib/types";
import { Link } from "@/lib/router";
import { Reveal } from "../reveal";
import { ErrorState, LoadingState } from "../states";
import { Portrait, initialsOf } from "./people";

/** Pick a lucide icon for a profile link based on its URL. */
function iconForLink(url: string): React.ComponentType<{ className?: string }> {
  const lower = url.toLowerCase();
  if (lower.includes("linkedin") || lower.includes("lnk.to"))
    return Linkedin;
  if (lower.includes("github") || lower.includes("gitlab")) return Github;
  if (lower.startsWith("mailto:") || lower.includes("mail")) return Mail;
  return Globe;
}

function labelForLink(link: PersonLink): string {
  if (link.label) return link.label;
  const lower = link.url.toLowerCase();
  if (lower.includes("linkedin")) return "LinkedIn";
  if (lower.includes("github")) return "GitHub";
  if (lower.includes("gitlab")) return "GitLab";
  if (lower.startsWith("mailto:")) return "Email";
  return "Website";
}

export default function PersonDetailPage({ slug }: { slug: string }) {
  const { data, loading, error, refresh } = useApi<Person | null>(
    `/api/public/people/${slug}`
  );

  if (loading && !data) {
    return (
      <section className="container-site py-20 md:py-28">
        <LoadingState label="Loading profile" />
      </section>
    );
  }

  if ((error && !data) || (!loading && !error && data === null)) {
    return (
      <section className="container-site py-20 md:py-28">
        <ErrorState
          message="Person not found. Profiles are only published with consent."
          onRetry={refresh}
        />
        <div className="mt-6 flex justify-center">
          <Link
            to="/people"
            className="inline-flex min-h-11 items-center rounded-full bg-graphite px-6 text-sm font-medium text-warmwhite transition-colors hover:bg-[#23262D]"
          >
            Back to People
          </Link>
        </div>
      </section>
    );
  }

  if (!data) {
    return (
      <section className="container-site py-20 md:py-28">
        <ErrorState message="Person not found." onRetry={refresh} />
      </section>
    );
  }

  const person = data;
  const biographyParagraphs = (person.biography ?? "").split(/\n\n+/).filter(Boolean);

  return (
    <div className="container-site py-24 md:py-32">
      <Reveal>
        <Link
          to="/people"
          className="inline-flex min-h-11 items-center font-mono text-[11px] uppercase tracking-[0.22em] text-ink-soft transition-colors hover:text-graphite"
        >
          <span aria-hidden="true" className="mr-2">←</span>
          People
        </Link>
      </Reveal>

      <div className="mt-10 grid gap-10 lg:grid-cols-12">
        {/* Portrait + links */}
        <div className="lg:col-span-4">
          <Reveal>
            <div className="w-full max-w-[320px]">
              <Portrait
                person={person}
                size={320}
                className="aspect-square rounded-2xl"
              />
              {person.links.length > 0 ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {person.links.map((link, index) => {
                    const Icon = iconForLink(link.url);
                    const label = labelForLink(link);
                    return (
                      <a
                        key={`${link.url}-${index}`}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`${person.name} on ${label}`}
                        className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border border-hairline bg-white p-2.5 text-ink-soft transition-colors hover:border-graphite hover:text-graphite"
                      >
                        <Icon className="size-4" aria-hidden="true" />
                      </a>
                    );
                  })}
                </div>
              ) : null}
            </div>
          </Reveal>
        </div>

        {/* Bio column */}
        <div className="lg:col-span-8">
          <Reveal>
            <div className="flex flex-wrap items-center gap-3">
              {person.department ? (
                <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-electric">
                  {person.department}
                </span>
              ) : null}
              {person.isFounder ? (
                <span className="rounded-full border border-electric/25 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.2em] text-electric">
                  Founder
                </span>
              ) : null}
            </div>
            <h1 className="mt-3 text-4xl font-semibold tracking-[-0.03em] text-graphite md:text-5xl">
              {person.name}
            </h1>
            <p className="mt-2 text-lg text-ink-soft">{person.position}</p>
          </Reveal>

          <div className="my-8 border-t border-hairline" />

          {biographyParagraphs.length > 0 ? (
            <Reveal delay={0.05}>
              <section>
                <h2 className="font-mono text-[11px] uppercase tracking-[0.22em] text-electric">
                  Biography
                </h2>
                <div className="mt-4 max-w-[62ch] space-y-5">
                  {biographyParagraphs.map((paragraph, index) => (
                    <p
                      key={index}
                      className="text-base leading-[1.85] text-ink-soft"
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>
              </section>
            </Reveal>
          ) : null}

          {person.responsibilities ? (
            <Reveal delay={0.05}>
              <section className="mt-10">
                <h2 className="font-mono text-[11px] uppercase tracking-[0.22em] text-electric">
                  Responsibilities
                </h2>
                <p className="mt-4 max-w-[62ch] text-base leading-[1.85] text-ink-soft">
                  {person.responsibilities}
                </p>
              </section>
            </Reveal>
          ) : null}

          {person.expertise.length > 0 ? (
            <Reveal delay={0.05}>
              <section className="mt-10">
                <h2 className="font-mono text-[11px] uppercase tracking-[0.22em] text-electric">
                  Expertise
                </h2>
                <div className="mt-4 flex flex-wrap gap-2">
                  {person.expertise.map((item) => (
                    <span
                      key={item}
                      className="rounded-full border border-hairline px-3.5 py-1.5 text-xs text-ink-soft"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </section>
            </Reveal>
          ) : null}

          <Reveal delay={0.05}>
            <div className="mt-12">
              <Link
                to="/contact"
                className="inline-flex min-h-11 items-center justify-center rounded-full bg-graphite px-6 py-3 text-sm font-medium text-warmwhite transition-colors hover:bg-[#23262D]"
              >
                Get in Touch
              </Link>
            </div>
          </Reveal>
        </div>
      </div>
    </div>
  );
}

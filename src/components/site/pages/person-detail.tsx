"use client";

import * as React from "react";
import Image from "next/image";
import { CalendarDays, Github, Globe, Linkedin, Mail, MapPin } from "lucide-react";
import { useApi } from "@/hooks/use-api";
import type { Person, PersonLink } from "@/lib/types";
import { Link } from "@/lib/router";
import { Reveal } from "../reveal";
import { ErrorState, LoadingState } from "../states";
import { BookingModal } from "../booking-modal";
import { initialsOf } from "../founder-card";

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
  const [bookingOpen, setBookingOpen] = React.useState(false);

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
  const positionLine = person.positionAbbr
    ? `${person.position} · ${person.positionAbbr}`
    : person.position;

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

      <div className="mt-10 grid gap-10 lg:grid-cols-12 lg:gap-12">
        {/* Left column — portrait, links, and public contact details. */}
        <aside className="lg:col-span-4">
          <div className="lg:sticky lg:top-24">
            <Reveal>
              <div className="w-full max-w-[420px]">
                <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl border border-hairline bg-graphite">
                  {person.portrait ? (
                    <Image
                      src={person.portrait.url}
                      alt={person.portrait.altText ?? person.name}
                      fill
                      sizes="(min-width: 1024px) 420px, (min-width: 768px) 60vw, 92vw"
                      className="object-cover"
                      unoptimized={person.portrait.mimeType === "image/svg+xml"}
                    />
                  ) : (
                    <>
                      <div
                        aria-hidden="true"
                        className="absolute inset-0 flex items-center justify-center bg-[linear-gradient(155deg,#23262D_0%,#15171B_52%,#101218_100%)]"
                      >
                        <span className="text-6xl font-semibold tracking-[0.06em] text-warmwhite md:text-7xl">
                          {initialsOf(person.name)}
                        </span>
                      </div>
                      <span className="sr-only">
                        {person.name} — portrait placeholder
                      </span>
                    </>
                  )}
                </div>
                {!person.portrait ? (
                  <p className="mt-3 font-mono text-[9px] uppercase tracking-[0.25em] text-ink-soft">
                    Portrait coming soon
                  </p>
                ) : null}

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

                {person.contactEmail ? (
                  <a
                    href={`mailto:${person.contactEmail}`}
                    className="mt-4 flex min-h-11 items-center gap-2.5 text-sm font-medium text-graphite transition-colors hover:text-electric"
                  >
                    <Mail className="size-4 shrink-0 text-ink-soft" aria-hidden="true" />
                    <span className="break-all">{person.contactEmail}</span>
                  </a>
                ) : null}

                {person.location ? (
                  <p className="mt-2 flex min-h-11 items-center gap-2.5 text-sm text-ink-soft">
                    <MapPin className="size-4 shrink-0" aria-hidden="true" />
                    {person.location}
                  </p>
                ) : null}
              </div>
            </Reveal>
          </div>
        </aside>

        {/* Right column — identity, booking CTA, and profile sections. */}
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
            <p className="mt-2 text-lg text-ink-soft">{positionLine}</p>

            {person.isFounder ? (
              <div className="mt-7 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => setBookingOpen(true)}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-graphite px-7 py-3.5 text-sm font-medium text-warmwhite transition-colors hover:bg-[#23262D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-warmwhite"
                >
                  <CalendarDays className="size-4" aria-hidden="true" />
                  Schedule a Meeting
                </button>
                <Link
                  to="/contact"
                  className="inline-flex min-h-11 items-center justify-center rounded-full border border-hairline bg-white px-6 py-3 text-sm font-medium text-graphite transition-colors hover:border-graphite focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-warmwhite"
                >
                  Get in Touch
                </Link>
              </div>
            ) : (
              <div className="mt-7">
                <Link
                  to="/contact"
                  className="inline-flex min-h-11 items-center justify-center rounded-full bg-graphite px-6 py-3 text-sm font-medium text-warmwhite transition-colors hover:bg-[#23262D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-warmwhite"
                >
                  Get in Touch
                </Link>
              </div>
            )}
          </Reveal>

          {biographyParagraphs.length > 0 || person.responsibilities || person.expertise.length > 0 ? (
            <div className="my-8 border-t border-hairline" />
          ) : null}

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
                  Role &amp; Responsibilities
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
                  Areas of Expertise
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
                to="/people"
                className="inline-flex min-h-11 items-center font-mono text-[11px] uppercase tracking-[0.22em] text-ink-soft transition-colors hover:text-graphite"
              >
                <span aria-hidden="true" className="mr-2">←</span>
                All people
              </Link>
            </div>
          </Reveal>
        </div>
      </div>

      {person.isFounder ? (
        <BookingModal
          open={bookingOpen}
          onOpenChange={setBookingOpen}
          founder={{
            name: person.name,
            slug: person.slug,
            position: person.position,
            positionAbbr: person.positionAbbr,
          }}
        />
      ) : null}
    </div>
  );
}

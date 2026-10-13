"use client";

import Image from "next/image";
import { useApi } from "@/hooks/use-api";
import type { Person } from "@/lib/types";
import { Link } from "@/lib/router";
import { cn } from "@/lib/utils";
import { PageHeader } from "../page-header";
import { Section } from "../section";
import { Reveal } from "../reveal";
import { EmptyState, ErrorState, LoadingState } from "../states";
import { FounderCard, initialsOf } from "../founder-card";

/*
 * `initialsOf` now lives in founder-card.tsx (next to the monogram tiles that
 * use it) and is re-exported here because article-detail.tsx and
 * person-detail.tsx import it from "./people".
 */
export { initialsOf } from "../founder-card";

/**
 * Portrait square: photo when available, otherwise a graphite-gradient tile
 * with the person's initials.
 */
export function Portrait({
  person,
  size,
  className,
}: {
  person: Person;
  size: 56 | 64 | 320;
  className?: string;
}) {
  const dimension =
    size === 320
      ? "aspect-square w-full"
      : size === 64
        ? "size-16"
        : "size-14";
  const textClass =
    size === 320
      ? "text-4xl"
      : size === 64
        ? "text-lg"
        : "text-base";

  return (
    <div
      className={cn(
        "relative shrink-0 overflow-hidden rounded-xl bg-[linear-gradient(135deg,#15171B,#333A4A)]",
        dimension,
        className
      )}
      aria-hidden={person.portrait ? undefined : "true"}
    >
      {person.portrait ? (
        <Image
          src={person.portrait.url}
          alt={person.portrait.altText ?? person.name}
          fill
          sizes={size === 320 ? "(min-width:320px) 320px" : `${size}px`}
          className="object-cover"
          unoptimized={person.portrait.mimeType === "image/svg+xml"}
        />
      ) : (
        <span
          className={cn(
            "flex h-full w-full items-center justify-center font-semibold text-warmwhite",
            textClass
          )}
        >
          {initialsOf(person.name)}
        </span>
      )}
    </div>
  );
}

export default function PeoplePage() {
  const { data, loading, error, refresh } = useApi<Person[]>(
    "/api/public/people"
  );

  const people = data ?? [];
  const founders = people.filter((person) => person.isFounder);
  const team = people.filter((person) => !person.isFounder);

  return (
    <>
      <PageHeader
        eyebrow="03 / PEOPLE"
        title="The People Behind ETARNITY."
        lede="A small founding team — presented honestly, because that's what early-stage companies look like."
      />

      {loading && people.length === 0 ? (
        <section className="container-site py-20 md:py-28">
          <LoadingState label="Loading the team" />
        </section>
      ) : error && people.length === 0 ? (
        <section className="container-site py-20 md:py-28">
          <ErrorState
            message="The team directory could not be loaded."
            onRetry={refresh}
          />
        </section>
      ) : people.length === 0 ? (
        <Section className="py-14 md:py-20">
          <EmptyState
            title="A small founding team operates ETARNITY."
            description="Individual profiles are published with each person's consent. Reach us via the contact page."
          />
        </Section>
      ) : (
        <>
          {founders.length > 0 ? (
            <Section eyebrow="Leadership" title="Founders." className="py-14 md:py-20">
              {/*
               * Two editorial 3:4 portrait cards per row on md+ — with five
               * founders the fifth naturally sits alone, aligned left. On
               * mobile the single column is capped at ~420px and centered so
               * the tall cards don't dominate the page.
               */}
              <div className="grid gap-6 md:grid-cols-2">
                {founders.map((person, index) => (
                  <Reveal
                    key={person.id}
                    delay={index * 0.06}
                    className="mx-auto w-full max-w-[420px] md:max-w-none"
                  >
                    <FounderCard person={person} />
                  </Reveal>
                ))}
              </div>
            </Section>
          ) : null}

          {team.length > 0 ? (
            <Section
              eyebrow="The Team"
              title="Specialists & Builders."
              bordered
              className="py-14 md:py-20"
            >
              <Reveal>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {team.map((person) => (
                    <Link
                      key={person.id}
                      to={`/people/${person.slug}`}
                      className="group flex items-start gap-4 rounded-xl border border-hairline bg-white p-5 transition hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(21,23,27,0.07)]"
                    >
                      <Portrait person={person} size={56} />
                      <div className="min-w-0">
                        <h3 className="text-[15px] font-semibold text-graphite">
                          {person.name}
                        </h3>
                        {person.department ? (
                          <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.15em] text-ink-soft">
                            {person.department}
                          </p>
                        ) : (
                          <p className="mt-0.5 text-sm text-ink-soft">
                            {person.position}
                          </p>
                        )}
                        {person.biography ? (
                          <p className="mt-2 text-[13px] leading-relaxed text-ink-soft line-clamp-2">
                            {person.biography}
                          </p>
                        ) : null}
                        <p className="mt-3 text-xs font-medium text-electric opacity-70 transition group-hover:opacity-100">
                          View Profile →
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </Reveal>
            </Section>
          ) : null}
        </>
      )}

      <div className="container-site pb-20 md:pb-28">
        <p className="font-mono text-[10px] uppercase leading-relaxed tracking-[0.15em] text-ink-soft">
          We publish only real people with consent — no fictional team members.
        </p>
      </div>
    </>
  );
}

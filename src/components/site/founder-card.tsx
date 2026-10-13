"use client";

import Image from "next/image";
import { ArrowRight } from "lucide-react";
import type { Person } from "@/lib/types";
import { Link } from "@/lib/router";
import { cn } from "@/lib/utils";

/** Initials for monogram tiles — first letter of the first + last word. */
export function initialsOf(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "E";
  if (words.length === 1) return words[0].charAt(0).toUpperCase();
  return (
    words[0].charAt(0).toUpperCase() + words[words.length - 1].charAt(0).toUpperCase()
  );
}

/** First sentence of a longer text ("…" fragments keep their punctuation). */
function firstSentence(text: string): string {
  const match = text.match(/^[^.!?]*[.!?]/);
  return (match ? match[0] : text).trim();
}

/** "Chief Executive Officer · CEO" — abbreviation appended only when present. */
export function positionLineOf(person: Person): string {
  return person.positionAbbr
    ? `${person.position} · ${person.positionAbbr}`
    : person.position;
}

/**
 * Card intro copy: the curated `cardIntro` when present, otherwise the first
 * sentence of the biography, otherwise the first sentence of the
 * responsibilities. Never fabricated — null when the person has none of these.
 */
function cardIntroOf(person: Person): string | null {
  if (person.cardIntro && person.cardIntro.trim()) return person.cardIntro.trim();
  if (person.biography && person.biography.trim())
    return firstSentence(person.biography);
  if (person.responsibilities && person.responsibilities.trim())
    return firstSentence(person.responsibilities);
  return null;
}

/**
 * Founder card — strict 3:4 (width:height) editorial portrait card.
 *
 * The whole card is a single <Link> (one tab stop): photo area on top
 * (flex-1, absorbs the remaining height), a fixed info block, and a
 * persistent "VIEW PROFILE" cue row at the bottom that is always visible on
 * touch devices (Tailwind 4 gates hover: states behind @media (hover:hover),
 * so the opacity strengthening simply never sticks on touch).
 */
export function FounderCard({
  person,
  className,
}: {
  person: Person;
  className?: string;
}) {
  const intro = cardIntroOf(person);

  return (
    <Link
      to={`/people/${person.slug}`}
      className={cn(
        "group flex aspect-[3/4] w-full flex-col overflow-hidden rounded-xl border border-hairline bg-white",
        "transition duration-300 hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(21,23,27,0.07)]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-inset",
        className
      )}
    >
      {/* Photo area — portrait when available, monogram placeholder otherwise. */}
      <div className="relative min-h-0 flex-1 overflow-hidden bg-graphite">
        {person.portrait ? (
          <Image
            src={person.portrait.url}
            alt={person.portrait.altText ?? person.name}
            fill
            sizes="(max-width: 767px) 90vw, (min-width: 1440px) 660px, 46vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
            unoptimized={person.portrait.mimeType === "image/svg+xml"}
          />
        ) : (
          <>
            <div
              aria-hidden="true"
              className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-[linear-gradient(155deg,#23262D_0%,#15171B_52%,#101218_100%)] px-6 text-center"
            >
              <span className="text-5xl font-semibold tracking-[0.06em] text-warmwhite sm:text-6xl lg:text-7xl">
                {initialsOf(person.name)}
              </span>
              <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-warmwhite/60">
                Portrait coming soon
              </span>
            </div>
            <span className="sr-only">
              {person.name} — portrait placeholder
            </span>
          </>
        )}
      </div>

      {/* Info block */}
      <div className="shrink-0 border-t border-hairline p-5">
        <h3 className="text-[15px] font-semibold leading-snug text-graphite">
          {person.name}
        </h3>
        <p className="mt-1 text-[13px] text-ink-soft">
          {positionLineOf(person)}
        </p>
        {intro ? (
          <p className="mt-3 line-clamp-3 text-[13px] leading-relaxed text-ink-soft">
            {intro}
          </p>
        ) : null}
      </div>

      {/* Persistent cue — subtle at rest (visible without hover), strengthens
       * on hover / keyboard focus. */}
      <div className="flex shrink-0 items-center gap-1.5 border-t border-hairline bg-warmwhite px-5 py-3">
        <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-electric opacity-70 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100">
          View Profile
        </span>
        <ArrowRight
          className="size-3.5 shrink-0 text-electric opacity-70 transition duration-300 group-hover:translate-x-0.5 group-hover:opacity-100 group-focus-visible:translate-x-0.5 group-focus-visible:opacity-100"
          aria-hidden="true"
        />
      </div>
    </Link>
  );
}

export default FounderCard;

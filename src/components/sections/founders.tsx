"use client";

/**
 * ETARNITY — founders.
 * "The people behind ETARNITY." Two horizontal editorial cards. Portraits are
 * honest typographic monogram placeholders — there is no real founder
 * photography, so none is faked. Desktop hover is a calm interplay: the
 * selected card lifts slightly and gains a soft accent panel, the sibling
 * recedes, the portrait drifts. Premium and quiet.
 */

import { Linkedin } from "lucide-react";
import { founders } from "@/content/site";
import {
  Reveal,
  SectionHeading,
  SectionShell,
} from "@/components/etarnity/primitives";
import { cn } from "@/lib/utils";

/**
 * "Ayaan Rahman" → "AR". Initials of the first and last name, rendered as the
 * typographic portrait placeholder.
 */
function monogram(name: string): string {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.charAt(0) ?? "";
  const last = parts.length > 1 ? (parts[parts.length - 1] ?? "").charAt(0) : "";
  return (first + last).toUpperCase();
}

export function Founders() {
  return (
    <SectionShell
      id="founders"
      ariaLabel="Founders — the people behind ETARNITY"
      alt
    >
      <SectionHeading
        index="14"
        kicker="Founders"
        title={
          <>
            The people behind{" "}
            <span className="text-accent-deep">ETARNITY</span>.
          </>
        }
      />

      <div className="founder-row grid grid-cols-1 gap-4 lg:grid-cols-2">
        {founders.map((founder, i) => (
          <Reveal
            key={founder.name}
            as="article"
            delay={0.08 + i * 0.1}
            className={cn(
              "group/card card-quiet relative flex flex-col gap-6 overflow-hidden rounded-[28px] p-6 shadow-ambient sm:flex-row sm:gap-8 md:p-8",
              "transition-[transform,box-shadow,opacity] duration-500 ease-out",
              /* Calm hover interplay (desktop only): the selected card lifts,
                 the sibling recedes — a single deterministic rule, no cascade
                 fights. */
              "lg:hover:scale-[1.015] lg:hover:shadow-ambient-lg",
              "lg:[.founder-row:hover_&:not(:hover)]:opacity-75"
            )}
          >
            {/* Soft accent panel — appears quietly behind the content on hover */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-accent-soft/40 opacity-0 transition-opacity duration-500 lg:group-hover/card:opacity-100"
            />

            {/* PORTRAIT — honest typographic placeholder (no photography yet) */}
            <div
              role="img"
              aria-label={`Portrait placeholder for ${founder.name}`}
              className="relative mx-auto aspect-[4/5] w-28 shrink-0 overflow-hidden rounded-[18px] border border-accent/20 sm:mx-0 sm:w-32 md:w-36"
            >
              <div aria-hidden="true" className="absolute inset-0 bg-accent-soft/50" />
              {/* Subtle radial lavender tint over the wash */}
              <div aria-hidden="true" className="absolute inset-0 glow-deep" />
              <div className="relative flex h-full flex-col items-center justify-center transition-transform duration-500 group-hover/card:-translate-y-1">
                <span className="font-display text-5xl font-light text-accent-deep">
                  {monogram(founder.name)}
                </span>
              </div>
              <span
                aria-hidden="true"
                className="label-mono absolute bottom-3 left-1/2 -translate-x-1/2 text-accent-deep/50"
              >
                Portrait
              </span>
            </div>

            {/* BODY */}
            <div className="relative flex min-w-0 flex-1 flex-col">
              <h3 className="font-display text-2xl font-normal tracking-[-0.01em] text-foreground">
                {founder.name}
              </h3>
              <p className="label-mono mt-2 text-accent-deep">{founder.role}</p>

              <ul
                className="mt-4 flex flex-wrap gap-2"
                aria-label={`${founder.name} — areas of focus`}
              >
                {founder.focus.map((focus) => (
                  <li
                    key={focus}
                    className="label-mono rounded-full border border-border px-3 py-1 text-muted-foreground"
                  >
                    {focus}
                  </li>
                ))}
              </ul>

              <p className="mt-5 text-[14px] leading-relaxed text-muted-foreground">
                {founder.bio}
              </p>

              <blockquote className="mt-5 border-l-2 border-accent/50 pl-4">
                <p className="text-[15px] font-light leading-relaxed text-foreground/85">
                  &ldquo;{founder.quote}&rdquo;
                </p>
              </blockquote>

              {/* Professional link — only when it actually exists */}
              {founder.linkedin ? (
                <a
                  href={founder.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`${founder.name} on LinkedIn`}
                  className="mt-6 inline-flex w-fit items-center gap-2 text-[13px] font-medium text-accent-deep transition-colors hover:text-foreground"
                >
                  <Linkedin
                    className="h-3.5 w-3.5"
                    strokeWidth={1.5}
                    aria-hidden="true"
                  />
                  LinkedIn
                </a>
              ) : null}
            </div>
          </Reveal>
        ))}
      </div>
    </SectionShell>
  );
}

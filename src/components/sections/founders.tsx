"use client";

import { Linkedin } from "lucide-react";
import { founders, type Founder } from "@/content/site";
import {
  Reveal,
  SectionHeading,
  SectionShell,
} from "@/components/primitives/corporate";

/**
 * Founders — the two people behind ETARNITY.
 * Portraits are honest typographic monogram placeholders (real
 * photography comes later); every person detail is imported from the
 * content module — nothing is invented here.
 */

/** Two-letter monogram derived from a full name ("Ayaan Rahman" → "AR"). */
function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.charAt(0) ?? "";
  const last =
    parts.length > 1 ? parts[parts.length - 1]?.charAt(0) ?? "" : "";
  return `${first}${last}`.toUpperCase();
}

function FounderPanel({ founder }: { founder: Founder }) {
  const initials = initialsOf(founder.name);

  return (
    <>
      {/* Portrait placeholder — typographic, honest, awaiting real photography */}
      <div
        role="img"
        aria-label={`Portrait placeholder for ${founder.name}`}
        className="flex aspect-[4/5] w-full shrink-0 items-center justify-center rounded-sm border border-border/70 bg-[radial-gradient(ellipse_at_30%_20%,var(--glow-faint),transparent_60%)] bg-card/40 md:w-[220px]"
      >
        <div aria-hidden="true" className="flex flex-col items-center gap-3">
          <span className="font-editorial font-light text-6xl text-emerald-corp">
            {initials}
          </span>
          <span className="font-mono text-[9px] uppercase tracking-[0.24em] text-muted-foreground/70">
            Portrait
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="flex min-w-0 flex-1 flex-col">
        <h3 className="text-2xl font-medium tracking-tight text-ivory md:text-[1.7rem]">
          {founder.name}
        </h3>
        <p className="label-mono mt-1.5 text-emerald-corp">{founder.role}</p>

        <ul className="mt-4 flex flex-wrap gap-2" aria-label="Focus areas">
          {founder.focus.map((focus) => (
            <li
              key={focus}
              className="rounded-full border border-border px-3 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground"
            >
              {focus}
            </li>
          ))}
        </ul>

        <p className="mt-5 text-[13.5px] leading-relaxed text-muted-foreground">
          {founder.bio}
        </p>

        <blockquote className="mt-6 border-l-2 border-emerald-corp/60 pl-4 font-editorial text-[15px] italic leading-relaxed text-ivory/90">
          &ldquo;{founder.quote}&rdquo;
        </blockquote>

        {founder.linkedin && (
          <a
            href={founder.linkedin}
            target="_blank"
            rel="noreferrer noopener"
            className="mt-6 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-emerald-corp"
          >
            <Linkedin className="h-4 w-4" aria-hidden="true" />
            LinkedIn
          </a>
        )}
      </div>
    </>
  );
}

export function Founders() {
  return (
    <SectionShell
      id="founders"
      ariaLabel="The people behind ETARNITY"
      className="bg-background"
    >
      <div className="py-20 md:py-28">
        <SectionHeading
          index="08"
          kicker="Founders"
          title="The people behind ETARNITY."
          lead="ETARNITY is led by its founders — two people who set the company's direction, its standards and its long-term ambition."
        />

        <div className="mt-12 grid gap-4 md:mt-16 lg:grid-cols-2">
          {founders.map((founder, i) => (
            <Reveal
              key={founder.name}
              blur
              delay={i * 0.14}
              distance={24}
              duration={1.05}
              className="flex flex-col gap-7 rounded-sm border border-border/60 p-6 transition-colors duration-500 hover:border-emerald-corp/40 hover:bg-card/30 md:flex-row md:gap-9 md:p-8"
            >
              <FounderPanel founder={founder} />
            </Reveal>
          ))}
        </div>
      </div>
    </SectionShell>
  );
}

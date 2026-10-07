"use client";

import { ArrowUpRight } from "lucide-react";
import { careers } from "@/content/site";
import {
  Reveal,
  SectionHeading,
  SectionShell,
  Stagger,
  StaggerItem,
} from "@/components/primitives/corporate";

/**
 * Careers — honest by design: no invented openings. While openRoles is
 * empty we show the real empty state; the process section explains how
 * we hire either way. When roles exist, they render as quiet rows.
 */
export function Careers() {
  const hasOpenRoles = careers.openRoles.length > 0;

  return (
    <SectionShell
      id="careers"
      ariaLabel="Careers at ETARNITY"
      className="bg-background"
    >
      <div className="py-20 md:py-28">
        <SectionHeading
          index={careers.index}
          kicker={careers.kicker}
          title={careers.title}
          lead={careers.lead}
          serifTitle
        />

        <Reveal delay={0.1} className="mt-12 md:mt-14">
          {hasOpenRoles ? (
            <ul className="overflow-hidden rounded-sm border border-border/60">
              {careers.openRoles.map((role) => (
                <li
                  key={role.title}
                  className="group grid items-baseline gap-2 border-t border-border/60 p-5 transition-colors first:border-t-0 hover:bg-card/40 sm:grid-cols-12 md:p-6"
                >
                  <h3 className="text-[15px] font-medium text-ivory transition-colors group-hover:text-emerald-corp sm:col-span-5">
                    {role.title}
                  </h3>
                  <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground sm:col-span-7">
                    {role.team} · {role.type} · {role.location}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <div className="rounded-sm border border-dashed border-border/70 p-8 text-center md:p-10">
              <p className="label-mono">Open roles</p>
              <h3 className="text-xl font-medium text-ivory">
                {careers.emptyState.title}
              </h3>
              <p className="mx-auto mt-3 max-w-md text-[13.5px] leading-relaxed text-muted-foreground">
                {careers.emptyState.body}
              </p>
              <a
                href={careers.emptyState.cta.href}
                className="mt-7 inline-flex h-11 items-center gap-2.5 rounded-sm border border-emerald-corp/40 bg-emerald-corp/10 px-5 text-[13.5px] font-semibold text-emerald-corp transition-colors hover:bg-emerald-corp/20"
              >
                {careers.emptyState.cta.label}
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </a>
            </div>
          )}
        </Reveal>

        {/* How we hire */}
        <div className="mt-14 md:mt-16">
          <Reveal>
            <p className="label-mono text-champagne">How we hire</p>
          </Reveal>

          <Stagger className="mt-8 grid gap-6 md:grid-cols-3 md:gap-8">
            {careers.process.map((step) => (
              <StaggerItem
                key={step.step}
                className="border-t border-border/60 pt-5"
              >
                <p className="font-mono text-[11px] tracking-[0.22em] text-champagne">
                  {step.step}
                </p>
                <h3 className="mt-2 text-[15px] font-medium text-ivory">
                  {step.title}
                </h3>
                <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
                  {step.body}
                </p>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </div>
    </SectionShell>
  );
}

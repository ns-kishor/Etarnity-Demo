"use client";

/**
 * ETARNITY — people & culture.
 * How we work (values), how the organization is shaped (a quiet system map of
 * areas), and how we hire (the careers block folded in — footer "Careers"
 * links target #people). Restrained and honest: no open roles means an honest
 * empty state, not invented headcounts.
 */

import { ArrowRight, ArrowUpRight } from "lucide-react";
import { careers, people } from "@/content/site";
import {
  Pill,
  Reveal,
  SectionHeading,
  SectionShell,
  Stagger,
  StaggerItem,
} from "@/components/etarnity/primitives";
import { scrollToHash } from "@/components/providers/smooth-scroll-provider";


export function People() {
  return (
    <SectionShell id="people" ariaLabel="People, culture and careers at ETARNITY">
      <SectionHeading
        index={people.index}
        kicker={people.kicker}
        title={people.title}
        lead={people.lead}
      />

      {/* A — HOW WE WORK */}
      <Reveal>
        <p className="label-mono text-accent-deep">How we work</p>
      </Reveal>
      <Stagger
        as="ul"
        className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
        aria-label="How we work — our values"
      >
        {people.values.map((value) => (
          <StaggerItem
            as="li"
            key={value.title}
            className="card-quiet rounded-[20px] p-5 transition-[border-color,box-shadow] duration-300 hover:border-accent/40 hover:shadow-ambient"
          >
            <h3 className="text-[15px] font-medium tracking-tight text-foreground">
              {value.title}
            </h3>
            <p className="mt-2 text-[13.5px] leading-relaxed text-muted-foreground">
              {value.body}
            </p>
          </StaggerItem>
        ))}
      </Stagger>

      {/* B — THE ORGANIZATION */}
      <div className="mt-16 md:mt-24">
        <Reveal>
          <p className="label-mono text-accent-deep">The organization</p>
        </Reveal>
        <Stagger
          as="ul"
          className="mt-5 border-b border-border"
          aria-label="The organization — areas of the company"
        >
          {people.org.map((row) => (
            <StaggerItem
              as="li"
              key={row.area}
              className="group grid grid-cols-1 border-t border-border py-4 transition-colors duration-300 hover:bg-card/60 sm:grid-cols-12 sm:items-baseline"
            >
              <p className="text-[15px] font-medium tracking-tight text-foreground transition-colors duration-300 group-hover:text-accent-deep sm:col-span-4">
                {row.area}
              </p>
              <p className="mt-1.5 text-[13.5px] leading-relaxed text-muted-foreground sm:col-span-7 sm:mt-0">
                {row.scope}
              </p>
              <ArrowRight
                className="hidden h-3.5 w-3.5 text-accent/60 transition-transform duration-300 group-hover:translate-x-0.5 sm:col-span-1 sm:block sm:justify-self-end"
                strokeWidth={1.5}
                aria-hidden="true"
              />
            </StaggerItem>
          ))}
        </Stagger>
      </div>

      {/* C — CAREERS (folded into the people block) */}
      <div className="mt-16 md:mt-24">
        <Reveal>
          <p className="label-mono text-accent-deep">{careers.kicker}</p>
        </Reveal>
        <Reveal delay={0.06}>
          <h3 className="display-2 mt-5 max-w-xl text-foreground">
            {careers.title}
          </h3>
        </Reveal>
        {careers.lead && (
          <Reveal delay={0.12}>
            <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-muted-foreground">
              {careers.lead}
            </p>
          </Reveal>
        )}

        {/* Open roles — dormant branch: renders automatically once the
            content module carries real roles (today it is empty, honestly). */}
        {careers.openRoles.length > 0 ? (
          <ul className="mt-8 border-b border-border">
            {careers.openRoles.map((role) => (
              <li
                key={role.title}
                className="group grid grid-cols-1 gap-1 border-t border-border py-4 transition-colors duration-300 hover:bg-card/60 sm:grid-cols-12 sm:items-baseline"
              >
                <p className="text-[15px] font-medium tracking-tight text-foreground transition-colors duration-300 group-hover:text-accent-deep sm:col-span-5">
                  {role.title}
                </p>
                <p className="label-mono text-muted-foreground sm:col-span-3">
                  {role.team}
                </p>
                <p className="text-[13.5px] text-muted-foreground sm:col-span-2">
                  {role.type}
                </p>
                <p className="text-[13.5px] text-muted-foreground sm:col-span-2 sm:justify-self-end">
                  {role.location}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <Reveal delay={0.16} className="mt-8">
            <div className="rounded-[24px] border border-dashed border-border p-8 text-center md:p-10">
              <p className="label-mono text-muted-foreground">Open roles</p>
              <p className="mt-3 font-display text-xl font-normal tracking-tight text-foreground">
                {careers.emptyState.title}
              </p>
              <p className="mx-auto mt-3 max-w-md text-[14px] leading-relaxed text-muted-foreground">
                {careers.emptyState.body}
              </p>
              <div className="mt-7">
                <Pill
                  variant="outline"
                  onClick={() => scrollToHash(careers.emptyState.cta.href)}
                >
                  {careers.emptyState.cta.label}
                  <ArrowUpRight
                    className="h-4 w-4"
                    strokeWidth={1.5}
                    aria-hidden="true"
                  />
                </Pill>
              </div>
            </div>
          </Reveal>
        )}

        {/* HOW WE HIRE */}
        <div className="mt-14 md:mt-16">
          <Reveal>
            <p className="label-mono text-accent-deep">How we hire</p>
          </Reveal>
          <Stagger
            as="ol"
            className="mt-6 grid grid-cols-1 gap-x-8 md:grid-cols-3"
            aria-label="How we hire — the process"
          >
            {careers.process.map((step) => (
              <StaggerItem
                as="li"
                key={step.step}
                className="border-t border-border pt-5"
              >
                <p className="label-mono tabular-nums text-accent-deep">
                  {step.step}
                </p>
                <p className="mt-3 text-[15px] font-medium tracking-tight text-foreground">
                  {step.title}
                </p>
                <p className="mt-2 text-[13.5px] leading-relaxed text-muted-foreground">
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

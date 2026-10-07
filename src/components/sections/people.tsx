"use client";

import { ArrowRight } from "lucide-react";
import { people } from "@/content/site";
import {
  Reveal,
  SectionHeading,
  SectionShell,
  Stagger,
  StaggerItem,
} from "@/components/primitives/corporate";

/**
 * People & culture — how we work (values) and the organization
 * (a deliberately small system map). No stock photography, no fake
 * team photos: structure only, honest by design.
 */
export function People() {
  return (
    <SectionShell
      id="people"
      ariaLabel="People and culture"
      className="bg-background"
    >
      <div className="py-20 md:py-28">
        <SectionHeading
          index={people.index}
          kicker={people.kicker}
          title={people.title}
          lead={people.lead}
          serifTitle
        />

        {/* A — How we work */}
        <div className="mt-14 md:mt-16">
          <Reveal>
            <p className="label-mono text-champagne">How we work</p>
          </Reveal>

          <Stagger className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {people.values.map((value) => (
              <StaggerItem
                key={value.title}
                className="rounded-sm border border-border/60 p-5 transition-colors duration-500 hover:border-emerald-corp/40 hover:bg-card/40"
              >
                <h3 className="text-[14.5px] font-medium text-ivory">
                  {value.title}
                </h3>
                <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
                  {value.body}
                </p>
              </StaggerItem>
            ))}
          </Stagger>
        </div>

        {/* B — The organization */}
        <div className="mt-14 md:mt-16">
          <Reveal>
            <p className="label-mono text-champagne">The organization</p>
          </Reveal>
          <Reveal delay={0.08}>
            <p className="mt-5 text-[13.5px] text-muted-foreground">
              A deliberately small structure — senior people, clear areas,
              real ownership.
            </p>
          </Reveal>

          <Stagger className="mt-8">
            {people.org.map((row) => (
              <StaggerItem
                key={row.area}
                className="group grid items-baseline gap-2 border-t border-border/60 py-4 transition-colors hover:bg-card/40 sm:grid-cols-12"
              >
                <h3 className="text-[15px] font-medium text-ivory transition-colors group-hover:text-emerald-corp sm:col-span-4">
                  {row.area}
                </h3>
                <p className="text-[13px] text-muted-foreground sm:col-span-7">
                  {row.scope}
                </p>
                <ArrowRight
                  aria-hidden="true"
                  className="hidden h-3.5 w-3.5 text-emerald-corp/60 sm:col-span-1 sm:block sm:justify-self-end sm:self-center"
                />
              </StaggerItem>
            ))}
          </Stagger>
          <div aria-hidden="true" className="border-b border-border/60" />
        </div>
      </div>
    </SectionShell>
  );
}

"use client";

import { whoWeAre } from "@/content/site";
import {
  Reveal,
  SectionHeading,
  SectionShell,
} from "@/components/primitives/corporate";
import { cn } from "@/lib/utils";

/**
 * Who we are — the corporate profile.
 *
 * Editorial two-part layout: the profile paragraphs carry the
 * argument on the left; the four pillars sit as a numbered index
 * on the right, separated by a vertical hairline. Deliberately
 * quiet — this is the section a serious reader actually reads.
 */
export function WhoWeAre() {
  return (
    <SectionShell
      id="company"
      ariaLabel="Who we are"
      className="bg-background"
    >
      <div className="py-20 md:py-28">
        <SectionHeading
          index={whoWeAre.index}
          kicker={whoWeAre.kicker}
          title={whoWeAre.title}
        />

        <div className="mt-12 grid gap-12 md:mt-16 lg:grid-cols-12 lg:gap-0">
          {/* Profile — the argument in three movements */}
          <div className="lg:col-span-7 lg:pr-14">
            {whoWeAre.paragraphs.map((paragraph, i) => (
              <Reveal
                key={paragraph.slice(0, 32)}
                delay={0.1 + i * 0.1}
                distance={i === 0 ? 24 : 18}
              >
                <p
                  className={cn(
                    "text-pretty leading-relaxed",
                    i === 0
                      ? "text-xl font-light text-ivory/90 md:text-2xl"
                      : "mt-8 text-[15px] text-muted-foreground"
                  )}
                >
                  {paragraph}
                </p>
              </Reveal>
            ))}
          </div>

          {/* The four pillars — numbered editorial index */}
          <div className="lg:col-span-5 lg:rule-left lg:pl-10">
            <ul>
              {whoWeAre.pillars.map((pillar, i) => (
                <Reveal
                  as="li"
                  key={pillar.id}
                  delay={0.18 + i * 0.08}
                  distance={16}
                  className="border-t border-border/60 py-6"
                >
                  <div className="flex items-baseline gap-4">
                    <span className="font-mono text-[11px] tracking-[0.22em] text-champagne/80">
                      {pillar.id}
                    </span>
                    <h3 className="text-[15px] font-medium text-ivory">
                      {pillar.title}
                    </h3>
                  </div>
                  <p className="mt-2 text-[13.5px] leading-relaxed text-muted-foreground">
                    {pillar.body}
                  </p>
                </Reveal>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </SectionShell>
  );
}

"use client";

/**
 * ETARNITY — impact.
 * Trust through direction, not numbers: six commitments as an editorial
 * two-column ledger (no uniform card grid), closing on the company's
 * standard — "we will publish numbers when they are real."
 */

import {
  Building2,
  Compass,
  Network,
  ShieldCheck,
  Sprout,
  Users,
} from "lucide-react";
import { impact } from "@/content/site";
import {
  Reveal,
  SectionHeading,
  SectionShell,
  Stagger,
  StaggerItem,
} from "@/components/etarnity/primitives";

const ICON_CLASSES =
  "mt-1 h-4 w-4 shrink-0 text-accent" as const;

/**
 * Icon per impact area, rendered through a module-scope switch — every icon
 * is a static reference, no component is ever created during render.
 */
function AreaIcon({ title }: { title: string }) {
  switch (title) {
    case "For businesses":
      return <Building2 className={ICON_CLASSES} strokeWidth={1.5} aria-hidden="true" />;
    case "For people":
      return <Users className={ICON_CLASSES} strokeWidth={1.5} aria-hidden="true" />;
    case "For the craft":
      return <Compass className={ICON_CLASSES} strokeWidth={1.5} aria-hidden="true" />;
    case "For the ecosystem":
      return <Network className={ICON_CLASSES} strokeWidth={1.5} aria-hidden="true" />;
    case "For security":
      return <ShieldCheck className={ICON_CLASSES} strokeWidth={1.5} aria-hidden="true" />;
    case "For what's next":
      return <Sprout className={ICON_CLASSES} strokeWidth={1.5} aria-hidden="true" />;
    default:
      return null;
  }
}

export function Impact() {
  return (
    <SectionShell id="impact" ariaLabel="Impact" alt>
      <SectionHeading
        index={impact.index}
        kicker={impact.kicker}
        title={impact.title}
        lead={impact.lead}
      />

      <Stagger
        as="ul"
        stagger={0.06}
        className="grid grid-cols-1 gap-x-12 md:grid-cols-2"
        aria-label="The impact we want to create — our commitments"
      >
        {impact.areas.map((area) => (
          <StaggerItem
            as="li"
            key={area.title}
            className="flex gap-4 border-t border-border py-6"
          >
            <AreaIcon title={area.title} />
            <div>
              <h3 className="text-[15px] font-medium tracking-tight text-foreground">
                {area.title}
              </h3>
              <p className="mt-1.5 text-[13.5px] leading-relaxed text-muted-foreground">
                {area.body}
              </p>
            </div>
          </StaggerItem>
        ))}
      </Stagger>

      {/* Closing statement — the standard we hold ourselves to */}
      <Reveal className="mt-4 border-t border-border pt-8">
        <p className="label-mono text-accent-deep">Our standard</p>
        <p className="mt-4 max-w-lg text-[14.5px] leading-relaxed text-muted-foreground">
          {impact.closing}
        </p>
      </Reveal>
    </SectionShell>
  );
}

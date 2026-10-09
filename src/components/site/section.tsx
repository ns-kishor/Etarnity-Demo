import * as React from "react";
import { cn } from "@/lib/utils";

export interface SectionProps {
  eyebrow?: string;
  title?: string;
  lede?: string;
  dark?: boolean;
  /** Render a full-width hairline separator above the section. */
  bordered?: boolean;
  id?: string;
  className?: string;
  children?: React.ReactNode;
}

/**
 * Editorial section scaffold: full-width section (py-20 md:py-28) with an
 * inner `.container-site`. Optional hairline separator, optional dark
 * (graphite) treatment, and an asymmetric header row — title left, lede
 * right-aligned (max-w-sm) on large screens.
 */
export function Section({
  eyebrow,
  title,
  lede,
  dark = false,
  bordered = false,
  id,
  className,
  children,
}: SectionProps) {
  const hasHeader = Boolean(eyebrow || title || lede);

  return (
    <section
      id={id}
      className={cn(
        "py-20 md:py-28",
        bordered && "border-t border-hairline",
        dark && "bg-graphite text-warmwhite",
        className
      )}
    >
      <div className="container-site">
        {hasHeader && (
          <div className="mb-12 md:mb-16">
            {eyebrow ? (
              <p
                className={cn(
                  "font-mono text-[11px] uppercase tracking-[0.22em]",
                  dark ? "text-periwinkle" : "text-electric"
                )}
              >
                {eyebrow}
              </p>
            ) : null}
            <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              {title ? (
                <h2
                  className={cn(
                    "text-3xl font-semibold leading-[1.1] tracking-[-0.02em] md:text-[2.75rem]",
                    dark ? "text-warmwhite" : "text-graphite"
                  )}
                >
                  {title}
                </h2>
              ) : null}
              {lede ? (
                <p
                  className={cn(
                    "max-w-2xl text-base leading-relaxed md:text-lg lg:max-w-sm lg:text-right",
                    dark ? "text-ink-dark-soft" : "text-ink-soft"
                  )}
                >
                  {lede}
                </p>
              ) : null}
            </div>
          </div>
        )}
        {children}
      </div>
    </section>
  );
}

export default Section;

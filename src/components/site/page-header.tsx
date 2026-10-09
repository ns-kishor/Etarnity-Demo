"use client";

import * as React from "react";
import { Reveal } from "./reveal";
import { Link } from "@/lib/router";
import { cn } from "@/lib/utils";

export interface PageHeaderProps {
  eyebrow: string;
  title: string;
  lede?: string;
  backTo?: { to: string; label: string };
  className?: string;
}

/** Inner-page header: mono eyebrow, display h1, optional lede + back link. */
export function PageHeader({
  eyebrow,
  title,
  lede,
  backTo,
  className,
}: PageHeaderProps) {
  return (
    <header className={cn("border-b border-hairline", className)}>
      <div className="container-site pb-14 pt-28 md:pb-20 md:pt-36">
        {backTo ? (
          <Reveal>
            <Link
              to={backTo.to}
              className="inline-flex min-h-11 items-center gap-2 font-mono text-[11px] uppercase tracking-[0.22em] text-ink-soft transition-colors hover:text-graphite"
            >
              <span aria-hidden="true">←</span>
              {backTo.label}
            </Link>
          </Reveal>
        ) : null}
        <Reveal delay={backTo ? 0.1 : 0.05}>
          <p
            className={cn(
              "font-mono text-[11px] uppercase tracking-[0.22em] text-electric",
              backTo && "mt-8"
            )}
          >
            {eyebrow}
          </p>
        </Reveal>
        <Reveal delay={backTo ? 0.15 : 0.1}>
          <h1 className="mt-5 text-4xl font-semibold leading-[1.04] tracking-[-0.03em] text-graphite sm:text-5xl lg:text-[3.5rem]">
            {title}
          </h1>
        </Reveal>
        {lede ? (
          <Reveal delay={backTo ? 0.2 : 0.15}>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-soft">
              {lede}
            </p>
          </Reveal>
        ) : null}
      </div>
    </header>
  );
}

export default PageHeader;

"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/* MachinaFusion shared primitives — the design language every section */
/* is built from: floating white cards, pill controls, dark frosted    */
/* panels, ambient shadows, oversized display type, mono micro-tags.   */
/* ------------------------------------------------------------------ */

/** Geometric brand mark — currentColor strokes + neon node. */
export function LogoMark({ className, ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 64 64" fill="none" aria-hidden="true" className={className} {...props}>
      <ellipse
        cx="32" cy="34" rx="27" ry="10.5"
        transform="rotate(-16 32 34)"
        stroke="currentColor" strokeOpacity={0.45} strokeWidth={2.4}
      />
      <path
        d="M13 46V18l19 17 19-17v28"
        stroke="currentColor" strokeWidth={5.2}
        strokeLinecap="round" strokeLinejoin="round"
      />
      <circle cx="53.5" cy="25" r="4" className="fill-[var(--accent)]" />
    </svg>
  );
}

/** Standard section wrapper — consistent vertical rhythm + anchor id. */
export function MfSection({
  id,
  children,
  className,
  ariaLabel,
}: {
  id: string;
  children: React.ReactNode;
  className?: string;
  ariaLabel?: string;
}) {
  return (
    <section
      id={id}
      aria-label={ariaLabel}
      className={cn("relative w-full overflow-x-clip", className)}
    >
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-20 md:py-28">
        {children}
      </div>
    </section>
  );
}

/** Kicker row — mono index tag + uppercase label + hairline. */
export function Kicker({
  index,
  label,
  className,
}: {
  index?: string;
  label: string;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-4", className)}>
      {index && (
        <span className="label-tag text-muted-foreground">{index}</span>
      )}
      <span className="label-tag text-[var(--accent)]">{label}</span>
      <span className="h-px flex-1 bg-border" aria-hidden="true" />
    </div>
  );
}

/** Section display heading. */
export function SectionTitle({
  children,
  className,
  as: Tag = "h2",
}: {
  children: React.ReactNode;
  className?: string;
  as?: "h1" | "h2" | "h3";
}) {
  return (
    <Tag className={cn("display-section text-foreground text-balance", className)}>
      {children}
    </Tag>
  );
}

/** Scroll-into-view reveal (degrades to no motion). */
export function Reveal({
  children,
  className,
  delay = 0,
  y = 28,
  blur = true,
  once = true,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  blur?: boolean;
  once?: boolean;
}) {
  const reduce = useReducedMotion();
  if (reduce) {
    return <div className={className}>{children}</div>;
  }
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y, filter: blur ? "blur(8px)" : undefined }}
      whileInView={{ opacity: 1, y: 0, filter: blur ? "blur(0px)" : undefined }}
      viewport={{ once, margin: "-80px" }}
      transition={{ duration: 0.9, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

/** Floating white card — the core container primitive. */
export function FloatCard({
  children,
  className,
  hover = false,
}: {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-[28px] bg-card border border-border shadow-ambient",
        hover &&
          "transition-all duration-500 ease-out hover:shadow-ambient-lg hover:-translate-y-1",
        className
      )}
    >
      {children}
    </div>
  );
}

/** Pill button / chip. */
export function Pill({
  children,
  className,
  as: Tag = "span",
  ...props
}: React.HTMLAttributes<HTMLElement> & { as?: "span" | "a" | "button" }) {
  return (
    <Tag
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors",
        className
      )}
      {...(props as React.HTMLAttributes<HTMLSpanElement>)}
    >
      {children}
    </Tag>
  );
}

/** Mono data label used across metrics/coordinates. */
export function MonoLabel({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <span className={cn("label-tag", className)}>{children}</span>;
}

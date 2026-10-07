"use client";

import * as React from "react";
import {
  motion,
  useInView,
  useReducedMotion,
  type Variants,
} from "framer-motion";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  Reveal — the single scroll-reveal language of the site.            */
/*  Subtle, cinematic, consistent. Never generic fade-everywhere.      */
/* ------------------------------------------------------------------ */

const easeOut = [0.21, 0.47, 0.32, 0.98] as const;

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  /** Animation direction */
  direction?: "up" | "down" | "left" | "right" | "none";
  /** Distance in px — small, deliberate movement only */
  distance?: number;
  delay?: number;
  duration?: number;
  /** Soft blur-in for editorial moments */
  blur?: boolean;
  once?: boolean;
  as?: "div" | "section" | "article" | "li" | "span";
}

export function Reveal({
  children,
  className,
  direction = "up",
  distance = 28,
  delay = 0,
  duration = 0.9,
  blur = false,
  once = true,
  as = "div",
}: RevealProps) {
  const reduce = useReducedMotion();
  const Comp = motion[as];

  const offset = reduce ? { x: 0, y: 0 } : getOffset(direction, distance);

  return (
    <Comp
      className={className}
      initial={{
        opacity: 0,
        x: offset.x,
        y: offset.y,
        filter: blur && !reduce ? "blur(10px)" : "blur(0px)",
      }}
      whileInView={{
        opacity: 1,
        x: 0,
        y: 0,
        filter: "blur(0px)",
      }}
      viewport={{ once, margin: "-12% 0px -12% 0px" }}
      transition={{ duration, delay, ease: easeOut }}
    >
      {children}
    </Comp>
  );
}

function getOffset(direction: string, distance: number) {
  switch (direction) {
    case "up":
      return { x: 0, y: distance };
    case "down":
      return { x: 0, y: -distance };
    case "left":
      return { x: distance, y: 0 };
    case "right":
      return { x: -distance, y: 0 };
    default:
      return { x: 0, y: 0 };
  }
}

/* ------------------------------------------------------------------ */
/*  Stagger — container that sequences its Reveal children.            */
/* ------------------------------------------------------------------ */

export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.09, delayChildren: 0.05 },
  },
};

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.21, 0.47, 0.32, 0.98] },
  },
};

export function Stagger({
  children,
  className,
  once = true,
}: {
  children: React.ReactNode;
  className?: string;
  once?: boolean;
}) {
  return (
    <motion.div
      className={className}
      variants={staggerContainer}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin: "-10% 0px -10% 0px" }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
  as = "div",
}: {
  children: React.ReactNode;
  className?: string;
  as?: "div" | "li" | "article";
}) {
  const Comp = motion[as];
  return (
    <Comp className={className} variants={staggerItem}>
      {children}
    </Comp>
  );
}

/* ------------------------------------------------------------------ */
/*  Counter — animated numeric statistic. Counts once when visible.    */
/* ------------------------------------------------------------------ */

export function Counter({
  value,
  duration = 1600,
  prefix = "",
  suffix = "",
  className,
}: {
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}) {
  const ref = React.useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  const reduce = useReducedMotion();
  const [display, setDisplay] = React.useState(0);

  React.useEffect(() => {
    if (!inView) return;
    if (reduce) {
      setDisplay(value);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      // ease-out cubic for a confident settle
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(eased * value));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, value, duration, reduce]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {display.toLocaleString("en-US")}
      {suffix}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  SectionShell — consistent corporate section wrapper.               */
/* ------------------------------------------------------------------ */

export function SectionShell({
  id,
  children,
  className,
  innerClassName,
  bordered = true,
  ariaLabel,
}: {
  id?: string;
  children: React.ReactNode;
  className?: string;
  innerClassName?: string;
  bordered?: boolean;
  ariaLabel?: string;
}) {
  return (
    <section
      id={id}
      aria-label={ariaLabel}
      className={cn(
        "relative w-full scroll-mt-20",
        bordered && "border-t border-border/60",
        className
      )}
    >
      <div className={cn("mx-auto w-full max-w-[1280px] px-6 md:px-10 lg:px-14", innerClassName)}>
        {children}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  SectionHeading — mono index/kicker + display title + lead.         */
/* ------------------------------------------------------------------ */

export function SectionHeading({
  index,
  kicker,
  title,
  lead,
  align = "left",
  serifTitle = false,
  className,
}: {
  index?: string;
  kicker: string;
  title: string;
  lead?: string;
  align?: "left" | "center";
  serifTitle?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "max-w-3xl",
        align === "center" && "mx-auto text-center",
        className
      )}
    >
      <Reveal>
        <div
          className={cn(
            "flex items-baseline gap-4",
            align === "center" && "justify-center"
          )}
        >
          {index && (
            <span className="font-mono text-[11px] tracking-[0.22em] text-champagne/80">
              {index}
            </span>
          )}
          <span className="label-mono text-emerald-corp/90">{kicker}</span>
        </div>
      </Reveal>
      <Reveal delay={0.08}>
        <h2
          className={cn(
            "mt-5 text-balance text-3xl font-medium leading-[1.08] tracking-[-0.02em] text-foreground sm:text-4xl lg:text-[2.9rem]",
            serifTitle && "font-editorial font-light"
          )}
        >
          {title}
        </h2>
      </Reveal>
      {lead && (
        <Reveal delay={0.16}>
          <p className="mt-5 max-w-2xl text-pretty text-[15px] leading-relaxed text-muted-foreground md:text-base">
            {lead}
          </p>
        </Reveal>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Wordmark — the ETARNITY signature (mark + letterspaced wordmark).  */
/* ------------------------------------------------------------------ */

export function Wordmark({
  size = "md",
  withMark = true,
  className,
}: {
  size?: "sm" | "md" | "lg";
  withMark?: boolean;
  className?: string;
}) {
  const letters = {
    sm: "text-[13px] tracking-[0.34em]",
    md: "text-[15px] tracking-[0.38em]",
    lg: "text-xl tracking-[0.42em]",
  }[size];
  const mark = { sm: "h-4 w-4", md: "h-[22px] w-[22px]", lg: "h-7 w-7" }[size];

  return (
    <span className={cn("inline-flex items-center gap-3", className)}>
      {withMark && (
        <img src="/logo-mark.svg" alt="" aria-hidden="true" className={mark} />
      )}
      <span className={cn("font-sans font-semibold uppercase text-ivory", letters)}>
        ETARNITY
      </span>
    </span>
  );
}

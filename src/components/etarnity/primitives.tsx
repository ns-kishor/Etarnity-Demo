"use client";

/**
 * ETARNITY — shared corporate primitives.
 * The design language every section is built from:
 *   SectionShell  — consistent editorial container + section semantics
 *   SectionHeading— mono index/kicker + display title + lead
 *   Reveal        — scroll reveal (direction/distance/blur), reduced-motion safe
 *   Stagger       — orchestrated child reveals
 *   Counter       — rAF count-up on inView
 *   Pill          — rounded-full link/button (solid charcoal | outline | ghost | accent)
 *   MonoLabel     — corporate metadata label
 *   Wordmark      — ETARNITY logo mark + wordmark lockup
 */

import {
  motion,
  useInView,
  useReducedMotion,
  type HTMLMotionProps,
} from "framer-motion";
import {
  useEffect,
  useRef,
  type ReactNode,
  type ElementType,
} from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { scrollToHash } from "@/components/providers/smooth-scroll-provider";

/* ------------------------------ Ease + motion ------------------------------ */

export const EASE = [0.16, 1, 0.3, 1] as const;

/* --------------------------------- Reveal ---------------------------------- */

type RevealDirection = "up" | "down" | "left" | "right" | "none";

interface RevealProps extends Omit<HTMLMotionProps<"div">, "ref"> {
  children: ReactNode;
  delay?: number;
  duration?: number;
  direction?: RevealDirection;
  distance?: number;
  blur?: boolean;
  once?: boolean;
  className?: string;
  as?: ElementType;
}

const OFFSETS: Record<RevealDirection, { x: number; y: number }> = {
  up: { x: 0, y: 1 },
  down: { x: 0, y: -1 },
  left: { x: 1, y: 0 },
  right: { x: -1, y: 0 },
  none: { x: 0, y: 0 },
};

/* Static motion-element registry — created once at module scope. */
const M = {
  div: motion.div,
  span: motion.span,
  p: motion.p,
  ul: motion.ul,
  ol: motion.ol,
  li: motion.li,
  article: motion.article,
  section: motion.section,
  header: motion.header,
  footer: motion.footer,
  nav: motion.nav,
  dl: motion.dl,
  figure: motion.figure,
  blockquote: motion.blockquote,
  h2: motion.h2,
  h3: motion.h3,
  h4: motion.h4,
};

type MotionKey = keyof typeof M;

const MOTION_KEYS = new Set<string>(Object.keys(M));

/**
 * Renders a semantic motion element chosen from the static registry via a
 * switch — every component used below is module-level and stable, so no
 * component is ever created during render (React Compiler-safe).
 */
function Animated({
  tag,
  children,
  ...rest
}: {
  tag: ElementType;
  children?: ReactNode;
} & HTMLMotionProps<"div">) {
  const t = (
    typeof tag === "string" && MOTION_KEYS.has(tag) ? (tag as MotionKey) : "div"
  ) as MotionKey;

  const props = rest as HTMLMotionProps<"div">;

  switch (t) {
    case "span":
      return <M.span {...(props as HTMLMotionProps<"span">)}>{children}</M.span>;
    case "p":
      return <M.p {...(props as HTMLMotionProps<"p">)}>{children}</M.p>;
    case "ul":
      return <M.ul {...(props as HTMLMotionProps<"ul">)}>{children}</M.ul>;
    case "ol":
      return <M.ol {...(props as HTMLMotionProps<"ol">)}>{children}</M.ol>;
    case "li":
      return <M.li {...(props as HTMLMotionProps<"li">)}>{children}</M.li>;
    case "article":
      return <M.article {...(props as HTMLMotionProps<"article">)}>{children}</M.article>;
    case "section":
      return <M.section {...(props as HTMLMotionProps<"section">)}>{children}</M.section>;
    case "header":
      return <M.header {...(props as HTMLMotionProps<"header">)}>{children}</M.header>;
    case "footer":
      return <M.footer {...(props as HTMLMotionProps<"footer">)}>{children}</M.footer>;
    case "nav":
      return <M.nav {...(props as HTMLMotionProps<"nav">)}>{children}</M.nav>;
    case "dl":
      return <M.dl {...(props as HTMLMotionProps<"dl">)}>{children}</M.dl>;
    case "figure":
      return <M.figure {...(props as HTMLMotionProps<"figure">)}>{children}</M.figure>;
    case "blockquote":
      return <M.blockquote {...(props as HTMLMotionProps<"blockquote">)}>{children}</M.blockquote>;
    case "h2":
      return <M.h2 {...(props as HTMLMotionProps<"h2">)}>{children}</M.h2>;
    case "h3":
      return <M.h3 {...(props as HTMLMotionProps<"h3">)}>{children}</M.h3>;
    case "h4":
      return <M.h4 {...(props as HTMLMotionProps<"h4">)}>{children}</M.h4>;
    default:
      return <M.div {...props}>{children}</M.div>;
  }
}

export function Reveal({
  children,
  delay = 0,
  duration = 0.9,
  direction = "up",
  distance = 24,
  blur = false,
  once = true,
  className,
  as = "div",
  ...rest
}: RevealProps) {
  const reduced = useReducedMotion();
  const offset = OFFSETS[direction];

  return (
    <Animated
      tag={as}
      className={className}
      initial={
        reduced
          ? { opacity: 0 }
          : {
              opacity: 0,
              x: offset.x * distance,
              y: offset.y * distance,
              ...(blur ? { filter: "blur(6px)" } : {}),
            }
      }
      whileInView={
        reduced
          ? { opacity: 1, transition: { duration: 0.3 } }
          : {
              opacity: 1,
              x: 0,
              y: 0,
              ...(blur ? { filter: "blur(0px)" } : {}),
              transition: { duration, delay, ease: EASE },
            }
      }
      viewport={{ once, margin: "-12% 0px -12% 0px" }}
      {...rest}
    >
      {children}
    </Animated>
  );
}

/* --------------------------------- Stagger --------------------------------- */

interface StaggerProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  stagger?: number;
  as?: ElementType;
}

export function Stagger({
  children,
  className,
  delay = 0,
  stagger = 0.08,
  as = "div",
}: StaggerProps) {
  const reduced = useReducedMotion();

  return (
    <Animated
      tag={as}
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-12% 0px -12% 0px" }}
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: reduced ? 0 : stagger, delayChildren: delay } },
      }}
    >
      {children}
    </Animated>
  );
}

interface StaggerItemProps {
  children: ReactNode;
  className?: string;
  direction?: RevealDirection;
  distance?: number;
  blur?: boolean;
  as?: ElementType;
}

export function StaggerItem({
  children,
  className,
  direction = "up",
  distance = 22,
  blur = false,
  as = "div",
}: StaggerItemProps) {
  const reduced = useReducedMotion();
  const offset = OFFSETS[direction];

  return (
    <Animated
      tag={as}
      className={className}
      variants={{
        hidden: reduced
          ? { opacity: 0 }
          : {
              opacity: 0,
              x: offset.x * distance,
              y: offset.y * distance,
              ...(blur ? { filter: "blur(6px)" } : {}),
            },
        show: reduced
          ? { opacity: 1, transition: { duration: 0.3 } }
          : {
              opacity: 1,
              x: 0,
              y: 0,
              ...(blur ? { filter: "blur(0px)" } : {}),
              transition: { duration: 0.9, ease: EASE },
            },
      }}
    >
      {children}
    </Animated>
  );
}

/* ------------------------------- SectionShell ------------------------------ */

interface SectionShellProps {
  id?: string;
  className?: string;
  innerClassName?: string;
  children: ReactNode;
  ariaLabel?: string;
  alt?: boolean; /* subtle tonal variation: surface-alt ground */
  as?: ElementType;
}

export function SectionShell({
  id,
  className,
  innerClassName,
  children,
  ariaLabel,
  alt = false,
  as: Tag = "section",
}: SectionShellProps) {
  return (
    <Tag
      id={id}
      aria-label={ariaLabel}
      className={cn(
        "relative w-full overflow-x-clip",
        alt && "bg-surface-alt",
        className
      )}
    >
      <div
        className={cn(
          "mx-auto w-full max-w-[1200px] px-6 py-24 md:px-10 md:py-36",
          innerClassName
        )}
      >
        {children}
      </div>
    </Tag>
  );
}

/* ------------------------------ SectionHeading ----------------------------- */

interface SectionHeadingProps {
  index?: string;
  kicker?: string;
  title: ReactNode;
  lead?: string;
  align?: "left" | "center";
  className?: string;
  titleClassName?: string;
}

export function SectionHeading({
  index,
  kicker,
  title,
  lead,
  align = "left",
  className,
  titleClassName,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "mb-12 md:mb-16",
        align === "center" && "text-center",
        className
      )}
    >
      {(index || kicker) && (
        <Reveal
          className={cn(
            "mb-6 flex items-center gap-4",
            align === "center" && "justify-center"
          )}
        >
          {index && (
            <span className="label-mono text-accent-deep tabular-nums">
              {index}
            </span>
          )}
          {index && kicker && <span className="hairline w-8" aria-hidden="true" />}
          {kicker && (
            <span className="label-mono text-muted-foreground">{kicker}</span>
          )}
        </Reveal>
      )}
      <Reveal delay={0.08} blur>
        <h2
          className={cn(
            "display-1 text-balance",
            align === "center" && "mx-auto max-w-4xl",
            titleClassName
          )}
        >
          {title}
        </h2>
      </Reveal>
      {lead && (
        <Reveal delay={0.16}>
          <p
            className={cn(
              "mt-6 max-w-xl text-[15px] leading-relaxed text-muted-foreground",
              align === "center" && "mx-auto text-pretty"
            )}
          >
            {lead}
          </p>
        </Reveal>
      )}
    </div>
  );
}

/* --------------------------------- Counter --------------------------------- */

interface CounterProps {
  value: number;
  suffix?: string;
  prefix?: string;
  isYear?: boolean;
  className?: string;
  duration?: number;
}

export function Counter({
  value,
  suffix,
  prefix,
  className,
  duration = 1.6,
}: CounterProps) {
  const numRef = useRef<HTMLSpanElement>(null);
  const inView = useInView(numRef, { once: true, margin: "-15% 0px" });
  const reduced = useReducedMotion();

  /* SSR-first: the final value is already in the DOM; the rAF branch
     tweens textContent from zero back to it (no React state churn). */
  useEffect(() => {
    if (!inView || reduced || !numRef.current) return;
    const el = numRef.current;
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / (duration * 1000));
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = String(Math.round(value * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, value, reduced, duration]);

  return (
    <span className={cn("tabular-nums", className)}>
      {prefix}
      <span ref={numRef}>{value}</span>
      {suffix}
    </span>
  );
}

/* ----------------------------------- Pill ---------------------------------- */

interface PillProps {
  children: ReactNode;
  href?: string;
  variant?: "solid" | "outline" | "ghost" | "accent";
  className?: string;
  external?: boolean;
  onClick?: () => void;
  ariaLabel?: string;
}

export function Pill({
  children,
  href,
  variant = "outline",
  className,
  external,
  onClick,
  ariaLabel,
}: PillProps) {
  const styles = cn(
    "inline-flex items-center justify-center gap-2 rounded-full px-6 py-3",
    "text-sm font-medium tracking-tight transition-all duration-300",
    "min-h-11",
    variant === "solid" &&
      "bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-panel",
    variant === "accent" &&
      "bg-accent text-accent-foreground hover:bg-accent-deep hover:shadow-panel",
    variant === "outline" &&
      "border border-border bg-card text-foreground hover:border-accent/40 hover:shadow-panel",
    variant === "ghost" &&
      "text-foreground/80 hover:text-foreground hover:bg-accent-soft",
    className
  );

  if (href) {
    if (external || href.startsWith("http") || href.startsWith("mailto:")) {
      return (
        <a
          href={href}
          className={styles}
          aria-label={ariaLabel}
          target={external ? "_blank" : undefined}
          rel={external ? "noreferrer" : undefined}
          onClick={onClick}
        >
          {children}
        </a>
      );
    }
    return (
      <a href={href} className={styles} aria-label={ariaLabel} onClick={onClick}>
        {children}
      </a>
    );
  }

  return (
    <button type="button" className={styles} onClick={onClick} aria-label={ariaLabel}>
      {children}
    </button>
  );
}

/* -------------------------------- MonoLabel --------------------------------- */

export function MonoLabel({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <span className={cn("label-mono", className)}>{children}</span>;
}

/* --------------------------------- Wordmark --------------------------------- */

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      aria-hidden="true"
      className={cn("h-6 w-6", className)}
    >
      <circle cx="32" cy="32" r="24" stroke="currentColor" strokeWidth="4" />
      <line x1="22" y1="32" x2="42" y2="32" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
      <circle cx="32" cy="8" r="5.5" className="fill-accent" />
    </svg>
  );
}

export function Wordmark({
  className,
  href = "#top",
  compact = false,
  onClick,
}: {
  className?: string;
  href?: string;
  compact?: boolean;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={(e) => {
        if (onClick) {
          e.preventDefault();
          onClick();
          return;
        }
        if (href.startsWith("#") && href !== "#") {
          e.preventDefault();
          scrollToHash(href);
        }
      }}
      className={cn("group inline-flex items-center gap-3", className)}
      aria-label="ETARNITY — back to top"
    >
      <LogoMark className="h-6 w-6 shrink-0 transition-transform duration-500 group-hover:rotate-[30deg]" />
      {!compact && (
        <span className="font-display text-[17px] font-semibold tracking-[0.08em]">
          ETARNITY
        </span>
      )}
    </Link>
  );
}

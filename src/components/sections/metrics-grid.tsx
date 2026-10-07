"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { metrics } from "@/content/machina";
import {
  FloatCard,
  Kicker,
  MfSection,
  MonoLabel,
  Reveal,
  SectionTitle,
} from "@/components/machina/mf-primitives";
import { cn } from "@/lib/utils";

type MetricItem = (typeof metrics.items)[number];

/**
 * Section 04 — Dynamic Metrics & KPI Grid.
 *
 * Minimalist white grid with high-impact numeric typography. Each FloatCard
 * counts its number up from zero on first scroll into view (GSAP ScrollTrigger,
 * once), carries an interactive pulse button (status-dot language) that opens
 * a detail popover — closable via Escape, toggle or outside click — and a
 * decorative pill-slider track whose fill bar and glowing thumb animate to the
 * metric's target. Reduced-motion users get the final numbers and fills
 * instantly: the server-rendered DOM already holds the end state, and the
 * animation branch only runs under `prefers-reduced-motion: no-preference`.
 */
export function MetricsGrid() {
  return (
    <MfSection id="metrics" ariaLabel="MachinaFusion — performance metrics">
      <Kicker index="02" label={metrics.kicker} />

      <Reveal y={20}>
        <SectionTitle className="mt-6">{metrics.title}</SectionTitle>
      </Reveal>

      <div className="mt-12 grid grid-cols-1 gap-4 md:mt-16 md:grid-cols-3 md:gap-6">
        {metrics.items.map((item, index) => (
          <MetricCard key={item.label} item={item} index={index} />
        ))}
      </div>
    </MfSection>
  );
}

/* ------------------------------------------------------------------ */
/* Metric card — count-up number, detail popover, pill-slider track.   */
/* ------------------------------------------------------------------ */

function MetricCard({ item, index }: { item: MetricItem; index: number }) {
  const cardRef = React.useRef<HTMLDivElement | null>(null);
  const numberRef = React.useRef<HTMLSpanElement | null>(null);
  const fillVRef = React.useRef<HTMLDivElement | null>(null);
  const fillHRef = React.useRef<HTMLDivElement | null>(null);
  const thumbVRef = React.useRef<HTMLDivElement | null>(null);
  const thumbHRef = React.useRef<HTMLDivElement | null>(null);

  /**
   * Count-up + track fills. The JSX renders the FINAL state (full number,
   * filled tracks) so no-JS and reduced-motion visitors see real values;
   * the animated branch resets to zero and tweens back to it on scroll.
   */
  React.useEffect(() => {
    const card = cardRef.current;
    const numberEl = numberRef.current;
    const fillV = fillVRef.current;
    const fillH = fillHRef.current;
    const thumbV = thumbVRef.current;
    const thumbH = thumbHRef.current;
    if (!card || !numberEl || !fillV || !fillH || !thumbV || !thumbH) return;

    gsap.registerPlugin(ScrollTrigger);
    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      /* Start from zero — SSR markup already holds the final state. */
      numberEl.textContent = "0";
      gsap.set(fillV, { scaleX: 1, scaleY: 0 });
      gsap.set(fillH, { scaleX: 0, scaleY: 1 });
      gsap.set(thumbV, { x: 0, y: 0, xPercent: 0, yPercent: 0 });
      gsap.set(thumbH, { x: 0, y: 0, xPercent: 0, yPercent: 0 });

      const counter = { v: 0 };
      const tl = gsap.timeline({
        scrollTrigger: { trigger: card, start: "top 80%", once: true },
      });

      tl.to(
        counter,
        {
          v: item.value,
          duration: 1.6,
          ease: "power3.out",
          onUpdate: () => {
            numberEl.textContent = String(Math.round(counter.v));
          },
          onComplete: () => {
            numberEl.textContent = String(item.value);
          },
        },
        0
      )
        .to(
          fillV,
          { scaleY: item.trackFill / 100, duration: 1.2, ease: "power3.out" },
          0.15
        )
        .to(
          thumbV,
          { yPercent: -item.trackFill, duration: 1.2, ease: "power3.out" },
          0.15
        )
        .to(
          fillH,
          { scaleX: item.trackFill / 100, duration: 1.2, ease: "power3.out" },
          0.15
        )
        .to(
          thumbH,
          { xPercent: item.trackFill, duration: 1.2, ease: "power3.out" },
          0.15
        );

      return () => {
        tl.scrollTrigger?.kill();
        tl.kill();
        /* Restore the server-rendered final state. */
        numberEl.textContent = String(item.value);
        gsap.set(fillV, { scaleY: item.trackFill / 100 });
        gsap.set(fillH, { scaleX: item.trackFill / 100 });
        gsap.set(thumbV, { yPercent: -item.trackFill });
        gsap.set(thumbH, { xPercent: item.trackFill });
      };
    });

    return () => mm.revert();
  }, [item]);

  const fillRatio = item.trackFill / 100;

  return (
    <Reveal delay={index * 0.1} className="relative z-20 h-full">
      <div ref={cardRef} className="h-full">
        <FloatCard
          hover
          className="group relative flex h-full flex-col gap-4 p-6 md:flex-row md:gap-6 md:p-8"
        >
          {/* Metric copy */}
          <div className="flex min-w-0 flex-1 flex-col">
            <div className="flex items-start justify-between gap-3">
              <p className="flex items-baseline">
                <span
                  ref={numberRef}
                  className="inline-block min-w-[2ch] font-display text-6xl leading-none tracking-[-0.04em] tabular-nums text-foreground md:text-7xl"
                >
                  {item.value}
                </span>
                <span className="font-display text-4xl leading-none text-[var(--accent)] md:text-5xl">
                  {item.suffix}
                </span>
              </p>
              <MetricDetailButton item={item} />
            </div>

            <p className="mt-3 text-[15px] font-medium text-muted-foreground">
              {item.label}
            </p>

            <span className="sr-only">
              {`${item.trackLabel.toLowerCase()} track indicates ${item.trackFill} percent.`}
            </span>
          </div>

          {/* Pill-slider track — vertical on md+ */}
          <div className="hidden shrink-0 flex-col items-center gap-2.5 pt-1 md:flex">
            <span
              className="label-tag text-muted-foreground"
              style={{ fontSize: "10px" }}
            >
              {item.trackLabel}
            </span>
            <div
              className="relative h-24 w-1.5 rounded-full bg-muted"
              aria-hidden="true"
            >
              <div
                ref={fillVRef}
                className="absolute inset-0 origin-bottom rounded-full bg-[var(--accent)] opacity-90 transition-opacity duration-500 group-hover:opacity-100"
                style={{ transform: `scaleY(${fillRatio})` }}
              />
              <div
                ref={thumbVRef}
                className="pointer-events-none absolute inset-0"
                style={{ transform: `translateY(-${item.trackFill}%)` }}
              >
                <div className="absolute -bottom-1.5 -left-[3px] h-3 w-3 rounded-full bg-[var(--accent)] shadow-[0_0_12px_2px_var(--glow)] transition-shadow duration-500 group-hover:shadow-[0_0_18px_4px_var(--glow)]" />
              </div>
            </div>
          </div>

          {/* Pill-slider track — horizontal on mobile */}
          <div className="md:hidden">
            <span
              className="label-tag text-muted-foreground"
              style={{ fontSize: "10px" }}
            >
              {item.trackLabel}
            </span>
            <div
              className="relative mt-2 h-1.5 w-full rounded-full bg-muted"
              aria-hidden="true"
            >
              <div
                ref={fillHRef}
                className="absolute inset-0 origin-left rounded-full bg-[var(--accent)] opacity-90 transition-opacity duration-500 group-hover:opacity-100"
                style={{ transform: `scaleX(${fillRatio})` }}
              />
              <div
                ref={thumbHRef}
                className="pointer-events-none absolute inset-0"
                style={{ transform: `translateX(${item.trackFill}%)` }}
              >
                <div className="absolute -left-1.5 -top-[3px] h-3 w-3 rounded-full bg-[var(--accent)] shadow-[0_0_12px_2px_var(--glow)] transition-shadow duration-500 group-hover:shadow-[0_0_18px_4px_var(--glow)]" />
              </div>
            </div>
          </div>
        </FloatCard>
      </div>
    </Reveal>
  );
}

/* ------------------------------------------------------------------ */
/* Pulse button + detail popover (Escape / outside-click dismissible). */
/* ------------------------------------------------------------------ */

function MetricDetailButton({ item }: { item: MetricItem }) {
  const [open, setOpen] = React.useState(false);
  const buttonRef = React.useRef<HTMLButtonElement | null>(null);
  const panelRef = React.useRef<HTMLDivElement | null>(null);
  const wasOpenRef = React.useRef(false);
  const reduce = useReducedMotion();

  /* Escape closes and returns focus; pointer-down outside closes. */
  React.useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node | null;
      if (
        !target ||
        panelRef.current?.contains(target) ||
        buttonRef.current?.contains(target)
      ) {
        return;
      }
      setOpen(false);
    };

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open]);

  /* Polite focus management: focus the panel on open, restore on close. */
  React.useEffect(() => {
    if (open) {
      wasOpenRef.current = true;
      panelRef.current?.focus({ preventScroll: true });
    } else if (wasOpenRef.current) {
      wasOpenRef.current = false;
      if (document.activeElement !== buttonRef.current) {
        buttonRef.current?.focus();
      }
    }
  }, [open]);

  return (
    <div className="relative shrink-0">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label={`More about this metric: ${item.label}`}
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card transition-all duration-300",
          "hover:border-accent/50 hover:shadow-[0_0_0_5px_var(--orb-neon)]",
          open && "border-accent/60 shadow-[0_0_0_5px_var(--orb-neon)]"
        )}
      >
        <span className="status-dot scale-150" aria-hidden="true" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            key="metric-detail"
            ref={panelRef}
            role="dialog"
            aria-modal={false}
            aria-label={`${item.label} — detail`}
            tabIndex={-1}
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.98 }}
            transition={{ duration: reduce ? 0 : 0.25, ease: [0.16, 1, 0.3, 1] }}
            style={{ transformOrigin: "bottom right" }}
            className="absolute bottom-full right-0 z-30 mb-2 w-60 rounded-2xl border border-border bg-popover p-4 text-popover-foreground shadow-ambient-lg"
          >
            <MonoLabel className="text-[var(--accent)]">
              Why it matters
            </MonoLabel>
            <p className="mt-2 text-[12px] leading-relaxed text-muted-foreground">
              {item.detail}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Transparent scrim, portaled to body — closes on outside clicks. */}
      {open &&
        createPortal(
          <div
            className="fixed inset-0 z-10 cursor-default"
            aria-hidden="true"
            onClick={() => setOpen(false)}
          />,
          document.body
        )}
    </div>
  );
}

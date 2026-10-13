"use client";

import * as React from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Reveal } from "@/components/site/reveal";

/* ------------------------------------------------------------------ */
/* Types & constants                                                   */
/* ------------------------------------------------------------------ */

/**
 * One problem → solution row. Defined locally (and structurally
 * compatible with the server payload's `problems` entries) on purpose:
 * the section never imports from src/lib, so the backend type can keep
 * evolving independently.
 */
export interface ProblemPairData {
  id: number;
  problemTitle: string;
  problemDesc: string;
  solutionTitle: string;
  solutionDesc: string;
  displayOrder?: number;
}

const ELECTRIC = "#526BFF";
const HAIRLINE = "#E8E9EC";
/** Subtle halo for the node dot once its connector goes live. */
const DOT_HALO = "0 0 0 3px rgba(82, 107, 255, 0.16)";

/** Viewport fraction where a row's timeline starts (row top at 88% vh). */
const START_ANCHOR = 0.88;
/** Sub-stage boundaries inside a row's 0→1 scroll progress. */
const T_PROBLEM_END = 0.38;
const T_LINE_END = 0.66;
const T_ARROW_END = 0.8;

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

/** Normalized position of `r` inside [start, end], clamped to 0..1. */
function range01(r: number, start: number, end: number): number {
  return clamp01((r - start) / (end - start));
}

/** Smoothstep easing — deliberate starts, soft landings, reversible. */
function smooth(x: number): number {
  const t = clamp01(x);
  return t * t * (3 - 2 * t);
}

/** The imperatively-controlled elements of one pair row. */
interface RowEls {
  row: HTMLDivElement | null;
  problem: HTMLElement | null;
  solution: HTMLElement | null;
  /* desktop (horizontal) connector */
  hBase: HTMLElement | null;
  hLine: HTMLElement | null;
  hDot: HTMLElement | null;
  hArrow: HTMLElement | null;
  /* mobile (vertical) connector */
  vBase: HTMLElement | null;
  vLine: HTMLElement | null;
  vDot: HTMLElement | null;
  vArrow: HTMLElement | null;
}

function emptyRow(): RowEls {
  return {
    row: null,
    problem: null,
    solution: null,
    hBase: null,
    hLine: null,
    hDot: null,
    hArrow: null,
    vBase: null,
    vLine: null,
    vDot: null,
    vArrow: null,
  };
}

/**
 * Write one row's full visual state for progress `r` ∈ [0, 1]. Pure DOM
 * writes (transform / opacity / color only — no reads, no React state).
 * r = 0 → everything hidden; r = 1 → pair fully connected. Because the
 * mapping is a pure function of r, scrolling backwards replays the
 * whole sequence in reverse.
 *
 * Stage map (smoothstepped per range):
 *   0.00–0.38  problem card rises (opacity, +24px, 0.98→1 scale) —
 *              the hairline baseline + node dot ride in with it
 *   0.38–0.66  electric line draws from the problem card outward
 *              (scaleX horizontally / scaleY vertically), node lights up
 *   0.66–0.80  arrowhead chevron lands at the solution card edge
 *   0.80–1.00  solution card rises (same refined motion as the problem)
 */
function applyRow(b: RowEls, r: number): void {
  const pT = smooth(range01(r, 0, T_PROBLEM_END));
  const lT = smooth(range01(r, T_PROBLEM_END, T_LINE_END));
  const aT = smooth(range01(r, T_LINE_END, T_ARROW_END));
  const sT = smooth(range01(r, T_ARROW_END, 1));

  if (b.problem) {
    b.problem.style.opacity = pT.toFixed(3);
    b.problem.style.transform =
      `translate3d(0, ${((1 - pT) * 24).toFixed(2)}px, 0) ` +
      `scale(${(0.98 + 0.02 * pT).toFixed(4)})`;
  }
  if (b.solution) {
    b.solution.style.opacity = sT.toFixed(3);
    b.solution.style.transform =
      `translate3d(0, ${((1 - sT) * 24).toFixed(2)}px, 0) ` +
      `scale(${(0.98 + 0.02 * sT).toFixed(4)})`;
  }

  /* Static connector furniture (hairline baseline) appears with the
     problem card — before that, "all cards + lines hidden". */
  if (b.hBase) b.hBase.style.opacity = pT.toFixed(3);
  if (b.vBase) b.vBase.style.opacity = pT.toFixed(3);

  /* Node dot — neutral hairline at rest, lights up electric the moment
     the line starts drawing, with a small reversible pop that settles
     again before the arrow lands. */
  const lit = lT > 0;
  const pop =
    lT <= 0
      ? 0
      : lT < 0.3
        ? smooth(lT / 0.3)
        : 1 - smooth((lT - 0.3) / 0.5);
  for (const dot of [b.hDot, b.vDot]) {
    if (!dot) continue;
    dot.style.opacity = pT.toFixed(3);
    dot.style.backgroundColor = lit ? ELECTRIC : HAIRLINE;
    dot.style.boxShadow = lit ? DOT_HALO : "none";
    dot.style.transform = `scale(${(1 + 0.45 * pop).toFixed(3)})`;
  }

  /* Progress line — scaleX (desktop) / scaleY (mobile), origin at the
     problem card. The opacity guard hides the 1.5px stub at rest. */
  if (b.hLine) {
    b.hLine.style.transform = `scaleX(${lT.toFixed(4)})`;
    b.hLine.style.opacity = lT > 0.001 ? "1" : "0";
  }
  if (b.vLine) {
    b.vLine.style.transform = `scaleY(${lT.toFixed(4)})`;
    b.vLine.style.opacity = lT > 0.001 ? "1" : "0";
  }

  /* Arrowhead — delivered from the problem side, landing pointing at
     the solution card. */
  if (b.hArrow) {
    b.hArrow.style.opacity = aT.toFixed(3);
    b.hArrow.style.transform =
      `translate3d(${((1 - aT) * -5).toFixed(2)}px, 0, 0) ` +
      `scale(${(0.7 + 0.3 * aT).toFixed(3)})`;
  }
  if (b.vArrow) {
    b.vArrow.style.opacity = aT.toFixed(3);
    b.vArrow.style.transform =
      `translate3d(0, ${((1 - aT) * -5).toFixed(2)}px, 0) ` +
      `scale(${(0.7 + 0.3 * aT).toFixed(3)})`;
  }
}

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

/**
 * "Problem Solving" — scroll-scrubbed two-column section. Each pair row
 * is [problem card | connector | solution card] on md+, stacked with a
 * vertical connector on mobile. A single rAF-coalesced scroll+resize
 * handler maps every row's viewport position to a 0→1 progress and
 * drives the whole sequence imperatively (zero React state per frame):
 * problem reveals → connector line draws → arrowhead lands → solution
 * reveals. Rows are windowed so pair N+1 never starts before pair N
 * has fully completed. No pinning — the process section above already
 * pins, so this one stays in normal document flow.
 *
 * SSR / no-JS: everything renders fully visible with the lines drawn;
 * the hidden initial state is only applied in useLayoutEffect (before
 * paint) when the scroll driver takes over. prefers-reduced-motion:
 * no listeners, no writes — the static SSR diagram is the final state.
 */
export default function ProblemSolvingSection({
  pairs,
}: {
  pairs: ProblemPairData[];
}) {
  const sorted = React.useMemo(
    () =>
      [...pairs].sort(
        (a, b) =>
          (a.displayOrder ?? Number.POSITIVE_INFINITY) -
            (b.displayOrder ?? Number.POSITIVE_INFINITY) || a.id - b.id
      ),
    [pairs]
  );

  /* Latest-ref pattern: the driver effect (deps []) reads the current
     pairs on every frame without re-subscribing. */
  const pairsRef = React.useRef(sorted);
  React.useEffect(() => {
    pairsRef.current = sorted;
  }, [sorted]);

  const rowElsRef = React.useRef<RowEls[]>([]);
  /**
   * Ref-callback factory: lazily sizes the bundle array and stores the
   * element. Runs during commit (never during render), so mutating the
   * ref here is safe.
   */
  const rowRef = <K extends keyof RowEls>(i: number, key: K) =>
    (el: RowEls[K]) => {
      const arr = rowElsRef.current;
      while (arr.length <= i) arr.push(emptyRow());
      arr[i][key] = el;
    };

  /** true while no row is mid-flight → will-change is stripped. */
  const settledRef = React.useRef(true);

  /* ---------------------------------------------------------------- */
  /* Scroll driver — one shared rAF loop, batched reads then writes.   */
  /* ---------------------------------------------------------------- */

  React.useLayoutEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    let raf = 0;
    let settleTimer = 0;
    let teardownDriver: (() => void) | null = null;
    let disposed = false;

    const update = () => {
      const count = pairsRef.current.length;
      if (count === 0) return;
      const bundles = rowElsRef.current;
      const vh = window.innerHeight;

      /* ---- batched reads (row rects are measured on the never-
         transformed row wrappers, so card transforms cannot feed back
         into the geometry) ---- */
      const tops: number[] = new Array(count);
      for (let i = 0; i < count; i++) {
        tops[i] =
          bundles[i]?.row?.getBoundingClientRect().top ??
          Number.POSITIVE_INFINITY;
      }

      /* Per-pair scroll window: 90% of the tightest row pitch (capped
         at 60% of the viewport) so pair N+1's window opens only after
         pair N's has closed — sequential staging with a small breather,
         never simultaneous. A single row falls back to 60% of the vh. */
      let pitch = Number.POSITIVE_INFINITY;
      for (let i = 0; i < count - 1; i++) {
        const gap = tops[i + 1] - tops[i];
        if (Number.isFinite(gap) && gap > 0) pitch = Math.min(pitch, gap);
      }
      if (!Number.isFinite(pitch)) pitch = 0.6 * vh;
      const spanPx = Math.max(Math.min(pitch * 0.9, 0.6 * vh), 1);
      const anchorPx = START_ANCHOR * vh;

      /* ---- batched writes ---- */
      let allAtStart = true;
      let allDone = true;
      for (let i = 0; i < count; i++) {
        const r = clamp01((anchorPx - tops[i]) / spanPx);
        if (r > 0) allAtStart = false;
        if (r < 1) allDone = false;
        const bundle = bundles[i];
        if (bundle) applyRow(bundle, r);
      }

      /* Promote/demote will-change only when the section as a whole
         enters or leaves its choreography. */
      const settled = allAtStart || allDone;
      if (settled !== settledRef.current) {
        settledRef.current = settled;
        for (let i = 0; i < count; i++) {
          const bundle = bundles[i];
          if (!bundle) continue;
          for (const el of [
            bundle.problem,
            bundle.solution,
            bundle.hLine,
            bundle.vLine,
            bundle.hArrow,
            bundle.vArrow,
          ]) {
            if (el) el.style.willChange = settled ? "" : "transform, opacity";
          }
        }
      }
    };

    const schedule = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(() => {
        raf = 0;
        update();
      });
    };

    const startDriver = () => {
      update(); // initial state — also covers reload-mid-page
      window.addEventListener("scroll", schedule, { passive: true });
      window.addEventListener("resize", schedule, { passive: true });
      settleTimer = window.setTimeout(schedule, 600); // late pass for font/layout settling
      teardownDriver = () => {
        window.removeEventListener("scroll", schedule);
        window.removeEventListener("resize", schedule);
        if (raf) {
          window.cancelAnimationFrame(raf);
          raf = 0;
        }
        window.clearTimeout(settleTimer);
        settleTimer = 0;
        teardownDriver = null;
      };
    };

    const stopDriver = () => {
      teardownDriver?.();
      /* Leave the fully-connected static diagram in place. */
      for (const bundle of rowElsRef.current) {
        applyRow(bundle, 1);
        for (const el of [
          bundle.problem,
          bundle.solution,
          bundle.hLine,
          bundle.vLine,
          bundle.hArrow,
          bundle.vArrow,
        ]) {
          if (el) el.style.willChange = "";
        }
      }
      settledRef.current = true;
    };

    const onMediaChange = () => {
      if (disposed) return;
      if (media.matches) stopDriver();
      else if (!teardownDriver) startDriver();
    };

    media.addEventListener("change", onMediaChange);
    if (!media.matches) startDriver();

    return () => {
      disposed = true;
      media.removeEventListener("change", onMediaChange);
      teardownDriver?.();
    };
  }, []);

  if (sorted.length === 0) return null;

  const pad = (i: number) => String(i + 1).padStart(2, "0");

  return (
    <section
      id="problem-solving"
      aria-labelledby="problem-solving-title"
      className="relative border-t border-hairline"
    >
      {/* faint blueprint grid — CSS-only, decorative */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "repeating-linear-gradient(to right, rgba(21, 23, 27, 0.035) 0 1px, transparent 1px 56px), " +
            "repeating-linear-gradient(to bottom, rgba(21, 23, 27, 0.035) 0 1px, transparent 1px 56px)",
          maskImage:
            "linear-gradient(to bottom, transparent, black 12%, black 88%, transparent)",
          WebkitMaskImage:
            "linear-gradient(to bottom, transparent, black 12%, black 88%, transparent)",
        }}
      />

      <div className="container-site relative z-10 py-20 md:py-28">
        {/* header — mirrors the process section layout */}
        <Reveal>
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-electric">
            04 / PROBLEM SOLVING
          </p>
          <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <h2
              id="problem-solving-title"
              className="text-3xl font-semibold leading-[1.1] tracking-[-0.02em] text-graphite md:text-[2.75rem]"
            >
              Real Problems. Engineered Solutions.
            </h2>
            <p className="max-w-sm text-base leading-relaxed text-ink-soft lg:text-right">
              The challenges teams bring us — and how we approach each
              one.
            </p>
          </div>
        </Reveal>

        {/* pair rows */}
        <div className="relative mx-auto mt-10 max-w-5xl md:mt-16">
          <p className="sr-only">
            {`Problem-and-solution pairs: ${sorted
              .map((p) => `${p.problemTitle} — ${p.solutionTitle}`)
              .join("; ")}.`}
          </p>

          {/* column headers (md+) / single caption (mobile) */}
          <Reveal delay={0.08}>
            <div className="hidden md:grid md:grid-cols-[1fr_minmax(88px,140px)_1fr]">
              <p className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.22em] text-ink-soft">
                <span
                  aria-hidden="true"
                  className="size-[5px] rounded-full bg-graphite"
                />
                Your Problems
              </p>
              <span aria-hidden="true" />
              <p className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.22em] text-ink-soft">
                <span
                  aria-hidden="true"
                  className="size-[5px] rounded-full bg-electric"
                />
                Our Solutions
              </p>
            </div>
            <p className="flex flex-wrap items-center gap-2 font-mono text-[11px] uppercase tracking-[0.22em] text-ink-soft md:hidden">
              <span
                aria-hidden="true"
                className="size-[5px] rounded-full bg-graphite"
              />
              Your Problems
              <ChevronRight
                aria-hidden="true"
                className="size-3 text-ink-soft/70"
              />
              <span
                aria-hidden="true"
                className="size-[5px] rounded-full bg-electric"
              />
              Our Solutions
            </p>
          </Reveal>

          <div className="mt-6 space-y-10 md:mt-8 md:space-y-14">
            {sorted.map((pair, i) => {
              return (
                <div
                  key={pair.id}
                  ref={rowRef(i, "row")}
                  className="md:grid md:grid-cols-[1fr_minmax(88px,140px)_1fr]"
                >
                  {/* problem */}
                  <article
                    ref={rowRef(i, "problem")}
                    className="rounded-xl border border-hairline bg-white p-5 md:p-6"
                  >
                    <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-graphite/60">
                      P·{pad(i)}
                    </p>
                    <h3 className="mt-2 text-base font-semibold leading-snug text-graphite">
                      {pair.problemTitle}
                    </h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">
                      {pair.problemDesc}
                    </p>
                  </article>

                  {/* connector zone — decorative, driven imperatively */}
                  <div
                    aria-hidden="true"
                    className="relative h-12 md:h-auto md:flex md:flex-col md:justify-center"
                  >
                    {/* desktop: horizontal line through the gutter */}
                    <div className="relative hidden h-8 w-full md:block">
                      <span
                        ref={rowRef(i, "hBase")}
                        className="absolute inset-x-0 top-1/2 -mt-[0.5px] h-px bg-hairline"
                      />
                      <span
                        ref={rowRef(i, "hLine")}
                        className="absolute inset-x-0 top-1/2 -mt-[0.75px] h-[1.5px] origin-left rounded-full bg-electric"
                      />
                      <span className="absolute left-0 top-1/2 -translate-y-1/2">
                        <span
                          ref={rowRef(i, "hDot")}
                          className="block size-1.5 rounded-full bg-hairline"
                        />
                      </span>
                      <span className="absolute right-0 top-1/2 -translate-y-1/2">
                        <span
                          ref={rowRef(i, "hArrow")}
                          className="block text-electric"
                        >
                          <ChevronRight className="size-3.5" strokeWidth={2.5} />
                        </span>
                      </span>
                    </div>

                    {/* mobile: vertical line down the left rail */}
                    <div className="relative h-full md:hidden">
                      <span
                        ref={rowRef(i, "vBase")}
                        className="absolute inset-y-0 left-7 -ml-[0.5px] w-px bg-hairline"
                      />
                      <span
                        ref={rowRef(i, "vLine")}
                        className="absolute inset-y-0 left-7 -ml-[0.75px] w-[1.5px] origin-top rounded-full bg-electric"
                      />
                      <span className="absolute left-7 top-0 -translate-x-1/2">
                        <span
                          ref={rowRef(i, "vDot")}
                          className="block size-1.5 rounded-full bg-hairline"
                        />
                      </span>
                      <span className="absolute bottom-0 left-7 -translate-x-1/2">
                        <span
                          ref={rowRef(i, "vArrow")}
                          className="block text-electric"
                        >
                          <ChevronDown className="size-3.5" strokeWidth={2.5} />
                        </span>
                      </span>
                    </div>
                  </div>

                  {/* solution */}
                  <article
                    ref={rowRef(i, "solution")}
                    className="rounded-xl border-l-[3px] border-electric bg-graphite p-5 text-warmwhite md:p-6"
                  >
                    <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-periwinkle">
                      S·{pad(i)}
                    </p>
                    <h3 className="mt-2 text-base font-semibold leading-snug text-warmwhite">
                      {pair.solutionTitle}
                    </h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-ink-dark-soft">
                      {pair.solutionDesc}
                    </p>
                  </article>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

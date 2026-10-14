"use client";

import * as React from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Reveal } from "@/components/site/reveal";
import "./problem-solving.css";

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

/* ------------------------------------------------------------------ */
/* Choreography tuning                                                 */
/* ------------------------------------------------------------------ */

/*
 * PINNED STAGE (md+, motion allowed) — the sequence is scrubbed inside
 * a sticky full-viewport window (same pattern as the process section
 * above), so every stage of every pair owns a long, dedicated slice of
 * scroll distance instead of the ~1 row-pitch it gets in plain flow:
 *
 *   runway per pair ... PIN_SLICE_VH viewports of pinned scroll after
 *                        the first pair
 *   approach pre-roll .. PIN_PREROLL slice-units of pair 1 play while
 *                        the section is still sliding into view, so
 *                        the stage is never blank on entry
 *
 * Within one pair's slice (local ∈ [0, 1]):
 *   0.00–T_SLIDE_END   track slides the finished pair out / the next
 *                      pair into the stage window (eased, reversible)
 *   T_RAMP_START–T_RAMP_END  the pair's own timeline plays (slight
 *                      overlap with the slide tail keeps the motion
 *                      continuous — no dead beat between pairs)
 *   T_RAMP_END–1.00    settle hold before the next slide begins
 */
const PIN_SLICE_VH = 1.0;
const PIN_PREROLL = 0.5;
const T_SLIDE_END = 0.14;
const T_RAMP_START = 0.1;
const T_RAMP_END = 0.97;

/** Sub-phase boundaries inside a pair's 0→1 progress (pinned stage). */
const PIN_PHASES: PhaseMap = { problemEnd: 0.42, lineEnd: 0.7, arrowEnd: 0.8 };

/*
 * NATURAL FLOW (mobile, and any fallback) — rows animate in place as
 * they travel through the viewport. Strict sequencing (pair N+1 never
 * starts before pair N has finished) caps a row's window at the row
 * pitch, so the pacing knobs here are the span multipliers, the phase
 * map and the easing — not the runway.
 */
const START_ANCHOR = 0.88;
const FLOW_SPAN_PITCH = 0.95;
const FLOW_SPAN_VH_CAP = 0.85;
const FLOW_PHASES: PhaseMap = { problemEnd: 0.4, lineEnd: 0.7, arrowEnd: 0.8 };

interface PhaseMap {
  problemEnd: number;
  lineEnd: number;
  arrowEnd: number;
}

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

/** Normalized position of `r` inside [start, end], clamped to 0..1. */
function range01(r: number, start: number, end: number): number {
  return clamp01((r - start) / (end - start));
}

/**
 * Smootherstep (6t⁵ − 15t⁴ + 10t³) — zero velocity at both ends, so
 * every stage of the scrub eases in and out perceptibly. That, plus
 * the long per-stage scroll windows, is what makes the sequence feel
 * slow and smooth rather than snappy.
 */
function easeInOut(x: number): number {
  const t = clamp01(x);
  return t * t * t * (t * (t * 6 - 15) + 10);
}

const padIndex = (i: number) => String(i + 1).padStart(2, "0");

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
 * Stage map (smootherstepped per range, boundaries from `ph`):
 *   0 – problemEnd   problem card rises (opacity, +24px, 0.98→1
 *                    scale) — the hairline baseline + node dot ride
 *                    in with it
 *   problemEnd–lineEnd  electric line draws from the problem card
 *                    outward (scaleX horizontally / scaleY
 *                    vertically), node lights up
 *   lineEnd–arrowEnd arrowhead chevron lands at the solution edge
 *   arrowEnd–1       solution card rises (same refined motion)
 */
function applyRow(b: RowEls, r: number, ph: PhaseMap): void {
  const pT = easeInOut(range01(r, 0, ph.problemEnd));
  const lT = easeInOut(range01(r, ph.problemEnd, ph.lineEnd));
  const aT = easeInOut(range01(r, ph.lineEnd, ph.arrowEnd));
  const sT = easeInOut(range01(r, ph.arrowEnd, 1));

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
        ? easeInOut(lT / 0.3)
        : 1 - easeInOut((lT - 0.3) / 0.5);
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

/** Faint blueprint grid — CSS-only, decorative. Shared by the flowing
   section background and the pinned stage background. */
const GRID_STYLE: React.CSSProperties = {
  backgroundImage:
    "repeating-linear-gradient(to right, rgba(21, 23, 27, 0.035) 0 1px, transparent 1px 56px), " +
    "repeating-linear-gradient(to bottom, rgba(21, 23, 27, 0.035) 0 1px, transparent 1px 56px)",
  maskImage:
    "linear-gradient(to bottom, transparent, black 12%, black 88%, transparent)",
  WebkitMaskImage:
    "linear-gradient(to bottom, transparent, black 12%, black 88%, transparent)",
};

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

/**
 * "Problem Solving" — slow, scroll-scrubbed problem → solution pairs.
 *
 * On md+ (motion allowed) the section becomes a pinned stage: the
 * header, column captions and a sliding pair window stay fixed while
 * the user scrolls through a dedicated runway (~1 viewport per pair).
 * Each pair plays problem → connector line → arrowhead → solution
 * inside its own long slice, and the track slides completed pairs up
 * and out as the next pair arrives — strictly sequential, fully
 * reversible, and slow enough to feel every stage while scrolling.
 * A slim pair-progress indicator (P·01 / 04 + segments) shows where
 * you are.
 *
 * On mobile (and any fallback — short viewports, no JS, reduced
 * motion) the same pairs render as a plain flowing list and each row
 * animates in place as it travels through the viewport, with the
 * sequencing span stretched as far as the row pitch allows.
 *
 * SSR / no-JS / prefers-reduced-motion: everything renders fully
 * visible with the lines drawn; the pin chrome is only ever applied
 * by the scroll driver (data-pin + inline runway height), never in
 * markup. No scroll trapping — the sticky window releases exactly
 * when the runway is exhausted.
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

  /* Stage scaffolding (pin mode). */
  const sectionRef = React.useRef<HTMLElement | null>(null);
  const stageRef = React.useRef<HTMLDivElement | null>(null);
  const trackWrapRef = React.useRef<HTMLDivElement | null>(null);
  const trackRef = React.useRef<HTMLDivElement | null>(null);
  const idxRef = React.useRef<HTMLSpanElement | null>(null);
  const segRefs = React.useRef<Array<HTMLSpanElement | null>>([]);
  const segRef = (i: number) => (el: HTMLSpanElement | null) => {
    segRefs.current[i] = el;
  };

  /** true while no row is mid-flight (flow mode) → will-change off. */
  const settledRef = React.useRef(true);

  /* ---------------------------------------------------------------- */
  /* Scroll driver — one shared rAF loop, batched reads then writes.   */
  /* ---------------------------------------------------------------- */

  React.useLayoutEffect(() => {
    const section = sectionRef.current;
    const stage = stageRef.current;
    const track = trackRef.current;
    if (!section || !stage || !track) return;

    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const wide = window.matchMedia("(min-width: 768px)");
    let raf = 0;
    let settleTimer = 0;
    let disposed = false;
    let teardownDriver: (() => void) | null = null;

    /* Pin state. */
    let pinned = false;
    let pinRunway = 0;
    let offsets: number[] = [];
    let lastR: number[] = [];
    let lastSegs: number[] = [];
    let lastSlice = -1;

    const segEls = segRefs.current;
    const idxEl = idxRef.current;

    const writeRow = (i: number, r: number, phases: PhaseMap) => {
      if (lastR[i] === r) return; // no-op write guard
      lastR[i] = r;
      const bundle = rowElsRef.current[i];
      if (bundle) applyRow(bundle, r, phases);
    };

    const writeIndicator = (slice: number, local: number) => {
      if (slice !== lastSlice) {
        lastSlice = slice;
        if (idxEl) idxEl.textContent = padIndex(slice);
      }
      for (let j = 0; j < segEls.length; j++) {
        const el = segEls[j];
        if (!el) continue;
        const v = j < slice ? 1 : j === slice ? local : 0;
        if (lastSegs[j] !== v) {
          lastSegs[j] = v;
          el.style.transform = `scaleX(${v.toFixed(4)})`;
        }
      }
    };

    /* -- pin geometry (only meaningful while data-pin is applied) --- */

    const measurePin = () => {
      const count = pairsRef.current.length;
      const wrap = trackWrapRef.current;
      const wrapH = wrap ? wrap.clientHeight : 0;
      offsets = [];
      let maxRow = 0;
      const bundles = rowElsRef.current;
      for (let i = 0; i < count; i++) {
        const row = bundles[i]?.row;
        if (!row) {
          offsets.push(i > 0 ? offsets[i - 1] + 240 : 0);
          continue;
        }
        offsets.push(row.offsetTop);
        maxRow = Math.max(maxRow, row.offsetHeight);
      }
      return { stagePx: stage.offsetHeight, wrapH, maxRow };
    };

    const setRowWillChange = (on: boolean) => {
      for (const bundle of rowElsRef.current) {
        for (const el of [
          bundle.problem,
          bundle.solution,
          bundle.hLine,
          bundle.vLine,
          bundle.hArrow,
          bundle.vArrow,
        ]) {
          if (el) el.style.willChange = on ? "transform, opacity" : "";
        }
      }
    };

    const resetPinState = () => {
      const count = pairsRef.current.length;
      lastR = new Array<number>(count).fill(NaN);
      lastSegs = new Array<number>(count).fill(NaN);
      lastSlice = -1;
    };

    const activatePin = () => {
      section.dataset.pin = "on";
      const m = measurePin();
      /* Bail (and stay in natural flow) when the window cannot
         comfortably hold even a single pair row — short landscape
         viewports, tiny desktop windows, etc. */
      if (m.wrapH < m.maxRow + 40) {
        delete section.dataset.pin;
        return false;
      }
      const count = pairsRef.current.length;
      pinRunway = Math.max(
        (count - PIN_PREROLL) * PIN_SLICE_VH * window.innerHeight,
        1
      );
      section.style.height = `${Math.round(m.stagePx + pinRunway)}px`;
      track.style.willChange = "transform";
      setRowWillChange(true);
      pinned = true;
      resetPinState();
      return true;
    };

    const deactivatePin = () => {
      delete section.dataset.pin;
      section.style.height = "";
      track.style.transform = "";
      track.style.willChange = "";
      setRowWillChange(false);
      pinned = false;
      pinRunway = 0;
      resetPinState();
      settledRef.current = true; // let flow settle logic re-promote
    };

    /** Re-evaluate which mode the viewport calls for. Runs on resize /
        layout settle / driver (re)start — never per scroll event. */
    const tryPin = () => {
      const should = !motion.matches && wide.matches;
      if (should && !pinned) {
        activatePin(); // silently falls back to flow if it doesn't fit
      } else if (!should && pinned) {
        deactivatePin();
      } else if (pinned) {
        /* Still pinned, but geometry may have moved (fonts, row copy,
           window height) — re-measure and refresh the runway. */
        const m = measurePin();
        if (m.wrapH < m.maxRow + 40) {
          deactivatePin();
        } else {
          const count = pairsRef.current.length;
          pinRunway = Math.max(
            (count - PIN_PREROLL) * PIN_SLICE_VH * window.innerHeight,
            1
          );
          section.style.height = `${Math.round(m.stagePx + pinRunway)}px`;
          resetPinState();
        }
      }
    };

    /* -- the frame: map scroll position to choreography -------------- */

    const update = () => {
      const count = pairsRef.current.length;
      if (count === 0) return;
      const bundles = rowElsRef.current;
      const vh = window.innerHeight;

      if (pinned) {
        const rect = section.getBoundingClientRect();
        const runway =
          pinRunway > 0
            ? pinRunway
            : Math.max(section.offsetHeight - stage.offsetHeight, 1);

        let sliceF: number;
        if (rect.top > 0) {
          /* Approach — the stage is still sliding into view. Spend the
             approach on the first PIN_PREROLL slice-units so pair 1
             reveals as the section arrives (never a blank stage). */
          sliceF = PIN_PREROLL * (1 - rect.top / vh);
        } else {
          /* Pinned runway — pre → count. */
          sliceF =
            PIN_PREROLL +
            clamp01(-rect.top / runway) * (count - PIN_PREROLL);
        }
        const f = Math.min(Math.max(sliceF, 0), count - 1e-4);
        const i = Math.floor(f);
        const local = f - i;

        /* Track slide — rest at pair i; ease out of pair i−1 during the
           head of the slice. Reversible by construction. */
        const to = offsets[i] ?? 0;
        let y = to;
        if (i > 0) {
          const from = offsets[i - 1] ?? 0;
          y = from + (to - from) * easeInOut(range01(local, 0, T_SLIDE_END));
        }
        track.style.transform = `translate3d(0, ${(-y).toFixed(2)}px, 0)`;

        /* Rows — finished pairs stay complete, later pairs stay
           hidden, the active pair plays its timeline. */
        const ramp = range01(local, T_RAMP_START, T_RAMP_END);
        for (let j = 0; j < count; j++) {
          writeRow(j, j < i ? 1 : j > i ? 0 : ramp, PIN_PHASES);
        }

        writeIndicator(i, local);
        return;
      }

      /* ---- natural flow (mobile / fallback) ----
         Batched reads: row rects are measured on the never-transformed
         row wrappers, so card transforms cannot feed back into the
         geometry. */
      const tops: number[] = new Array(count);
      for (let i = 0; i < count; i++) {
        tops[i] =
          bundles[i]?.row?.getBoundingClientRect().top ??
          Number.POSITIVE_INFINITY;
      }

      /* Per-pair scroll window: a little under the tightest row pitch
         (capped for safety) so pair N+1's window opens only after pair
         N's has closed — sequential staging, never simultaneous. */
      let pitch = Number.POSITIVE_INFINITY;
      for (let i = 0; i < count - 1; i++) {
        const gap = tops[i + 1] - tops[i];
        if (Number.isFinite(gap) && gap > 0) pitch = Math.min(pitch, gap);
      }
      if (!Number.isFinite(pitch)) pitch = 0.6 * vh;
      const spanPx = Math.max(
        Math.min(pitch * FLOW_SPAN_PITCH, FLOW_SPAN_VH_CAP * vh),
        1
      );
      const anchorPx = START_ANCHOR * vh;

      /* ---- batched writes ---- */
      let allAtStart = true;
      let allDone = true;
      for (let i = 0; i < count; i++) {
        const r = clamp01((anchorPx - tops[i]) / spanPx);
        if (r > 0) allAtStart = false;
        if (r < 1) allDone = false;
        writeRow(i, r, FLOW_PHASES);
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

    /* rAF coalescing. Scroll frames never re-measure mode/geometry;
       layout frames (resize, settle) do. */
    const scheduleScroll = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(() => {
        raf = 0;
        update();
      });
    };
    const scheduleLayout = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(() => {
        raf = 0;
        tryPin();
        update();
      });
    };

    const stopDriver = () => {
      teardownDriver?.();
      teardownDriver = null;
      if (pinned) deactivatePin();
      /* Leave the fully-connected static diagram in place. */
      for (const bundle of rowElsRef.current) {
        applyRow(bundle, 1, FLOW_PHASES);
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
      resetPinState();
      settledRef.current = true;
    };

    const startDriver = () => {
      tryPin();
      update(); // initial state — also covers reload-mid-page
      window.addEventListener("scroll", scheduleScroll, { passive: true });
      window.addEventListener("resize", scheduleLayout, { passive: true });
      settleTimer = window.setTimeout(scheduleLayout, 600); // late pass for font/layout settling
      teardownDriver = () => {
        window.removeEventListener("scroll", scheduleScroll);
        window.removeEventListener("resize", scheduleLayout);
        if (raf) {
          window.cancelAnimationFrame(raf);
          raf = 0;
        }
        window.clearTimeout(settleTimer);
        settleTimer = 0;
        teardownDriver = null;
      };
    };

    const onMotionChange = () => {
      if (disposed) return;
      if (motion.matches) stopDriver();
      else if (!teardownDriver) startDriver();
    };

    motion.addEventListener("change", onMotionChange);
    if (!motion.matches) startDriver();

    return () => {
      disposed = true;
      motion.removeEventListener("change", onMotionChange);
      teardownDriver?.();
    };
  }, []);

  if (sorted.length === 0) return null;

  return (
    <section
      id="problem-solving"
      aria-labelledby="problem-solving-title"
      ref={(el) => {
        sectionRef.current = el;
      }}
      className="ps-section relative border-t border-hairline"
    >
      {/* faint blueprint grid — flowing section background (natural mode) */}
      <div
        aria-hidden="true"
        className="ps-grid-outer pointer-events-none absolute inset-0"
        style={GRID_STYLE}
      />

      {/* stage — becomes the sticky full-viewport window in pin mode */}
      <div ref={stageRef} className="ps-stage">
        {/* blueprint grid — pinned stage background (pin mode) */}
        <div
          aria-hidden="true"
          className="ps-grid-inner pointer-events-none absolute inset-0"
          style={GRID_STYLE}
        />

        <div className="ps-body container-site relative z-10 py-20 md:py-28">
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
          <div className="ps-column relative mx-auto mt-10 max-w-5xl md:mt-16">
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

            {/* track window — the sliding pair list lives here */}
            <div ref={trackWrapRef} className="ps-track-wrap">
              <div
                ref={trackRef}
                className="ps-track mt-6 space-y-10 md:mt-8 md:space-y-14"
              >
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
                          P·{padIndex(i)}
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
                              <ChevronRight
                                className="size-3.5"
                                strokeWidth={2.5}
                              />
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
                              <ChevronDown
                                className="size-3.5"
                                strokeWidth={2.5}
                              />
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
                          S·{padIndex(i)}
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

            {/* pair progress indicator — pinned stage only (decorative) */}
            <div
              aria-hidden="true"
              className="ps-indicator hidden items-center gap-4 pt-5 md:pt-6"
            >
              <p className="shrink-0 font-mono text-[11px] uppercase tracking-[0.22em] text-ink-soft">
                P·
                <span ref={idxRef} className="text-graphite">
                  01
                </span>
                <span className="text-ink-soft/60">
                  {" "}
                  / {padIndex(sorted.length - 1)}
                </span>
              </p>
              <div className="flex max-w-[320px] flex-1 gap-1.5">
                {sorted.map((pair, i) => (
                  <span
                    key={pair.id}
                    className="relative h-px flex-1 overflow-hidden rounded-full bg-hairline"
                  >
                    <span
                      ref={segRef(i)}
                      className="absolute inset-0 origin-left rounded-full bg-electric"
                    />
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

"use client";

import * as React from "react";
import {
  Briefcase,
  ClipboardList,
  Code2,
  DraftingCompass,
  FlaskConical,
  PackageCheck,
  Rocket,
} from "lucide-react";
import { Reveal } from "@/components/site/reveal";
import "./process-section.css";

/* ------------------------------------------------------------------ */
/* Data                                                                */
/* ------------------------------------------------------------------ */

const STAGES = [
  { name: "Planning", icon: ClipboardList },
  { name: "Visualizing", icon: DraftingCompass },
  { name: "Creation Process", icon: Code2 },
  { name: "Testing", icon: FlaskConical },
  { name: "Deploy", icon: Rocket },
  { name: "Deliver", icon: PackageCheck },
] as const;

const STAGE_COUNT = STAGES.length;

/** Scroll-timeline margins (fractions of the pinned distance): lead-in + hold-out. */
const TIMELINE_TAIL = 0.04;
const TIMELINE_SPAN = 0.86;

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

/** Low-frequency scroll progress — drives card highlighting only. */
interface ProcessProgress {
  /** How many stage dots have reached the client card (0..6). */
  arrived: number;
  /** Index of the dot currently in flight, or -1 when at rest. */
  traveling: number;
}

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

/**
 * "Our Working Process" — sticky scrollytelling section. Six stage cards
 * sit in a row (2×3 on mobile), a Client Project card below; as the user
 * scrolls through the 300svh track, one electric dot per stage travels
 * its connector line into the client card, drawing the line behind it and
 * lighting the cards it leaves. All geometry is measured after mount, so
 * the SSR pass renders the static diagram (cards + empty svg) and the
 * lines appear once measured.
 */
export default function ProcessSection() {
  const trackRef = React.useRef<HTMLDivElement | null>(null);
  const diagramRef = React.useRef<HTMLDivElement | null>(null);
  const clientRef = React.useRef<HTMLDivElement | null>(null);
  const svgRef = React.useRef<SVGSVGElement | null>(null);
  const stageRefs = React.useRef<Array<HTMLDivElement | null>>([]);
  const basePathsRef = React.useRef<Array<SVGPathElement | null>>([]);
  const progressPathsRef = React.useRef<Array<SVGPathElement | null>>([]);
  const dotRefsRef = React.useRef<Array<SVGCircleElement | null>>([]);
  const lensRef = React.useRef<number[]>([]);
  const updateRef = React.useRef<(() => void) | null>(null);

  const [progress, setProgress] = React.useState<ProcessProgress>({
    arrived: 0,
    traveling: -1,
  });
  const progressStateRef = React.useRef<ProcessProgress>(progress);

  /* ---------------------------------------------------------------- */
  /* Geometry — measure cards, build the connector paths. Runs only    */
  /* after mount (useLayoutEffect), so SSR/hydration are untouched.   */
  /* ---------------------------------------------------------------- */

  React.useLayoutEffect(() => {
    const measure = () => {
      const diagram = diagramRef.current;
      const svg = svgRef.current;
      const client = clientRef.current;
      if (!diagram || !svg || !client) return;

      const dRect = diagram.getBoundingClientRect();
      if (dRect.width === 0) return;
      const cRect = client.getBoundingClientRect();

      // The overlay is inset-0 over the diagram, so 1 px == 1 user unit.
      svg.setAttribute("viewBox", `0 0 ${dRect.width} ${dRect.height}`);

      for (let i = 0; i < STAGE_COUNT; i++) {
        const stage = stageRefs.current[i];
        const base = basePathsRef.current[i];
        const path = progressPathsRef.current[i];
        const dot = dotRefsRef.current[i];
        if (!stage || !base || !path || !dot) continue;

        const sRect = stage.getBoundingClientRect();
        // Start: bottom center of the stage card, 3px below its edge.
        const sx = sRect.left + sRect.width / 2 - dRect.left;
        const sy = sRect.bottom - dRect.top + 3;
        // End: six evenly-spread docking points along the client card's top edge.
        const ex =
          cRect.left + (cRect.width * (i + 0.5)) / STAGE_COUNT - dRect.left;
        const ey = cRect.top - dRect.top - 3;
        // Cubic S-curve from the stage down into the client card.
        const drop = ey - sy;
        const d = `M ${sx} ${sy} C ${sx} ${sy + drop * 0.55}, ${
          ex
        } ${ey - drop * 0.55}, ${ex} ${ey}`;

        base.setAttribute("d", d);
        path.setAttribute("d", d);

        // Hide the progress stroke completely; the scroll driver draws it.
        const len = path.getTotalLength();
        lensRef.current[i] = len;
        path.style.strokeDasharray = `${len}`;
        path.style.strokeDashoffset = `${len}`;

        // Park the dot at the path start, invisible.
        const start = path.getPointAtLength(0);
        dot.setAttribute("cx", `${start.x}`);
        dot.setAttribute("cy", `${start.y}`);
        dot.setAttribute("opacity", "0");
      }
    };

    measure();

    // Re-measure (rAF-coalesced) whenever the diagram's box changes.
    let measureRaf = 0;
    const scheduleMeasure = () => {
      if (measureRaf) return;
      measureRaf = window.requestAnimationFrame(() => {
        measureRaf = 0;
        measure();
        updateRef.current?.();
      });
    };

    const observer = new ResizeObserver(scheduleMeasure);
    if (diagramRef.current) observer.observe(diagramRef.current);
    window.addEventListener("resize", scheduleMeasure, { passive: true });

    // One late pass for fonts/layout settling after hydration.
    const settleTimer = window.setTimeout(() => {
      measure();
      updateRef.current?.();
    }, 600);

    return () => {
      if (measureRaf) window.cancelAnimationFrame(measureRaf);
      window.clearTimeout(settleTimer);
      observer.disconnect();
      window.removeEventListener("resize", scheduleMeasure);
    };
  }, []);

  /* ---------------------------------------------------------------- */
  /* Scroll driver — sequential dots, lines that draw themselves.      */
  /* Imperative per-frame work; React state only for card highlights. */
  /* ---------------------------------------------------------------- */

  React.useEffect(() => {
    let updateRaf = 0;

    const update = () => {
      const track = trackRef.current;
      if (!track) return;

      const rect = track.getBoundingClientRect();
      // Pinned scroll distance: track height minus one viewport.
      const total = rect.height - window.innerHeight;
      // raw: 0 when the track top hits the viewport top,
      //      1 when the track bottom aligns with the viewport bottom.
      const raw = clamp01(-rect.top / Math.max(total, 1));
      const p = clamp01((raw - TIMELINE_TAIL) / TIMELINE_SPAN);
      const seq = p * STAGE_COUNT;

      for (let i = 0; i < STAGE_COUNT; i++) {
        const seg = clamp01(seq - i);
        const path = progressPathsRef.current[i];
        const dot = dotRefsRef.current[i];
        const len = lensRef.current[i] ?? 0;
        if (!path || !dot || len <= 0) continue;
        const point = path.getPointAtLength(seg * len);
        dot.setAttribute("cx", `${point.x}`);
        dot.setAttribute("cy", `${point.y}`);
        dot.setAttribute("opacity", seg > 0 ? "1" : "0");
        // seg 0 → hidden (offset = len), seg 1 → fully drawn (offset = 0).
        path.style.strokeDashoffset = `${len * (1 - seg)}`;
      }

      const traveling =
        seq > 0 && seq < STAGE_COUNT ? Math.floor(seq) : -1;
      const arrived = Math.min(STAGE_COUNT, Math.floor(seq + 1e-4));

      // Pulse the client card on each new arrival.
      if (arrived > progressStateRef.current.arrived) {
        const client = clientRef.current;
        if (client) {
          client.classList.remove("process-client-pulse");
          client.getBoundingClientRect(); // force reflow so the keyframe restarts
          client.classList.add("process-client-pulse");
        }
      }

      // Commit highlight state only when it actually changes.
      if (
        progressStateRef.current.arrived !== arrived ||
        progressStateRef.current.traveling !== traveling
      ) {
        progressStateRef.current = { arrived, traveling };
        setProgress(progressStateRef.current);
      }
    };

    const scheduleUpdate = () => {
      if (updateRaf) return;
      updateRaf = window.requestAnimationFrame(() => {
        updateRaf = 0;
        update();
      });
    };

    updateRef.current = update;

    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate, { passive: true });

    // Remove the pulse class when its keyframe finishes.
    const client = clientRef.current;
    const onPulseEnd = (event: AnimationEvent) => {
      if (client && event.animationName === "process-client-pulse") {
        client.classList.remove("process-client-pulse");
      }
    };
    client?.addEventListener("animationend", onPulseEnd);

    update(); // covers reload-mid-page

    return () => {
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      if (updateRaf) window.cancelAnimationFrame(updateRaf);
      client?.removeEventListener("animationend", onPulseEnd);
      updateRef.current = null;
    };
  }, []);

  /* ---------------------------------------------------------------- */
  /* Render                                                            */
  /* ---------------------------------------------------------------- */

  return (
    <section className="relative border-t border-hairline">
      <div ref={trackRef} className="relative h-[300svh]">
        <div className="sticky top-0 flex min-h-[100svh] flex-col justify-center overflow-hidden">
          <div className="container-site">
            {/* header */}
            <Reveal>
              <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-electric">
                03 / OUR WORKING PROCESS
              </p>
              <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                <h2 className="text-3xl font-semibold leading-[1.1] tracking-[-0.02em] text-graphite md:text-[2.75rem]">
                  How We Work.
                </h2>
                <p className="max-w-sm text-base leading-relaxed text-ink-soft lg:text-right">
                  Six steps between an idea and a shipped client product —
                  the same pipeline every engagement runs through.
                </p>
              </div>
            </Reveal>

            {/* diagram */}
            <Reveal delay={0.1} className="mt-8 sm:mt-12 md:mt-16">
              <div ref={diagramRef} className="relative mx-auto max-w-5xl">
                <p className="sr-only">
                  Our working process: Planning, Visualizing, Creation
                  Process, Testing, Deploy, and Deliver — every step converges
                  on the client project.
                </p>

                {/* stage grid */}
                <div className="grid grid-cols-3 gap-x-3 gap-y-6 sm:grid-cols-6 sm:gap-x-4">
                  {STAGES.map((stage, i) => {
                    const active =
                      progress.traveling === i || progress.arrived > i;
                    const Icon = stage.icon;
                    return (
                      <div
                        key={stage.name}
                        ref={(el) => {
                          stageRefs.current[i] = el;
                        }}
                        className={`relative z-10 flex flex-row items-center justify-center gap-2.5 rounded-xl border bg-white p-2.5 text-left transition-[border-color,box-shadow,transform] duration-300 sm:flex-col sm:items-center sm:gap-1.5 sm:p-4 sm:text-center ${
                          active
                            ? "border-electric/60 shadow-[0_10px_28px_rgba(82,107,255,0.10)] -translate-y-0.5"
                            : "border-hairline"
                        }`}
                      >
                        <span
                          className={`flex size-9 shrink-0 items-center justify-center rounded-lg transition-colors duration-300 sm:size-10 ${
                            active
                              ? "bg-electric/10 text-electric"
                              : "bg-secondary text-graphite"
                          }`}
                        >
                          <Icon className="size-4 sm:size-5" aria-hidden="true" />
                        </span>
                        <span className="hidden font-mono text-[9px] uppercase tracking-[0.18em] text-ink-soft sm:block">
                          0{i + 1}
                        </span>
                        <span className="text-[11px] font-semibold leading-tight text-graphite sm:text-xs">
                          {stage.name}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* connector zone */}
                <div aria-hidden="true" className="h-[64px] sm:h-[136px]" />

                {/* client card */}
                <div className="flex justify-center">
                  <div
                    ref={clientRef}
                    className={`relative flex w-full max-w-[280px] flex-col items-center gap-2 rounded-xl border-2 bg-white px-6 py-4 text-center transition-[border-color,box-shadow] duration-500 sm:py-5 ${
                      progress.arrived >= STAGE_COUNT
                        ? "border-electric shadow-[0_0_0_6px_rgba(82,107,255,0.14)]"
                        : progress.arrived > 0
                          ? "border-electric/50 shadow-[0_0_0_5px_rgba(82,107,255,0.08)]"
                          : "border-hairline"
                    }`}
                  >
                    <span className="flex size-11 items-center justify-center rounded-lg bg-graphite text-warmwhite">
                      <Briefcase className="size-5" aria-hidden="true" />
                    </span>
                    <span className="text-sm font-semibold text-graphite">
                      Client Project
                    </span>
                    <span
                      className="flex items-center gap-1.5"
                      aria-hidden="true"
                    >
                      {STAGES.map((stage, i) => (
                        <span
                          key={stage.name}
                          className={`size-1.5 rounded-full transition-colors duration-300 ${
                            i < progress.arrived ? "bg-electric" : "bg-hairline"
                          }`}
                        />
                      ))}
                    </span>
                    <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-ink-soft">
                      Every step converges here
                    </span>
                  </div>
                </div>

                {/* svg overlay — geometry wired up imperatively in effects */}
                <svg
                  ref={svgRef}
                  className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
                  aria-hidden="true"
                >
                  {STAGES.map((stage, i) => (
                    <g key={stage.name}>
                      <path
                        ref={(el) => {
                          basePathsRef.current[i] = el;
                        }}
                        stroke="#E8E9EC"
                        strokeWidth={1.5}
                        fill="none"
                        opacity={0.7}
                      />
                      <path
                        ref={(el) => {
                          progressPathsRef.current[i] = el;
                        }}
                        stroke="#526BFF"
                        strokeWidth={1.5}
                        fill="none"
                        strokeLinecap="round"
                      />
                      <circle
                        ref={(el) => {
                          dotRefsRef.current[i] = el;
                        }}
                        r={3.5}
                        fill="#526BFF"
                        stroke="#FFFFFF"
                        strokeWidth={1}
                        opacity={0}
                      />
                    </g>
                  ))}
                </svg>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

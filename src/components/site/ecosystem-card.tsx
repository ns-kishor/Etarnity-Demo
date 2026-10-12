"use client";

import * as React from "react";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import type { Business } from "@/lib/types";
import { Link } from "@/lib/router";
import { StatusChip } from "@/components/site/status-chip";
import "./ecosystem-card.css";

/**
 * EcosystemCard — "ETARNITY Ecosystem" grid card.
 *
 * Default state: a large animated SVG glyph + business name. On card hover
 * (or keyboard focus on the link) the glyph layer recedes and the full
 * business card layer (logo chip + status chip, name, category, summary,
 * Explore link) rises in. The swap is orchestrated with asymmetric
 * delays:
 *
 *   hover-in  → glyph leaves immediately, details enter after 150ms
 *   hover-out → details leave immediately, glyph returns after 150ms
 *
 * The glyph layer is aria-hidden (it duplicates the name that lives in
 * the details layer, which stays in the accessibility tree at all
 * times). All glyph choice + geometry is deterministic — no window
 * access, no randomness — so SSR and hydration render identically.
 */

/* ------------------------------------------------------------------ */
/* Shared constants + deterministic geometry helpers                   */
/* ------------------------------------------------------------------ */

const GRAPHITE = "#15171B";
const HAIRLINE = "#E8E9EC";
const ELECTRIC = "#526BFF";

const GLYPH_SVG_PROPS = {
  viewBox: "0 0 96 96",
  width: 84,
  height: 84,
  fill: "none",
  "aria-hidden": true,
  className: "ecosystem-glyph size-[84px]",
} as const;

/**
 * Trims a segment by `pad` units at both ends so edge lines stop short of
 * the node rings they connect. Pure arithmetic only (no trig) — bit-for-bit
 * deterministic across SSR and client.
 */
function trimmedEdge(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  pad: number
): { ax: number; ay: number; bx: number; by: number } {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy);
  const ux = dx / len;
  const uy = dy / len;
  return {
    ax: +(x1 + ux * pad).toFixed(2),
    ay: +(y1 + uy * pad).toFixed(2),
    bx: +(x2 - ux * pad).toFixed(2),
    by: +(y2 - uy * pad).toFixed(2),
  };
}

/** Flat-top hexagon vertex list around (cx, cy) — 6 points, r = circumradius. */
function hexPoints(cx: number, cy: number, r: number): string {
  const points: string[] = [];
  for (let k = 0; k < 6; k++) {
    const a = (Math.PI / 3) * k;
    points.push(
      `${(cx + r * Math.cos(a)).toFixed(2)},${(cy + r * Math.sin(a)).toFixed(2)}`
    );
  }
  return points.join(" ");
}

/* ------------------------------------------------------------------ */
/* Glyphs                                                              */
/* ------------------------------------------------------------------ */

/** ETARNITY Studio — design canvas. */
function StudioGlyph() {
  return (
    <svg {...GLYPH_SVG_PROPS}>
      {/* canvas frame */}
      <rect
        x="10"
        y="10"
        width="76"
        height="76"
        rx="14"
        stroke={HAIRLINE}
        strokeWidth="1.5"
      />
      {/* rotating electric selection ring (8 even dashes → smooth spin) */}
      <circle
        cx="48"
        cy="48"
        r="21"
        stroke={ELECTRIC}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeDasharray="5 7.5"
        pathLength={100}
        className="glyph-spin"
      />
      {/* center crosshair */}
      <line
        x1="41"
        y1="48"
        x2="55"
        y2="48"
        stroke={GRAPHITE}
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.85"
      />
      <line
        x1="48"
        y1="41"
        x2="48"
        y2="55"
        stroke={GRAPHITE}
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.85"
      />
      {/* corner brackets — staggered breathing */}
      <path
        d="M18 26 L18 18 L26 18"
        stroke={GRAPHITE}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="glyph-bracket"
      />
      <path
        d="M70 18 L78 18 L78 26"
        stroke={GRAPHITE}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="glyph-bracket"
        style={{ animationDelay: "0.75s" }}
      />
      <path
        d="M78 70 L78 78 L70 78"
        stroke={GRAPHITE}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="glyph-bracket"
        style={{ animationDelay: "1.5s" }}
      />
      <path
        d="M26 78 L18 78 L18 70"
        stroke={GRAPHITE}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="glyph-bracket"
        style={{ animationDelay: "2.25s" }}
      />
    </svg>
  );
}

/** ETAR.AI — neural net. */

/** [x, y] — four graphite nodes; the electric core sits at (48, 48). */
const AI_NODES: ReadonlyArray<readonly [number, number]> = [
  [26, 28],
  [70, 28],
  [26, 68],
  [70, 68],
];

/** Directed edges: the perimeter circulates clockwise, spokes feed the core. */
const AI_EDGES: ReadonlyArray<readonly [number, number, number, number]> = [
  [26, 28, 70, 28], // top →
  [70, 28, 70, 68], // right ↓
  [70, 68, 26, 68], // bottom ←
  [26, 68, 26, 28], // left ↑
  [26, 28, 48, 48], // spokes → core
  [70, 28, 48, 48],
  [26, 68, 48, 48],
  [70, 68, 48, 48],
];

const AI_EDGE_PAD = 6.5;

function AIGlyph() {
  return (
    <svg {...GLYPH_SVG_PROPS}>
      {/* hairline tracks */}
      {AI_EDGES.map(([x1, y1, x2, y2], i) => {
        const e = trimmedEdge(x1, y1, x2, y2, AI_EDGE_PAD);
        return (
          <line
            key={`track-${i}`}
            x1={e.ax}
            y1={e.ay}
            x2={e.bx}
            y2={e.by}
            stroke={HAIRLINE}
            strokeWidth="1.5"
          />
        );
      })}
      {/* traveling dash pulses (one comet per edge, staggered) */}
      {AI_EDGES.map(([x1, y1, x2, y2], i) => {
        const e = trimmedEdge(x1, y1, x2, y2, AI_EDGE_PAD);
        return (
          <line
            key={`pulse-${i}`}
            x1={e.ax}
            y1={e.ay}
            x2={e.bx}
            y2={e.by}
            stroke={GRAPHITE}
            strokeOpacity="0.5"
            strokeWidth="1.5"
            strokeLinecap="round"
            pathLength={100}
            strokeDasharray="16 84"
            className="glyph-edge-pulse"
            style={{ animationDelay: `${i * 0.3}s` }}
          />
        );
      })}
      {/* graphite nodes — staggered opacity breathing */}
      {AI_NODES.map(([x, y], i) => (
        <circle
          key={`node-${i}`}
          cx={x}
          cy={y}
          r="3.5"
          stroke={GRAPHITE}
          strokeWidth="1.5"
          className="glyph-node"
          style={{ animationDelay: `${i * 0.8}s` }}
        />
      ))}
      {/* electric core */}
      <circle cx="48" cy="48" r="4.5" fill={ELECTRIC} className="glyph-node-core" />
    </svg>
  );
}

/** SignalPath — radar. */
function SignalGlyph() {
  return (
    <svg {...GLYPH_SVG_PROPS}>
      {/* range rings — staggered opacity ping (ripple) */}
      <circle
        cx="48"
        cy="48"
        r="15"
        stroke={GRAPHITE}
        strokeWidth="1.5"
        className="glyph-ring"
      />
      <circle
        cx="48"
        cy="48"
        r="25"
        stroke={GRAPHITE}
        strokeWidth="1.5"
        className="glyph-ring"
        style={{ animationDelay: "0.6s" }}
      />
      {/* rotating sweep with a dot riding its end */}
      <g className="glyph-radar-sweep">
        <line
          x1="48"
          y1="48"
          x2="48"
          y2="23"
          stroke={ELECTRIC}
          strokeWidth="1.75"
          opacity="0.85"
        />
        <circle cx="48" cy="23" r="2" fill={ELECTRIC} />
      </g>
      {/* beacon core */}
      <circle cx="48" cy="48" r="3" fill={ELECTRIC} className="glyph-radar-core" />
    </svg>
  );
}

/** NorthCell — honeycomb. */

/** Center cell + ring of six, listed in sweep order (clockwise from bottom). */
const CELL_CENTERS: ReadonlyArray<readonly [number, number]> = [
  [48, 48],
  [48, 75.5],
  [71.82, 61.75],
  [71.82, 34.25],
  [48, 20.5],
  [24.18, 34.25],
  [24.18, 61.75],
];

const CELL_HEX_R = 13.5;

function CellGlyph() {
  return (
    <svg {...GLYPH_SVG_PROPS}>
      {CELL_CENTERS.map(([cx, cy], i) => (
        <g key={`cell-${i}`}>
          {/* base hexagon — soft graphite hairline */}
          <polygon
            points={hexPoints(cx, cy, CELL_HEX_R)}
            fill="none"
            stroke={GRAPHITE}
            strokeOpacity="0.3"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          {/* electric glow overlay — sequential sweep */}
          <polygon
            points={hexPoints(cx, cy, CELL_HEX_R)}
            fill={ELECTRIC}
            fillOpacity="0.12"
            stroke={ELECTRIC}
            strokeWidth="1.5"
            strokeLinejoin="round"
            className="glyph-cell-glow"
            style={{ animationDelay: `${i * 0.5}s` }}
          />
        </g>
      ))}
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Glyph picker                                                        */
/* ------------------------------------------------------------------ */

type GlyphComponent = () => React.ReactElement;

const GLYPHS: readonly GlyphComponent[] = [
  StudioGlyph,
  AIGlyph,
  SignalGlyph,
  CellGlyph,
];

const GLYPHS_BY_SLUG: Readonly<Record<string, GlyphComponent>> = {
  "etarnity-studio": StudioGlyph,
  "etar-ai": AIGlyph,
  signalpath: SignalGlyph,
  northcell: CellGlyph,
};

/**
 * Deterministic glyph picker — known slugs map to their signature glyph,
 * unknown slugs cycle through the set by index (stable, no randomness).
 */
export function BusinessGlyph({
  slug,
  index,
}: {
  slug: string;
  index: number;
}) {
  const Glyph =
    GLYPHS_BY_SLUG[slug] ?? GLYPHS[((index % 4) + 4) % 4] ?? StudioGlyph;
  return <Glyph />;
}

/* ------------------------------------------------------------------ */
/* Card                                                                */
/* ------------------------------------------------------------------ */

export default function EcosystemCard({
  business,
  index,
}: {
  business: Business;
  index: number;
}) {
  return (
    <Link
      to={`/businesses/${business.slug}`}
      className="group relative block h-[320px] overflow-hidden rounded-xl border border-hairline bg-white transition-[transform,box-shadow,border-color] duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(21,23,27,0.07)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric/40"
    >
      {/* LAYER A — default: animated glyph + name (duplicates Layer B). */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-6 px-6 text-center transition-all duration-500 delay-150 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:duration-300 group-hover:delay-0 group-hover:opacity-0 group-hover:scale-[0.94] group-focus-within:duration-300 group-focus-within:delay-0 group-focus-within:opacity-0 group-focus-within:scale-[0.94] motion-reduce:transition-none motion-reduce:group-hover:opacity-0"
      >
        <BusinessGlyph slug={business.slug} index={index} />
        <p className="text-lg font-semibold text-graphite">{business.name}</p>
        <p className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-soft/70">
          Hover to reveal
        </p>
      </div>

      {/* LAYER B — revealed on hover / keyboard focus. */}
      <div className="pointer-events-none absolute inset-0 flex flex-col p-6 opacity-0 translate-y-3 transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:delay-150 group-hover:duration-500 group-hover:opacity-100 group-hover:translate-y-0 group-focus-within:delay-150 group-focus-within:duration-500 group-focus-within:opacity-100 group-focus-within:translate-y-0 motion-reduce:translate-y-0 motion-reduce:transition-none motion-reduce:group-hover:opacity-100">
        <div className="flex items-center">
          {business.logo ? (
            <span className="relative size-10 overflow-hidden rounded-lg">
              <Image
                src={business.logo.url}
                alt={business.logo.altText ?? business.name}
                fill
                sizes="40px"
                className="object-cover"
              />
            </span>
          ) : (
            <span
              aria-hidden="true"
              className="flex size-10 items-center justify-center rounded-lg bg-graphite text-sm font-semibold text-warmwhite"
            >
              {business.name.charAt(0)}
            </span>
          )}
          <StatusChip status={business.operationalStatus} className="ml-auto" />
        </div>
        <h3 className="mt-4 text-[15px] font-semibold text-graphite">
          {business.name}
        </h3>
        <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.15em] text-ink-soft">
          {business.category}
        </p>
        <p className="mt-2 line-clamp-3 text-[13px] leading-relaxed text-ink-soft">
          {business.summary}
        </p>
        <p className="mt-auto inline-flex items-center gap-1 pt-4 text-xs font-medium text-electric">
          Explore
          <ArrowUpRight
            aria-hidden="true"
            className="size-3.5 -translate-x-1 opacity-0 transition group-hover:translate-x-0 group-hover:opacity-100"
          />
        </p>
      </div>
    </Link>
  );
}

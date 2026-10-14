"use client";

/**
 * ETARNITY ECOSYSTEM — the signature 3D visual.
 * One central translucent structure (the parent company) with softly
 * connected orbiting elements (businesses, technology, people, products,
 * innovation, ventures) on inclined rings. Bright editorial palette:
 * charcoal hairline rings, soft lavender + periwinkle nodes, generous
 * negative space. Slow drift, cursor parallax, DPR-capped, pauses
 * offscreen, reduced-motion renders a static frame, mobile degrades
 * ring/node counts.
 */

import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";

/* ------------------------------- Palette --------------------------------- */

const INK = { r: 27, g: 28, b: 32 };
const ACCENT = { r: 124, g: 107, b: 166 };
const PERI = { r: 163, g: 168, b: 212 };

const rgba = (c: { r: number; g: number; b: number }, a: number) =>
  `rgba(${c.r},${c.g},${c.b},${a})`;

/* ----------------------------- Configuration ------------------------------- */

interface RingConfig {
  radius: number; // fraction of min dimension
  tilt: number; // inclination (rad)
  yaw: number; // rotation of the plane (rad)
  nodes: number;
  speed: number; // rad / second
  nodeColors: ("accent" | "peri" | "ink")[];
  alpha: number;
}

const RINGS: RingConfig[] = [
  {
    radius: 0.34, tilt: 1.18, yaw: 0.4, nodes: 5, speed: 0.05,
    nodeColors: ["accent", "ink", "peri", "ink", "accent"], alpha: 0.5,
  },
  {
    radius: 0.46, tilt: 0.62, yaw: -0.9, nodes: 7, speed: -0.035,
    nodeColors: ["ink", "peri", "ink", "accent", "ink", "peri", "ink"], alpha: 0.34,
  },
  {
    radius: 0.58, tilt: 1.62, yaw: 2.1, nodes: 9, speed: 0.022,
    nodeColors: ["peri", "ink", "ink", "accent", "ink", "peri", "ink", "ink", "peri"], alpha: 0.22,
  },
];

const DUST_COUNT = 26;

/* -------------------------------- Component -------------------------------- */

export function HeroVisual({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const isMobile = window.matchMedia("(max-width: 767px)").matches;
    const rings = isMobile ? RINGS.slice(0, 2) : RINGS;
    const dustCount = isMobile ? Math.floor(DUST_COUNT / 2) : DUST_COUNT;
    const SAMPLES = 96;
    const FOCAL = 620; // perspective focal length (px units pre-scaled)

    let w = 0;
    let h = 0;
    let dpr = 1;
    let raf = 0;
    let running = true;
    let inView = true;
    const start = performance.now();

    /* Cursor parallax state */
    let targetPitch = 0;
    let targetYaw = 0;
    let pitch = 0;
    let yaw = 0;

    const onPointer = (e: PointerEvent) => {
      const nx = e.clientX / window.innerWidth - 0.5;
      const ny = e.clientY / window.innerHeight - 0.5;
      targetYaw = nx * 0.22;
      targetPitch = ny * 0.14;
    };
    window.addEventListener("pointermove", onPointer, { passive: true });

    const onVisibility = () => {
      running = !document.hidden;
      if (running) raf = requestAnimationFrame(draw);
    };
    document.addEventListener("visibilitychange", onVisibility);

    const io = new IntersectionObserver(
      (entries) => {
        inView = entries[0]?.isIntersecting ?? true;
      },
      { rootMargin: "120px" }
    );
    io.observe(canvas);

    /* Dust particles (deterministic pseudo-random) */
    const dust = Array.from({ length: dustCount }, (_, i) => {
      const s = Math.sin(i * 12.9898) * 43758.5453;
      const r1 = s - Math.floor(s);
      const t = Math.cos(i * 78.233) * 12543.1456;
      const r2 = t - Math.floor(t);
      const u = Math.sin(i * 43.7) * 2634.231;
      const r3 = u - Math.floor(u);
      return {
        x: r1 * 2 - 1,
        y: r2 * 2 - 1,
        z: r3 * 2 - 0.6,
        size: 0.6 + r1 * 1.2,
        speed: 0.008 + r2 * 0.02,
        phase: r3 * Math.PI * 2,
      };
    });

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = rect.width;
      h = rect.height;
      canvas.width = Math.max(1, Math.round(w * dpr));
      canvas.height = Math.max(1, Math.round(h * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    /* Project a 3D point -> 2D (with system pitch/yaw applied). */
    const project = (
      x: number,
      y: number,
      z: number,
      cx: number,
      cy: number,
      scale: number
    ) => {
      // apply system yaw then pitch
      const cyw = Math.cos(yaw);
      const syw = Math.sin(yaw);
      const x1 = x * cyw - z * syw;
      const z1 = x * syw + z * cyw;
      const cp = Math.cos(pitch);
      const sp = Math.sin(pitch);
      const y2 = y * cp - z1 * sp;
      const z2 = y * sp + z1 * cp;
      const s = FOCAL / (FOCAL + z2 * scale);
      return { x: cx + x1 * s * scale, y: cy + y2 * s * scale, s, depth: z2 };
    };

    const draw = (now: number) => {
      const t = (now - start) / 1000;

      /* Ease parallax toward target */
      pitch += (targetPitch - pitch) * 0.04;
      yaw += (targetYaw - yaw) * 0.04;

      ctx.clearRect(0, 0, w, h);

      const cx = w / 2;
      const cy = h / 2;
      const scale = Math.min(w, h);

      /* ---- Ambient dust ---- */
      for (const d of dust) {
        const p = project(
          d.x * scale * 0.42,
          (d.y + Math.sin(t * d.speed * 10 + d.phase) * 0.03) * scale * 0.42,
          d.z * scale * 0.4,
          cx,
          cy,
          1
        );
        const a = 0.08 + (p.s - 0.7) * 0.12;
        if (a <= 0) continue;
        ctx.fillStyle = rgba(INK, Math.min(0.2, a));
        ctx.beginPath();
        ctx.arc(p.x, p.y, d.size * (p.s > 1 ? 1.1 : 0.8), 0, Math.PI * 2);
        ctx.fill();
      }

      /* ---- Node positions per ring (computed once per frame) ---- */
      const ringNodes: {
        x: number;
        y: number;
        s: number;
        depth: number;
        color: "accent" | "peri" | "ink";
        alpha: number;
      }[][] = [];

      rings.forEach((ring, ri) => {
        const phase = t * ring.speed;

        /* Ring path */
        ctx.beginPath();
        let first = true;
        for (let i = 0; i <= SAMPLES; i++) {
          const a = (i / SAMPLES) * Math.PI * 2;
          // point on circle in ring plane
          const xr = Math.cos(a) * ring.radius;
          const yr = Math.sin(a) * ring.radius;
          // apply ring tilt + yaw (plane orientation)
          const ct = Math.cos(ring.tilt);
          const st = Math.sin(ring.tilt);
          const cyy = Math.cos(ring.yaw);
          const syy = Math.sin(ring.yaw);
          const y1 = yr * ct;
          const z1 = yr * st;
          const x2 = xr * cyy - z1 * syy;
          const z2 = xr * syy + z1 * cyy;
          const p = project(x2 * scale, y1 * scale, z2 * scale, cx, cy, 1);
          if (first) {
            ctx.moveTo(p.x, p.y);
            first = false;
          } else {
            ctx.lineTo(p.x, p.y);
          }
        }
        ctx.strokeStyle = rgba(INK, ring.alpha * (reduced ? 0.9 : 1));
        ctx.lineWidth = 1;
        ctx.stroke();

        /* Nodes */
        const nodes: typeof ringNodes[number] = [];
        for (let n = 0; n < ring.nodes; n++) {
          const a = phase + (n / ring.nodes) * Math.PI * 2;
          const xr = Math.cos(a) * ring.radius;
          const yr = Math.sin(a) * ring.radius;
          const ct = Math.cos(ring.tilt);
          const st = Math.sin(ring.tilt);
          const cyy = Math.cos(ring.yaw);
          const syy = Math.sin(ring.yaw);
          const y1 = yr * ct;
          const z1 = yr * st;
          const x2 = xr * cyy - z1 * syy;
          const z2 = xr * syy + z1 * cyy;
          const p = project(x2 * scale, y1 * scale, z2 * scale, cx, cy, 1);
          nodes.push({
            ...p,
            color: ring.nodeColors[n % ring.nodeColors.length],
            alpha: ring.alpha,
          });
        }
        ringNodes.push(nodes);
      });

      /* ---- Connections: core -> inner-ring nodes (very subtle) ---- */
      const inner = ringNodes[0] ?? [];
      ctx.lineWidth = 1;
      for (const n of inner) {
        const a = 0.14 * (1 - Math.min(1, Math.max(0, (n.depth + 0.5) / 1.2)));
        if (a <= 0.02) continue;
        ctx.strokeStyle = n.color === "accent" ? rgba(ACCENT, a * 1.4) : rgba(INK, a);
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(n.x, n.y);
        ctx.stroke();
      }

      /* ---- The core: translucent lavender sphere + fine ring ---- */
      const coreR = scale * 0.075;
      const glow = ctx.createRadialGradient(cx, cy, coreR * 0.2, cx, cy, coreR * 2.1);
      glow.addColorStop(0, rgba(ACCENT, 0.14));
      glow.addColorStop(0.5, rgba(ACCENT, 0.05));
      glow.addColorStop(1, rgba(ACCENT, 0));
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(cx, cy, coreR * 2.1, 0, Math.PI * 2);
      ctx.fill();

      const coreFill = ctx.createRadialGradient(
        cx - coreR * 0.25,
        cy - coreR * 0.3,
        coreR * 0.1,
        cx,
        cy,
        coreR
      );
      coreFill.addColorStop(0, rgba(ACCENT, 0.32));
      coreFill.addColorStop(0.7, rgba(ACCENT, 0.12));
      coreFill.addColorStop(1, rgba(ACCENT, 0.04));
      ctx.fillStyle = coreFill;
      ctx.beginPath();
      ctx.arc(cx, cy, coreR, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = rgba(ACCENT, 0.45);
      ctx.lineWidth = 1;
      ctx.stroke();

      /* inner detail ring */
      ctx.beginPath();
      ctx.arc(cx, cy, coreR * 0.55, 0, Math.PI * 2);
      ctx.strokeStyle = rgba(INK, 0.16);
      ctx.stroke();

      /* ---- Nodes with halos (depth-shaded) ---- */
      ringNodes.forEach((nodes) => {
        for (const n of nodes) {
          const depthAlpha = 1 - Math.min(1, Math.max(0, (n.depth + 0.5) / 1.2));
          const c =
            n.color === "accent" ? ACCENT : n.color === "peri" ? PERI : INK;
          const base = n.color === "ink" ? 0.5 : 0.85;
          const a = base * depthAlpha;
          if (a <= 0.03) continue;

          const size = (n.color === "ink" ? 2.2 : 3.2) * (n.s > 1 ? 1.15 : 0.85);

          /* halo */
          const halo = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, size * 4);
          halo.addColorStop(0, rgba(c, a * 0.25));
          halo.addColorStop(1, rgba(c, 0));
          ctx.fillStyle = halo;
          ctx.beginPath();
          ctx.arc(n.x, n.y, size * 4, 0, Math.PI * 2);
          ctx.fill();

          /* node */
          ctx.fillStyle = rgba(c, a);
          ctx.beginPath();
          ctx.arc(n.x, n.y, size, 0, Math.PI * 2);
          ctx.fill();

          /* accent nodes get a fine ring */
          if (n.color === "accent" && a > 0.4) {
            ctx.strokeStyle = rgba(c, a * 0.5);
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(n.x, n.y, size + 4, 0, Math.PI * 2);
            ctx.stroke();
          }
        }
      });

      if (running && inView && !reduced) {
        raf = requestAnimationFrame(draw);
      }
    };

    if (reduced) {
      /* Single static frame */
      raf = requestAnimationFrame((now) => draw(now));
    } else {
      raf = requestAnimationFrame(draw);
    }

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onPointer);
      document.removeEventListener("visibilitychange", onVisibility);
      io.disconnect();
      ro.disconnect();
    };
  }, [reduced]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      aria-hidden="true"
      role="presentation"
    />
  );
}

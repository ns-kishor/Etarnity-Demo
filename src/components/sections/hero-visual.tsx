"use client";

import * as React from "react";

/**
 * ETARNITY CORE — the company's signature generative visual.
 *
 * A bespoke canvas system, not a stock 3D object:
 *   one nucleus  →  five inclined orbital rings  →  orbiting nodes
 *   →  live connections between nodes near each other in space.
 *
 * Reading: one company → many businesses → one ecosystem.
 *
 * Engineering notes:
 *  - Pure canvas 2D with manual 3D projection (no heavy scene graph).
 *  - rAF loop paused when off-screen or tab hidden.
 *  - DPR capped at 2; node/particle counts reduced on small screens.
 *  - Honors prefers-reduced-motion with a single static frame.
 *  - Responds to cursor (parallax) and scroll (drift + fade).
 */

interface Vec3 {
  x: number;
  y: number;
  z: number;
}

interface RingDef {
  radius: number; // relative to core scale
  incl: number; // inclination around X axis (radians)
  yaw0: number; // additional base yaw of the ring plane
  nodes: number;
  speed: number; // orbital angular speed
  phase: number;
  hue: "emerald" | "champagne" | "ivory";
  alpha: number;
}

const RINGS: RingDef[] = [
  { radius: 0.34, incl: 0.0, yaw0: 0.0, nodes: 3, speed: 0.22, phase: 0.2, hue: "ivory", alpha: 0.5 },
  { radius: 0.52, incl: 0.42, yaw0: 0.6, nodes: 4, speed: -0.16, phase: 1.1, hue: "emerald", alpha: 0.8 },
  { radius: 0.72, incl: -0.55, yaw0: 1.9, nodes: 5, speed: 0.12, phase: 2.4, hue: "emerald", alpha: 0.65 },
  { radius: 0.94, incl: 0.95, yaw0: 3.4, nodes: 5, speed: -0.09, phase: 0.7, hue: "champagne", alpha: 0.7 },
  { radius: 1.18, incl: -0.28, yaw0: 5.1, nodes: 6, speed: 0.07, phase: 3.9, hue: "ivory", alpha: 0.45 },
];

const COLORS = {
  emerald: [91, 191, 142],
  champagne: [201, 168, 106],
  ivory: [226, 228, 221],
} as const;

function rotY(p: Vec3, a: number): Vec3 {
  const c = Math.cos(a);
  const s = Math.sin(a);
  return { x: p.x * c + p.z * s, y: p.y, z: -p.x * s + p.z * c };
}
function rotX(p: Vec3, a: number): Vec3 {
  const c = Math.cos(a);
  const s = Math.sin(a);
  return { x: p.x, y: p.y * c - p.z * s, z: p.y * s + p.z * c };
}

export function HeroVisual({ className }: { className?: string }) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let raf = 0;
    let running = true;
    let visible = true;
    const startTime = performance.now();

    /* Interaction state — eased toward targets */
    let yawTarget = 0;
    let pitchTarget = 0;
    let yaw = 0.2;
    let pitch = -0.28;
    const mouse = { x: 0.5, y: 0.5 };

    const onPointer = (e: PointerEvent) => {
      mouse.x = e.clientX / window.innerWidth;
      mouse.y = e.clientY / window.innerHeight;
      yawTarget = (mouse.x - 0.5) * 0.55;
      pitchTarget = -0.28 + (mouse.y - 0.5) * 0.22;
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();

    const io = new IntersectionObserver(
      (entries) => {
        visible = entries[0]?.isIntersecting ?? true;
      },
      { threshold: 0.02 }
    );
    io.observe(canvas);

    const onVisibility = () => {
      running = !document.hidden;
    };
    document.addEventListener("visibilitychange", onVisibility);

    if (!reduce) {
      window.addEventListener("pointermove", onPointer, { passive: true });
    }

    /* ------------------------------- rendering ------------------------------ */

    const draw = (now: number) => {
      const t = reduce ? 0 : (now - startTime) / 1000;

      /* Scroll: drift + fade as the hero leaves the viewport */
      const heroEl = canvas.closest("[data-hero]") as HTMLElement | null;
      const heroH = heroEl?.offsetHeight || height;
      const scrollP = Math.min(Math.max(window.scrollY / (heroH * 0.9), 0), 1);
      const sceneAlpha = 1 - scrollP * 0.55;

      /* Ease interaction */
      yaw += ((reduce ? 0 : yawTarget) + 0.2 - yaw) * 0.045;
      pitch += ((reduce ? -0.28 : pitchTarget) - pitch) * 0.045;
      const globalYaw = yaw + t * 0.05 + scrollP * 0.5;

      ctx.clearRect(0, 0, width, height);

      const isDesktop = width >= 1024;
      const cx = width * (isDesktop ? 0.62 : 0.5);
      const cy = height * (isDesktop ? 0.52 : 0.4);
      const core = Math.min(width, height) * (isDesktop ? 0.42 : 0.34) * (1 - scrollP * 0.1);
      const focal = 3.2;

      const project = (p: Vec3) => {
        const pr = rotX(rotY(p, globalYaw), pitch);
        const s = focal / (focal + pr.z / core);
        return { x: cx + pr.x * s, y: cy + pr.y * s, z: pr.z, s };
      };

      /* Ambient dust — a faint field of stability around the structure */
      const dustCount = isDesktop ? 90 : 44;
      ctx.save();
      for (let i = 0; i < dustCount; i++) {
        const seed = i * 127.1;
        const a = seed * 0.707 + t * 0.02 * (i % 3 === 0 ? 1 : -1);
        const r = core * (1.45 + ((i * 37) % 100) / 100 * 0.9);
        const inc = ((i * 91) % 100) / 100 * Math.PI - Math.PI / 2;
        const p = project({
          x: r * Math.cos(a),
          y: r * Math.sin(inc) * 0.6,
          z: r * Math.sin(a),
        });
        const depth = 0.5 + 0.5 * (1 - Math.min(p.z / (core * 1.4), 1));
        ctx.fillStyle = `rgba(210,214,205,${0.05 + depth * 0.09 * sceneAlpha})`;
        ctx.fillRect(p.x, p.y, 1, 1);
      }
      ctx.restore();

      /* Nucleus — layered glow + rotating hairline shells */
      const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, core * 0.5);
      glow.addColorStop(0, `rgba(76,164,118,${0.16 * sceneAlpha})`);
      glow.addColorStop(0.45, `rgba(76,164,118,${0.05 * sceneAlpha})`);
      glow.addColorStop(1, "rgba(76,164,118,0)");
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(cx, cy, core * 0.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = `rgba(226,228,221,${0.9 * sceneAlpha})`;
      ctx.beginPath();
      ctx.arc(cx, cy, 2.6, 0, Math.PI * 2);
      ctx.fill();

      for (let shell = 0; shell < 3; shell++) {
        const sr = core * (0.16 + shell * 0.09);
        const a0 = t * (shell % 2 === 0 ? 0.4 : -0.3) + shell;
        ctx.strokeStyle = `rgba(91,191,142,${(0.28 - shell * 0.07) * sceneAlpha})`;
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.arc(cx, cy, sr, a0, a0 + Math.PI * 1.6);
        ctx.stroke();
      }

      /* Orbit rings — depth-shaded polylines */
      const nodePoints: { x: number; y: number; z: number; hue: RingDef["hue"] }[] = [];

      for (const ring of RINGS) {
        const segs = isDesktop ? 120 : 72;
        let prev: { x: number; y: number; z: number } | null = null;
        for (let i = 0; i <= segs; i++) {
          const a = (i / segs) * Math.PI * 2;
          let p: Vec3 = {
            x: ring.radius * core * Math.cos(a),
            y: 0,
            z: ring.radius * core * Math.sin(a),
          };
          p = rotX(rotY(p, ring.yaw0), ring.incl);
          const pr = project(p);
          if (prev) {
            const depth = 1 - Math.min((pr.z + core) / (core * 2), 1); // 0 back → 1 front
            const alpha = ring.alpha * (0.25 + depth * 0.75) * sceneAlpha;
            ctx.strokeStyle = `rgba(${COLORS[ring.hue][0]},${COLORS[ring.hue][1]},${COLORS[ring.hue][2]},${alpha})`;
            ctx.lineWidth = 0.9;
            ctx.beginPath();
            ctx.moveTo(prev.x, prev.y);
            ctx.lineTo(pr.x, pr.y);
            ctx.stroke();
          }
          prev = { x: pr.x, y: pr.y, z: pr.z };
        }

        /* Nodes on this ring */
        const nodeCount = isDesktop ? ring.nodes : Math.max(2, Math.round(ring.nodes * 0.6));
        for (let n = 0; n < nodeCount; n++) {
          const a = ring.phase + (n / nodeCount) * Math.PI * 2 + t * ring.speed;
          let p: Vec3 = {
            x: ring.radius * core * Math.cos(a),
            y: 0,
            z: ring.radius * core * Math.sin(a),
          };
          p = rotX(rotY(p, ring.yaw0), ring.incl);
          const pr = project(p);
          nodePoints.push({ ...pr, hue: ring.hue });
        }
      }

      /* Connections — the ecosystem links. Drawn between nodes that
         approach each other in 3D space, alpha by closeness and depth. */
      const linkDist = core * 0.34;
      ctx.lineWidth = 0.75;
      for (let i = 0; i < nodePoints.length; i++) {
        for (let j = i + 1; j < nodePoints.length; j++) {
          const dx = nodePoints[i].x - nodePoints[j].x;
          const dy = nodePoints[i].y - nodePoints[j].y;
          const dz = nodePoints[i].z - nodePoints[j].z;
          const d = Math.sqrt(dx * dx + dy * dy + dz * dz);
          if (d < linkDist) {
            const closeness = 1 - d / linkDist;
            const depth = 1 - Math.min((nodePoints[i].z + nodePoints[j].z + core * 2) / (core * 4), 1);
            const alpha = closeness * (0.16 + depth * 0.34) * sceneAlpha;
            if (alpha > 0.02) {
              ctx.strokeStyle = `rgba(91,191,142,${alpha})`;
              ctx.beginPath();
              ctx.moveTo(nodePoints[i].x, nodePoints[i].y);
              ctx.lineTo(nodePoints[j].x, nodePoints[j].y);
              ctx.stroke();
            }
          }
        }
      }

      /* Nodes — glowing points, front-most drawn last */
      const sorted = [...nodePoints].sort((a, b) => a.z - b.z);
      for (const n of sorted) {
        const depth = 1 - Math.min((n.z + core) / (core * 2), 1);
        const size = (n.hue === "champagne" ? 2.4 : 2.0) * (0.6 + depth * 0.8);
        const [r, g, b] = COLORS[n.hue];
        const alpha = (0.35 + depth * 0.65) * sceneAlpha;

        const halo = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, size * 4.5);
        halo.addColorStop(0, `rgba(${r},${g},${b},${alpha * 0.5})`);
        halo.addColorStop(1, `rgba(${r},${g},${b},0)`);
        ctx.fillStyle = halo;
        ctx.beginPath();
        ctx.arc(n.x, n.y, size * 4.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`;
        ctx.beginPath();
        ctx.arc(n.x, n.y, size, 0, Math.PI * 2);
        ctx.fill();
      }

      /* Thin outer atmosphere ring — the boundary of the system */
      ctx.strokeStyle = `rgba(201,168,106,${0.14 * sceneAlpha})`;
      ctx.lineWidth = 0.7;
      ctx.setLineDash([2, 6]);
      ctx.beginPath();
      ctx.arc(cx, cy, core * 1.42, -0.4 + t * 0.02, Math.PI * 1.6 - 0.4 + t * 0.02);
      ctx.stroke();
      ctx.setLineDash([]);
    };

    const loop = (now: number) => {
      if (running && visible) draw(now);
      raf = requestAnimationFrame(loop);
    };

    if (reduce) {
      draw(startTime); // one considered frame, no motion
    } else {
      raf = requestAnimationFrame(loop);
    }

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      if (!reduce) window.removeEventListener("pointermove", onPointer);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={className}
      style={{ width: "100%", height: "100%" }}
    />
  );
}

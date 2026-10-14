"use client";

/**
 * ChromeOrbit — the ETARNITY hero's signature 3D visual.
 *
 * A faithful, fully offline implementation of the React Bits "Chrome Orbit"
 * concept: a liquid-chrome sphere inside four interlocking orbital bands
 * (a gyroscope / armillary sphere) with small satellite spheres travelling
 * along them — exactly one electric-blue (#526BFF) accent satellite.
 *
 * Module surface (this is the ONLY file owned by task 2-b):
 *
 *   export default ChromeOrbit({ bandWidth = 0.09, className })
 *       SSR-safe client gate: renders a static CSS chrome-orb fallback until
 *       mounted, then swaps to the live WebGL scene — but only when WebGL is
 *       available AND the user has not requested reduced motion. Any three.js
 *       error is caught by an error boundary that renders the fallback.
 *   export ChromeOrbitLazy
 *       next/dynamic wrapper (ssr: false) around the live scene.
 *   export ChromeOrbitScene
 *       The raw React Three Fiber scene (client only).
 *   export ChromeOrbitFallback
 *       Static, animation-free CSS chrome orb (also used as loading fallback).
 *
 * Sizing: the parent controls geometry. Render it inside a sized container:
 *   <div className="relative h-[420px] md:h-[560px] rounded-2xl bg-graphite overflow-hidden">
 *     <ChromeOrbit bandWidth={0.09} />
 *   </div>
 *
 * Offline guarantee: reflections come from drei <Lightformer> meshes rendered
 * into an <Environment> cube — no remote HDRIs, no `preset`, no `files`.
 */

import * as React from "react";
import dynamic from "next/dynamic";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import type { Group, Mesh } from "three";

// ---------------------------------------------------------------------------
// Types & public API
// ---------------------------------------------------------------------------

export type ChromeOrbitProps = {
  /** Torus tube radius as a fraction of each band's radius. Default 0.09. */
  bandWidth?: number;
  /** Extra classes for the component root (root is always h-full w-full). */
  className?: string;
};

// ---------------------------------------------------------------------------
// Orbital system configuration
// ---------------------------------------------------------------------------

type SatelliteSpec = {
  /** Satellite sphere radius. */
  r: number;
  /** Angular speed along the band (rad/s; sign = direction). */
  speed: number;
  /** Starting angle (rad). */
  phase: number;
  /** The single electric-blue accent satellite. */
  accent?: boolean;
};

type BandSpec = {
  /** Ring radius (torus centerline). */
  radius: number;
  /** Static tilt (rad) — distinct per band; no two rings are coplanar. */
  tilt: [number, number, number];
  /** Axis the whole tilted band assembly slowly rotates around. */
  spinAxis: "x" | "y";
  /** Assembly rotation speed (rad/s). */
  spinSpeed: number;
  satellites: SatelliteSpec[];
};

const BANDS: BandSpec[] = [
  // Inner ring — the one "tumbling" band (spins around x). Small enough that
  // its worst-case reach (radius + tube) can never leave the frame.
  { radius: 1.45, tilt: [0.3, 0.85, -0.4], spinAxis: "x", spinSpeed: 0.15, satellites: [] },
  // Outer three bands precess around the vertical like a gyroscope, each at
  // its own inclination, so the ensemble constantly re-configures.
  {
    radius: 1.75,
    tilt: [0.55, 0.45, 0.4],
    spinAxis: "y",
    spinSpeed: -0.11,
    satellites: [{ r: 0.07, speed: 0.42, phase: 0.8 }],
  },
  {
    radius: 2.05,
    tilt: [0.75, -0.35, 0.55],
    spinAxis: "y",
    spinSpeed: 0.08,
    satellites: [{ r: 0.065, speed: -0.3, phase: 2.1, accent: true }],
  },
  {
    radius: 2.35,
    tilt: [0.95, 0.36, -0.5],
    spinAxis: "y",
    spinSpeed: -0.06,
    satellites: [
      { r: 0.06, speed: 0.25, phase: 4.2 },
      { r: 0.06, speed: -0.38, phase: 1.4 },
    ],
  },
];

/** Camera (kept identical to the React Bits reference): [0, 0, 6.4], fov 38. */
const CAMERA_Z = 6.4;
const CAMERA_FOV = 38;

/** Half-height of the visible frustum at the origin plane. */
const FRUSTUM_HALF_HEIGHT = Math.tan((CAMERA_FOV / 2) * (Math.PI / 180)) * CAMERA_Z; // ≈ 2.204

/** Fraction of the half-width the system may occupy at its widest moment. */
const FIT_MARGIN = 0.92;

/** Widest horizontal reach of the system (outer band + tube + satellites). */
function systemHalfWidth(bandWidth: number): number {
  let max = 1; // central chrome sphere
  for (const band of BANDS) {
    const tube = band.radius * bandWidth;
    let half = band.radius + tube;
    for (const sat of band.satellites) {
      half = Math.max(half, band.radius + tube + sat.r * 1.6);
    }
    max = Math.max(max, half);
  }
  return max;
}

// ---------------------------------------------------------------------------
// Capability helpers (client-only; safe to call from effects)
// ---------------------------------------------------------------------------

function hasWebGLContext(): boolean {
  if (typeof document === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return false;
  }
  try {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Static fallback — pure CSS chrome orb (no animation, decorative)
// ---------------------------------------------------------------------------

export function ChromeOrbitFallback({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`relative h-full w-full overflow-hidden ${className ?? ""}`}
    >
      <div className="absolute inset-0 flex items-center justify-center">
        {/* The orb box is square; every offset below is a percentage of it. */}
        <div className="relative" style={{ width: "min(64%, 400px)", aspectRatio: "1 / 1" }}>
          {/* Orbital ring — back pass (hidden by the orb where they overlap). */}
          <span
            className="absolute"
            style={{
              left: "-14%",
              top: "50%",
              width: "128%",
              height: "36%",
              marginTop: "-18%",
              transform: "rotate(-16deg)",
              borderRadius: "50%",
              border: "1px solid rgba(170, 183, 255, 0.6)",
              boxShadow: "0 0 18px rgba(170, 183, 255, 0.12)",
            }}
          />
          {/* Chrome orb — dark radial-gradient disc with a specular highlight. */}
          <span
            className="absolute rounded-full"
            style={{
              inset: 0,
              background: [
                "radial-gradient(circle at 32% 26%, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0) 22%)",
                "radial-gradient(circle at 72% 82%, rgba(170, 183, 255, 0.24) 0%, rgba(170, 183, 255, 0) 45%)",
                "radial-gradient(circle at 50% 42%, #454b57 0%, #2b2f38 46%, #14161b 74%, #07080b 100%)",
              ].join(", "),
              boxShadow: [
                "inset 0 0 0 1px rgba(255, 255, 255, 0.05)",
                "inset 10px 14px 30px rgba(255, 255, 255, 0.06)",
                "inset -10px -16px 34px rgba(0, 0, 0, 0.55)",
                "0 24px 70px rgba(82, 107, 255, 0.1)",
              ].join(", "),
            }}
          />
          {/* Orbital ring — front pass, clipped to the arc that crosses the
              orb's face so the ring appears to wrap around it. */}
          <span
            className="absolute"
            style={{
              left: "-14%",
              top: "50%",
              width: "128%",
              height: "36%",
              marginTop: "-18%",
              transform: "rotate(-16deg)",
              borderRadius: "50%",
              border: "1px solid rgba(170, 183, 255, 0.6)",
              clipPath: "inset(50% 12% 0 12%)",
            }}
          />
          {/* Electric satellite riding the ring (the single accent). */}
          <span
            className="absolute rounded-full"
            style={{
              left: "28.5%",
              top: "73.1%",
              width: "3.5%",
              aspectRatio: "1 / 1",
              transform: "translate(-50%, -50%)",
              background: "#526BFF",
              boxShadow: "0 0 14px 3px rgba(82, 107, 255, 0.55)",
            }}
          />
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Error boundary — any three.js failure degrades to the static fallback
// ---------------------------------------------------------------------------

class ChromeOrbitErrorBoundary extends React.Component<
  { fallback?: React.ReactNode; children?: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { fallback?: React.ReactNode; children?: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): { hasError: boolean } {
    return { hasError: true };
  }

  componentDidCatch(error: unknown, info: React.ErrorInfo): void {
    console.error("[ChromeOrbit] 3D scene failed, showing static fallback:", error, info.componentStack);
  }

  render(): React.ReactNode {
    return this.state.hasError ? this.props.fallback : this.props.children;
  }
}

// ---------------------------------------------------------------------------
// Scene internals
// ---------------------------------------------------------------------------

/**
 * One band: a slowly rotating assembly containing a statically tilted chrome
 * ring plus its satellite spheres. The animated spin is applied OUTSIDE the
 * static tilt (world = Spin · Tilt), so the three outer bands precess around
 * the vertical at constant inclination — gyroscope motion whose vertical
 * reach stays inside the frustum for every spin angle.
 */
function BandAssembly({ spec, tubeRatio }: { spec: BandSpec; tubeRatio: number }) {
  const spinRef = React.useRef<Group | null>(null);
  const satRefs = React.useRef<Array<Mesh | null>>([]);
  const angles = React.useRef<number[]>(spec.satellites.map((s) => s.phase));
  const tube = spec.radius * tubeRatio;

  useFrame((_, delta) => {
    if (document.hidden) return; // pause heavy work in background tabs
    const dt = Math.min(delta, 0.1); // clamp tab-return jumps
    const group = spinRef.current;
    if (group) {
      group.rotation[spec.spinAxis] += spec.spinSpeed * dt;
    }
    const sats = spec.satellites;
    for (let i = 0; i < sats.length; i++) {
      const mesh = satRefs.current[i];
      if (!mesh) continue;
      angles.current[i] += sats[i].speed * dt;
      const angle = angles.current[i];
      // Satellite rides just proud of the band surface (bead on a rail).
      const orbitR = spec.radius + tube + sats[i].r * 0.6;
      mesh.position.set(Math.cos(angle) * orbitR, Math.sin(angle) * orbitR, 0);
    }
  });

  return (
    <group ref={spinRef}>
      <group rotation={spec.tilt}>
        <mesh>
          <torusGeometry args={[spec.radius, tube, 32, 160]} />
          <meshPhysicalMaterial
            color="#c9cdd6"
            metalness={1}
            roughness={0.15}
            envMapIntensity={1.4}
          />
        </mesh>
        {spec.satellites.map((sat, i) => {
          const orbitR = spec.radius + tube + sat.r * 0.6;
          return (
            <mesh
              key={i}
              ref={(mesh: Mesh | null) => {
                satRefs.current[i] = mesh;
              }}
              position={[Math.cos(sat.phase) * orbitR, Math.sin(sat.phase) * orbitR, 0]}
            >
              <sphereGeometry args={[sat.r, 24, 24]} />
              {sat.accent ? (
                <meshPhysicalMaterial
                  color="#526BFF"
                  emissive="#526BFF"
                  emissiveIntensity={2.2}
                  metalness={0.25}
                  roughness={0.3}
                />
              ) : (
                <meshPhysicalMaterial
                  color="#c9cdd6"
                  metalness={1}
                  roughness={0.12}
                  envMapIntensity={1.5}
                />
              )}
            </mesh>
          );
        })}
      </group>
    </group>
  );
}

/**
 * The whole orbital system: central chrome sphere + all bands. Owns the
 * weighted pointer-follow rotation, the slow idle auto-rotation, and a
 * responsive fit so the outermost ring never clips the panel sides.
 */
function OrbitalSystem({ bandWidth }: { bandWidth: number }) {
  const rootRef = React.useRef<Group | null>(null);
  const pointerOffset = React.useRef({ x: 0, y: 0 });
  const idleY = React.useRef(0);
  const size = useThree((state) => state.size);

  // Responsive fit: in narrow (portrait) containers, shrink the system so the
  // widest ring sweep stays inside the frustum. Landscape containers render
  // at the reference scale of 1.
  const aspect = size.width / Math.max(size.height, 1);
  const fit = Math.min(
    1,
    (FRUSTUM_HALF_HEIGHT * aspect * FIT_MARGIN) / systemHalfWidth(bandWidth),
  );

  useFrame((state, delta) => {
    const root = rootRef.current;
    if (!root || document.hidden) return;
    const dt = Math.min(delta, 0.1);

    // Very slow idle auto-rotation (~0.0016 rad per 60fps frame).
    idleY.current += 0.0016 * 60 * dt;

    // Weighted pointer follow: lerped targets, damping ≈ 0.045 per frame.
    const damping = 1 - Math.pow(1 - 0.045, dt * 60);
    pointerOffset.current.x += (state.pointer.y * 0.24 - pointerOffset.current.x) * damping;
    pointerOffset.current.y += (state.pointer.x * 0.38 - pointerOffset.current.y) * damping;

    root.rotation.x = pointerOffset.current.x;
    root.rotation.y = idleY.current + pointerOffset.current.y;
  });

  return (
    <group ref={rootRef} scale={fit}>
      {/* Central chrome sphere — premium liquid chrome. */}
      <mesh>
        <sphereGeometry args={[1, 48, 48]} />
        <meshPhysicalMaterial
          color="#d7dce5"
          metalness={1}
          roughness={0.08}
          clearcoat={1}
          clearcoatRoughness={0.1}
          envMapIntensity={1.6}
        />
      </mesh>
      {BANDS.map((spec, i) => (
        <BandAssembly key={i} spec={spec} tubeRatio={bandWidth} />
      ))}
    </group>
  );
}

// ---------------------------------------------------------------------------
// Live scene
// ---------------------------------------------------------------------------

export function ChromeOrbitScene({ bandWidth = 0.09, className }: ChromeOrbitProps) {
  const safeBandWidth = Number.isFinite(bandWidth)
    ? Math.min(Math.max(bandWidth, 0.02), 0.25)
    : 0.09;

  return (
    <div className={`relative h-full w-full ${className ?? ""}`}>
      <div className="absolute inset-0">
        <Canvas
          dpr={[1, 1.75]}
          camera={{ position: [0, 0, CAMERA_Z], fov: CAMERA_FOV }}
          gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        >
          <ambientLight intensity={0.15} />
          <directionalLight position={[4, 6, 4]} intensity={0.4} />
          <OrbitalSystem bandWidth={safeBandWidth} />
          {/*
            Studio reflections, fully offline: Environment with children only
            (never `preset`/`files`, which fetch remote HDRIs). The color
            attaches to the environment's internal (virtual) scene, giving the
            chrome a dark reflective base instead of flat black.
          */}
          <Environment resolution={256}>
            <color attach="background" args={["#0d0e11"]} />
            {/* Big soft white strip overhead. */}
            <Lightformer
              form="rect"
              intensity={3.6}
              position={[0, 5, -2]}
              rotation-x={Math.PI / 2}
              scale={[9, 3, 1]}
              color="#ffffff"
            />
            {/* Periwinkle fill from the left. */}
            <Lightformer
              form="rect"
              intensity={1.8}
              position={[-5, 1, 0]}
              rotation-y={Math.PI / 2}
              scale={[5, 2, 1]}
              color="#AAB7FF"
            />
            {/* Bright small white from the right. */}
            <Lightformer
              form="rect"
              intensity={2.6}
              position={[5, 0.5, 1]}
              rotation-y={-Math.PI / 2}
              scale={[2.5, 1.2, 1]}
              color="#ffffff"
            />
            {/* Subtle electric fill from below. */}
            <Lightformer
              form="rect"
              intensity={1}
              position={[0, -5, 0]}
              rotation-x={-Math.PI / 2}
              scale={[7, 2.5, 1]}
              color="#526BFF"
            />
          </Environment>
        </Canvas>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Lazy wrapper (next/dynamic, client-only)
// ---------------------------------------------------------------------------

export const ChromeOrbitLazy = dynamic<ChromeOrbitProps>(() => Promise.resolve(ChromeOrbitScene), {
  ssr: false,
  loading: () => <ChromeOrbitFallback />,
});

// ---------------------------------------------------------------------------
// Default export — SSR-safe gate with WebGL / reduced-motion / error handling
// ---------------------------------------------------------------------------

export default function ChromeOrbit({ bandWidth = 0.09, className }: ChromeOrbitProps) {
  // "pending" until mounted (server HTML + first client paint both render the
  // static fallback, so hydration never mismatches), then "live" or "static".
  const [mode, setMode] = React.useState<"pending" | "live" | "static">("pending");

  React.useEffect(() => {
    let mediaQuery: MediaQueryList | null = null;
    let onChange: (() => void) | null = null;
    try {
      mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    } catch {
      mediaQuery = null;
    }
    if (mediaQuery && typeof mediaQuery.addEventListener === "function") {
      onChange = () => {
        setMode(
          prefersReducedMotion() || !hasWebGLContext() ? "static" : "live",
        );
      };
      mediaQuery.addEventListener("change", onChange);
    }
    setMode(prefersReducedMotion() || !hasWebGLContext() ? "static" : "live");
    return () => {
      if (mediaQuery && onChange && typeof mediaQuery.removeEventListener === "function") {
        mediaQuery.removeEventListener("change", onChange);
      }
    };
  }, []);

  if (mode !== "live") {
    return <ChromeOrbitFallback className={className} />;
  }

  return (
    <ChromeOrbitErrorBoundary fallback={<ChromeOrbitFallback className={className} />}>
      <ChromeOrbitLazy bandWidth={bandWidth} className={className} />
    </ChromeOrbitErrorBoundary>
  );
}

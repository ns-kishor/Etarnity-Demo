"use client";

import * as React from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { stack } from "@/content/machina";
import {
  FloatCard,
  Kicker,
  MonoLabel,
  MfSection,
  Reveal,
  SectionTitle,
} from "@/components/machina/mf-primitives";
import { cn } from "@/lib/utils";

/**
 * Product Stack & Partner Ecosystem — "Touching tomorrow, today".
 *
 * Desktop: a perspective stage (1400px) holds the three device renders
 * as layered isometric slabs — a wrapper carries `rotateX(52deg)` +
 * `translateZ` (0 / 90 / 180) and an inner plane carries `rotateZ(-38deg)`
 * (nested outer-rotateX / inner-rotateZ == CSS `rotateX(52deg)
 * rotateZ(-38deg)` on a straight-on render, so the phones become tilted
 * isometric planes without GSAP ever having to decompose a combined
 * matrix). A scrubbed ScrollTrigger fans the stack outward — Machina One
 * to the upper-left, Machina Lens to the right, Machina Pod to the lower
 * center — while rotateZ eases to -30° so the screens turn readable and
 * FloatCard captions fade in beside each device.
 *
 * Mobile / reduced-motion: no 3D scrub — the devices render as a simple
 * vertical stacked-deck flow with plain Reveal fades (PRD degradation).
 */

type Device = (typeof stack.devices)[number];

/** Natural asset geometry — width/height feed next/image exactly. */
const DEVICE_ASSETS = [
  { src: "/images/device-1.png", width: 440, height: 1012, wrap: "w-[172px]" },
  { src: "/images/device-2.png", width: 533, height: 1034, wrap: "w-[196px]" },
  { src: "/images/device-3.png", width: 405, height: 988, wrap: "w-[168px]" },
] as const;

/* Desktop choreography ---------------------------------------------------- */

/** translateZ per device — the layered-slab lift (stays put during fan-out). */
const LIFT = [0, 90, 180];
/** Resting offsets so every slab edge peeks around the stack. */
const REST = [
  { x: -14, y: 10 },
  { x: 16, y: -10 },
  { x: 0, y: 0 },
];
/** Fan-out vectors: One → upper-left, Lens → right, Pod → lower center. */
const FAN = [
  { dx: -1, y: -140 },
  { dx: 1, y: 40 },
  { dx: 0, y: 150 },
];
/** Caption anchors near each device's expanded location. */
const CAPTION_POS = [
  "left-[3%] top-[52%]",
  "right-[3%] top-[12%]",
  "left-[10%] bottom-[8%]",
];

function DeviceCaption({
  device,
  className,
}: {
  device: Device;
  className?: string;
}) {
  return (
    <FloatCard className={cn("max-w-[220px] rounded-[20px] p-4", className)}>
      <MonoLabel className="text-[var(--accent)]">{device.role}</MonoLabel>
      <p className="mt-2 font-display text-base font-semibold tracking-tight text-foreground">
        {device.name}
      </p>
      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
        {device.copy}
      </p>
    </FloatCard>
  );
}

export function ProductStack() {
  const stageRef = React.useRef<HTMLDivElement>(null);
  const floorRef = React.useRef<HTMLDivElement>(null);
  const wrappersRef = React.useRef<Array<HTMLDivElement | null>>([]);
  const isosRef = React.useRef<Array<HTMLDivElement | null>>([]);
  const capsRef = React.useRef<Array<HTMLDivElement | null>>([]);

  React.useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const mm = gsap.matchMedia();

    /* ---------- Desktop: isometric fan-out scrub ---------- */
    mm.add(
      "(min-width: 768px) and (prefers-reduced-motion: no-preference)",
      () => {
        const stage = stageRef.current;
        const wrappers = wrappersRef.current.filter(
          (el): el is HTMLDivElement => el !== null
        );
        const isos = isosRef.current.filter(
          (el): el is HTMLDivElement => el !== null
        );
        const caps = capsRef.current.filter(
          (el): el is HTMLDivElement => el !== null
        );
        if (!stage || wrappers.length === 0) return;
        const floor = floorRef.current;

        /* Isometric rest state — GSAP owns every transform (opacity-0 in
           markup suppresses the pre-hydration straight-on flash). */
        wrappers.forEach((wrapper, i) => {
          gsap.set(wrapper, {
            autoAlpha: 1,
            xPercent: -50,
            yPercent: -50,
            rotationX: 52,
            z: LIFT[i],
            ...REST[i],
          });
        });
        if (isos.length) gsap.set(isos, { rotation: -38 });
        if (caps.length) gsap.set(caps, { autoAlpha: 0, y: 18 });

        /* Horizontal fan distance, clamped to the stage so the outermost
           slabs never clip at the md breakpoint (recomputed on refresh). */
        const fanX = () => {
          const half = (stage.clientWidth || 1200) / 2;
          return Math.min(280, Math.max(110, half - 230));
        };

        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: stage,
            start: "top 80%",
            end: "bottom 40%",
            scrub: 0.5,
            invalidateOnRefresh: true,
          },
        });

        wrappers.forEach((wrapper, i) => {
          tl.to(
            wrapper,
            { x: () => FAN[i].dx * fanX(), y: FAN[i].y, duration: 0.9 },
            0
          );
        });
        if (isos.length) tl.to(isos, { rotation: -30, duration: 0.9 }, 0);
        if (floor) tl.to(floor, { scaleX: 1.55, duration: 0.9 }, 0);
        /* Captions surface once the stack has largely spread (reversible
           with the scrub, so collapsing the stack hides them again). */
        if (caps.length) {
          tl.to(
            caps,
            { autoAlpha: 1, y: 0, duration: 0.26, stagger: 0.06 },
            0.72
          );
        }

        return () => {
          tl.scrollTrigger?.kill();
          tl.kill();
          gsap.set(
            [...wrappers, ...isos, ...caps, ...(floor ? [floor] : [])],
            { clearProps: "all" }
          );
        };
      }
    );

    return () => mm.revert();
  }, []);

  return (
    <MfSection
      id="stack"
      ariaLabel="MachinaFusion — product stack and partner ecosystem"
    >
      {/* Headline banner — mixed sans / editorial-serif type */}
      <Reveal y={14}>
        <Kicker index="03" label={stack.kicker} />
      </Reveal>
      <Reveal y={26} delay={0.08}>
        <SectionTitle className="mt-6">
          Touching{" "}
          <span className="editorial-accent">tomorrow,</span> today
        </SectionTitle>
      </Reveal>
      <Reveal y={22} delay={0.16}>
        <p className="mt-6 max-w-xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
          {stack.lead}
        </p>
      </Reveal>

      {/* Desktop: layered isometric stage (hidden on mobile / reduced motion) */}
      <div
        ref={stageRef}
        className="relative mx-auto mt-12 hidden h-[420px] w-full motion-safe:md:block md:mt-16 md:h-[560px] [transform-style:preserve-3d] [perspective:1400px]"
      >
        {/* Atmosphere */}
        <div
          className="orb orb-neon h-80 w-80 -translate-x-32 -translate-y-24"
          aria-hidden="true"
        />
        <div
          className="orb orb-blue h-64 w-64 translate-x-36 translate-y-20"
          aria-hidden="true"
        />

        {/* Soft elliptical floor shadow under the stack */}
        <div
          ref={floorRef}
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-[68%] h-24 w-[min(78%,34rem)] -translate-x-1/2 rounded-[100%] bg-[radial-gradient(closest-side,rgba(0,0,0,0.18),rgba(0,0,0,0.07)_55%,transparent_75%)] blur-md will-change-transform dark:bg-[radial-gradient(closest-side,rgba(0,0,0,0.6),rgba(0,0,0,0.3)_55%,transparent_75%)]"
        />

        {/* Device slabs — wrapper: rotateX + translateZ, inner: rotateZ */}
        {stack.devices.map((device, i) => (
          <div
            key={device.name}
            ref={(el) => {
              wrappersRef.current[i] = el;
            }}
            className={cn(
              "pointer-events-none absolute left-1/2 top-1/2 opacity-0 will-change-transform",
              DEVICE_ASSETS[i].wrap
            )}
          >
            <div
              ref={(el) => {
                isosRef.current[i] = el;
              }}
              className="will-change-transform"
            >
              <Image
                src={DEVICE_ASSETS[i].src}
                alt={`${device.name} — ${device.role}`}
                width={DEVICE_ASSETS[i].width}
                height={DEVICE_ASSETS[i].height}
                sizes="200px"
                className="h-auto w-full drop-shadow-[0_26px_38px_rgba(0,0,0,0.15)] dark:drop-shadow-[0_26px_44px_rgba(0,0,0,0.55)]"
              />
            </div>
          </div>
        ))}

        {/* Captions — fade in beside each expanded device */}
        {stack.devices.map((device, i) => (
          <div
            key={`${device.name}-caption`}
            ref={(el) => {
              capsRef.current[i] = el;
            }}
            className={cn("absolute opacity-0", CAPTION_POS[i])}
          >
            <DeviceCaption device={device} />
          </div>
        ))}
      </div>

      {/* Mobile / reduced-motion: static stacked-deck flow */}
      <div className="mt-12 flex flex-col items-center md:motion-safe:hidden">
        {stack.devices.map((device, i) => (
          <Reveal
            key={device.name}
            delay={0.1 + i * 0.15}
            y={32}
            className="flex w-full flex-col items-center"
          >
            <div className={cn(i > 0 && "-mt-4")}>
              <Image
                src={DEVICE_ASSETS[i].src}
                alt={`${device.name} — ${device.role}`}
                width={DEVICE_ASSETS[i].width}
                height={DEVICE_ASSETS[i].height}
                sizes="(max-width: 767px) 192px, 224px"
                className="mx-auto h-auto w-48 md:w-56 drop-shadow-[0_22px_34px_rgba(0,0,0,0.14)] dark:drop-shadow-[0_22px_36px_rgba(0,0,0,0.55)]"
              />
            </div>
            <DeviceCaption device={device} className="mt-4 max-w-[260px]" />
          </Reveal>
        ))}
      </div>

      {/* Partner ecosystem wall */}
      <Reveal y={20} className="mt-16 md:mt-24">
        <div
          aria-label="Partner ecosystem"
          className="border-t border-border pt-10 md:pt-12"
        >
          <div className="flex flex-col items-center text-center">
            <MonoLabel className="text-muted-foreground">
              {stack.partners.label}
            </MonoLabel>
            <ul className="mt-6 flex flex-wrap justify-center gap-3">
              {stack.partners.brands.map((brand) => (
                <li
                  key={brand}
                  className="rounded-full border border-border bg-card px-5 py-2.5 font-display text-sm font-medium tracking-tight text-muted-foreground transition-colors duration-300 hover:text-foreground"
                >
                  {brand}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Reveal>
    </MfSection>
  );
}

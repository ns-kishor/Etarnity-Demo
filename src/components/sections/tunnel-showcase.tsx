"use client";

import * as React from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { tunnel } from "@/content/machina";
import {
  Kicker,
  MfSection,
  MonoLabel,
  Reveal,
} from "@/components/machina/mf-primitives";

/* ------------------------------------------------------------------ */
/* Tunnel geometry — pure CSS 3D.                                      */
/* The stage below carries [perspective:900px]; each rib is a flat      */
/* rounded-rectangle plane pushed into depth with translateZ, so the    */
/* browser's own perspective projection supplies the receding scale     */
/* (apparent size = base × 900 / (900 + z)) — no manual scale math.     */
/* The desktop scrub flies the whole rib stack toward the viewer by     */
/* animating a single wrapper's z, which recomputes every rib's         */
/* projection at once.                                                 */
/* ------------------------------------------------------------------ */

const RIB_COUNT = 16;
const RIB_SPACING = 58; // px of depth between successive ribs
const ZOOM_TRAVEL = 480; // px the tunnel flies toward the viewer (desktop scrub)

type Rib = {
  z: number;
  size: number; // percent of the card
  radius: number; // px
  borderWidth: number; // px
  opacity: number;
  borderAlpha: number;
  glowBlur: number; // px
  glowAlpha: number;
};

/** 16 concentric ribs — the 3 nearest are larger pill-shaped frames. */
const RIBS: Rib[] = Array.from({ length: RIB_COUNT }, (_, i) => {
  const depth = i / (RIB_COUNT - 1); // 0 = nearest, 1 = deepest
  const near = i < 3;
  return {
    z: RIB_SPACING * (i + 1),
    size: near ? 88 - i * 3.5 : 78,
    radius: near ? 48 : 26,
    borderWidth: near ? 2 : 1,
    opacity: 0.92 - depth * 0.78,
    borderAlpha: 0.5 - depth * 0.36,
    glowBlur: near ? 26 : 18,
    glowAlpha: 0.22 - depth * 0.16,
  };
});

/**
 * Section 03 — 3D Tunnel Zoom Showcase (dark immersive break).
 *
 * A centered pitch-black panel (panel-dark) holds a CSS-3D optical speed
 * tunnel: 16 concentric rounded-rectangle ribs receding toward a glowing
 * blue vanishing point. On desktop a GSAP scrub (matchMedia ≥768px +
 * motion allowed) flies the rib stack toward the viewer while the card
 * scales to 1.15, the tunnel axis levels out, and the headline assembles
 * letter-by-letter from wide tracking. Mobile and reduced-motion visitors
 * get the static tunnel at a fixed mid-zoom with all copy visible (the
 * markup default — no-JS renders the same complete composition) and a
 * fade-up entrance; no scrub animation runs.
 */
export function TunnelShowcase() {
  const cardRef = React.useRef<HTMLDivElement | null>(null);
  const depthRef = React.useRef<HTMLDivElement | null>(null);
  const glowRef = React.useRef<HTMLDivElement | null>(null);
  const titleRef = React.useRef<HTMLHeadingElement | null>(null);
  const subtextRef = React.useRef<HTMLParagraphElement | null>(null);
  const bulletsRef = React.useRef<HTMLUListElement | null>(null);

  React.useEffect(() => {
    const card = cardRef.current;
    const depth = depthRef.current;
    const glow = glowRef.current;
    const title = titleRef.current;
    const subtext = subtextRef.current;
    const bullets = bulletsRef.current;
    if (!card || !depth || !glow || !title || !subtext || !bullets) return;

    gsap.registerPlugin(ScrollTrigger);
    const mm = gsap.matchMedia();

    /* ---------- Desktop: scroll-scrubbed tunnel zoom ---------- */
    mm.add(
      "(min-width: 768px) and (prefers-reduced-motion: no-preference)",
      () => {
        const letters = Array.from(
          title.querySelectorAll<HTMLElement>("[data-letter]")
        );
        const tags = Array.from(
          bullets.querySelectorAll<HTMLElement>("[data-bullet]")
        );

        /* Hide-then-reveal — the markup defaults stay visible for
           no-JS, mobile and reduced-motion visitors (no flash: this
           runs synchronously before the section can scroll into view). */
        gsap.set(depth, { z: 0, rotationX: 2.5 });
        gsap.set(glow, { scale: 0.7, opacity: 0.5 });
        gsap.set(letters, { autoAlpha: 0, yPercent: 60 });
        gsap.set(title, { letterSpacing: "0.25em" });
        gsap.set(subtext, { autoAlpha: 0, y: 24 });
        gsap.set(tags, { autoAlpha: 0, y: 16 });

        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: card,
            start: "top 80%",
            end: "bottom 30%",
            scrub: 0.5,
          },
        });

        tl.to(depth, { z: ZOOM_TRAVEL, rotationX: 0, duration: 1 }, 0)
          .to(card, { scale: 1.15, duration: 1 }, 0)
          .to(glow, { scale: 1.25, opacity: 1, duration: 1 }, 0)
          .to(title, { letterSpacing: "-0.02em", duration: 0.6 }, 0.15)
          .to(
            letters,
            {
              autoAlpha: 1,
              yPercent: 0,
              duration: 0.3,
              stagger: 0.03,
              ease: "power1.out",
            },
            0.1
          )
          .to(
            subtext,
            { autoAlpha: 1, y: 0, duration: 0.25, ease: "power1.out" },
            0.45
          )
          .to(
            tags,
            {
              autoAlpha: 1,
              y: 0,
              duration: 0.2,
              stagger: 0.06,
              ease: "power1.out",
            },
            0.6
          );

        return () => {
          tl.scrollTrigger?.kill();
          tl.kill();
          gsap.set(
            [card, depth, glow, title, subtext, ...letters, ...tags],
            { clearProps: "all" }
          );
        };
      }
    );

    /* ---------- Mobile / reduced motion: static tunnel + fade-up ---------- */
    mm.add("(max-width: 767px), (prefers-reduced-motion: reduce)", () => {
      /* Never inherit desktop scrub state across a breakpoint flip. */
      gsap.set(card, { clearProps: "all" });
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        return; // fully static — markup already holds the final state
      }

      const tl = gsap.timeline({
        scrollTrigger: { trigger: card, start: "top 85%", once: true },
      });
      tl.fromTo(
        card,
        { autoAlpha: 0, y: 24 },
        { autoAlpha: 1, y: 0, duration: 0.8, ease: "power2.out" }
      );

      return () => {
        tl.scrollTrigger?.kill();
        tl.kill();
        gsap.set(card, { clearProps: "all" });
      };
    });

    return () => mm.revert();
  }, []);

  return (
    <MfSection
      id="tunnel"
      ariaLabel="MachinaFusion — cutting-edge engineering"
    >
      <Reveal y={14}>
        <Kicker index="01" label={tunnel.kicker} />
      </Reveal>

      {/* Dark immersive card — the tunnel lives inside it. */}
      <div
        ref={cardRef}
        className="panel-dark shadow-panel relative mx-auto mt-12 aspect-[4/5] w-full max-w-5xl overflow-hidden rounded-[32px] sm:aspect-[4/3] md:mt-16 md:aspect-[16/10] lg:max-w-6xl"
      >
        {/* 3D stage — perspective on; the ribs recede into it. */}
        <div
          className="pointer-events-none absolute inset-0 [perspective:900px]"
          aria-hidden="true"
        >
          {/* Rib stack. Rests at a fixed mid-zoom (translateZ(240px)) for
              mobile / reduced motion / no-JS; the desktop scrub takes
              over this transform via GSAP inline styles. */}
          <div
            ref={depthRef}
            className="absolute inset-0 [transform-style:preserve-3d] [transform:translateZ(240px)] will-change-transform"
          >
            {RIBS.map((rib) => (
              <div
                key={rib.z}
                className="absolute left-1/2 top-1/2 will-change-transform"
                style={{
                  width: `${rib.size}%`,
                  height: `${rib.size}%`,
                  borderRadius: rib.radius,
                  borderWidth: rib.borderWidth,
                  borderStyle: "solid",
                  borderColor: `rgba(56, 189, 248, ${rib.borderAlpha})`,
                  boxShadow: `0 0 ${rib.glowBlur}px rgba(56, 189, 248, ${rib.glowAlpha})`,
                  opacity: rib.opacity,
                  transform: `translate(-50%, -50%) translateZ(${-rib.z}px)`,
                }}
              />
            ))}
          </div>
        </div>

        {/* Vanishing-point bloom — the light the tunnel dives toward. */}
        <div
          ref={glowRef}
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-1/2 z-[1] aspect-square w-[38%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(56,189,248,0.38),rgba(56,189,248,0.10)_46%,transparent_72%)] opacity-60 blur-2xl"
        />

        {/* Texture + vignette to deepen the black. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-[2] bg-noise opacity-[0.04]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-[2] bg-[radial-gradient(110%_85%_at_50%_50%,transparent_52%,rgba(4,4,8,0.62)_100%)]"
        />

        {/* Overlay copy — real heading semantics, panel tokens. */}
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 px-5 text-center sm:px-10 md:gap-5">
          <h2
            ref={titleRef}
            aria-label={tunnel.title}
            className="font-display font-semibold uppercase text-panel-foreground text-[clamp(2rem,5vw,4.5rem)] leading-[1.04] tracking-[-0.02em] md:whitespace-nowrap [text-shadow:0_0_18px_rgba(245,245,247,0.28),0_0_44px_rgba(56,189,248,0.35)]"
          >
            <span aria-hidden="true">
              {tunnel.title.split(" ").map((word, wi, words) => (
                <React.Fragment key={word}>
                  <span className="inline-block whitespace-nowrap">
                    {word.split("").map((letter, li) => (
                      <span key={li} data-letter className="inline-block">
                        {letter}
                      </span>
                    ))}
                  </span>
                  {wi < words.length - 1 ? " " : null}
                </React.Fragment>
              ))}
            </span>
          </h2>

          <p
            ref={subtextRef}
            className="max-w-md text-balance text-[13px] leading-relaxed text-panel-muted md:text-[15px]"
          >
            {tunnel.subtext}
          </p>

          <ul
            ref={bulletsRef}
            aria-label="Engineering highlights"
            className="mt-1 flex flex-wrap items-center justify-center gap-2"
          >
            {tunnel.bullets.map((bullet) => (
              <li
                key={bullet}
                data-bullet
                className="inline-flex items-center gap-2 rounded-full border border-[rgba(56,189,248,0.22)] bg-[rgba(10,16,28,0.5)] px-3.5 py-1.5 backdrop-blur-sm"
              >
                <span
                  aria-hidden="true"
                  className="h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--tunnel)] shadow-[0_0_8px_2px_rgba(56,189,248,0.45)]"
                />
                <MonoLabel className="text-panel-muted">{bullet}</MonoLabel>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </MfSection>
  );
}

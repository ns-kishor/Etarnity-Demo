"use client";

import * as React from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ChevronDown } from "lucide-react";
import { hero } from "@/content/machina";
import { Reveal } from "@/components/machina/mf-primitives";

/**
 * Kinetic Hero — split-reveal "Creation of Adam".
 *
 * A 200vh runway with a sticky 100vh stage: the oversized MachinaFusion
 * headline sits over a holographic sphere; as the user scrolls, a human
 * hand enters from the far-left and a robotic hand from the far-right,
 * converging until a neon spark bridges their fingertips. Mobile degrades
 * to vertical fade-in sequences (no multi-axis scrub) per the PRD.
 */
export function KineticHero() {
  const rootRef = React.useRef<HTMLElement>(null);
  const stageRef = React.useRef<HTMLDivElement>(null);
  const handLRef = React.useRef<HTMLDivElement>(null);
  const handRRef = React.useRef<HTMLDivElement>(null);
  const sparkRef = React.useRef<HTMLDivElement>(null);
  const copyRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const mm = gsap.matchMedia();

    /* ---------- Desktop: kinetic scrub ---------- */
    mm.add(
      "(min-width: 768px) and (prefers-reduced-motion: no-preference)",
      () => {
        const handL = handLRef.current!;
        const handR = handRRef.current!;
        const spark = sparkRef.current!;
        const copy = copyRef.current!;

        gsap.set([handL, handR], { autoAlpha: 1, yPercent: -50 });
        gsap.set(handL, { xPercent: -128, rotation: -6 });
        gsap.set(handR, { xPercent: 128, rotation: 6 });
        gsap.set(spark, { autoAlpha: 0, scale: 0.4 });

        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: rootRef.current,
            start: "top top",
            end: "bottom bottom",
            scrub: 0.6,
          },
        });

        tl.to(handL, { xPercent: 0, rotation: -1.5 }, 0)
          .to(handR, { xPercent: 0, rotation: 1.5 }, 0)
          .to(
            copy,
            { y: -90, autoAlpha: 0.12, scale: 0.96 },
            0
          )
          .to(
            spark,
            { autoAlpha: 1, scale: 1, duration: 0.16 },
            0.78
          )
          .to(
            spark.querySelector("[data-ripple]"),
            { scale: 2.4, autoAlpha: 0, duration: 0.2 },
            0.84
          );

        return () => {
          tl.scrollTrigger?.kill();
          tl.kill();
          gsap.set([handL, handR, spark, copy], { clearProps: "all" });
        };
      }
    );

    /* ---------- Mobile / reduced motion: static fade-in ---------- */
    mm.add("(max-width: 767px), (prefers-reduced-motion: reduce)", () => {
      const handL = handLRef.current;
      const handR = handRRef.current;
      const spark = sparkRef.current;
      if (handL && handR) {
        gsap.set([handL, handR], { clearProps: "all", autoAlpha: 1, xPercent: 0, rotation: 0, yPercent: 0 });
        gsap.fromTo(
          [handL, handR],
          { autoAlpha: 0, y: 24 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.8,
            stagger: 0.15,
            ease: "power2.out",
            scrollTrigger: { trigger: stageRef.current, start: "top 70%" },
          }
        );
      }
      if (spark) gsap.set(spark, { autoAlpha: 0 });
      return () => {
        gsap.set([handL, handR, spark], { clearProps: "all" });
      };
    });

    return () => mm.revert();
  }, []);

  return (
    <section id="top" ref={rootRef} className="relative h-[190vh] md:h-[210vh]" aria-label="MachinaFusion — introduction">
      {/* Sticky stage */}
      <div
        ref={stageRef}
        className="sticky top-0 flex h-screen flex-col items-center justify-center overflow-hidden px-4 sm:px-6"
      >
        {/* Atmosphere: soft glowing orbs */}
        <div className="orb orb-soft h-[34rem] w-[34rem] -translate-x-24 -translate-y-32" aria-hidden="true" />
        <div className="orb orb-neon h-96 w-96 translate-x-40 translate-y-24" aria-hidden="true" />
        <div className="orb orb-blue h-72 w-72 -translate-x-48 translate-y-40" aria-hidden="true" />

        {/* Holographic sphere */}
        <div
          className="pointer-events-none absolute left-1/2 top-[44%] h-[min(58vw,30rem)] w-[min(58vw,30rem)] -translate-x-1/2 -translate-y-1/2"
          aria-hidden="true"
        >
          <div className="absolute inset-0 rounded-full holo-sphere opacity-90" />
          <div className="absolute inset-[6%] rounded-full holo-sheen animate-[spin_18s_linear_infinite]" />
          {/* Orbit ring */}
          <div className="absolute left-1/2 top-1/2 h-[112%] w-[76%] -translate-x-1/2 -translate-y-1/2 -rotate-16 rounded-[100%] border border-foreground/10" />
          <div className="absolute left-1/2 top-1/2 h-[76%] w-[114%] -translate-x-1/2 -translate-y-1/2 rotate-24 rounded-[100%] border border-foreground/[0.07]" />
        </div>

        {/* Headline copy */}
        <div ref={copyRef} className="relative z-10 flex flex-col items-center text-center">
          <Reveal y={16} delay={0.1}>
            <p className="label-tag text-muted-foreground">
              MachinaFusion Group — Est. 2024
            </p>
          </Reveal>
          <h1 className="display-hero mt-5 text-foreground">
            Machina<span className="text-muted-foreground">Fusion</span>
          </h1>
          <Reveal y={20} delay={0.25}>
            <p className="editorial-accent mt-6 text-2xl sm:text-3xl md:text-4xl text-muted-foreground">
              {hero.subheadline}
            </p>
          </Reveal>
        </div>

        {/* Neon spark at the meeting point */}
        <div
          ref={sparkRef}
          className="pointer-events-none absolute left-1/2 top-[46%] z-20 hidden md:block"
          aria-hidden="true"
        >
          <div className="relative h-3 w-3 -translate-x-1/2 -translate-y-1/2">
            <div className="absolute inset-0 rounded-full bg-[var(--accent)] shadow-[0_0_24px_6px_var(--glow)]" />
            <div
              data-ripple
              className="absolute inset-0 rounded-full border border-[var(--accent)] opacity-60"
            />
          </div>
        </div>

        {/* Hands — enter from the far margins on scroll (desktop) */}
        <div
          ref={handLRef}
          className="pointer-events-none absolute left-[3vw] top-[46%] z-10 w-[30vw] max-w-[460px] opacity-0 max-md:static max-md:top-auto max-md:mt-10 max-md:w-[42vw] max-md:translate-y-0"
        >
          <Image
            src="/images/hand-human.png"
            alt={hero.ariaLabels.humanHand}
            width={900}
            height={389}
            priority
            className="h-auto w-full drop-shadow-[0_36px_60px_rgba(0,0,0,0.16)] dark:drop-shadow-[0_36px_60px_rgba(0,0,0,0.5)]"
          />
        </div>
        <div
          ref={handRRef}
          className="pointer-events-none absolute right-[3vw] top-[46%] z-10 w-[30vw] max-w-[460px] opacity-0 max-md:static max-md:top-auto max-md:mt-6 max-md:w-[42vw] max-md:translate-y-0"
        >
          <Image
            src="/images/hand-robot.png"
            alt={hero.ariaLabels.robotHand}
            width={900}
            height={505}
            priority
            className="h-auto w-full -scale-x-100 drop-shadow-[0_36px_60px_rgba(0,0,0,0.16)] dark:drop-shadow-[0_36px_60px_rgba(0,0,0,0.5)]"
          />
        </div>

        {/* Mobile hands row (static flow, revealed via fade) */}
        {/* (the two divs above become static on mobile via max-md: utilities) */}

        {/* Bottom-left callout + bottom-right micro pills */}
        <div className="absolute inset-x-4 bottom-20 sm:inset-x-6 z-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between md:inset-x-10">
          <Reveal y={24} delay={0.35} className="max-w-sm">
            <div className="glass-float rounded-[22px] px-5 py-4 shadow-ambient">
              <p className="label-tag text-[var(--accent)] mb-2">
                The mission
              </p>
              <p className="text-[13px] leading-relaxed text-foreground/90 text-pretty">
                {hero.callout}
              </p>
            </div>
          </Reveal>
          <Reveal y={24} delay={0.45} className="max-sm:self-end">
            <div className="flex flex-wrap gap-2" role="list" aria-label="Focus areas">
              {hero.microPills.map((pill) => (
                <span
                  key={pill}
                  role="listitem"
                  className="inline-flex items-center rounded-full border border-border bg-card/70 px-4 py-1.5 text-xs font-medium text-foreground backdrop-blur-sm"
                >
                  {pill}
                </span>
              ))}
            </div>
          </Reveal>
        </div>

        {/* Scroll cue */}
        <div
          className="absolute bottom-5 left-1/2 z-10 -translate-x-1/2 flex flex-col items-center gap-1.5 text-muted-foreground"
          aria-hidden="true"
        >
          <span className="label-tag">Scroll</span>
          <ChevronDown className="h-4 w-4 animate-bounce" />
        </div>
      </div>
    </section>
  );
}

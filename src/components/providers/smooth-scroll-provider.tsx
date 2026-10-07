"use client";

import { useEffect, type ReactNode } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

let lenisInstance: Lenis | null = null;

/** Get the shared Lenis instance (null before mount / when reduced motion). */
export function getLenis(): Lenis | null {
  return lenisInstance;
}

/**
 * Lenis inertial smooth scrolling wired into the GSAP ticker so
 * ScrollTrigger-driven animations stay perfectly in sync with the
 * smoothed scroll position. Disabled when the user prefers reduced motion.
 */
export function SmoothScrollProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReduced) return;

    gsap.registerPlugin(ScrollTrigger);

    const lenis = new Lenis({
      lerp: 0.11,
      wheelMultiplier: 1,
      touchMultiplier: 1.4,
      smoothWheel: true,
    });
    lenisInstance = lenis;

    const onScroll = () => ScrollTrigger.update();
    lenis.on("scroll", onScroll);

    const raf = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    // Recalculate trigger positions once the document settles.
    const refresh = () => ScrollTrigger.refresh();
    const refreshTimer = window.setTimeout(refresh, 300);

    return () => {
      window.clearTimeout(refreshTimer);
      gsap.ticker.remove(raf);
      lenis.off("scroll", onScroll);
      lenis.destroy();
      lenisInstance = null;
    };
  }, []);

  return <>{children}</>;
}

/**
 * Smooth-scroll to an anchor, falling back to native behavior when Lenis
 * is unavailable (reduced motion / SSR).
 */
export function scrollToHash(hash: string) {
  const target = document.querySelector(hash);
  if (!target) return;
  const lenis = getLenis();
  if (lenis) {
    lenis.scrollTo(target as HTMLElement, { offset: -96, duration: 1.2 });
  } else {
    (target as HTMLElement).scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

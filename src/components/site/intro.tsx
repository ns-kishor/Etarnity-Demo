"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { EASE } from "./reveal";

/* ------------------------------------------------------------------ */
/* Brand intro — "faint ghost" loading screen                          */
/*                                                                     */
/* 1. Full-screen warm-white overlay (SSR-rendered, so the site never  */
/*    flashes before it).                                              */
/* 2. ETARNITY emerges letter by letter from a faint, blurred ghost    */
/*    state while the tracking condenses — refined, not flashy.        */
/* 3. The wordmark then flies (translate + scale, measured live from    */
/*    the real navbar wordmark rect) into its place beside the logo.    */
/* 4. Crossfades with the real navbar wordmark, overlay unmounts,       */
/*    scroll unlocks, the site becomes interactive.                     */
/*                                                                     */
/* Plays once per browser session (sessionStorage) and never on         */
/* internal navigation. Reduced motion → skipped entirely (plus a CSS   */
/* media-query backstop that works even before hydration / without JS). */
/* A React failsafe and a pure-CSS failsafe guarantee the visitor is   */
/* never trapped on the loading screen.                                */
/*                                                                     */
/* The phase machine is a module-level singleton so the sequence        */
/* survives component remounts (route switches, React strict mode,      */
/* fast refresh) without restarting or duplicating.                      */
/* ------------------------------------------------------------------ */

const WORD = "ETARNITY";
const SESSION_KEY = "etarnity.intro.v1";

const TIMING = {
  /** Ghost reveal + read hold before the wordmark flies to the navbar. */
  settleAtMs: 2100,
  /** Wordmark flight duration (seconds — framer-motion). */
  flightSec: 0.9,
  /** Backdrop fade (starts partway into the flight). */
  bgFadeDelaySec: 0.42,
  bgFadeSec: 0.4,
  /** Real navbar wordmark fade-in (starts partway into the flight). */
  wordmarkDelayMs: 500,
  wordmarkMs: 350,
  /** Overlay unmount — flight complete + small padding. */
  doneAtMs: 3120,
  /** Absolute failsafe — never trap the visitor. */
  safetyMs: 4200,
};

/* ------------------------------------------------------------------ */
/* Singleton phase machine                                             */
/* ------------------------------------------------------------------ */

type Phase = "ghost" | "settle" | "done";
interface Flight {
  x: number;
  y: number;
  scale: number;
}

let phase: Phase = "ghost";
let started = false;
let flight: Flight | null = null;
const listeners = new Set<() => void>();
const timers: ReturnType<typeof setTimeout>[] = [];

function setPhase(next: Phase) {
  if (phase === next) return;
  phase = next;
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

const getSnapshot = () => phase;
const getServerSnapshot = () => "ghost" as Phase;

function later(ms: number, fn: () => void) {
  timers.push(setTimeout(fn, ms));
}

function clearTimers() {
  timers.splice(0).forEach(clearTimeout);
}

function playedThisSession(): boolean {
  try {
    return sessionStorage.getItem(SESSION_KEY) === "1";
  } catch {
    return false;
  }
}

function markSessionPlayed() {
  try {
    sessionStorage.setItem(SESSION_KEY, "1");
  } catch {
    /* storage unavailable — the intro simply replays on reload */
  }
}

function getNavbarWordmark(): HTMLElement | null {
  return document.querySelector<HTMLElement>("header [data-wordmark]");
}

/** Undo every inline style the intro applied to the document chrome. */
function restoreChrome() {
  const wordmark = getNavbarWordmark();
  if (wordmark) {
    wordmark.style.opacity = "";
    wordmark.style.transition = "";
  }
  document.body.style.overflow = "";
}

function finish() {
  clearTimers();
  restoreChrome();
  setPhase("done");
}

/** Runs at most once per page load. */
function start() {
  started = true;
  markSessionPlayed();
  document.body.style.overflow = "hidden";

  // Hide the real navbar wordmark so the flying one replaces it 1:1
  // (no duplicate brand names at any point).
  const wordmark = getNavbarWordmark();
  if (wordmark) wordmark.style.opacity = "0";

  later(TIMING.settleAtMs, () => {
    // Measure the flight path: big centered wordmark → navbar wordmark.
    const fly = document.getElementById("brand-intro-fly");
    const target = getNavbarWordmark();
    if (fly && target) {
      const from = fly.getBoundingClientRect();
      const to = target.getBoundingClientRect();
      const scale = to.width / Math.max(from.width, 1);
      flight = {
        scale,
        x: to.left + to.width / 2 - (from.left + from.width / 2),
        y: to.top + to.height / 2 - (from.top + from.height / 2),
      };
    } else {
      // Navbar unavailable (e.g. user switched to the admin route) —
      // fail gracefully: fade everything instead of flying.
      flight = null;
    }

    if (target) {
      later(TIMING.wordmarkDelayMs, () => {
        target.style.transition = `opacity ${TIMING.wordmarkMs}ms cubic-bezier(0.22,1,0.36,1)`;
        target.style.opacity = "1";
      });
    }

    setPhase("settle");
    later(TIMING.doneAtMs - TIMING.settleAtMs, finish);
  });

  // Absolute safety net — reveal the site no matter what.
  later(TIMING.safetyMs, finish);
}

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

export function BrandIntro() {
  const current = React.useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );

  // Decide before first paint: play the intro, or skip straight to the
  // site (repeat visit in this session / reduced motion).
  React.useLayoutEffect(() => {
    if (started) return;
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReduced || playedThisSession()) {
      finish();
      return;
    }
    start();
  }, []);

  if (current === "done") return null;

  const settling = current === "settle";
  const target = settling ? flight : null;

  const settleAnimate = target
    ? {
        x: target.x,
        y: target.y,
        scale: target.scale,
        opacity: [1, 1, 0],
        letterSpacing: "0.18em",
      }
    : { opacity: 0, letterSpacing: "0.18em" };

  const settleTransition = target
    ? {
        x: { duration: TIMING.flightSec, ease: EASE },
        y: { duration: TIMING.flightSec, ease: EASE },
        scale: { duration: TIMING.flightSec, ease: EASE },
        opacity: {
          duration: TIMING.flightSec,
          times: [0, 0.74, 1],
          ease: "linear" as const,
        },
        letterSpacing: { duration: 0 },
      }
    : {
        opacity: { duration: 0.5, ease: "easeOut" as const },
        letterSpacing: { duration: 0 },
      };

  return (
    <div id="brand-intro" aria-hidden="true" className="fixed inset-0 z-[100]">
      {/* Backdrop — fades near the end of the flight so the navbar and
          page appear just as the wordmark is landing. */}
      <motion.div
        className="absolute inset-0 bg-warmwhite"
        initial={false}
        animate={{ opacity: settling ? 0 : 1 }}
        transition={
          settling
            ? {
                delay: TIMING.bgFadeDelaySec,
                duration: TIMING.bgFadeSec,
                ease: "easeOut",
              }
            : { duration: 0 }
        }
      />

      {/* The flying wordmark — identical typography to the navbar
          wordmark (font, weight, 0.18em tracking, 1.5 line height), so
          the scaled-down text lands pixel-for-pixel on top of it. */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.span
          id="brand-intro-fly"
          className="select-none font-sans text-[clamp(2.5rem,7vw,4.5rem)] font-semibold leading-[1.5] tracking-[0.18em] text-graphite"
          style={{ transformOrigin: "50% 50%" }}
          initial={{ letterSpacing: "0.55em" }}
          animate={
            settling ? settleAnimate : { x: 0, y: 0, letterSpacing: "0.18em" }
          }
          transition={
            settling
              ? settleTransition
              : { letterSpacing: { duration: 1.6, delay: 0.05, ease: EASE } }
          }
        >
          {WORD.split("").map((letter, i) => (
            <motion.span
              key={i}
              className="inline-block"
              initial={{ opacity: 0.04, y: 12, filter: "blur(14px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{
                duration: 1.05,
                delay: 0.12 + i * 0.055,
                ease: EASE,
              }}
            >
              {letter}
            </motion.span>
          ))}
        </motion.span>
      </div>
    </div>
  );
}

export default BrandIntro;

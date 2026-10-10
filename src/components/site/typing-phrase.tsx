"use client";

import * as React from "react";
import { useReducedMotion } from "framer-motion";

/* ------------------------------------------------------------------ */
/* Config                                                              */
/* ------------------------------------------------------------------ */

/** Exact phrase sequence — loops back to the first after the fifth. */
const PHRASES = [
  "solve problems",
  "build solutions",
  "create products",
  "develop software",
  "transform businesses",
] as const;

/** Longest phrase — used to pre-fit the line so text never overflows. */
const LONGEST = PHRASES.reduce((a, b) => (b.length > a.length ? b : a));

/* Timing (ms) — consistent and natural: never rushed, never sluggish. */
const TYPE_MS = 62; // per typed character (+ small jitter for a natural feel)
const TYPE_JITTER_MS = 26;
const DELETE_MS = 34; // per deleted character
const HOLD_MS = 2000; // pause after a phrase is fully displayed
const GAP_MS = 380; // pause after deleting, before the next phrase
const INITIAL_HOLD_MS = 2600; // read the initial phrase before cycling
const CURSOR_BUFFER_PX = 10; // horizontal room reserved for the cursor

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

/**
 * The animated phrase inside the hero headline
 * ("We don't just <phrase>. We rethink what's possible.").
 *
 * - `solve problems` is rendered immediately (SSR + hydration match).
 * - Cycles: type → hold → delete → gap → type → … indefinitely.
 * - `prefers-reduced-motion`: renders the first phrase statically,
 *   no cursor, no cycling.
 * - Auto-fits its own font size so the longest phrase + cursor can
 *   never overflow the line (no horizontal scroll, no layout shift).
 * - All timers are cleaned up on unmount.
 */
export function TypingPhrase() {
  const reduceMotion = useReducedMotion();
  const [text, setText] = React.useState<string>(`${PHRASES[0]}.`);
  const textRef = React.useRef<HTMLSpanElement>(null);

  // Decide only after hydration: SSR always renders the animated variant
  // (with cursor), so branching on prefers-reduced-motion during the first
  // client render would cause hydration mismatches.
  const [mounted, setMounted] = React.useState(false);
  React.useLayoutEffect(() => {
    setMounted(true);
  }, []);
  const staticMode = mounted && reduceMotion;

  /* ---------------- typing loop ---------------- */

  React.useEffect(() => {
    if (reduceMotion) return;

    let alive = true;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let wake: (() => void) | undefined;

    const sleep = (ms: number) =>
      new Promise<void>((resolve) => {
        wake = resolve;
        timer = setTimeout(() => {
          wake = undefined;
          resolve();
        }, ms);
      });

    (async () => {
      await sleep(INITIAL_HOLD_MS);
      let index = 0;
      for (;;) {
        // Delete the current phrase character by character.
        const current = `${PHRASES[index]}.`;
        for (let pos = current.length - 1; pos >= 0; pos--) {
          if (!alive) return;
          setText(current.slice(0, pos));
          await sleep(DELETE_MS);
        }
        await sleep(GAP_MS);
        // Type the next phrase (wraps back to the first after the fifth).
        index = (index + 1) % PHRASES.length;
        const next = `${PHRASES[index]}.`;
        for (let pos = 1; pos <= next.length; pos++) {
          if (!alive) return;
          setText(next.slice(0, pos));
          await sleep(TYPE_MS + Math.random() * TYPE_JITTER_MS);
        }
        await sleep(HOLD_MS);
      }
    })();

    return () => {
      alive = false;
      if (timer) clearTimeout(timer);
      wake?.();
    };
  }, [reduceMotion]);

  /* ---------------- auto-fit (no overflow, no shift) ---------------- */

  React.useLayoutEffect(() => {
    const el = textRef.current;
    const line = el?.parentElement;
    if (!el || !line) return;

    const longest = `${reduceMotion ? PHRASES[0] : LONGEST}.`;

    const fit = () => {
      el.style.fontSize = "";
      const available = line.clientWidth;
      if (available <= 0) return;

      // Measure the longest phrase with the current (natural) font size.
      const probe = document.createElement("span");
      probe.style.cssText =
        "position:absolute;visibility:hidden;white-space:nowrap;pointer-events:none;";
      probe.textContent = longest;
      line.appendChild(probe);
      const needed = probe.getBoundingClientRect().width;
      line.removeChild(probe);

      if (needed + CURSOR_BUFFER_PX > available) {
        const natural = parseFloat(getComputedStyle(el).fontSize);
        if (natural > 0) {
          const fitted = Math.floor(
            (natural * (available - CURSOR_BUFFER_PX)) /
              (needed + CURSOR_BUFFER_PX)
          );
          el.style.fontSize = `${Math.max(fitted, 14)}px`;
        }
      }
    };

    fit();
    window.addEventListener("resize", fit);
    document.fonts?.ready?.then(fit).catch(() => {});
    return () => window.removeEventListener("resize", fit);
  }, [reduceMotion]);

  /* ---------------- render ---------------- */

  if (staticMode) {
    return (
      <span ref={textRef} className="whitespace-nowrap text-electric">
        {`${PHRASES[0]}.`}
      </span>
    );
  }

  return (
    <span
      ref={textRef}
      className="relative inline-block whitespace-nowrap text-electric"
    >
      {text}
      <span
        aria-hidden="true"
        className="type-cursor ml-[0.09em] inline-block h-[0.78em] w-[0.055em] min-w-[2px] rounded-[1px] bg-electric"
      />
    </span>
  );
}

export default TypingPhrase;

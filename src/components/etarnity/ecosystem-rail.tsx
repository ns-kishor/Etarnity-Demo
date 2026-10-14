"use client";

/**
 * THE ETARNITY ECOSYSTEM — signature interaction.
 * A quiet fixed rail on the left edge (desktop only) that evolves as the
 * visitor scrolls: Company → expands into Businesses → connects to
 * Technology → connects to People → connects to Impact → connects to Future.
 * The connecting line draws with scroll; nodes resolve into the accent;
 * the active chapter is announced in vertical mono type. The whole site
 * reads as one interconnected organism.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { scrollToHash } from "@/components/providers/smooth-scroll-provider";
import { cn } from "@/lib/utils";

const CHAPTERS = [
  { id: "company", label: "Company", href: "#company" },
  { id: "businesses", label: "Businesses", href: "#businesses" },
  { id: "technology", label: "Technology", href: "#technology" },
  { id: "founders", label: "People", href: "#founders" },
  { id: "impact", label: "Impact", href: "#impact" },
  { id: "future", label: "Future", href: "#future" },
];

const RAIL_HEIGHT = 260; // px

export function EcosystemRail() {
  const [activeIndex, setActiveIndex] = useState(-1);
  const [lineProgress, setLineProgress] = useState(0); // 0..1 through the rail
  const rafRef = useRef(0);
  const reduced = useReducedMotion();

  const measure = useCallback(() => {
    /* Map document scroll onto the chapter sequence. */
    const doc = document.documentElement;
    const total = doc.scrollHeight - window.innerHeight;
    const scroll = window.scrollY;

    /* Find element positions for each chapter (re-measured live). */
    let active = -1;
    let progress = 0;

    const tops = CHAPTERS.map((c) => {
      const el = document.getElementById(c.id);
      if (!el) return null;
      return el.getBoundingClientRect().top + window.scrollY;
    }).filter((v): v is number => v !== null);

    if (tops.length) {
      const first = tops[0];
      const last = tops[tops.length - 1] ?? first;
      const span = Math.max(1, last - first);
      progress = Math.min(1, Math.max(0, (scroll - first) / span));

      for (let i = tops.length - 1; i >= 0; i--) {
        if (scroll + window.innerHeight * 0.4 >= tops[i]) {
          active = i;
          break;
        }
      }
    } else if (total > 0) {
      progress = scroll / total;
    }

    setActiveIndex(active);
    setLineProgress(progress);
  }, []);

  useEffect(() => {
    const onScroll = () => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(measure);
    };
    /* Defer the first measure to the next frame (async, after mount). */
    rafRef.current = requestAnimationFrame(measure);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [measure]);

  return (
    <nav
      aria-label="Ecosystem chapters"
      className="fixed left-6 top-1/2 z-40 hidden -translate-y-1/2 xl:block"
    >
      <div className="group/rail flex items-center gap-4">
        {/* Vertical connecting line */}
        <div
          aria-hidden="true"
          className="relative w-px bg-border"
          style={{ height: RAIL_HEIGHT }}
        >
          <div
            className="absolute left-0 top-0 w-px bg-accent transition-[height] duration-300 ease-out"
            style={{ height: `${lineProgress * 100}%` }}
          />
        </div>

        {/* Nodes */}
        <ul className="flex flex-col justify-between" style={{ height: RAIL_HEIGHT }}>
          {CHAPTERS.map((chapter, i) => {
            const reached = i <= activeIndex;
            const active = i === activeIndex;
            return (
              <li key={chapter.id} className="relative">
                <button
                  type="button"
                  onClick={() => scrollToHash(chapter.href)}
                  aria-label={`Go to ${chapter.label}`}
                  aria-current={active ? "true" : undefined}
                  className="grid h-6 w-6 place-items-center"
                >
                  <span
                    className={cn(
                      "block rounded-full transition-all duration-500",
                      reached
                        ? "h-2 w-2 bg-accent"
                        : "h-1.5 w-1.5 bg-border bg-foreground/25",
                      active &&
                        "h-2.5 w-2.5 ring-4 ring-accent/15"
                    )}
                  />
                </button>
              </li>
            );
          })}
        </ul>

        {/* Active chapter label — vertical mono */}
        <span
          aria-hidden="true"
          className={cn(
            "label-mono h-[fit-content] whitespace-nowrap text-muted-foreground transition-opacity duration-500 [writing-mode:vertical-rl]",
            activeIndex >= 0 ? "opacity-100" : "opacity-0"
          )}
        >
          {activeIndex >= 0 ? CHAPTERS[activeIndex].label : ""}
        </span>
      </div>
    </nav>
  );
}

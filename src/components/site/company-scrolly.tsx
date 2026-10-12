"use client";

import * as React from "react";
import { Reveal } from "@/components/site/reveal";
import { cn } from "@/lib/utils";

interface CompanyPoint {
  index: string;
  title: string;
  detail: string;
}

/** Verbatim editorial content — shared by the sticky index and the detail blocks. */
const POINTS: readonly CompanyPoint[] = [
  {
    index: "01",
    title: "A Technology Company",
    detail:
      "ETARNITY designs, builds, and operates digital products, platforms, and businesses — founded in Dhaka, Bangladesh, and built for an international market.",
  },
  {
    index: "02",
    title: "Designed with Intent",
    detail:
      "Every product starts with design. Interfaces are shaped around real behavior — clear hierarchy, honest states, and interactions that feel inevitable rather than decorative.",
  },
  {
    index: "03",
    title: "Engineered with Discipline",
    detail:
      "We hold ourselves to the standard of much larger teams: typed codebases, reviewed changes, tested releases, and architecture designed to outlive launch day.",
  },
  {
    index: "04",
    title: "Operated for the Long Run",
    detail:
      "Shipping is the midpoint, not the finish line. We monitor, maintain, and improve what we build — a product's real life begins after release.",
  },
  {
    index: "05",
    title: "Grown One System at a Time",
    detail:
      "Client engineering keeps us sharp, internal products compound what we learn, and the ecosystem grows one honest, working system at a time.",
  },
];

/**
 * CompanyScrolly — scroll-driven replacement for the long overview paragraph.
 *
 * Desktop (lg+): sticky index list on the left marks the point whose detail
 * block is currently crossing the viewport center; detail blocks on the right
 * dim/undim as they enter and leave the center band. Mobile (<lg): the index
 * is hidden and the detail blocks simply stack with their titles inline.
 *
 * Active tracking is functional for everyone (including reduced-motion users);
 * only the movement is removed via `motion-reduce:` variants.
 */
export default function CompanyScrolly() {
  const [active, setActive] = React.useState(0);
  const blockRefs = React.useRef<Array<HTMLDivElement | null>>([]);

  React.useEffect(() => {
    const blocks: Element[] = blockRefs.current.filter(
      (el): el is HTMLDivElement => el !== null,
    );
    if (blocks.length === 0 || typeof IntersectionObserver === "undefined") {
      return;
    }

    // Which blocks currently cross the center band, and by how much.
    // Kept across callbacks so the largest ratio always wins — not just the
    // largest among the entries that happened to change in this batch.
    const intersecting = new Map<Element, number>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            intersecting.set(entry.target, entry.intersectionRatio);
          } else {
            intersecting.delete(entry.target);
          }
        }

        // The block crossing the center band with the largest ratio wins.
        // When nothing intersects (gap between blocks), keep the last active.
        let nextIndex = -1;
        let nextRatio = 0;
        intersecting.forEach((ratio, target) => {
          if (ratio > nextRatio) {
            nextRatio = ratio;
            nextIndex = blocks.indexOf(target);
          }
        });
        if (nextIndex >= 0) {
          setActive(nextIndex);
        }
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 },
    );

    for (const block of blocks) {
      observer.observe(block);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  const scrollToBlock = (index: number) => {
    const block = blockRefs.current[index];
    if (!block) return;
    // Read prefers-reduced-motion at click time — no reactive state, so the
    // render output stays identical on server and client (hydration-safe).
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    block.scrollIntoView({
      behavior: prefersReduced ? "auto" : "smooth",
      block: "center",
    });
  };

  return (
    <Reveal delay={0}>
      <div className="lg:grid lg:grid-cols-12 lg:gap-12">
        {/* Sticky index — desktop only. */}
        <div className="hidden lg:col-span-5 lg:block">
          <div className="sticky top-28">
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-soft">
              What we do — 05 points
            </p>
            <ul className="mt-5">
              {POINTS.map((point, i) => {
                const isActive = i === active;
                return (
                  <li key={point.index}>
                    <button
                      type="button"
                      onClick={() => scrollToBlock(i)}
                      aria-current={isActive ? "true" : undefined}
                      className="relative flex w-full items-baseline gap-4 py-4 pl-5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-inset"
                    >
                      {/* Vertical accent rail. */}
                      <span
                        aria-hidden="true"
                        className={cn(
                          "absolute left-0 top-1 bottom-1 w-[2px] rounded-full bg-electric origin-top transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
                          isActive ? "scale-y-100" : "scale-y-0",
                        )}
                      />
                      <span
                        className={cn(
                          "font-mono text-[11px] tracking-[0.18em] transition-colors duration-300",
                          isActive ? "text-electric" : "text-ink-soft/60",
                        )}
                      >
                        {point.index}
                      </span>
                      <span
                        className={cn(
                          "text-[17px] font-medium leading-snug transition-colors duration-300",
                          isActive ? "text-graphite" : "text-ink-soft/50",
                        )}
                      >
                        {point.title}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        {/* Detail blocks — stack on mobile, scrollytelling on desktop. */}
        <div className="lg:col-span-7">
          {POINTS.map((point, i) => {
            const isActive = i === active;
            return (
              <div
                key={point.index}
                data-point={i}
                ref={(el) => {
                  blockRefs.current[i] = el;
                }}
                className="flex items-center py-12 lg:min-h-[58vh] lg:py-0"
              >
                <div
                  className={cn(
                    "relative transition-all motion-reduce:transition-none duration-[550ms] ease-[cubic-bezier(0.22,1,0.36,1)]",
                    isActive
                      ? "opacity-100 translate-y-0"
                      : "opacity-[0.32] translate-y-3 motion-reduce:translate-y-0",
                  )}
                >
                  {/* Ghost index — decorative. */}
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute -top-9 -left-1 select-none font-mono text-[6.5rem] font-semibold leading-none text-graphite/[0.06]"
                  >
                    {point.index}
                  </span>
                  <h3 className="relative text-2xl md:text-[1.9rem] font-semibold tracking-[-0.01em] text-graphite">
                    {point.title}
                  </h3>
                  <p className="relative mt-4 max-w-md text-[15px] leading-[1.75] text-ink-soft">
                    {point.detail}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Reveal>
  );
}

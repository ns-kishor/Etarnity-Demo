"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { motion, useReducedMotion } from "framer-motion";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * MoodToggle — the two moods of MachinaFusion.
 *
 * A quiet segmented pill (dark / light) with a sliding indicator.
 * Renders inert until mounted so SSR markup never mismatches,
 * keeps the browser theme-color meta in sync with the active mood.
 */
export function MoodToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const reduce = useReducedMotion();

  React.useEffect(() => setMounted(true), []);

  /* Keep the browser chrome (theme-color meta) honest with the mood */
  React.useEffect(() => {
    if (!mounted) return;
    const meta = document.querySelector('meta[name="theme-color"]');
    meta?.setAttribute("content", resolvedTheme === "light" ? "#f4f4f6" : "#0a0a0c");
  }, [mounted, resolvedTheme]);

  const isDark = resolvedTheme === "dark";
  const active = mounted ? (isDark ? "dark" : "light") : null;

  const select = (mood: "dark" | "light") => {
    if (mood !== active) setTheme(mood);
  };

  return (
    <div
      role="radiogroup"
      aria-label="Color mood"
      className={cn(
        "inline-flex h-9 items-center gap-0.5 rounded-full border border-border bg-card/60 p-0.5 backdrop-blur-sm",
        className
      )}
    >
      {(
        [
          { mood: "dark", label: "Dark mood", Icon: Moon },
          { mood: "light", label: "White mood", Icon: Sun },
        ] as const
      ).map(({ mood, label, Icon }) => {
        const isActive = active === mood;
        return (
          <button
            key={mood}
            type="button"
            role="radio"
            aria-checked={isActive}
            aria-label={label}
            title={label}
            onClick={() => select(mood)}
            className={cn(
              "relative inline-flex h-8 w-8 items-center justify-center rounded-full outline-offset-2 transition-colors",
              isActive ? "text-emerald-corp" : "text-muted-foreground/70 hover:text-foreground"
            )}
          >
            {isActive && (
              <motion.span
                layoutId="mood-indicator"
                aria-hidden="true"
                className="absolute inset-0 rounded-full bg-emerald-corp/12"
                transition={
                  reduce
                    ? { duration: 0.01 }
                    : { type: "spring", stiffness: 500, damping: 38 }
                }
              />
            )}
            <Icon className="relative h-[15px] w-[15px]" aria-hidden="true" strokeWidth={1.8} />
          </button>
        );
      })}
    </div>
  );
}

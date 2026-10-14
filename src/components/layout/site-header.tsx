"use client";

/**
 * ETARNITY — minimal thin floating navigation.
 * Almost invisible until needed: a transparent text-only bar that resolves
 * into a soft glass pill on scroll. Full-screen menu overlay with the
 * complete corporate sitemap. Quietly animated — no bounce.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion, useScroll, useSpring } from "framer-motion";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { navigation } from "@/content/site";
import { Wordmark, EASE } from "@/components/etarnity/primitives";
import { getLenis, scrollToHash } from "@/components/providers/smooth-scroll-provider";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 90, damping: 28, mass: 0.4 });

  /* Resolve into a glass pill after the hero breathes. */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 32);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* Active section tracking for the center links. */
  useEffect(() => {
    const ids = navigation.primary.map((l) => l.href.slice(1));
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(`#${entry.target.id}`);
        }
      },
      { rootMargin: "-40% 0px -55% 0px" }
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  /* Scroll lock + Escape while the menu overlay is open. */
  useEffect(() => {
    if (!menuOpen) return;
    const lenis = getLenis();
    lenis?.stop();
    document.documentElement.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      lenis?.start();
      document.documentElement.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  /* Smooth anchor navigation through Lenis when available. */
  const go = useCallback((href: string) => {
    setMenuOpen(false);
    if (href.startsWith("#")) {
      scrollToHash(href);
    }
  }, []);

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 w-full",
          "transition-[padding] duration-500",
          scrolled ? "pt-3" : "pt-0"
        )}
      >
        {/* Scroll progress hairline — only once scrolled. */}
        <motion.div
          aria-hidden="true"
          style={{ scaleX: reduced ? 1 : progress }}
          className={cn(
            "absolute inset-x-0 top-0 h-px origin-left bg-accent/60",
            "transition-opacity duration-500",
            scrolled ? "opacity-100" : "opacity-0"
          )}
        />

        <motion.div
          initial={{ opacity: 0, y: -14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.15, ease: EASE }}
          className={cn(
            "mx-auto flex h-14 w-full max-w-[1200px] items-center justify-between gap-6",
            "px-4 transition-all duration-500 md:px-6",
            scrolled &&
              "rounded-full border border-border bg-card/80 px-5 shadow-ambient backdrop-blur-xl md:px-7"
          )}
        >
          {/* Brand */}
          <Wordmark className="shrink-0" />

          {/* Center links — desktop only, thin and quiet */}
          <nav aria-label="Primary" className="hidden lg:block">
            <ul className="flex items-center gap-8">
              {navigation.primary.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    onClick={(e) => {
                      e.preventDefault();
                      go(link.href);
                    }}
                    className={cn(
                      "group relative py-2 text-[13px] tracking-[0.02em] transition-colors duration-300",
                      active === link.href
                        ? "text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {link.label}
                    <span
                      aria-hidden="true"
                      className={cn(
                        "absolute inset-x-0 -bottom-0.5 h-px origin-left bg-accent transition-transform duration-300",
                        active === link.href ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                      )}
                    />
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Right cluster */}
          <div className="flex items-center gap-3">
            <a
              href={navigation.contact.href}
              onClick={(e) => {
                e.preventDefault();
                go(navigation.contact.href);
              }}
              className={cn(
                "hidden items-center rounded-full border border-border px-5 py-2 text-[13px] tracking-tight transition-all duration-300 sm:inline-flex",
                "bg-card/60 text-foreground hover:border-accent/40 hover:shadow-panel"
              )}
            >
              Contact
            </a>
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
              aria-expanded={menuOpen}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card/60 text-foreground transition-all duration-300 hover:border-accent/40 hover:shadow-panel"
            >
              <Menu className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
            </button>
          </div>
        </motion.div>
      </header>

      {/* Full-screen corporate menu overlay */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Site menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45, ease: EASE }}
            className="fixed inset-0 z-[60] overflow-y-auto bg-background/95 backdrop-blur-2xl"
          >
            <div className="mx-auto flex min-h-full w-full max-w-[1200px] flex-col px-6 pb-16 pt-6 md:px-10">
              <div className="flex h-14 items-center justify-between">
                <Wordmark onClick={() => setMenuOpen(false)} />
                <button
                  type="button"
                  onClick={() => setMenuOpen(false)}
                  aria-label="Close menu"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-foreground transition-all duration-300 hover:border-accent/40"
                >
                  <X className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
                </button>
              </div>

              <nav aria-label="Site menu" className="mt-14 md:mt-24">
                <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
                  {navigation.menuGroups.map((group, gi) => (
                    <motion.div
                      key={group.title}
                      initial={{ opacity: 0, y: 18 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.7, delay: 0.08 + gi * 0.07, ease: EASE }}
                    >
                      <p className="label-mono mb-6 text-accent-deep">{group.title}</p>
                      <ul className="space-y-4">
                        {group.links.map((link) => (
                          <li key={link.label}>
                            <a
                              href={link.href}
                              onClick={(e) => {
                                e.preventDefault();
                                go(link.href);
                              }}
                              className="group inline-flex items-center gap-2 font-display text-xl font-light tracking-tight text-foreground/90 transition-colors duration-300 hover:text-accent-deep md:text-2xl"
                            >
                              {link.label}
                              <ArrowUpRight
                                className="h-4 w-4 opacity-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:opacity-100"
                                strokeWidth={1.5}
                                aria-hidden="true"
                              />
                            </a>
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  ))}
                </div>
              </nav>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.7, delay: 0.4, ease: EASE }}
                className="mt-auto pt-16"
              >
                <a
                  href={navigation.contact.href}
                  onClick={(e) => {
                    e.preventDefault();
                    go(navigation.contact.href);
                  }}
                  className="font-display text-3xl font-light tracking-tight text-accent-deep md:text-4xl"
                >
                  Let&apos;s talk.
                </a>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion, useScroll, useSpring } from "framer-motion";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { navigation } from "@/content/site";
import { Wordmark } from "@/components/primitives/corporate";
import { MoodToggle } from "@/components/theme-toggle";

export function SiteHeader() {
  const [scrolled, setScrolled] = React.useState(false);
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [active, setActive] = React.useState<string>("");

  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    mass: 0.4,
  });

  /* Glass surface appears after leaving the hero threshold */
  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* Track the section currently in view for nav highlighting */
  React.useEffect(() => {
    const ids = navigation.primary.map((n) => n.href.slice(1));
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id);
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

  /* Lock scroll + escape key while the menu overlay is open */
  React.useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-all duration-500",
          scrolled
            ? "border-b border-border/70 bg-background/85 backdrop-blur-xl"
            : "border-b border-transparent bg-transparent"
        )}
      >
        {/* Scroll progress — a hairline of ink tracking the journey */}
        <motion.div
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-px origin-left bg-gradient-to-r from-emerald-corp via-emerald-corp to-champagne"
          style={{ scaleX: progress, opacity: scrolled ? 0.9 : 0 }}
        />

        <div className="mx-auto flex h-16 w-full max-w-[1280px] items-center justify-between px-6 md:h-[72px] md:px-10 lg:px-14">
          <a
            href="#top"
            aria-label="ETARNITY — back to top"
            className="rounded-sm transition-opacity hover:opacity-80"
          >
            <Wordmark size="md" />
          </a>

          {/* Primary corporate navigation */}
          <nav aria-label="Primary" className="hidden items-center gap-1 lg:flex">
            {navigation.primary.map((item) => {
              const isActive = active === item.href.slice(1);
              return (
                <a
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative rounded-sm px-3.5 py-2 text-[13.5px] font-medium tracking-tight transition-colors",
                    isActive
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {item.label}
                  <span
                    aria-hidden="true"
                    className={cn(
                      "absolute inset-x-3.5 -bottom-px h-px origin-left bg-emerald-corp transition-transform duration-300",
                      isActive ? "scale-x-100" : "scale-x-0"
                    )}
                  />
                </a>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            {/* The two corporate moods — dark (default) and white */}
            <MoodToggle />

            <a
              href="#contact"
              className="group hidden items-center gap-2 rounded-sm border border-emerald-corp/40 bg-emerald-corp/10 px-4 py-2 text-[13.5px] font-semibold tracking-tight text-emerald-corp transition-all hover:border-emerald-corp/70 hover:bg-emerald-corp/20 sm:inline-flex"
            >
              Contact
              <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
            </a>

            {/* Full menu — the window into the whole company */}
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-expanded={menuOpen}
              aria-haspopup="dialog"
              aria-label="Open menu"
              className="inline-flex items-center gap-2 rounded-sm border border-border px-3.5 py-2 text-[13px] font-medium text-muted-foreground transition-colors hover:border-border/80 hover:text-foreground"
            >
              <Menu className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">Menu</span>
            </button>
          </div>
        </div>
      </header>

      {/* Full-screen corporate menu */}
      <AnimatePresence>
        {menuOpen && <FullMenu onClose={() => setMenuOpen(false)} />}
      </AnimatePresence>
    </>
  );
}

function FullMenu({ onClose }: { onClose: () => void }) {
  const reduce = useReducedMotion();
  const closeRef = React.useRef<HTMLButtonElement>(null);

  React.useEffect(() => {
    closeRef.current?.focus();
  }, []);

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label="Site menu"
      className="fixed inset-0 z-[60] flex flex-col bg-background/97 backdrop-blur-2xl"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reduce ? 0.01 : 0.35 }}
    >
      <div className="mx-auto flex h-16 w-full max-w-[1280px] shrink-0 items-center justify-between px-6 md:h-[72px] md:px-10 lg:px-14">
        <Wordmark size="md" />
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Close menu"
          className="inline-flex items-center gap-2 rounded-sm border border-border px-3.5 py-2 text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <X className="h-4 w-4" aria-hidden="true" />
          Close
        </button>
      </div>

      <nav
        aria-label="All sections"
        className="mx-auto grid w-full max-w-[1280px] flex-1 content-start gap-10 overflow-y-auto px-6 py-10 scroll-area-corp md:grid-cols-2 md:px-10 lg:grid-cols-4 lg:px-14"
      >
        {navigation.menuGroups.map((group, gi) => (
          <motion.div
            key={group.title}
            initial={{ opacity: 0, y: reduce ? 0 : 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 + gi * 0.06, duration: 0.5 }}
          >
            <p className="label-mono mb-5 text-champagne/80">{group.title}</p>
            <ul className="space-y-1">
              {group.links.map((link) => (
                <li key={link.href + link.label}>
                  <a
                    href={link.href}
                    onClick={onClose}
                    className="group inline-flex items-baseline gap-2 py-1.5 text-lg font-medium tracking-tight text-foreground/85 transition-colors hover:text-emerald-corp"
                  >
                    {link.label}
                    <ArrowUpRight
                      className="h-4 w-4 self-center opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100"
                      aria-hidden="true"
                    />
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </nav>

      <div className="mx-auto w-full max-w-[1280px] shrink-0 border-t border-border/60 px-6 py-6 md:px-10 lg:px-14">
        <p className="text-[13px] text-muted-foreground">
          ETARNITY — Building what comes next. · Dhaka, Bangladesh
        </p>
      </div>
    </motion.div>
  );
}

"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ArrowUpRight } from "lucide-react";
import { LogoMark } from "@/components/machina/mf-primitives";
import { MoodToggle } from "@/components/theme-toggle";
import { scrollToHash } from "@/components/providers/smooth-scroll-provider";
import { nav, headerCta, site } from "@/content/machina";
import { cn } from "@/lib/utils";

/**
 * Floating capsule header — detached pill navigation with backdrop blur.
 * Left: brand mark + namespace · Center: pill toggles · Right: hiring status.
 * Mobile collapses to brand + mood toggle + menu expander.
 */
export function CapsuleHeader() {
  const [active, setActive] = React.useState<string>("");
  const [open, setOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    const ids = [...nav.map((n) => n.href.slice(1)), "contact"];
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
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  const go = (e: React.MouseEvent, href: string) => {
    e.preventDefault();
    setOpen(false);
    scrollToHash(href);
  };

  return (
    <header className="fixed inset-x-0 top-4 z-50 flex justify-center px-4 pointer-events-none">
      <div
        className={cn(
          "pointer-events-auto flex max-w-[min(94vw,64rem)] items-center gap-2 rounded-full border border-border glass-float transition-shadow duration-500",
          scrolled ? "shadow-ambient-lg" : "shadow-ambient"
        )}
      >
        {/* Brand */}
        <a
          href="#top"
          onClick={(e) => go(e, "#top")}
          className="flex shrink-0 items-center gap-2.5 rounded-full py-2 pl-3 pr-4 text-foreground transition-opacity hover:opacity-80"
          aria-label={`${site.name} — back to top`}
        >
          <LogoMark className="h-7 w-7" />
          <span className="font-display text-[15px] font-semibold tracking-tight hidden sm:inline">
            Machina<span className="text-muted-foreground">Fusion</span>
          </span>
        </a>

        <span className="hidden md:block h-5 w-px bg-border" aria-hidden="true" />

        {/* Center pill toggles */}
        <nav
          className="hidden md:flex items-center gap-1"
          aria-label="Primary sections"
        >
          {nav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={(e) => go(e, item.href)}
              aria-current={active === item.href ? "true" : undefined}
              className={cn(
                "relative rounded-full px-4 py-2 text-[13px] font-medium transition-colors",
                active === item.href
                  ? "text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {active === item.href && (
                <motion.span
                  layoutId="nav-pill"
                  className="absolute inset-0 rounded-full bg-primary"
                  transition={{ type: "spring", stiffness: 420, damping: 34 }}
                />
              )}
              <span className="relative z-10">{item.label}</span>
            </a>
          ))}
        </nav>

        <span className="hidden md:block h-5 w-px bg-border" aria-hidden="true" />

        {/* Right cluster */}
        <div className="flex items-center gap-2">
          <MoodToggle className="hidden sm:flex" />
          <a
            href={headerCta.href}
            onClick={(e) => go(e, headerCta.href)}
            className="group hidden sm:inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-[13px] font-medium text-primary-foreground transition-transform hover:scale-[1.03] active:scale-95"
          >
            <span className="status-dot" aria-hidden="true" />
            {headerCta.label}
            <ArrowUpRight
              className="h-3.5 w-3.5 opacity-60 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              aria-hidden="true"
            />
          </a>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label={open ? "Close menu" : "Open menu"}
            className="md:hidden inline-flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-foreground"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Mobile expansion panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.98 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="pointer-events-auto absolute top-full mt-3 w-[min(94vw,24rem)] rounded-[28px] border border-border bg-popover p-3 shadow-ambient-lg"
          >
            <nav className="flex flex-col" aria-label="Mobile sections">
              {nav.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={(e) => go(e, item.href)}
                  className="rounded-2xl px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
                >
                  {item.label}
                </a>
              ))}
              <a
                href={headerCta.href}
                onClick={(e) => go(e, headerCta.href)}
                className="mt-2 flex items-center justify-between rounded-2xl bg-primary px-4 py-3 text-sm font-medium text-primary-foreground"
              >
                <span className="flex items-center gap-2">
                  <span className="status-dot" aria-hidden="true" />
                  {headerCta.label}
                </span>
                <ArrowUpRight className="h-4 w-4 opacity-60" aria-hidden="true" />
              </a>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

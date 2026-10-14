"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";
import { Link } from "@/lib/router";
import { Logo } from "./logo";
import { EASE } from "./reveal";

const LINKS: { label: string; to: string }[] = [
  { label: "Company", to: "/company" },
  { label: "Businesses", to: "/businesses" },
  { label: "Technology", to: "/technology" },
  { label: "Work", to: "/work" },
  { label: "People", to: "/people" },
  { label: "Insights", to: "/insights" },
];

export interface MobileNavProps {
  open: boolean;
  onClose: () => void;
}

export function MobileNav({ open, onClose }: MobileNavProps) {
  const closeRef = React.useRef<HTMLButtonElement>(null);
  const restoreFocusRef = React.useRef<HTMLElement | null>(null);
  const reduceMotion = useReducedMotion();

  // Body scroll lock + Escape-to-close + focus management while open.
  React.useEffect(() => {
    if (!open) return;

    restoreFocusRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
      restoreFocusRef.current?.focus?.();
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label="Site menu"
          className="fixed inset-0 z-[70] flex flex-col bg-graphite text-warmwhite"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          <div className="container-site flex h-16 items-center justify-between md:h-[72px]">
            <Logo variant="dark" onClick={onClose} />
            <button
              ref={closeRef}
              type="button"
              onClick={onClose}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full text-warmwhite transition-colors hover:bg-white/10"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>

          <nav
            id="mobile-nav"
            className="container-site flex flex-1 flex-col justify-center gap-1"
            aria-label="Mobile"
          >
            {LINKS.map((link, index) => (
              <motion.div
                key={link.to}
                initial={reduceMotion ? false : { opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.45,
                  ease: EASE,
                  delay: 0.05 + index * 0.05,
                }}
              >
                <Link
                  to={link.to}
                  onClick={onClose}
                  className="group flex items-baseline gap-4 py-3"
                >
                  <span className="font-mono text-[11px] tracking-[0.22em] text-ink-dark-soft">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="text-3xl font-semibold tracking-tight text-warmwhite transition-colors group-hover:text-periwinkle">
                    {link.label}
                  </span>
                </Link>
              </motion.div>
            ))}

            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.45,
                ease: EASE,
                delay: 0.05 + LINKS.length * 0.05,
              }}
              className="mt-10"
            >
              <Link
                to="/contact"
                onClick={onClose}
                className="inline-flex min-h-11 items-center justify-center rounded-full bg-white px-6 text-sm font-medium text-graphite transition-colors hover:bg-[#E8E9EC]"
              >
                Contact
              </Link>
            </motion.div>
          </nav>

          <div className="container-site border-t border-white/10 py-6">
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-ink-dark-soft">
              ETARNITY — Building What Comes Next
            </p>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

export default MobileNav;

"use client";

import * as React from "react";
import { Menu } from "lucide-react";
import { Link, useRouteActive } from "@/lib/router";
import { Logo } from "./logo";
import { MobileNav } from "./mobile-nav";
import { cn } from "@/lib/utils";

const NAV_ITEMS: { label: string; to: string }[] = [
  { label: "Company", to: "/company" },
  { label: "Businesses", to: "/businesses" },
  { label: "Technology", to: "/technology" },
  { label: "Work", to: "/work" },
  { label: "People", to: "/people" },
  { label: "Insights", to: "/insights" },
];

function NavItem({ label, to }: { label: string; to: string }) {
  const active = useRouteActive(to);

  return (
    <Link
      to={to}
      aria-current={active ? "page" : undefined}
      className={cn(
        "inline-flex items-center gap-2 text-[13px] font-medium transition-colors",
        active ? "text-graphite" : "text-ink-soft hover:text-graphite"
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "h-1 w-1 rounded-full bg-electric transition-opacity",
          active ? "opacity-100" : "opacity-0"
        )}
      />
      {label}
    </Link>
  );
}

export function Header() {
  const [scrolled, setScrolled] = React.useState(false);
  const [menuOpen, setMenuOpen] = React.useState(false);

  const closeMenu = React.useCallback(() => setMenuOpen(false), []);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-[60] focus:rounded-md focus:bg-graphite focus:px-4 focus:py-2 focus:text-sm focus:text-warmwhite"
      >
        Skip to main content
      </a>

      <header
        className={cn(
          "sticky top-0 z-50 h-16 border-b transition-colors duration-300 md:h-[72px]",
          scrolled
            ? "border-hairline bg-warmwhite/85 backdrop-blur-xl"
            : "border-transparent bg-transparent"
        )}
      >
        <div className="container-site flex h-full items-center justify-between gap-4">
          <Logo />

          <nav className="hidden items-center gap-8 lg:flex" aria-label="Primary">
            {NAV_ITEMS.map((item) => (
              <NavItem key={item.to} {...item} />
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Link
              to="/contact"
              className="hidden items-center rounded-full bg-graphite px-4 py-2 text-xs font-medium text-warmwhite transition-colors hover:bg-[#23262D] sm:inline-flex"
            >
              Contact
            </Link>
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full text-graphite transition-colors hover:bg-secondary lg:hidden"
              aria-expanded={menuOpen}
              aria-controls="mobile-nav"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>

      <MobileNav open={menuOpen} onClose={closeMenu} />
    </>
  );
}

export default Header;

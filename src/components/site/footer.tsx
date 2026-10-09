"use client";

import * as React from "react";
import { useApi } from "@/hooks/use-api";
import type { Business } from "@/lib/types";
import { Link } from "@/lib/router";
import { Logo } from "./logo";
import { cn } from "@/lib/utils";

const EXPLORE_LINKS: { label: string; to: string }[] = [
  { label: "Company", to: "/company" },
  { label: "Businesses", to: "/businesses" },
  { label: "Technology", to: "/technology" },
  { label: "Work", to: "/work" },
  { label: "People", to: "/people" },
  { label: "Insights", to: "/insights" },
  { label: "Careers", to: "/careers" },
];

const footerLink =
  "inline-flex min-h-6 items-center text-sm text-ink-dark-soft transition-colors hover:text-warmwhite";

function ColumnLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.22em] text-ink-dark-soft">
      {children}
    </p>
  );
}

export interface FooterProps {
  email?: string;
}

export function Footer({ email = "hello@etarnity.com" }: FooterProps) {
  const { data: businesses } = useApi<Business[]>("/api/public/businesses");
  const businessLinks = (businesses ?? []).slice(0, 5);
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto bg-graphite text-warmwhite">
      <div className="container-site py-16">
        <div className="grid gap-10 md:grid-cols-12">
          {/* Brand */}
          <div className="md:col-span-4">
            <Logo variant="dark" />
            <p className="mt-6 max-w-xs text-sm leading-relaxed text-ink-dark-soft">
              ETARNITY is a technology company building products, digital
              platforms, and digital businesses — founded in Dhaka, Bangladesh.
            </p>
            <p className="mt-6 font-mono text-[11px] uppercase tracking-[0.22em] text-ink-dark-soft">
              Est. 2025 — Dhaka, Bangladesh
            </p>
          </div>

          {/* Explore */}
          <nav className="md:col-span-2" aria-label="Explore">
            <ColumnLabel>Explore</ColumnLabel>
            <ul className="space-y-2.5">
              {EXPLORE_LINKS.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className={footerLink}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Businesses */}
          <nav className="md:col-span-3" aria-label="Businesses">
            <ColumnLabel>Businesses</ColumnLabel>
            {businessLinks.length > 0 ? (
              <ul className="space-y-2.5">
                {businessLinks.map((business) => (
                  <li key={business.id}>
                    <Link
                      to={`/businesses/${business.slug}`}
                      className={footerLink}
                    >
                      {business.name}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-ink-dark-soft">Ecosystem forming</p>
            )}
          </nav>

          {/* Connect */}
          <nav className="md:col-span-3" aria-label="Connect">
            <ColumnLabel>Connect</ColumnLabel>
            <ul className="space-y-2.5">
              <li>
                <Link to="/contact" className={footerLink}>
                  Contact
                </Link>
              </li>
              <li>
                <a href={`mailto:${email}`} className={footerLink}>
                  {email}
                </a>
              </li>
              <li>
                <Link to="/privacy-policy" className={footerLink}>
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className={footerLink}>
                  Terms
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div
          className={cn(
            "container-site flex flex-col gap-2 py-6 text-xs text-ink-dark-soft sm:flex-row sm:items-center sm:justify-between"
          )}
        >
          <p>© {currentYear} ETARNITY. All rights reserved.</p>
          <p>ETARNITY — Building What Comes Next.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;

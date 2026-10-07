"use client";

import * as React from "react";
import { Download, ArrowUpRight, Globe } from "lucide-react";
import { Reveal } from "@/components/machina/mf-primitives";
import { scrollToHash } from "@/components/providers/smooth-scroll-provider";
import { footer, site } from "@/content/machina";

/**
 * Oversized typography footer — display-type sign-off, mission summary,
 * Download / Recruits action pills and the corporate domain.
 * Sits flush at the bottom of the page (mt-auto in the page shell).
 */
export function MfFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative mt-auto border-t border-border">
      {/* soft glow orb behind the sign-off */}
      <div
        className="orb orb-neon h-64 w-64 -top-20 left-1/4"
        aria-hidden="true"
      />
      <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="pt-16 md:pt-24 pb-10 md:pb-14">
          {/* Oversized display title */}
          <Reveal y={36}>
            <h2 className="display-footer text-foreground">
              MachinaFusion — where{" "}
              <span className="editorial-accent text-muted-foreground">
                human intuition
              </span>{" "}
              meets machine intelligence.
            </h2>
          </Reveal>

          {/* Mission summary + domain */}
          <div className="mt-10 md:mt-14 grid gap-8 md:grid-cols-12 md:items-end">
            <Reveal delay={0.08} className="md:col-span-7">
              <p className="max-w-xl text-[15px] leading-relaxed text-muted-foreground text-pretty">
                {footer.mission}
              </p>
            </Reveal>
            <Reveal delay={0.16} className="md:col-span-5 md:text-right">
              <a
                href={`https://${site.domain}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 label-tag text-foreground transition-colors hover:text-[var(--accent)]"
              >
                <Globe className="h-3.5 w-3.5" aria-hidden="true" />
                {footer.contact}
              </a>
            </Reveal>
          </div>

          {/* Action pills */}
          <Reveal delay={0.22} className="mt-10 md:mt-12">
            <div className="flex flex-wrap items-center gap-3">
              <a
                href={footer.actions[0].href}
                download
                className="group inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-ambient transition-all hover:shadow-ambient-lg hover:-translate-y-0.5 active:translate-y-0"
              >
                <Download
                  className="h-4 w-4 transition-transform group-hover:translate-y-0.5"
                  aria-hidden="true"
                />
                {footer.actions[0].label}
              </a>
              <a
                href={footer.actions[1].href}
                onClick={(e) => {
                  e.preventDefault();
                  scrollToHash(footer.actions[1].href);
                }}
                className="group inline-flex items-center gap-2 rounded-full border border-border bg-card px-6 py-3 text-sm font-medium text-foreground transition-all hover:-translate-y-0.5 hover:shadow-ambient active:translate-y-0"
              >
                {footer.actions[1].label}
                <ArrowUpRight
                  className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  aria-hidden="true"
                />
              </a>
            </div>
          </Reveal>

          {/* Legal strip */}
          <div className="mt-14 md:mt-20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-t border-border pt-6">
            <p className="label-tag text-muted-foreground">
              © {year} {site.name} Group. All rights reserved.
            </p>
            <nav aria-label="Footer sections" className="flex gap-5">
              {footer.nav.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToHash(item.href);
                  }}
                  className="label-tag text-muted-foreground transition-colors hover:text-foreground"
                >
                  {item.label}
                </a>
              ))}
            </nav>
          </div>
        </div>
      </div>
    </footer>
  );
}

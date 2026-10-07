"use client";

/**
 * ETARNITY — corporate footer.
 * Five quiet link columns, a short statement, and the giant ETARNITY
 * signature as the final word. Flush to the bottom via mt-auto.
 */

import { footer, site } from "@/content/site";
import { LogoMark, Reveal } from "@/components/etarnity/primitives";
import { scrollToHash } from "@/components/providers/smooth-scroll-provider";

export function SiteFooter() {
  return (
    <footer className="relative mt-auto overflow-x-clip border-t border-border bg-surface-alt">
      {/* Faint lavender atmosphere rising from the signature */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[420px] glow-deep opacity-60"
      />

      <div className="relative mx-auto w-full max-w-[1200px] px-6 pb-10 pt-20 md:px-10 md:pt-28">
        {/* Statement + columns */}
        <div className="grid gap-14 lg:grid-cols-12">
          <Reveal className="lg:col-span-5" direction="up">
            <div className="inline-flex items-center gap-3">
              <LogoMark className="h-7 w-7" />
              <span className="font-display text-lg font-semibold tracking-[0.08em]">
                ETARNITY
              </span>
            </div>
            <p className="mt-6 max-w-sm text-[15px] leading-relaxed text-muted-foreground">
              {footer.statement}
            </p>
            <p className="label-mono mt-8 text-muted-foreground">
              Est. {site.founded} — {site.hq.city}, {site.hq.country}
            </p>
          </Reveal>

          <nav
            aria-label="Footer"
            className="grid grid-cols-2 gap-10 sm:grid-cols-3 lg:col-span-7 lg:grid-cols-5"
          >
            {footer.columns.map((column, ci) => (
              <Reveal
                key={column.title}
                direction="up"
                delay={0.08 + ci * 0.06}
                as="div"
              >
                <p className="label-mono mb-5 text-accent-deep">{column.title}</p>
                <ul className="space-y-3">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        onClick={
                          link.href.startsWith("#") && link.href !== "#"
                            ? (e) => {
                                e.preventDefault();
                                scrollToHash(link.href);
                              }
                            : undefined
                        }
                        className="text-[13.5px] text-muted-foreground transition-colors duration-300 hover:text-foreground"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </Reveal>
            ))}
          </nav>
        </div>

        {/* The signature — the final corporate word */}
        <Reveal delay={0.1} blur duration={1.2}>
          <p
            aria-hidden="true"
            className="display-footer mt-20 select-none text-foreground/[0.96] md:mt-28"
          >
            ETARNITY
          </p>
          <p className="sr-only">ETARNITY</p>
        </Reveal>

        {/* Legal strip */}
        <div className="mt-8 flex flex-col gap-4 border-t border-border pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="label-mono text-muted-foreground">{footer.copyright}</p>
          <div className="flex items-center gap-6">
            {footer.legal.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="label-mono text-muted-foreground transition-colors duration-300 hover:text-foreground"
              >
                {link.label}
              </a>
            ))}
            <a
              href={`https://${footer.domain}`}
              target="_blank"
              rel="noreferrer"
              className="label-mono text-accent-deep transition-colors duration-300 hover:text-foreground"
            >
              {footer.domain}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

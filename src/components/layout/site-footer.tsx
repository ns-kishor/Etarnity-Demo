"use client";

import * as React from "react";
import { ArrowUp } from "lucide-react";
import { footer as footerContent, site } from "@/content/site";
import { Reveal } from "@/components/primitives/corporate";

export function SiteFooter() {
  return (
    <footer
      id="site-footer"
      aria-label="Site footer"
      className="relative mt-auto w-full border-t border-border/70 bg-background"
    >
      <div className="mx-auto w-full max-w-[1280px] px-6 md:px-10 lg:px-14">
        {/* Link architecture */}
        <div className="grid gap-10 py-14 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 lg:py-16">
          {footerContent.columns.map((col, i) => (
            <Reveal key={col.title} delay={i * 0.05} distance={16}>
              <p className="label-mono mb-4">{col.title}</p>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-[13.5px] leading-relaxed text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </Reveal>
          ))}
        </div>

        {/* The corporate signature */}
        <div className="border-t border-border/60 py-12 md:py-16">
          <Reveal blur>
            <p
              aria-label="ETARNITY"
              className="select-none text-center font-sans font-semibold uppercase leading-none tracking-[0.32em] text-ivory"
              style={{ fontSize: "clamp(2.6rem, 9vw, 7.5rem)" }}
            >
              ETARNITY
            </p>
          </Reveal>
          <Reveal delay={0.12}>
            <p className="mx-auto mt-7 max-w-xl text-pretty text-center text-sm leading-relaxed text-muted-foreground">
              {footerContent.statement}
            </p>
          </Reveal>
        </div>

        {/* Legal baseline */}
        <div className="flex flex-col items-center justify-between gap-4 border-t border-border/60 py-6 pb-8 md:flex-row md:pb-10">
          <p className="font-mono text-[11px] tracking-[0.14em] text-muted-foreground/70">
            {footerContent.copyright}
          </p>
          <div className="flex items-center gap-6">
            {footerContent.legal.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="text-[12.5px] text-muted-foreground transition-colors hover:text-foreground"
              >
                {item.label}
              </a>
            ))}
            <a
              href="#top"
              aria-label="Back to top"
              className="inline-flex h-9 w-9 items-center justify-center rounded-sm border border-border text-muted-foreground transition-colors hover:border-emerald-corp/50 hover:text-emerald-corp"
            >
              <ArrowUp className="h-4 w-4" aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

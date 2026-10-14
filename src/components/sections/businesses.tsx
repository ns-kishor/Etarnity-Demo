"use client";

/**
 * ETARNITY — our businesses (ecosystem block).
 * Each business is a large floating editorial card — a miniature company
 * identity inside the parent website. On desktop the cards run a quiet
 * scroll sequence: the current card comes forward (scale, opacity, shadow
 * depth) while its image drifts at its own speed. Mobile: plain reveals.
 */

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { businesses, type BusinessEntity } from "@/content/site";
import {
  EASE,
  SectionHeading,
  SectionShell,
} from "@/components/etarnity/primitives";
import { cn } from "@/lib/utils";

/* Scroll-sequence shadows — rest ≈ ambient, center = full depth */
const SHADOW_REST = "0 14px 36px -16px rgb(27 28 32 / 0.05)";
const SHADOW_CENTER = "0 34px 78px -24px rgb(27 28 32 / 0.15)";

const STATUS_DOT: Record<BusinessEntity["status"], string> = {
  Operating: "bg-accent",
  Building: "bg-periwinkle",
  "Early-stage": "bg-foreground/30",
};

/* Desktop-only scroll sequence — breakpoint state deferred to rAF (lint-safe) */
function useIsDesktop(): boolean {
  const [enabled, setEnabled] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const raf = requestAnimationFrame(() => setEnabled(mq.matches));
    const onChange = (event: MediaQueryListEvent) => setEnabled(event.matches);
    mq.addEventListener("change", onChange);
    return () => {
      cancelAnimationFrame(raf);
      mq.removeEventListener("change", onChange);
    };
  }, []);
  return enabled;
}

function StatusPill({ status }: { status: BusinessEntity["status"] }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5">
      <span
        className={cn("h-1.5 w-1.5 rounded-full", STATUS_DOT[status])}
        aria-hidden="true"
      />
      <span className="label-mono text-muted-foreground">{status}</span>
    </span>
  );
}

function BusinessCard({
  business,
  index,
  sequence,
}: {
  business: BusinessEntity;
  index: number;
  sequence: boolean;
}) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLElement>(null);

  /* Per-card scroll tracking — the card eases forward as it crosses center */
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start center", "end center"],
  });
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.97, 1, 0.97]);
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [0.55, 1, 0.55]);
  const y = useTransform(scrollYProgress, [0, 0.5, 1], [22, 0, -22]);
  const boxShadow = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    [SHADOW_REST, SHADOW_CENTER, SHADOW_REST]
  );
  /* The image drifts at its own speed inside the overflow-hidden frame */
  const imageY = useTransform(scrollYProgress, [0, 1], [-18, 18]);

  const animated = sequence && !reduced;
  const imageLeft = index % 2 === 0;

  return (
    <article
      ref={ref}
      className={cn("w-full md:w-[86%]", index % 2 === 1 && "md:ml-auto")}
    >
      <motion.div
        style={animated ? { scale, opacity, y, boxShadow } : undefined}
        initial={animated ? undefined : { opacity: 0, y: 26 }}
        whileInView={animated ? undefined : { opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-12% 0px -12% 0px" }}
        transition={animated ? undefined : { duration: 0.9, ease: EASE }}
        className={cn(
          "card-quiet p-6 md:p-8 lg:p-10",
          !animated && "shadow-ambient"
        )}
      >
        {/* Card header — status left, decorative arrow right */}
        <div className="flex items-center justify-between gap-4">
          <StatusPill status={business.status} />
          <ArrowUpRight
            className="h-4 w-4 text-foreground opacity-40"
            strokeWidth={1.5}
            aria-hidden="true"
          />
        </div>

        <div className="mt-7 grid gap-8 md:grid-cols-12 md:gap-10">
          {/* Large framed image */}
          <div
            className={cn(
              "relative aspect-[4/3] overflow-hidden rounded-[20px] md:col-span-7",
              !imageLeft && "md:order-2"
            )}
          >
            <motion.div
              style={animated ? { y: imageY } : undefined}
              className={cn("absolute", animated ? "-inset-6" : "inset-0")}
            >
              <Image
                src={business.image}
                alt={business.imageAlt}
                fill
                sizes="(min-width: 1280px) 560px, (min-width: 768px) 45vw, 92vw"
                className="object-cover"
              />
            </motion.div>
          </div>

          {/* Identity column */}
          <div
            className={cn(
              "flex flex-col md:col-span-5",
              !imageLeft && "md:order-1"
            )}
          >
            <h3 className="display-2 text-balance text-foreground">
              {business.name}
            </h3>
            <p className="label-mono mt-3 text-muted-foreground">
              {business.industry}
            </p>
            <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">
              {business.description}
            </p>

            <div className="mt-auto pt-7">
              <p className="label-mono text-accent-deep">Purpose</p>
              <p className="mt-2.5 text-[14px] leading-relaxed text-foreground/85">
                “{business.purpose}”
              </p>
              <div className="hairline mt-5 w-full" aria-hidden="true" />
              <div className="mt-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
                <p className="label-mono text-muted-foreground">
                  {business.relationship}
                </p>
                <p className="label-mono text-muted-foreground/70">
                  {business.category}
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </article>
  );
}

export function Businesses() {
  const desktop = useIsDesktop();

  return (
    <SectionShell id="businesses" ariaLabel="Our businesses" alt>
      <SectionHeading
        index="04"
        kicker="Our Businesses"
        title={
          <>
            <span className="text-muted-foreground/80">Our </span>Businesses.
          </>
        }
        lead="Each business is a company of its own — purpose, discipline, identity — inside one parent structure."
      />

      <div className="space-y-16 md:space-y-24">
        {businesses.map((business, i) => (
          <BusinessCard
            key={business.id}
            business={business}
            index={i}
            sequence={desktop}
          />
        ))}
      </div>
    </SectionShell>
  );
}

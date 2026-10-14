"use client";

import * as React from "react";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { Reveal } from "@/components/site/reveal";
import { cn } from "@/lib/utils";
import { 
  Cpu, 
  Layers, 
  Terminal, 
  Activity, 
  Network, 
  CheckCircle2, 
  ArrowUpRight 
} from "lucide-react";

interface CompanyPoint {
  index: string;
  title: string;
  detail: string;
  badge: string;
  stats: string;
  icon: React.ElementType;
}

const POINTS: readonly CompanyPoint[] = [
  {
    index: "01",
    title: "A Technology Company",
    detail:
      "ETARNITY designs, builds, and operates digital products, platforms, and businesses — founded in Dhaka, Bangladesh, and engineered for global scale.",
    badge: "CORE MANDATE",
    stats: "GLOBAL REACH // DEEP TECH",
    icon: Cpu,
  },
  {
    index: "02",
    title: "Designed with Intent",
    detail:
      "Every product begins with deliberate architecture. Interfaces are shaped around real human cognition — crisp hierarchy, honest states, and interactions that feel inevitable rather than decorative.",
    badge: "HUMAN-CENTERED",
    stats: "ZERO FRICTION // INTUITIVE",
    icon: Layers,
  },
  {
    index: "03",
    title: "Engineered with Discipline",
    detail:
      "We hold ourselves to the rigorous standards of global technology leaders: statically typed codebases, audited pull requests, automated test matrices, and architectures built to outlive trends.",
    badge: "ZERO DEBT",
    stats: "STRICT TYPES // 100% AUDITED",
    icon: Terminal,
  },
  {
    index: "04",
    title: "Operated for the Long Run",
    detail:
      "Shipping is merely day one. We monitor, maintain, and iterate continuously on what we build — a platform's true value compounds after release through relentless operational telemetry.",
    badge: "SLA RESILIENT",
    stats: "99.99% OBSERVED // RESILIENT",
    icon: Activity,
  },
  {
    index: "05",
    title: "Grown One System at a Time",
    detail:
      "Client engineering keeps our edges sharp, proprietary ventures compound what we learn, and our ecosystem expands organically through proven, production-grade solutions.",
    badge: "COMPOUNDING",
    stats: "PORTFOLIO SYNERGY // EXPANDING",
    icon: Network,
  },
];

export default function CompanyScrolly() {
  const [active, setActive] = React.useState(0);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const blockRefs = React.useRef<Array<HTMLDivElement | null>>([]);

  // Smooth scroll tracking inside this section
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end center"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 70,
    damping: 25,
    restDelta: 0.001,
  });

  // Calculate active index smoothly based on scroll
  React.useEffect(() => {
    const unsubscribe = smoothProgress.on("change", (latest) => {
      const pointIndex = Math.min(
        Math.floor(latest * POINTS.length),
        POINTS.length - 1
      );
      if (pointIndex >= 0 && pointIndex !== active) {
        setActive(pointIndex);
      }
    });
    return () => unsubscribe();
  }, [smoothProgress, active]);

  const scrollToBlock = (index: number) => {
    const block = blockRefs.current[index];
    if (!block) return;
    block.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  };

  return (
    <div ref={containerRef} className="relative mt-8">
      <div className="lg:grid lg:grid-cols-12 lg:gap-14">
        {/* Sticky index — desktop only */}
        <div className="hidden lg:col-span-5 lg:block">
          <div className="sticky top-32 rounded-2xl border border-hairline/80 bg-white/70 p-6 shadow-[0_8px_30px_rgba(0,0,0,0.03)] backdrop-blur-md">
            <div className="flex items-center justify-between border-b border-hairline/80 pb-4">
              <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-ink-soft">
                COMPANY ETHOS — 05 PILLARS
              </p>
              <span className="flex items-center gap-1.5 font-mono text-[10px] text-electric">
                <span className="size-1.5 animate-pulse rounded-full bg-electric" />
                ACTIVE
              </span>
            </div>

            <ul className="mt-5 space-y-2">
              {POINTS.map((point, i) => {
                const isActive = i === active;
                const Icon = point.icon;

                return (
                  <li key={point.index}>
                    <button
                      type="button"
                      onClick={() => scrollToBlock(i)}
                      aria-current={isActive ? "true" : undefined}
                      className={cn(
                        "group relative flex w-full items-center justify-between rounded-xl p-3.5 text-left transition-all duration-300",
                        isActive
                          ? "bg-graphite text-warmwhite shadow-[0_4px_20px_rgba(21,23,27,0.12)]"
                          : "text-ink-soft hover:bg-black/[0.03] hover:text-graphite"
                      )}
                    >
                      <div className="flex items-center gap-3.5">
                        <span
                          className={cn(
                            "flex size-7 items-center justify-center rounded-lg font-mono text-[11px] transition-colors",
                            isActive
                              ? "bg-white/10 text-warmwhite"
                              : "bg-black/[0.04] text-ink-soft group-hover:text-graphite"
                          )}
                        >
                          {point.index}
                        </span>
                        <div>
                          <span
                            className={cn(
                              "block text-[15px] font-semibold leading-tight transition-colors",
                              isActive ? "text-warmwhite" : "text-graphite"
                            )}
                          >
                            {point.title}
                          </span>
                          <span
                            className={cn(
                              "mt-0.5 block font-mono text-[9px] tracking-wider uppercase",
                              isActive ? "text-periwinkle" : "text-ink-soft/70"
                            )}
                          >
                            {point.badge}
                          </span>
                        </div>
                      </div>

                      <Icon
                        className={cn(
                          "size-4 transition-transform duration-300",
                          isActive
                            ? "text-electric scale-110"
                            : "text-ink-soft/40 group-hover:translate-x-0.5"
                        )}
                      />
                    </button>
                  </li>
                );
              })}
            </ul>

            {/* Live Progress Bar */}
            <div className="mt-6 pt-4 border-t border-hairline/80">
              <div className="flex items-center justify-between font-mono text-[9px] uppercase tracking-widest text-ink-soft mb-2">
                <span>SCROLL PROGRESS</span>
                <span>{Math.round(((active + 1) / POINTS.length) * 100)}%</span>
              </div>
              <div className="h-1 w-full rounded-full bg-hairline overflow-hidden">
                <motion.div
                  className="h-full bg-electric rounded-full"
                  style={{ scaleX: smoothProgress, transformOrigin: "0%" }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Detail blocks with high-tech cards and micro-animations */}
        <div className="lg:col-span-7 space-y-12 lg:space-y-24 py-6">
          {POINTS.map((point, i) => {
            const isActive = i === active;
            const Icon = point.icon;

            return (
              <div
                key={point.index}
                data-point={i}
                ref={(el) => {
                  blockRefs.current[i] = el;
                }}
                className="flex items-center min-h-[50vh] lg:min-h-[65vh]"
              >
                <motion.div
                  initial={false}
                  animate={{
                    opacity: isActive ? 1 : 0.45,
                    scale: isActive ? 1 : 0.98,
                    y: isActive ? 0 : 8,
                  }}
                  transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                  className={cn(
                    "relative w-full rounded-2xl border p-8 md:p-10 transition-all duration-500",
                    isActive
                      ? "border-electric/30 bg-white shadow-[0_16px_50px_rgba(21,23,27,0.08)] ring-1 ring-electric/20"
                      : "border-hairline bg-white/50 backdrop-blur-sm shadow-sm"
                  )}
                >
                  {/* Holographic Watermark Index */}
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute top-4 right-6 select-none font-mono text-[5rem] sm:text-[6.5rem] font-bold leading-none text-graphite/[0.04]"
                  >
                    {point.index}
                  </span>

                  <div className="flex items-center gap-3">
                    <span className="flex size-10 items-center justify-center rounded-xl bg-graphite text-warmwhite shadow-sm">
                      <Icon className="size-5 text-electric" />
                    </span>
                    <div>
                      <span className="inline-block rounded-full bg-electric/10 px-2.5 py-0.5 font-mono text-[10px] font-medium text-electric tracking-wider uppercase">
                        {point.badge}
                      </span>
                    </div>
                  </div>

                  <h3 className="mt-6 text-2xl sm:text-3xl font-bold tracking-tight text-graphite">
                    {point.title}
                  </h3>

                  <p className="mt-4 text-[16px] leading-[1.8] text-ink-soft sm:text-[17px]">
                    {point.detail}
                  </p>

                  <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-hairline pt-5 font-mono text-[10px] sm:text-[11px] text-ink-soft">
                    <span className="flex items-center gap-2">
                      <CheckCircle2 className="size-3.5 text-emerald-600" />
                      <span>{point.stats}</span>
                    </span>

                    <button
                      type="button"
                      onClick={() => scrollToBlock((i + 1) % POINTS.length)}
                      className="inline-flex items-center gap-1 font-medium text-electric hover:underline"
                    >
                      <span>NEXT PILLAR</span>
                      <ArrowUpRight className="size-3" />
                    </button>
                  </div>
                </motion.div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

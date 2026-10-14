"use client";

import * as React from "react";
import Image from "next/image";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ArrowRight, Cpu, Sparkles, Terminal } from "lucide-react";
import { Link } from "@/lib/router";
import TypingPhrase from "./typing-phrase";
import { Reveal } from "./reveal";

const MATRIX_LINES = [
  "ETARNITY // APPLIED INTELLIGENCE // SYSTEM KERNEL // 0x7F001 // NEXT-GEN COMPUTE // QUANTUM MAPPING // NEURAL RUNTIME // AUTONOMOUS PLATFORMS // DHAKA 2025 // PROTOCOL 01",
  "DEEP TECH ECOSYSTEM // DISTRIBUTED LEDGER // REALTIME OBSERVABILITY // HIGH THROUGHPUT // SCALABLE ARCHITECTURE // ZERO TRUST ENCRYPTION // CLIENT ENGINEERING // HARDWARE-ACCELERATED",
  "TRANSFORMING VISION INTO REALITY // REVOLUTIONARY ENGINEERING // CORE DISCIPLINE // RESILIENT INFRASTRUCTURE // PRODUCT DESIGN // SYSTEM INTEGRITY // COMPOSABLE INTELLIGENCE",
  "01010101 01100101 01110100 01100001 01110010 01101110 01101001 01110100 01111001 // BUILD WHAT COMES NEXT // BOUNDLESS HORIZONS // OPERATIONAL EXCELLENCE // ENTERPRISE GRADE",
  "AI SUBSYSTEMS // SYNAPSE ENGINE // NEURAL DATAFLOW // CONTINUOUS DELIVERY // MICROSERVICES // NEXTJS // TYPESCRIPT // RUST // PYTHON // THREE.JS // WEBGL SHADERS // GLSL",
  "GLOBAL STANDARD // DISCIPLINED EXECUTION // FOUNDED IN DHAKA // BUILT FOR THE WORLD // ETHICAL INNOVATION // ENTERPRISE RESILIENCE // MISSION CRITICAL PLATFORMS // 2025",
];

export default function HeroRobotic() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Damped spring physics for ultra-smooth robotic hand parallax
  const springX = useSpring(mouseX, { stiffness: 45, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 45, damping: 20 });

  const leftHandX = useTransform(springX, [-0.5, 0.5], [-18, 14]);
  const leftHandY = useTransform(springY, [-0.5, 0.5], [-12, 16]);
  const leftHandRotate = useTransform(springX, [-0.5, 0.5], [-3, 3]);

  const rightHandX = useTransform(springX, [-0.5, 0.5], [14, -18]);
  const rightHandY = useTransform(springY, [-0.5, 0.5], [-14, 14]);
  const rightHandRotate = useTransform(springX, [-0.5, 0.5], [3, -3]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <section
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative min-h-[92vh] w-full overflow-hidden bg-gradient-to-b from-[#F8F8F6] via-[#F4F5F8] to-[#F8F8F6] pt-28 pb-20 md:pt-36 md:pb-28 flex flex-col justify-center"
    >
      {/* ---------------- BACKGROUND SMALL TEXT MATRIX EFFECT (as in sample-1.jpg) ---------------- */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 select-none overflow-hidden opacity-[0.055] md:opacity-[0.075] transition-opacity duration-700"
      >
        <div className="flex flex-col gap-3.5 py-6 font-mono text-[9px] md:text-[11px] uppercase tracking-[0.25em] text-graphite whitespace-nowrap">
          {MATRIX_LINES.map((line, idx) => (
            <motion.div
              key={idx}
              initial={{ x: idx % 2 === 0 ? -40 : 40 }}
              animate={{ x: idx % 2 === 0 ? 0 : -20 }}
              transition={{
                duration: 25 + idx * 4,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "linear",
              }}
              className="flex gap-8"
            >
              <span>{line}</span>
              <span>{line}</span>
              <span>{line}</span>
            </motion.div>
          ))}
          {MATRIX_LINES.map((line, idx) => (
            <motion.div
              key={`repeat-${idx}`}
              initial={{ x: idx % 2 === 0 ? 20 : -30 }}
              animate={{ x: idx % 2 === 0 ? -30 : 20 }}
              transition={{
                duration: 28 + idx * 3,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "linear",
              }}
              className="flex gap-8"
            >
              <span>{line}</span>
              <span>{line}</span>
              <span>{line}</span>
            </motion.div>
          ))}
        </div>

        {/* Faint cyber grid overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#15171b0a_1px,transparent_1px),linear-gradient(to_bottom,#15171b0a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
      </div>

      {/* ---------------- ROBOTIC HAND LEFT (from sample-1.jpg) ---------------- */}
      <motion.div
        aria-hidden="true"
        style={{
          x: leftHandX,
          y: leftHandY,
          rotate: leftHandRotate,
        }}
        className="pointer-events-none absolute bottom-0 -left-6 z-10 w-[240px] sm:w-[320px] md:w-[420px] lg:w-[500px] xl:w-[540px] select-none"
      >
        <motion.div
          animate={{
            y: [0, -10, 0],
            rotate: [0, 1, 0],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="relative aspect-[480/435] w-full filter drop-shadow-[0_20px_45px_rgba(21,23,27,0.18)]"
        >
          <Image
            src="/images/robotic-hand-left.png"
            alt="Robotic Left Hand"
            fill
            sizes="(max-width: 768px) 300px, 540px"
            className="object-contain object-bottom-left"
            priority
          />
          {/* Subtle cyan cyber pulse node near the hand */}
          <span className="absolute top-[40%] right-[22%] size-2 rounded-full bg-electric/60 blur-[2px] animate-pulse" />
        </motion.div>
      </motion.div>

      {/* ---------------- ROBOTIC HAND RIGHT (from sample-1.jpg) ---------------- */}
      <motion.div
        aria-hidden="true"
        style={{
          x: rightHandX,
          y: rightHandY,
          rotate: rightHandRotate,
        }}
        className="pointer-events-none absolute bottom-0 -right-6 z-10 w-[240px] sm:w-[320px] md:w-[420px] lg:w-[500px] xl:w-[540px] select-none"
      >
        <motion.div
          animate={{
            y: [0, -12, 0],
            rotate: [0, -1.2, 0],
          }}
          transition={{
            duration: 6.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5,
          }}
          className="relative aspect-[466/435] w-full filter drop-shadow-[0_20px_45px_rgba(21,23,27,0.18)]"
        >
          <Image
            src="/images/robotic-hand-right.png"
            alt="Robotic Right Hand"
            fill
            sizes="(max-width: 768px) 300px, 540px"
            className="object-contain object-bottom-right"
            priority
          />
          {/* Subtle electric blue cyber pulse node near the fingertips */}
          <span className="absolute top-[38%] left-[24%] size-2 rounded-full bg-electric/60 blur-[2px] animate-pulse" />
        </motion.div>
      </motion.div>

      {/* ---------------- CENTER HERO CONTENT ---------------- */}
      <div className="container-site relative z-20">
        <div className="mx-auto max-w-4xl text-center">
          {/* Futuristic Chip / Pill */}
          <Reveal>
            <div className="inline-flex items-center gap-2.5 rounded-full border border-hairline/80 bg-white/80 px-4 py-1.5 shadow-[0_2px_12px_rgba(0,0,0,0.03)] backdrop-blur-md">
              <span className="relative flex size-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#10b981] opacity-75" />
                <span className="relative inline-flex size-2 rounded-full bg-[#10b981]" />
              </span>
              <span className="font-mono text-[10px] md:text-[11px] font-medium tracking-[0.2em] text-graphite uppercase">
                MOTHER TECHNOLOGY GROUP // GLOBAL RUNTIME
              </span>
              <span className="hidden sm:inline-block h-3 w-px bg-hairline" />
              <span className="hidden sm:inline-flex items-center gap-1 font-mono text-[10px] text-electric">
                <Cpu className="size-3" />
                <span>v2.5 ARCHITECTURE</span>
              </span>
            </div>
          </Reveal>

          {/* Main Visual Headline */}
          <Reveal delay={0.08}>
            <h1 className="mt-8 text-[2.4rem] font-bold leading-[1.05] tracking-[-0.035em] text-graphite sm:text-5xl md:text-6xl lg:text-[4.5rem]">
              <span className="sr-only">
                We don&apos;t just solve problems. We rethink what&apos;s possible.
              </span>
              <span aria-hidden="true" className="block">
                <span className="block text-graphite/90 font-medium tracking-tight">
                  We don&apos;t just
                </span>
                <span className="block text-graphite py-1 font-extrabold">
                  <TypingPhrase />
                </span>
                <span className="block mt-1 bg-gradient-to-r from-graphite via-graphite to-[#2a303c] bg-clip-text text-transparent">
                  We rethink what&apos;s possible.
                </span>
              </span>
            </h1>
          </Reveal>

          {/* Subtitle / Positioning Lede */}
          <Reveal delay={0.16}>
            <p className="mx-auto mt-7 max-w-2xl text-base leading-relaxed text-ink-soft sm:text-lg md:text-[1.18rem] md:leading-[1.75]">
              ETARNITY engineers deep-tech platforms, autonomous intelligent systems,
              and category-defining digital businesses built for longevity.
            </p>
          </Reveal>

          {/* Interactive CTAs */}
          <Reveal delay={0.24}>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-3.5">
              <Link
                to="/company"
                className="group relative inline-flex items-center gap-2.5 overflow-hidden rounded-full bg-graphite px-7 py-4 text-sm font-semibold text-warmwhite shadow-[0_10px_30px_rgba(21,23,27,0.18)] transition-all duration-300 hover:bg-[#23262D] hover:shadow-[0_15px_35px_rgba(21,23,27,0.28)] hover:-translate-y-0.5 active:translate-y-0"
              >
                <span>Explore ETARNITY</span>
                <ArrowRight
                  aria-hidden="true"
                  className="size-4 transition-transform duration-300 group-hover:translate-x-1"
                />
              </Link>

              <Link
                to="/businesses"
                className="inline-flex items-center gap-2 rounded-full border border-hairline/90 bg-white/90 px-7 py-4 text-sm font-semibold text-graphite shadow-[0_4px_16px_rgba(0,0,0,0.04)] backdrop-blur-md transition-all duration-300 hover:border-graphite hover:bg-white hover:-translate-y-0.5"
              >
                <span>Explore Ecosystem</span>
                <span className="size-1.5 rounded-full bg-electric" />
              </Link>
            </div>
          </Reveal>

          {/* Bottom Telemetry Ticker */}
          <Reveal delay={0.32}>
            <div className="mt-14 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 border-t border-hairline/80 pt-6 font-mono text-[10px] md:text-[11px] tracking-[0.2em] text-ink-soft">
              <span className="flex items-center gap-1.5">
                <span className="size-1.5 rounded-full bg-electric" />
                EST. 2025
              </span>
              <span className="text-hairline">/</span>
              <span>DHAKA, BANGLADESH</span>
              <span className="text-hairline">/</span>
              <span className="text-graphite font-semibold">
                GLOBAL TECHNOLOGY GROUP
              </span>
              <span className="text-hairline">/</span>
              <span className="text-[#10b981] font-medium">SYS.HEALTH 99.98%</span>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

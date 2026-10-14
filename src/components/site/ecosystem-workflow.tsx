"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Lightbulb, 
  Cpu, 
  Rocket, 
  RefreshCw, 
  CheckCircle2, 
  ArrowRight,
  ShieldCheck,
  Zap,
  Layers,
  ChevronRight
} from "lucide-react";

interface WorkflowStage {
  id: string;
  step: string;
  title: string;
  shortDesc: string;
  fullDesc: string;
  icon: React.ElementType;
  deliverables: string[];
  telemetry: string;
  color: string;
}

const STAGES: WorkflowStage[] = [
  {
    id: "stage-1",
    step: "PHASE 01",
    title: "Venture Incubation & Deep-Tech R&D",
    shortDesc: "Algorithmic exploration, zero-to-one problem mapping, and technological validation.",
    fullDesc:
      "We begin by identifying structural market inefficiencies and foundational technological bottlenecks. Our research lab prototypes proofs-of-concept using applied intelligence and modern cryptographic methods before committing venture capital.",
    icon: Lightbulb,
    deliverables: ["Market Inefficiency Audit", "Mathematical Feasibility Model", "Algorithmic Prototype"],
    telemetry: "SEEDING // R&D SPRINT",
    color: "#526BFF",
  },
  {
    id: "stage-2",
    step: "PHASE 02",
    title: "High-Assurance Systems Architecture",
    shortDesc: "End-to-end typed codebases, microservices, and zero-trust security postures.",
    fullDesc:
      "Architecture outlives trends. We design resilient digital platforms with statically typed schemas, immutable audit trails, and human-centered design principles that eliminate user friction from day one.",
    icon: Cpu,
    deliverables: ["Type-Safe Domain Modeling", "Zero-Trust Infrastructure", "Intuitive Interface Hierarchy"],
    telemetry: "STRICT TYPES // AUDITED",
    color: "#10b981",
  },
  {
    id: "stage-3",
    step: "PHASE 03",
    title: "Distributed Launch & Global Edge Scaling",
    shortDesc: "Global edge CDN deployment, multi-region database replication, and sub-millisecond routing.",
    fullDesc:
      "Platforms are deployed into production via automated continuous integration pipelines with strict synthetic test gates. Real-time telemetry and deep observability monitor every transaction and system heartbeat 24/7.",
    icon: Rocket,
    deliverables: ["Multi-Region Replication", "Sub-100ms Global P99", "Automated Canary Deployments"],
    telemetry: "EDGE-ACTIVE // 99.99% SLA",
    color: "#8b5cf6",
  },
  {
    id: "stage-4",
    step: "PHASE 04",
    title: "Ecosystem Compounding & Perpetual Operation",
    shortDesc: "Shared infrastructure, cross-venture synergies, and continuous product evolution.",
    fullDesc:
      "Shipping is merely our milestone. Each business within the ETARNITY ecosystem shares knowledge, security telemetry, and data pipelines with other internal products, creating an accelerating compounding effect.",
    icon: RefreshCw,
    deliverables: ["Cross-Venture Data Fabric", "Continuous Feature Iteration", "Long-Term Value Compounding"],
    telemetry: "PERPETUAL COMPOUNDING",
    color: "#f59e0b",
  },
];

export default function EcosystemWorkflow() {
  const [activeStageIndex, setActiveStageIndex] = React.useState(0);
  const activeStage = STAGES[activeStageIndex];
  const Icon = activeStage.icon;

  // Auto-advance stages every 6 seconds if user hasn't manually interacted recently
  React.useEffect(() => {
    const timer = setInterval(() => {
      setActiveStageIndex((prev) => (prev + 1) % STAGES.length);
    }, 6500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-hairline bg-white p-7 md:p-12 shadow-[0_12px_45px_rgba(21,23,27,0.05)]">
      {/* Top Telemetry Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-hairline pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-electric animate-ping" />
            <span className="font-mono text-[10px] tracking-[0.24em] text-electric uppercase">
              METHODOLOGY // HOW WE OPERATE
            </span>
          </div>
          <h2 className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-graphite">
            The 4-Stage Ecosystem Engine
          </h2>
        </div>

        <div className="hidden sm:flex items-center gap-2 font-mono text-[10px] tracking-widest text-ink-soft">
          <span>ACTIVE STAGE:</span>
          <span className="rounded-full bg-graphite px-2.5 py-1 text-white font-semibold">
            {activeStage.step}
          </span>
        </div>
      </div>

      {/* Interactive Progress Pipeline Track */}
      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {STAGES.map((stage, idx) => {
          const isCurrent = idx === activeStageIndex;
          const StageIcon = stage.icon;

          return (
            <button
              key={stage.id}
              type="button"
              onClick={() => setActiveStageIndex(idx)}
              className={`group relative flex flex-col items-start rounded-xl border p-4 text-left transition-all duration-300 ${
                isCurrent
                  ? "border-graphite bg-graphite text-warmwhite shadow-[0_8px_25px_rgba(21,23,27,0.15)] -translate-y-1"
                  : "border-hairline bg-[#F8F8F6]/60 text-graphite hover:border-graphite/40 hover:bg-white"
              }`}
            >
              {/* Top Accent Line */}
              <div 
                className={`absolute top-0 left-0 right-0 h-1 rounded-t-xl transition-all ${
                  isCurrent ? "bg-electric" : "bg-transparent group-hover:bg-hairline"
                }`} 
              />

              <div className="flex w-full items-center justify-between">
                <span className={`font-mono text-[10px] tracking-widest uppercase ${
                  isCurrent ? "text-periwinkle" : "text-ink-soft"
                }`}>
                  {stage.step}
                </span>
                <StageIcon className={`size-4 ${isCurrent ? "text-electric" : "text-ink-soft"}`} />
              </div>

              <h3 className={`mt-3 text-sm font-semibold leading-snug line-clamp-2 ${
                isCurrent ? "text-warmwhite" : "text-graphite"
              }`}>
                {stage.title}
              </h3>
            </button>
          );
        })}
      </div>

      {/* Detailed Animated Stage Inspector */}
      <div className="mt-8 overflow-hidden rounded-2xl border border-hairline/80 bg-gradient-to-br from-[#15171B] via-[#1c202a] to-[#121419] p-7 md:p-10 text-warmwhite shadow-inner">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeStage.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="grid gap-8 lg:grid-cols-12 items-center"
          >
            {/* Left Column: Descriptive info */}
            <div className="lg:col-span-7">
              <div className="flex items-center gap-3">
                <span className="flex size-11 items-center justify-center rounded-xl bg-white/10 text-electric shadow-sm backdrop-blur-md">
                  <Icon className="size-6" />
                </span>
                <div>
                  <span className="font-mono text-[10px] tracking-widest text-periwinkle uppercase">
                    {activeStage.step} // EXECUTION PROFILE
                  </span>
                  <h4 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                    {activeStage.title}
                  </h4>
                </div>
              </div>

              <p className="mt-5 text-sm sm:text-base leading-relaxed text-white/80">
                {activeStage.fullDesc}
              </p>

              {/* Deliverable points */}
              <div className="mt-6 space-y-2 border-t border-white/10 pt-5">
                <p className="font-mono text-[10px] uppercase tracking-wider text-white/50">
                  SYSTEM DELIVERABLES & VERIFICATIONS
                </p>
                <div className="grid gap-2 sm:grid-cols-2 mt-3">
                  {activeStage.deliverables.map((item) => (
                    <div key={item} className="flex items-center gap-2 text-xs font-medium text-white/90">
                      <CheckCircle2 className="size-3.5 text-emerald-400 shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Visual Telemetry Card */}
            <div className="lg:col-span-5">
              <div className="relative overflow-hidden rounded-xl border border-white/15 bg-white/5 p-6 backdrop-blur-md">
                <div className="flex items-center justify-between border-b border-white/10 pb-3 font-mono text-[10px] uppercase tracking-widest text-white/60">
                  <span>TELEMETRY METRICS</span>
                  <span className="flex items-center gap-1 text-emerald-400">
                    <Zap className="size-3" />
                    LIVE
                  </span>
                </div>

                <div className="mt-4 space-y-3 font-mono text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-white/60">STAGE HEALTH</span>
                    <span className="font-semibold text-emerald-400">OPTIMAL (100%)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/60">OPERATIONAL STATUS</span>
                    <span className="font-semibold text-periwinkle">{activeStage.telemetry}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/60">QUALITY GATE</span>
                    <span className="font-semibold text-white">STRICT COMPLIANCE</span>
                  </div>
                </div>

                {/* Animated Signal Wave Visual */}
                <div className="mt-6 h-12 w-full rounded-lg bg-black/40 p-2 flex items-center justify-between gap-1 overflow-hidden">
                  {Array.from({ length: 24 }).map((_, i) => (
                    <motion.div
                      key={i}
                      animate={{
                        height: [
                          `${Math.sin(i * 0.4) * 14 + 16}px`,
                          `${Math.cos(i * 0.4) * 16 + 18}px`,
                          `${Math.sin(i * 0.4) * 14 + 16}px`,
                        ],
                      }}
                      transition={{
                        duration: 1.5 + (i % 5) * 0.2,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                      className="w-1.5 rounded-full bg-electric/70"
                    />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

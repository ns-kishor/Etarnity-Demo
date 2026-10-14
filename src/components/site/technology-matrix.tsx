"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { 
  BrainCircuit, 
  ShieldCheck, 
  Cpu, 
  Layers, 
  Terminal, 
  Database, 
  Zap, 
  Code2, 
  Radio, 
  CheckCircle2 
} from "lucide-react";

interface TechPillar {
  id: string;
  category: string;
  title: string;
  description: string;
  icon: React.ElementType;
  specs: string[];
  codeSnippet: string;
}

const PILLARS: TechPillar[] = [
  {
    id: "ai",
    category: "01 // NEURAL INTELLIGENCE",
    title: "Applied AI & Inference Pipelines",
    description: "Multi-modal model orchestration, real-time embeddings, and agentic reasoning pipelines with deterministic safety guardrails.",
    icon: BrainCircuit,
    specs: ["Sub-50ms Token Latency", "Vector Quantization", "Structured Outputs via Zod"],
    codeSnippet: `// Neural Ingestion Protocol\nconst pipeline = createInferenceEngine({\n  precision: "fp16",\n  maxTokens: 4096,\n  guardrails: ["zero-hallucination", "audit-logged"]\n});`,
  },
  {
    id: "distributed",
    category: "02 // DISTRIBUTED SYSTEMS",
    title: "High-Throughput Reactive Fabric",
    description: "Event-driven microservices engineered with strict typing, distributed consensus, and asynchronous job queuing.",
    icon: Cpu,
    specs: ["100K+ RPS Concurrent", "ACID Guaranteed", "Fault-Tolerant Rebalancing"],
    codeSnippet: `// Event Mesh Orchestrator\nexport async function dispatchEvent(event: DomainEvent) {\n  await eventMesh.publish({\n    topic: "system.mutation",\n    payload: event,\n    quorum: "majority"\n  });\n}`,
  },
  {
    id: "security",
    category: "03 // RESILIENCE & ZERO TRUST",
    title: "Cryptographic Security & Verification",
    description: "Strict isolation, end-to-end encryption in transit and at rest, and automated dependency vulnerability scanning.",
    icon: ShieldCheck,
    specs: ["AES-256-GCM / SHA-3", "Automated Pen-testing", "Zero-Knowledge Audits"],
    codeSnippet: `// Cryptographic Assertion Gate\nconst session = await verifySessionToken(token, {\n  algorithm: "scrypt+ed25519",\n  rateLimitWindowMs: 60000,\n  maxFailures: 5\n});`,
  },
  {
    id: "client",
    category: "04 // CLIENT ERGONOMICS",
    title: "Human-Machine Interface & 3D WebGL",
    description: "Ultra-fast Next.js architecture, hardware-accelerated shaders, and fluid framer-motion transitions built to feel instantaneous.",
    icon: Layers,
    specs: ["60+ FPS Hardware Sync", "WCAG 2.1 AAA Accessibility", "Instant Hydration"],
    codeSnippet: `// Kinetic Motion Damping\nconst spring = useSpring(mousePosition, {\n  stiffness: 45,\n  damping: 20,\n  restDelta: 0.001\n});`,
  },
];

export default function TechnologyMatrix() {
  const [selectedPillarId, setSelectedPillarId] = React.useState<string>("ai");
  const selectedPillar = PILLARS.find((p) => p.id === selectedPillarId) ?? PILLARS[0];
  const Icon = selectedPillar.icon;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-hairline bg-gradient-to-br from-[#15171B] via-[#1a1d24] to-[#121417] p-7 md:p-12 text-warmwhite shadow-[0_20px_60px_rgba(21,23,27,0.18)]">
      {/* Background Cyber Grid */}
      <div 
        aria-hidden="true" 
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(82,107,255,0.16),transparent_60%)]" 
      />
      <div 
        aria-hidden="true" 
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:3rem_3rem]" 
      />

      {/* Header */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-electric animate-ping" />
            <span className="font-mono text-[10px] tracking-[0.24em] text-periwinkle uppercase">
              ETARNITY CORE ARCHITECTURE // DEEP-DIVE
            </span>
          </div>
          <h2 className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Engineering Foundations
          </h2>
        </div>

        <div className="flex items-center gap-2 font-mono text-[10px] tracking-wider text-white/50">
          <Terminal className="size-3.5 text-electric" />
          <span>STRICT TYPED SYSTEM SPEC</span>
        </div>
      </div>

      {/* Interactive Tabs */}
      <div className="relative z-10 mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {PILLARS.map((pillar) => {
          const active = pillar.id === selectedPillarId;
          const PIcon = pillar.icon;
          return (
            <button
              key={pillar.id}
              type="button"
              onClick={() => setSelectedPillarId(pillar.id)}
              className={`flex flex-col items-start rounded-xl border p-4 text-left transition-all duration-300 ${
                active
                  ? "border-electric bg-white/10 shadow-[0_4px_20px_rgba(82,107,255,0.25)] text-white"
                  : "border-white/10 bg-white/5 text-white/70 hover:border-white/20 hover:text-white"
              }`}
            >
              <div className="flex w-full items-center justify-between">
                <span className="font-mono text-[9px] tracking-widest text-periwinkle uppercase">
                  {pillar.category.split("//")[0].trim()}
                </span>
                <PIcon className={`size-4 ${active ? "text-electric" : "text-white/40"}`} />
              </div>
              <span className="mt-2.5 text-xs sm:text-sm font-semibold line-clamp-1">
                {pillar.title}
              </span>
            </button>
          );
        })}
      </div>

      {/* Visual Inspector: Description + Interactive Code Terminal */}
      <div className="relative z-10 mt-8 grid gap-8 lg:grid-cols-12 items-center rounded-2xl border border-white/10 bg-white/[0.03] p-7 md:p-9 backdrop-blur-md">
        <div className="lg:col-span-6">
          <span className="font-mono text-[10px] tracking-widest text-electric uppercase">
            {selectedPillar.category}
          </span>
          <h3 className="mt-2 text-2xl font-bold tracking-tight text-white">
            {selectedPillar.title}
          </h3>
          <p className="mt-4 text-sm sm:text-base leading-relaxed text-white/80">
            {selectedPillar.description}
          </p>

          <div className="mt-6 space-y-2 border-t border-white/10 pt-4">
            <span className="font-mono text-[9px] uppercase tracking-wider text-white/50">
              CORE METRICS & BENCHMARKS
            </span>
            <div className="grid gap-2 sm:grid-cols-2 mt-2">
              {selectedPillar.specs.map((spec) => (
                <div key={spec} className="flex items-center gap-2 text-xs font-mono text-white/90">
                  <CheckCircle2 className="size-3.5 text-emerald-400 shrink-0" />
                  <span>{spec}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Code Terminal Box */}
        <div className="lg:col-span-6">
          <div className="overflow-hidden rounded-xl border border-white/15 bg-black/60 shadow-2xl backdrop-blur-md">
            {/* Terminal Window Header */}
            <div className="flex items-center justify-between border-b border-white/10 bg-white/5 px-4 py-2.5">
              <div className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-full bg-red-500/80" />
                <span className="size-2.5 rounded-full bg-yellow-500/80" />
                <span className="size-2.5 rounded-full bg-green-500/80" />
              </div>
              <span className="font-mono text-[10px] text-white/40">
                etarnity-core/{selectedPillar.id}.ts
              </span>
              <Code2 className="size-3.5 text-electric" />
            </div>

            {/* Code Body */}
            <div className="p-4 sm:p-5 font-mono text-xs text-white/90 leading-relaxed overflow-x-auto">
              <pre className="text-periwinkle whitespace-pre-wrap">
                <code>{selectedPillar.codeSnippet}</code>
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

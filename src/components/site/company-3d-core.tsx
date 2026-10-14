"use client";

import * as React from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ShieldCheck, Cpu, Database, Network, Activity, Zap } from "lucide-react";

const TELEMETRY_NODES = [
  { label: "APPLIED AI", val: "ACTIVE // 99.9%", icon: Cpu },
  { label: "ZERO TRUST", val: "ENCRYPTED // SHA3", icon: ShieldCheck },
  { label: "CLOUD INFRA", val: "DISTRIBUTED // GLOBAL", icon: Database },
  { label: "LATENCY", val: "0.14ms // REALTIME", icon: Zap },
];

export default function Company3DCore() {
  const [activeTab, setActiveTab] = React.useState<"architecture" | "network" | "resilience">("architecture");
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springX = useSpring(mouseX, { stiffness: 60, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 60, damping: 20 });

  const rotateX = useTransform(springY, [-0.5, 0.5], [14, -14]);
  const rotateY = useTransform(springX, [-0.5, 0.5], [-14, 14]);

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
    <div 
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative overflow-hidden rounded-2xl border border-hairline/80 bg-gradient-to-br from-[#15171B] via-[#1c1f26] to-[#121418] p-7 md:p-10 text-warmwhite shadow-[0_20px_60px_rgba(21,23,27,0.18)]"
    >
      {/* Background Matrix & Radial Glow */}
      <div 
        aria-hidden="true" 
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(82,107,255,0.18),transparent_70%)]" 
      />
      <div 
        aria-hidden="true" 
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:2rem_2rem]" 
      />

      {/* Header telemetry and controls */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="font-mono text-[10px] tracking-[0.24em] text-periwinkle uppercase">
              ETARNITY // SYSTEM KERNEL VISUALIZER
            </span>
          </div>
          <h3 className="mt-1 text-xl font-bold tracking-tight text-white sm:text-2xl">
            Autonomous Engineering Engine
          </h3>
        </div>

        {/* Mode selector pills */}
        <div className="flex rounded-lg border border-white/10 bg-white/5 p-1 backdrop-blur-md">
          {(["architecture", "network", "resilience"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`rounded-md px-3 py-1 font-mono text-[10px] tracking-wider uppercase transition-all ${
                activeTab === tab
                  ? "bg-electric text-white shadow-sm"
                  : "text-white/60 hover:text-white"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* 3D Interactive Isometric Centerpiece */}
      <div className="relative z-10 my-10 flex min-h-[300px] sm:min-h-[360px] items-center justify-center [perspective:1000px]">
        <motion.div
          style={{ rotateX, rotateY }}
          className="relative flex items-center justify-center [transform-style:preserve-3d]"
        >
          {/* Outer Orbital Ring 1 */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 24, repeat: Infinity, ease: "linear" }}
            className="absolute size-64 sm:size-80 rounded-full border border-dashed border-white/20 [transform:rotateX(65deg)]"
          >
            <span className="absolute -top-1 left-1/2 size-2.5 rounded-full bg-electric shadow-[0_0_12px_#526bff]" />
          </motion.div>

          {/* Orbital Ring 2 (Tilted) */}
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
            className="absolute size-52 sm:size-64 rounded-full border border-electric/40 [transform:rotateY(60deg)]"
          >
            <span className="absolute -bottom-1 left-1/2 size-2 rounded-full bg-[#10b981] shadow-[0_0_10px_#10b981]" />
          </motion.div>

          {/* Orbital Ring 3 (Cross axis) */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            className="absolute size-44 sm:size-52 rounded-full border border-white/15 [transform:rotateX(45deg)_rotateY(30deg)]"
          />

          {/* Center Monolith Holographic Core */}
          <motion.div
            animate={{
              scale: [1, 1.05, 1],
              boxShadow: [
                "0 0 30px rgba(82,107,255,0.3)",
                "0 0 60px rgba(82,107,255,0.6)",
                "0 0 30px rgba(82,107,255,0.3)",
              ],
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="relative flex size-28 sm:size-36 items-center justify-center rounded-2xl border border-electric/60 bg-gradient-to-tr from-[#1f2638] via-[#2d3962] to-[#161a27] text-center [transform:translateZ(40px)]"
          >
            <div className="flex flex-col items-center">
              <Cpu className="size-8 sm:size-10 text-electric animate-pulse" />
              <span className="mt-2 font-mono text-[9px] sm:text-[10px] font-bold tracking-widest text-periwinkle uppercase">
                ETARNITY
              </span>
              <span className="font-mono text-[8px] text-white/50">
                CORE v2.5
              </span>
            </div>

            {/* Glowing Corner Accents */}
            <span className="absolute -top-1 -left-1 size-2 border-t border-l border-electric" />
            <span className="absolute -top-1 -right-1 size-2 border-t border-r border-electric" />
            <span className="absolute -bottom-1 -left-1 size-2 border-b border-l border-electric" />
            <span className="absolute -bottom-1 -right-1 size-2 border-b border-r border-electric" />
          </motion.div>

          {/* Floating Data Nodes in 3D Space */}
          <motion.div
            style={{ x: -140, y: -70 }}
            className="hidden sm:flex absolute items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 backdrop-blur-md [transform:translateZ(60px)]"
          >
            <Activity className="size-3.5 text-emerald-400" />
            <span className="font-mono text-[9px] tracking-wider text-white/90">AI SYNAPSE</span>
          </motion.div>

          <motion.div
            style={{ x: 140, y: 70 }}
            className="hidden sm:flex absolute items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 backdrop-blur-md [transform:translateZ(60px)]"
          >
            <Network className="size-3.5 text-electric" />
            <span className="font-mono text-[9px] tracking-wider text-white/90">DISTRIBUTED FABRIC</span>
          </motion.div>
        </motion.div>
      </div>

      {/* Bottom Live Metrics Row */}
      <div className="relative z-10 grid grid-cols-2 gap-3 sm:grid-cols-4 border-t border-white/10 pt-5">
        {TELEMETRY_NODES.map((node) => {
          const Icon = node.icon;
          return (
            <div key={node.label} className="rounded-xl border border-white/5 bg-white/[0.03] p-3 backdrop-blur-sm">
              <div className="flex items-center gap-1.5 text-white/50">
                <Icon className="size-3 text-periwinkle" />
                <span className="font-mono text-[9px] tracking-wider uppercase">{node.label}</span>
              </div>
              <p className="mt-1 font-mono text-[11px] font-semibold tracking-tight text-white">
                {node.val}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

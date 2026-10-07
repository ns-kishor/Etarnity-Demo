import { CapsuleHeader } from "@/components/layout/capsule-header";
import { MfFooter } from "@/components/layout/mf-footer";
import { KineticHero } from "@/components/sections/kinetic-hero";
import { TunnelShowcase } from "@/components/sections/tunnel-showcase";
import { MetricsGrid } from "@/components/sections/metrics-grid";
import { ProductStack } from "@/components/sections/product-stack";
import { Newsroom } from "@/components/sections/newsroom";
import { ContactMachina } from "@/components/sections/contact-machina";

export default function Home() {
  return (
    <div className="relative flex min-h-screen flex-col">
      {/* Ambient page atmosphere */}
      <div
        className="pointer-events-none fixed inset-0 -z-10"
        aria-hidden="true"
      >
        <div className="absolute inset-0 bg-noise opacity-[0.035] mix-blend-multiply dark:opacity-[0.05] dark:mix-blend-screen" />
      </div>

      <CapsuleHeader />

      <main className="flex-1">
        {/* 00 — Kinetic hero: Creation-of-Adam split reveal */}
        <KineticHero />
        {/* 01 — Dark immersive 3D tunnel zoom */}
        <TunnelShowcase />
        {/* 02 — Dynamic metrics & KPI grid */}
        <MetricsGrid />
        {/* 03 — Isometric product stack + partner ecosystem */}
        <ProductStack />
        {/* 04 — Newsroom: news + insights (data-mapped) */}
        <Newsroom />
        {/* 05 — Contact: transmission form + hiring status */}
        <ContactMachina />
      </main>

      <MfFooter />
    </div>
  );
}

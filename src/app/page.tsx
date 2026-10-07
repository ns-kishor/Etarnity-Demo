import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { Hero } from "@/components/sections/hero";
import { Stats } from "@/components/sections/stats";
import { WhoWeAre } from "@/components/sections/who-we-are";
import { Mission } from "@/components/sections/mission";
import { Problems } from "@/components/sections/problems";
import { Businesses } from "@/components/sections/businesses";
import { Ventures } from "@/components/sections/ventures";
import { Industries } from "@/components/sections/industries";
import { Founders } from "@/components/sections/founders";
import { People } from "@/components/sections/people";
import { Technology } from "@/components/sections/technology";
import { Innovation } from "@/components/sections/innovation";
import { SelectedWork } from "@/components/sections/selected-work";
import { Impact } from "@/components/sections/impact";
import { Insights } from "@/components/sections/insights";
import { News } from "@/components/sections/news";
import { Careers } from "@/components/sections/careers";
import { Presence } from "@/components/sections/presence";
import { Vision } from "@/components/sections/vision";
import { Contact } from "@/components/sections/contact";

/**
 * ETARNITY — the official global corporate website.
 *
 * The visitor journey (PRD §44):
 *   HERO → COMPANY → SCALE → MISSION → PROBLEMS → BUSINESSES →
 *   FOUNDERS → TECHNOLOGY → WORK → IMPACT → INSIGHTS → CAREERS →
 *   PRESENCE → VISION → CONTACT
 */
export default function Home() {
  return (
    <div className="relative flex min-h-screen flex-col bg-background">
      {/* Global atmosphere */}
      <div aria-hidden="true" className="bg-noise pointer-events-none fixed inset-0 z-0" />

      <SiteHeader />

      <main className="relative z-10">
        <Hero />
        <Stats />
        <WhoWeAre />
        <Mission />
        <Problems />
        <Businesses />
        <Ventures />
        <Industries />
        <Founders />
        <People />
        <Technology />
        <Innovation />
        <SelectedWork />
        <Impact />
        <Insights />
        <News />
        <Careers />
        <Presence />
        <Vision />
        <Contact />
      </main>

      <SiteFooter />
    </div>
  );
}

import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { EcosystemRail } from "@/components/etarnity/ecosystem-rail";
import { Hero } from "@/components/sections/hero";
import { CorporateIntro } from "@/components/sections/corporate-intro";
import { CompanyScale } from "@/components/sections/company-scale";
import { WhoWeAre } from "@/components/sections/who-we-are";
import { Businesses } from "@/components/sections/businesses";
import { Ventures } from "@/components/sections/ventures";
import { Industries } from "@/components/sections/industries";
import { Mission } from "@/components/sections/mission";
import { Vision } from "@/components/sections/vision";
import { Problems } from "@/components/sections/problems";
import { WhyEternity } from "@/components/sections/why-etarnity";
import { Technology } from "@/components/sections/technology";
import { Innovation } from "@/components/sections/innovation";
import { SelectedWork } from "@/components/sections/selected-work";
import { Founders } from "@/components/sections/founders";
import { People } from "@/components/sections/people";
import { Impact } from "@/components/sections/impact";
import { Journey } from "@/components/sections/journey";
import { Insights } from "@/components/sections/insights";
import { Future } from "@/components/sections/future";
import { Contact } from "@/components/sections/contact";

export default function Home() {
  return (
    <div className="relative flex min-h-screen flex-col">
      {/* Ambient page atmosphere — almost imperceptible paper grain */}
      <div className="pointer-events-none fixed inset-0 -z-10" aria-hidden="true">
        <div className="absolute inset-0 bg-noise opacity-[0.03] mix-blend-multiply" />
      </div>

      <SiteHeader />
      <EcosystemRail />

      <main className="flex-1">
        {/* 00 — Hero: the ETARNITY ECOSYSTEM + cinematic editorial opening */}
        <Hero />
        {/* 01 — Corporate introduction: scroll-driven word shift */}
        <CorporateIntro />
        {/* 02 — Company scale: asymmetric editorial ledger */}
        <CompanyScale />
        {/* 03 — Who we are: one ecosystem */}
        <WhoWeAre />
        {/* 04-06 — The ecosystem: businesses, ventures, industries */}
        <Businesses />
        <Ventures />
        <Industries />
        {/* 07-10 — What we believe: mission, vision, problems, why */}
        <Mission />
        <Vision />
        <Problems />
        <WhyEternity />
        {/* 11-13 — What we build: technology, innovation, selected work */}
        <Technology />
        <Innovation />
        <SelectedWork />
        {/* 14-15 — The people: founders, people & culture */}
        <Founders />
        <People />
        {/* 16-17 — Impact & journey */}
        <Impact />
        <Journey />
        {/* 18-20 — Signal & connect: insights, future, contact */}
        <Insights />
        <Future />
        <Contact />
      </main>

      <SiteFooter />
    </div>
  );
}

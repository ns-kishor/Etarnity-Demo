/**
 * ETARNITY — Corporate content architecture
 * ------------------------------------------
 * Single source of truth for every piece of corporate copy on the site.
 * Structured so a future CMS can replace this module without touching UI:
 * each shape mirrors a future CMS collection (businesses, founders, work,
 * insights, news, careers).
 *
 * Replace placeholder values marked TODO with real company data as it
 * becomes available — never invent data.
 */

/* ---------------------------------- Types --------------------------------- */

export interface StatItem {
  label: string;
  value: number;
  suffix?: string;
  prefix?: string;
  note?: string;
  isYear?: boolean;
}

export interface BusinessEntity {
  id: string;
  name: string;
  industry: string;
  category: "Technology" | "Digital Products" | "Media" | "Infrastructure" | "Innovation";
  status: "Operating" | "Building" | "Early-stage";
  description: string;
  purpose: string;
  relationship: string;
  image: string;
  imageAlt: string;
  url: string | null;
}

export interface VentureActivity {
  id: string;
  mode: string;
  title: string;
  description: string;
  items: string[];
}

export interface Industry {
  name: string;
  description: string;
  stage: "Operating" | "Building" | "Exploring";
}

export interface Founder {
  name: string;
  role: string;
  focus: string[];
  bio: string;
  quote: string;
  linkedin: string | null;
}

export interface Project {
  id: string;
  index: string;
  name: string;
  sector: string;
  year: string;
  summary: string;
  problem: string;
  idea: string;
  design: string;
  technology: string[];
  outcome: string;
  image: string;
  imageAlt: string;
  url: string | null;
}

export interface Insight {
  title: string;
  category: string;
  date: string;
  readTime: string;
  excerpt: string;
}

export interface NewsItem {
  title: string;
  date: string;
  type: string;
  summary: string;
}

/* --------------------------------- Company -------------------------------- */

export const site = {
  name: "ETARNITY",
  legalName: "ETARNITY",
  tagline: "Building what comes next.",
  description:
    "ETARNITY is a technology-driven parent company building businesses, products, digital systems and ventures designed to solve meaningful problems.",
  hq: {
    city: "Dhaka",
    country: "Bangladesh",
    coordinates: "23.8103° N, 90.4125° E",
  },
  email: "hello@etarnity.com",
  domain: "etarnity.com",
  url: "https://etarnity.com",
  founded: "2024",
  socials: [
    { label: "LinkedIn", href: "https://www.linkedin.com/company/etarnity" },
    { label: "GitHub", href: "https://github.com/etarnity" },
    { label: "X", href: "https://x.com/etarnity" },
  ],
};

/* ------------------------------- Navigation ------------------------------- */

export const navigation = {
  primary: [
    { label: "Company", href: "#company" },
    { label: "Businesses", href: "#businesses" },
    { label: "Technology", href: "#technology" },
    { label: "Impact", href: "#impact" },
    { label: "Insights", href: "#insights" },
  ],
  contact: { label: "Contact", href: "#contact" },
  menuGroups: [
    {
      title: "Company",
      links: [
        { label: "Who We Are", href: "#company" },
        { label: "Mission", href: "#mission" },
        { label: "Vision", href: "#vision" },
        { label: "Problems We Solve", href: "#problems" },
        { label: "Founders", href: "#founders" },
        { label: "People & Culture", href: "#people" },
        { label: "Careers", href: "#people" },
      ],
    },
    {
      title: "Ecosystem",
      links: [
        { label: "Our Businesses", href: "#businesses" },
        { label: "Ventures", href: "#ventures" },
        { label: "Industries", href: "#industries" },
        { label: "Company Journey", href: "#journey" },
      ],
    },
    {
      title: "Capability",
      links: [
        { label: "Technology", href: "#technology" },
        { label: "Innovation", href: "#innovation" },
        { label: "What We've Built", href: "#work" },
      ],
    },
    {
      title: "Signal",
      links: [
        { label: "Impact", href: "#impact" },
        { label: "Insights", href: "#insights" },
        { label: "What Comes Next", href: "#future" },
        { label: "Contact", href: "#contact" },
      ],
    },
  ],
};

/* ---------------------------------- Hero ---------------------------------- */

export const hero = {
  kicker: "A technology-driven parent company",
  headline: ["Building", "what comes", "next."],
  statement:
    "ETARNITY is a technology-driven company building businesses, products, digital systems and ventures designed to solve meaningful problems.",
  primaryCta: { label: "Explore the company", href: "#company" },
  secondaryCta: { label: "Talk to ETARNITY", href: "#contact" },
  meta: [
    { label: "Est.", value: site.founded },
    { label: "HQ", value: "Dhaka · Bangladesh" },
    { label: "Focus", value: "Technology · Business · Ventures" },
  ],
  visualLabel: "The ETARNITY Ecosystem",
};

/* -------------------------- Corporate introduction ------------------------- */
/* Statement whose key words shift from charcoal to the soft lavender accent
   as the user scrolls through the section. */

export const intro = {
  kicker: "The Company",
  statement:
    "ETARNITY is building businesses, technology and ideas designed to solve meaningful problems.",
  accentWords: ["businesses", "technology", "ideas", "meaningful"],
  closing: "One company. Many businesses. A single long-term view.",
};

/* ---------------------------- Company scale ------------------------------- */
/* TODO: keep in sync with real company data. Values are structural placeholders. */

export const scale = {
  index: "02",
  kicker: "Company Scale",
  lead: "The shape of the company today — measured, not inflated.",
  items: [
    { label: "Founded", value: 2024, isYear: true, note: "Dhaka, Bangladesh" },
    { label: "Team", value: 15, suffix: "+", note: "across disciplines" },
    { label: "Businesses", value: 4, note: "operating & building" },
    { label: "Industries", value: 8, note: "operating & exploring" },
    { label: "Projects", value: 20, suffix: "+", note: "delivered by our businesses" },
    { label: "Products & platforms", value: 8, note: "built and maintained" },
  ],
};

/* -------------------------------- Who we are ------------------------------ */

export const whoWeAre = {
  index: "03",
  kicker: "Who We Are",
  title: "More than one business. One ecosystem.",
  paragraphs: [
    "ETARNITY was founded on a simple conviction: that meaningful technology companies are built deliberately — not as a collection of services, but as an ecosystem of businesses, products and capabilities that reinforce one another over decades, not quarters.",
    "We operate as a parent company. Under ETARNITY, individual businesses and ventures are built, incubated and grown — each with its own purpose, its own discipline and its own relationship to the whole. What connects them is shared engineering standards, shared values and a shared long-term view.",
    "We are headquartered in Dhaka, Bangladesh, and we build for the world. Our ambition is not to be the biggest company in the room — it is to be the one still standing, still building, still useful, decades from now.",
  ],
  pillars: [
    {
      id: "01",
      title: "One company, many businesses",
      body: "ETARNITY exists to build and operate multiple businesses — technology, products, media and ventures — under one long-term structure.",
    },
    {
      id: "02",
      title: "Technology as the foundation",
      body: "Every business we build rests on serious engineering: software, AI, infrastructure and security held to one standard across the group.",
    },
    {
      id: "03",
      title: "Built for the long term",
      body: "We make decisions on the horizon of years and decades. Patience is a strategy — compounding is the model.",
    },
    {
      id: "04",
      title: "Entrepreneurial by design",
      body: "New ideas get capital, people and room to become real businesses inside the ecosystem — not slid into a service catalogue.",
    },
  ],
  visual: {
    image: "/images/ecosystem.png",
    alt: "Abstract ecosystem of translucent orbs orbiting a central form",
    label: "The ecosystem, visualized",
  },
};

/* -------------------------------- Businesses ------------------------------ */

export const businesses: BusinessEntity[] = [
  {
    id: "etarnity-technology",
    name: "ETARNITY Technology",
    industry: "Software Engineering & Digital Infrastructure",
    category: "Technology",
    status: "Operating",
    description:
      "The engineering core of the group — software engineering, AI systems, cloud infrastructure and security for businesses and institutions.",
    purpose: "Give organizations digital systems they can depend on for a decade.",
    relationship: "Core technology unit of ETARNITY",
    image: "/images/business-technology.png",
    imageAlt: "Abstract architecture of stacked translucent glass slabs",
    url: null,
  },
  {
    id: "etarnity-digital",
    name: "ETARNITY Digital",
    industry: "Digital Products & Experience",
    category: "Digital Products",
    status: "Operating",
    description:
      "The product studio of the group — strategy, design and product engineering, taking digital products from concept to launch and scale.",
    purpose: "Turn good ideas into products people rely on.",
    relationship: "Product & experience unit of ETARNITY",
    image: "/images/business-digital.png",
    imageAlt: "Abstract composition of floating translucent panels at different depths",
    url: null,
  },
  {
    id: "etarnity-media",
    name: "ETARNITY Media",
    industry: "Digital Media & Content Systems",
    category: "Media",
    status: "Operating",
    description:
      "The media arm of the group — digital publications, content platforms and communication systems built for the information era.",
    purpose: "Make useful, reliable information easier to access.",
    relationship: "Media & information unit of ETARNITY",
    image: "/images/business-media.png",
    imageAlt: "Abstract composition of soft overlapping translucent sheets of light",
    url: null,
  },
  {
    id: "etarnity-labs",
    name: "ETARNITY Labs",
    industry: "Early-Stage Ventures & Emerging Technology",
    category: "Innovation",
    status: "Building",
    description:
      "The venture engine of the group — early-stage products, internal experiments and emerging-technology research, from AI to automation.",
    purpose: "Give new ideas the structure, capital and engineering to become real businesses.",
    relationship: "Incubation & research arm of ETARNITY",
    image: "/images/business-labs.png",
    imageAlt: "Abstract experimental translucent form with a geometric core",
    url: null,
  },
];

/* --------------------------------- Ventures -------------------------------- */

export const ventures = {
  index: "05",
  kicker: "Ventures & Investments",
  title: "How the ecosystem grows.",
  lead:
    "ETARNITY deploys capital and capability in four modes. Today, our activity is concentrated on building — external investment and partnerships will follow as the company matures. We don't pretend otherwise.",
  activities: [
    {
      id: "building",
      mode: "01",
      title: "Building",
      description:
        "Businesses and products developed internally — from first principles to operating entities inside the group.",
      items: ["New business units", "Internal products & platforms", "Shared engineering infrastructure"],
    },
    {
      id: "investing",
      mode: "02",
      title: "Investing",
      description:
        "External opportunities where capital and strategic alignment make sense — selectively, and only where we can add real value beyond money.",
      items: ["Selective external stakes", "Strategic follow-on participation"],
    },
    {
      id: "partnering",
      mode: "03",
      title: "Partnering",
      description:
        "Collaborations that extend the ecosystem — with operators, institutions and technology partners.",
      items: ["Technology partnerships", "Joint go-to-market", "Institutional collaboration"],
    },
    {
      id: "experimenting",
      mode: "04",
      title: "Experimenting",
      description:
        "Early-stage technology and ideas inside ETARNITY Labs — cheap to test, quick to learn, honest to kill.",
      items: ["AI research & prototyping", "Emerging technology exploration", "Internal tooling"],
    },
  ],
};

/* -------------------------------- Industries ------------------------------- */

/* --------------------------------- Founders -------------------------------- */
/* TODO: replace with real founder portraits and professional links. */

export const founders: Founder[] = [
  {
    name: "Ayaan Rahman",
    role: "Co-Founder & Chief Executive",
    focus: ["Strategy", "Business", "Capital"],
    bio: "Ayaan leads ETARNITY's direction — the businesses we build, the capital behind them and the long-term position of the company. His focus is structure: making sure every venture inside the ecosystem has a real purpose, a real model and room to become something durable.",
    quote: "We are not building a services firm. We are building the institution that builds businesses.",
    linkedin: null,
  },
  {
    name: "Nafis Chowdhury",
    role: "Co-Founder & Chief Technology",
    focus: ["Technology", "Engineering", "Security"],
    bio: "Nafis leads the engineering foundation of ETARNITY — the systems, standards and security discipline that every business in the group is built on. His focus is depth: technology held to a standard high enough that the ecosystem can compound on top of it.",
    quote: "Everything we build should still be standing — and still useful — in ten years.",
    linkedin: null,
  },
];

/* ------------------------------ People & culture ---------------------------- */

export const people = {
  index: "15",
  kicker: "People & Culture",
  title: "The company is its people.",
  lead: "ETARNITY runs on a deliberately small team — senior people given real ownership, held to one standard of work, with the patience to build for decades. This is how we work, how the organization is shaped, and how we hire.",
  values: [
    {
      title: "Ownership, not job descriptions",
      body: "People own outcomes, not tasks. If a system is yours, it ships because you made it ship — and you know exactly why it shipped.",
    },
    {
      title: "Depth before speed",
      body: "We move slowly through understanding and quickly through execution. Rushed thinking is the expensive kind.",
    },
    {
      title: "Written thinking",
      body: "Ideas are written down before they are debated. Documents carry the decisions — memory doesn't.",
    },
    {
      title: "Honesty in the small things",
      body: "We say what we built, what broke, and what we don't know yet. It starts with the small things, because that's where it gets tested.",
    },
    {
      title: "Craft as a habit",
      body: "Engineering and design standards are daily practice — not polish applied at review time.",
    },
    {
      title: "A long horizon",
      body: "Decisions are weighed in years, not quarters. We build things meant to outlive the people who started them.",
    },
  ],
  org: [
    {
      area: "Leadership",
      scope: "Direction, capital and standards — set by the founders and held across every business in the group.",
    },
    {
      area: "Engineering",
      scope: "The systems, platforms and shared foundation every ETARNITY business is built on.",
    },
    {
      area: "Product & Design",
      scope: "Research, information architecture and interface — the standard users actually feel.",
    },
    {
      area: "AI Research",
      scope: "The applied-AI track inside ETARNITY Labs: workflow automation and applied intelligence.",
    },
    {
      area: "Business & Operations",
      scope: "Ventures, partnerships and the operating discipline that keeps the ecosystem honest.",
    },
    {
      area: "Security & Infrastructure",
      scope: "Hardening, monitoring and resilience — applied across everything we run, as one standard.",
    },
  ],
};

/* -------------------------------- Industries ------------------------------- */

export const industries: Industry[] = [
  { name: "Technology", description: "Software engineering, systems and platforms", stage: "Operating" },
  { name: "Artificial Intelligence", description: "Applied AI, automation and intelligent systems", stage: "Building" },
  { name: "Digital Products", description: "Products, platforms and digital experiences", stage: "Operating" },
  { name: "Media", description: "Digital media, content and information systems", stage: "Operating" },
  { name: "Commerce", description: "Commerce infrastructure and enablement", stage: "Exploring" },
  { name: "Security", description: "Digital security and resilient infrastructure", stage: "Operating" },
  { name: "Education", description: "Learning and access to knowledge", stage: "Exploring" },
  { name: "Infrastructure", description: "Cloud, data and digital foundations", stage: "Building" },
];

/* --------------------------------- Mission -------------------------------- */

export const mission = {
  index: "07",
  kicker: "Our Mission",
  statement:
    "Our mission is to build technology and businesses that solve meaningful problems and create lasting value.",
  lead:
    "We exist because the gap between what technology makes possible and what people actually experience is still enormous. Closing that gap — carefully, honestly, and for the long term — is the work of this company.",
  focus: [
    {
      title: "The problems we choose",
      body: "We focus on problems where technology can remove real friction: how businesses operate, how people access information, how organizations secure what matters.",
    },
    {
      title: "Why technology matters",
      body: "Technology is not the product — it is the lever. Applied with judgment, it turns fragile, manual systems into infrastructure that compounds in value.",
    },
    {
      title: "How we create value",
      body: "We build businesses and products designed to outlive trends: engineered properly, designed around real users, and operated with discipline.",
    },
  ],
  principles: [
    { id: "01", title: "Solve real problems", body: "If it doesn't remove real friction for real people, we don't build it." },
    { id: "02", title: "Build for the long term", body: "Every decision is weighed against a horizon of years, not a quarter." },
    { id: "03", title: "Technology with purpose", body: "Engineering serves the mission — never the other way around." },
    { id: "04", title: "Honesty over hype", body: "We say what we've built, we show what exists, and we don't pretend scale we haven't reached." },
  ],
};

/* --------------------------------- Vision --------------------------------- */

export const vision = {
  index: "08",
  kicker: "Our Vision",
  headline: "We are building for a future that hasn't arrived yet.",
  statement: "To build a global ecosystem of technology, businesses and innovation that shapes a better future.",
  supporting:
    "We see ETARNITY as a company that outlives its founders — an institution where businesses are built, ideas become products, and technology quietly improves life for millions of people.",
  horizon: [
    { label: "Near", body: "Operate profitable, well-engineered businesses across our core industries." },
    { label: "Mid", body: "Expand the ecosystem — new ventures, new markets, new products born from our own platform." },
    { label: "Long", body: "A durable global institution: technology, capital and people compounding over decades." },
  ],
  visual: {
    image: "/images/horizon.png",
    alt: "Abstract layered landscape of thin lavender light planes receding into depth",
  },
};

/* ---------------------------- Problems we solve --------------------------- */

export const problems = {
  index: "09",
  kicker: "Why We Exist",
  title: "Problems worth solving.",
  lead:
    "These are not service categories. They are the standing problems we organize our businesses, our engineering and our investment around.",
  areas: [
    {
      id: "01",
      title: "Digital Friction",
      body: "Businesses still run on outdated, disconnected digital systems — slow, fragile and expensive to change.",
      response: "We build modern, coherent digital systems that organizations can actually run on.",
    },
    {
      id: "02",
      title: "Accessibility",
      body: "People and smaller organizations lack access to digital tools that bigger players take for granted.",
      response: "We design products that bring capable technology within reach.",
    },
    {
      id: "03",
      title: "Inefficient Workflows",
      body: "Organizations lose enormous time to fragmented processes and manual, repetitive work.",
      response: "We engineer automation and well-structured workflows that give time back.",
    },
    {
      id: "04",
      title: "Security",
      body: "Businesses operate on vulnerable digital infrastructure — often without knowing it.",
      response: "We harden systems, embed security in engineering, and treat it as a foundation, not an add-on.",
    },
    {
      id: "05",
      title: "Information",
      body: "People struggle to access useful, reliable information when they need it.",
      response: "We build platforms and media systems that make quality information easier to reach.",
    },
    {
      id: "06",
      title: "Growth",
      body: "Businesses struggle to turn technology into sustainable, compounding growth.",
      response: "We build growth infrastructure — products, systems and strategy designed to compound.",
    },
    {
      id: "07",
      title: "Innovation",
      body: "Good ideas struggle to become real products, and good products struggle to find a structure to live in.",
      response: "We give ideas a path: capital, engineering, design and a parent structure built for them.",
    },
  ],
};

/* ------------------------------- Why ETARNITY ------------------------------ */

export const why = {
  index: "10",
  kicker: "Why ETARNITY",
  title: "Six reasons the ecosystem works.",
  items: [
    {
      id: "01",
      title: "Technology-driven",
      body: "Every business is built on real engineering — not rented platforms and hope.",
    },
    {
      id: "02",
      title: "Built for the long term",
      body: "Decisions are weighed against decades, not quarters. Patience is our compounding advantage.",
    },
    {
      id: "03",
      title: "Multi-disciplinary thinking",
      body: "Engineering, design, business and security in one structure — decisions don't get made in a vacuum.",
    },
    {
      id: "04",
      title: "Security-conscious",
      body: "Security is an engineering standard inside the group, not a product we upsell afterwards.",
    },
    {
      id: "05",
      title: "Product-oriented",
      body: "We think in products and platforms that outlive projects — built to be operated, not abandoned.",
    },
    {
      id: "06",
      title: "Innovation-focused",
      body: "ETARNITY Labs keeps the frontier moving — quietly experimenting so the ecosystem never stalls.",
    },
  ],
};

/* -------------------------------- Technology -------------------------------- */

export const technology = {
  index: "11",
  kicker: "Technology",
  title: "Technology at our core.",
  lead:
    "Every business in the ecosystem is built on the same engineering foundation. This is what that foundation is made of.",
  capabilities: [
    { title: "Software Engineering", body: "Product-grade engineering across web platforms, backends and APIs — built to be maintained, not replaced." },
    { title: "AI & Intelligent Systems", body: "Applied AI: automation, assistants and systems that learn from real operational data." },
    { title: "Automation", body: "Workflow engineering that removes repetitive human effort from serious operations." },
    { title: "Infrastructure & Cloud", body: "Scalable, observable cloud architecture — the substrate every ETARNITY business runs on." },
    { title: "Security", body: "Security embedded in engineering from the first line — hardening, audit and response discipline." },
    { title: "Data", body: "Data architecture and pipelines that make information an asset instead of a liability." },
    { title: "Product Engineering", body: "The discipline of turning ideas into shipped, supported, evolving products." },
    { title: "Digital Experience", body: "Interfaces engineered for clarity and speed — designed around real users." },
  ],
  layers: [
    { name: "Idea", body: "A real problem, stated honestly." },
    { name: "Product", body: "A shape that solves it — deliberately designed." },
    { name: "Experience", body: "Interfaces drawn around real users." },
    { name: "Application", body: "Product-grade engineering, built to be maintained." },
    { name: "Intelligence", body: "Applied AI where it removes real friction." },
    { name: "Data", body: "Information made an asset, not a liability." },
    { name: "Infrastructure", body: "Cloud and systems that hold under scale." },
    { name: "Security", body: "Hardened before anything ever ships." },
  ],
};

/* --------------------------------- Innovation ------------------------------- */

export const innovation = {
  index: "12",
  kicker: "Innovation",
  title: "Beyond today.",
  lead:
    "ETARNITY Labs is where the company thinks ahead — applied research, internal tools and early experiments. Some will become businesses. Most won't. That's the point.",
  tracks: [
    { title: "Applied AI", body: "Where intelligent systems can remove real friction in the industries we operate in.", status: "Active" },
    { title: "Internal Platforms", body: "Shared tooling and infrastructure that makes every ETARNITY business faster to build.", status: "Active" },
    { title: "Product Concepts", body: "Early-stage product ideas under evaluation inside the Labs pipeline.", status: "In exploration" },
    { title: "Emerging Technology", body: "Deliberate exploration of technologies before they're obvious — quietly, seriously.", status: "In exploration" },
  ],
  visual: {
    image: "/images/innovation-object.png",
    alt: "A soft translucent sculptural object floating in empty space",
    label: "Labs — current object of study",
  },
};

/* ------------------------------- Selected work ------------------------------ */
/* TODO: replace with real project data and live links. */

export const projects: Project[] = [
  {
    id: "meridian",
    index: "01",
    name: "Meridian",
    sector: "Financial Operations Platform",
    year: "2024",
    summary: "A financial services firm's fragmented ledgers, consolidated into one operations platform.",
    problem:
      "A financial services firm was running on fragmented ledgers and manual reconciliation — slow, error-prone and impossible to audit cleanly.",
    idea:
      "Replace the patchwork with a single operations platform: one ledger of record, automated reconciliation and clean reporting built in from day one.",
    design:
      "An interface designed around operators — dense where it needs to be, quiet everywhere else, with every state of a transaction visible and explainable.",
    technology: ["TypeScript", "Next.js", "PostgreSQL", "Automation pipelines"],
    outcome:
      "A consolidated operations platform the firm now runs its daily workflow on — delivered with full documentation and an in-house team trained to operate it.",
    image: "/images/work-meridian.png",
    imageAlt: "Abstract financial operations visualization with a precise hairline grid",
    url: null,
  },
  {
    id: "northlight",
    index: "02",
    name: "Northlight",
    sector: "Commerce Infrastructure",
    year: "2024",
    summary: "Commerce re-architected as resilient infrastructure for a growing retailer.",
    problem:
      "A growing retailer's commerce stack couldn't scale with demand — every campaign risked the whole storefront going down.",
    idea:
      "Re-architect commerce as resilient infrastructure: performance-first storefront, headless backend, and observability so problems surface before customers notice.",
    design:
      "A fast, distraction-free buying experience, engineered to stay smooth under real traffic — with an admin surface a small team can actually operate.",
    technology: ["Next.js", "Headless commerce", "Edge caching", "Analytics"],
    outcome:
      "A commerce platform that held through the retailer's highest-traffic period without incident, with infrastructure the team maintains confidently.",
    image: "/images/work-northlight.png",
    imageAlt: "Abstract commerce infrastructure — a translucent glass arch with light beneath",
    url: null,
  },
  {
    id: "civicline",
    index: "03",
    name: "Civicline",
    sector: "Public Information Platform",
    year: "2025",
    summary: "Public information organized into clean, searchable, structured knowledge.",
    problem:
      "Citizens and researchers struggled to find reliable, structured public information scattered across outdated sources.",
    idea:
      "A platform that organizes public information into clean, searchable, structured knowledge — accessible on any device, on any connection.",
    design:
      "Reading-first typography, progressive loading for low-bandwidth access, and an information architecture people can actually navigate.",
    technology: ["Next.js", "Structured data", "Search", "Performance engineering"],
    outcome:
      "A platform in active use, proving that well-engineered information access is a real product category — now part of our Media direction.",
    image: "/images/work-civicline.png",
    imageAlt: "Abstract public information structure — an archive of translucent light planes",
    url: null,
  },
  {
    id: "sentinel",
    index: "04",
    name: "Sentinel",
    sector: "Security Hardening Program",
    year: "2025",
    summary: "A structured hardening program that left an organization stronger than it started.",
    problem:
      "An organization discovered its digital infrastructure carried serious unaddressed vulnerabilities — with no internal capacity to fix them.",
    idea:
      "A structured hardening program: full audit, prioritized remediation, and an engineering pattern that leaves the team stronger than it started.",
    design:
      "Clear reporting designed for decision-makers — risk made legible, remediation made trackable.",
    technology: ["Security audit", "Infrastructure hardening", "Monitoring", "Response runbooks"],
    outcome:
      "Critical vulnerabilities closed, continuous monitoring in place, and a documented security baseline the organization now maintains as standard practice.",
    image: "/images/work-sentinel.png",
    imageAlt: "Abstract security concept — concentric translucent protective layers",
    url: null,
  },
];

/* ---------------------------------- Impact --------------------------------- */

export const impact = {
  index: "16",
  kicker: "Impact",
  title: "The impact we want to create.",
  lead:
    "We are early in our history, and we'd rather show direction than manufacture numbers. These are the commitments we measure ourselves against.",
  areas: [
    { title: "For businesses", body: "Organizations that run on systems we built — faster, safer and clearer than what they had." },
    { title: "For people", body: "Products that give people real capability — information, tools and access they didn't have before." },
    { title: "For the craft", body: "Engineering and design standards in our market that get a little higher because we're here." },
    { title: "For the ecosystem", body: "A structure where good ideas become real businesses, and the people behind them grow with them." },
    { title: "For security", body: "Infrastructure in our orbit that is measurably harder to compromise because we built it that way." },
    { title: "For what's next", body: "Technology built with a long-term view — designed to be useful for decades, not a funding cycle." },
  ],
  closing:
    "We will publish numbers when they are real. Until then, direction is the honest signal.",
};

/* ------------------------------ Company journey ----------------------------- */
/* Real events only — sourced from company records; no invented milestones. */

export const journey = {
  index: "17",
  kicker: "Company Journey",
  title: "The story so far.",
  lead: "A short history — honestly told, with the future left open.",
  milestones: [
    {
      period: "2024",
      title: "Founding",
      body: "ETARNITY is founded in Dhaka, Bangladesh — a parent company built to compound, not to chase.",
    },
    {
      period: "2024",
      title: "First platforms delivered",
      body: "The first operating platforms — Meridian and Northlight — ship inside the Technology and Digital units.",
    },
    {
      period: "2024",
      title: "Group engineering standards",
      body: "A single engineering, security and design standard is established across every business in the ecosystem.",
    },
    {
      period: "2025",
      title: "Civicline enters public use",
      body: "Our public-information platform goes into active use — the first product of the Media direction.",
    },
    {
      period: "2025",
      title: "ETARNITY Labs opens",
      body: "A dedicated applied-AI research track begins inside Labs, focused on workflow automation.",
    },
    {
      period: "Today",
      title: "Four businesses, one ecosystem",
      body: "Technology, Digital, Media and Labs — operating as one structure with a shared foundation.",
    },
  ],
  next: {
    period: "Next",
    title: "What comes next",
    body: "The story is still being written — see where we're heading.",
    href: "#future",
  },
};

/* --------------------------------- Insights --------------------------------- */
/* TODO: replace with real published articles. */

export const insights: Insight[] = [
  {
    title: "The quiet advantage of building for a decade",
    category: "Business",
    date: "2025",
    readTime: "6 min",
    excerpt: "Most software is built to be replaced. What changes when you build something meant to be maintained for ten years?",
  },
  {
    title: "Applied AI starts with the workflow, not the model",
    category: "AI",
    date: "2025",
    readTime: "8 min",
    excerpt: "The teams getting real value from AI aren't the ones chasing models — they're the ones who understand the workflow first.",
  },
  {
    title: "Security is an engineering standard, not a product",
    category: "Security",
    date: "2025",
    readTime: "5 min",
    excerpt: "Why bolting security on after the fact fails, and what embedding it in engineering actually looks like.",
  },
  {
    title: "Designing for the low-bandwidth majority",
    category: "Design",
    date: "2025",
    readTime: "7 min",
    excerpt: "Performance is not a metric — it's access. What it means to engineer experiences that work on every connection.",
  },
  {
    title: "The parent company model, built honestly",
    category: "Leadership",
    date: "2025",
    readTime: "9 min",
    excerpt: "On building an ecosystem of businesses without pretending to be something you're not yet.",
  },
  {
    title: "Infrastructure that compounds",
    category: "Technology",
    date: "2025",
    readTime: "6 min",
    excerpt: "The invisible engineering decisions that make every future product cheaper to build.",
  },
];

export const insightCategories = [
  "Technology",
  "Business",
  "AI",
  "Design",
  "Security",
  "Innovation",
  "Leadership",
];

/* ----------------------------------- News ----------------------------------- */
/* TODO: replace with real company announcements. */

export const news: NewsItem[] = [
  {
    title: "ETARNITY Labs begins applied-AI research track",
    date: "2025",
    type: "Innovation",
    summary: "Our Labs group has opened a dedicated applied-AI track focused on workflow automation for the industries we operate in.",
  },
  {
    title: "Civicline platform enters public use",
    date: "2025",
    type: "Product",
    summary: "Our public-information platform is now in active use — a first step in our Media and information direction.",
  },
  {
    title: "ETARNITY establishes group engineering standards",
    date: "2024",
    type: "Company",
    summary: "A single engineering, security and design standard now applies across every business built inside the ecosystem.",
  },
];

/* ---------------------------------- Careers --------------------------------- */

export const careers = {
  kicker: "Careers",
  title: "Build the future with us.",
  lead:
    "We hire slowly and deliberately — people who want real ownership over serious work, inside a structure designed to last.",
  openRoles: [] as { title: string; team: string; type: string; location: string }[],
  emptyState: {
    title: "No open positions at the moment.",
    body: "But we're always interested in exceptional people. If you think you should be part of what we're building, introduce yourself — we read everything.",
    cta: { label: "Introduce yourself", href: "#contact" },
  },
  process: [
    { step: "01", title: "Introduction", body: "A conversation about what you build and what you want to become." },
    { step: "02", title: "Depth", body: "A working session with the actual team — real problems, not puzzles." },
    { step: "03", title: "Decision", body: "Fast, honest and mutual. We don't leave people waiting." },
  ],
};

/* ------------------------------ Global presence ------------------------------ */

export const presence = {
  kicker: "Global Presence",
  hq: { label: "Headquarters", city: "Dhaka", country: "Bangladesh", coordinates: "23.8103° N, 90.4125° E" },
  building: [
    { label: "Building in", value: "Bangladesh" },
    { label: "Working with", value: "Clients & partners across regions" },
    { label: "Building toward", value: "A global operating footprint" },
  ],
};

/* ---------------------------------- Future ---------------------------------- */

export const future = {
  index: "19",
  kicker: "What Comes Next",
  headline: ["Still", "becoming", "something larger."],
  lead:
    "The direction of the company from here — new ventures, new markets, new products born from our own platform, and a footprint that grows with the work.",
  statements: [
    { label: "Now", body: "Operating four businesses on one engineering foundation." },
    { label: "Next", body: "New ventures and markets — grown from inside the ecosystem, not acquired into it." },
    { label: "Later", body: "A global institution: technology, capital and people compounding over decades." },
  ],
  cta: { label: "Talk to ETARNITY", href: "#contact" },
};

/* ---------------------------------- Contact --------------------------------- */

export const contact = {
  index: "20",
  kicker: "Contact",
  title: "Let's talk.",
  lead:
    "Talk to ETARNITY about a partnership, an investment, a business, or the future in general. Every message reaches a real person on the leadership team.",
  categories: ["General", "Business", "Partnership", "Investment", "Careers", "Media", "Technology"],
  channels: [
    { label: "Email", value: site.email, href: `mailto:${site.email}` },
    { label: "Headquarters", value: "Dhaka, Bangladesh" },
    { label: "Response", value: "Within two business days" },
  ],
  form: {
    nameLabel: "Your name",
    emailLabel: "Email",
    orgLabel: "Company",
    categoryLabel: "Reason for contact",
    messageLabel: "Message",
    submit: "Send message",
    pending: "Sending…",
    successTitle: "Message received.",
    successBody: "Thank you — a real person on the leadership team will reply within two business days.",
    error: "Something went wrong. Please try again.",
  },
};

/* ---------------------------------- Footer ---------------------------------- */

export const footer = {
  statement:
    "ETARNITY is a technology-driven parent company building businesses, products, digital systems and ventures designed to solve meaningful problems.",
  columns: [
    {
      title: "Company",
      links: [
        { label: "About", href: "#company" },
        { label: "Mission", href: "#mission" },
        { label: "Vision", href: "#vision" },
        { label: "Leadership", href: "#founders" },
        { label: "Careers", href: "#people" },
      ],
    },
    {
      title: "Businesses",
      links: [
        { label: "Businesses", href: "#businesses" },
        { label: "Ventures", href: "#ventures" },
        { label: "Industries", href: "#industries" },
      ],
    },
    {
      title: "Technology",
      links: [
        { label: "Technology", href: "#technology" },
        { label: "Innovation", href: "#innovation" },
        { label: "Security", href: "#problems" },
      ],
    },
    {
      title: "Insights",
      links: [
        { label: "Insights", href: "#insights" },
        { label: "News", href: "#journey" },
      ],
    },
    {
      title: "Connect",
      links: [
        { label: "Contact", href: "#contact" },
        ...site.socials.map((s) => ({ label: s.label, href: s.href })),
      ],
    },
  ],
  domain: site.domain,
  legal: [
    { label: "Privacy Policy", href: "#" },
    { label: "Terms", href: "#" },
  ],
  copyright: `© ${new Date().getFullYear()} ETARNITY. All rights reserved.`,
};

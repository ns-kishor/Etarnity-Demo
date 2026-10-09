/**
 * ETARNITY — database seed.
 * Run: bun prisma/seed.ts
 *
 * Seeds roles, admin users, company profile, principles, milestones,
 * businesses, projects, people, articles, technology areas, job positions,
 * sample inquiries, and links generated imagery as MediaItems.
 *
 * NOTE: All content is honest sample data — statuses are labeled truthfully
 * (Active / In Development / Planned / Experiment) and everything is editable
 * through the admin panel.
 */
import { db } from "../src/lib/db";
import { hashPassword } from "../src/lib/password";
import { readdirSync, existsSync, statSync } from "fs";
import path from "path";

const UPLOAD_DIR = path.join(process.cwd(), "db", "uploads");

async function registerMedia(
  fileName: string,
  altText: string
): Promise<number | null> {
  const full = path.join(UPLOAD_DIR, fileName);
  if (!existsSync(full)) {
    console.warn(`  ! missing media file: ${fileName} (skipped)`);
    return null;
  }
  const stat = statSync(full);
  const row = await db.mediaItem.create({
    data: {
      storageKey: fileName,
      fileName,
      mimeType: "image/png",
      size: stat.size,
      altText,
    },
  });
  return row.id;
}

async function main() {
  console.log("Seeding ETARNITY database…");

  /* ---------- wipe (FK-safe order) ---------- */
  await db.auditLog.deleteMany();
  await db.session.deleteMany();
  await db.projectAsset.deleteMany();
  await db.mediaItem.deleteMany();
  await db.contactInquiry.deleteMany();
  await db.article.deleteMany();
  await db.person.deleteMany();
  await db.project.deleteMany();
  await db.business.deleteMany();
  await db.jobPosition.deleteMany();
  await db.technologyArea.deleteMany();
  await db.milestone.deleteMany();
  await db.principle.deleteMany();
  await db.user.deleteMany();
  await db.role.deleteMany();
  await db.siteSetting.deleteMany();
  await db.companyProfile.deleteMany();

  /* ---------- roles & users ---------- */
  const superRole = await db.role.create({
    data: { name: "SUPER_ADMIN", description: "Full system access" },
  });
  const contentRole = await db.role.create({
    data: { name: "CONTENT_MANAGER", description: "Manage all website content" },
  });
  await db.role.create({
    data: { name: "BUSINESS_MANAGER", description: "Manage assigned business profiles" },
  });
  await db.role.create({
    data: { name: "VIEWER", description: "Read-only access to admin data" },
  });

  await db.user.create({
    data: {
      name: "ETARNITY Admin",
      email: "admin@etarnity.com",
      passwordHash: hashPassword("Etarnity@2025!"),
      roleId: superRole.id,
    },
  });
  await db.user.create({
    data: {
      name: "Content Manager",
      email: "content@etarnity.com",
      passwordHash: hashPassword("Etarnity@2025!"),
      roleId: contentRole.id,
    },
  });
  console.log("  ✓ roles & users");

  /* ---------- company profile ---------- */
  await db.companyProfile.create({
    data: {
      id: 1,
      name: "ETARNITY",
      tagline: "Building What Comes Next.",
      overview:
        "ETARNITY is a technology company that designs, builds, and operates digital products, platforms, and businesses. Founded in Dhaka, Bangladesh and built for an international market, we combine software engineering, product design, and applied intelligence to solve meaningful problems.\n\nWe exist because good technology is rarely the bottleneck — good execution is. ETARNITY was founded to prove that a company from Dhaka can engineer at the standard of the best teams anywhere: precise, reliable, and honest about what it has and hasn't built.\n\nOur approach is deliberately long-term. We take on client engineering work to stay sharp, we build internal products to compound what we learn, and we grow the ecosystem one honest, working system at a time.",
      mission:
        "To build technology that solves meaningful problems — engineered with precision, designed with clarity, and delivered with integrity.",
      vision:
        "To grow from a focused engineering studio into a technology group operating a portfolio of digital products and platforms serving users internationally.",
      foundingYear: 2025,
      headquarters: "Dhaka, Bangladesh",
      operatingStatus: "Operating — early stage",
      contactEmail: "hello@etarnity.com",
    },
  });
  console.log("  ✓ company profile");

  /* ---------- principles ---------- */
  const principles: [string, string][] = [
    ["Engineering Excellence", "We treat quality as an engineering discipline — measured, reviewed, and continuously improved, not hoped for."],
    ["Responsible Innovation", "We build with awareness of consequence: for users, for clients, and for the systems we operate."],
    ["User-Centered Design", "Every interface we ship is shaped by the people who will actually use it, not by what was easiest to build."],
    ["Security & Reliability", "We design for failure, protect by default, and treat reliability as a feature — not an afterthought."],
    ["Continuous Learning", "We invest in our own capability as deliberately as we invest in our products."],
    ["Long-Term Value", "We optimize for outcomes that still matter in five years, not just five weeks."],
  ];
  for (let i = 0; i < principles.length; i++) {
    await db.principle.create({
      data: {
        title: principles[i][0],
        description: principles[i][1],
        displayOrder: i,
      },
    });
  }
  console.log("  ✓ principles");

  /* ---------- milestones ---------- */
  const milestones: [string, string, string][] = [
    ["Q1 2025", "Concept & Foundation", "ETARNITY is founded in Dhaka with a focus on software engineering, design, and digital products."],
    ["Q2 2025", "First Engagements", "Delivery of the first client engineering and design engagements — the studio earns its first references."],
    ["Q3 2025", "Internal Initiatives", "Development begins on ETARNITY's first internal products and platforms."],
    ["Q4 2025", "Digital Headquarters", "Launch of the corporate platform you are viewing — with a managed content system powering every public page."],
  ];
  for (let i = 0; i < milestones.length; i++) {
    await db.milestone.create({
      data: {
        year: milestones[i][0],
        title: milestones[i][1],
        description: milestones[i][2],
        displayOrder: i,
      },
    });
  }
  console.log("  ✓ milestones");

  /* ---------- media ---------- */
  const corporateCover = await registerMedia("project-corporate.png", "Dark corporate dashboard interface — ETARNITY corporate platform");
  const atlasCover = await registerMedia("project-atlas.png", "Design system component cards — Atlas Design System");
  const meridianCover = await registerMedia("project-meridian.png", "Minimal e-commerce storefront presentation — Meridian Commerce");
  const pulseCover = await registerMedia("project-pulse.png", "Real-time analytics visualization with glowing line charts — Pulse Analytics");
  const articleIntro = await registerMedia("article-introducing.png", "Chrome sphere with elliptical orbit ring — ETARNITY brand visual");
  const articleEng = await registerMedia("article-engineering.png", "White technical line drawings on graphite — engineering blueprint");
  const articleAi = await registerMedia("article-ai.png", "Constellation of connected nodes, one glowing — applied AI");
  const articleInfra = await registerMedia("article-infrastructure.png", "Dark server racks with status lights — infrastructure");
  console.log("  ✓ media");

  /* ---------- businesses ---------- */
  await db.business.create({
    data: {
      name: "ETARNITY Studio",
      slug: "etarnity-studio",
      summary:
        "Our digital product studio — web platforms, applications, and design systems, engineered end-to-end.",
      description:
        "ETARNITY Studio is the engine room of the company: the team that designs and builds every client-facing and internal product we ship.\n\nThe studio works across the full lifecycle — discovery, interface design, engineering, launch, and operation. It is also where our standards live: every project that leaves the studio carries the same review discipline, accessibility bar, and reliability expectations.",
      category: "Product Design & Engineering",
      relationshipType: "OWNED",
      operationalStatus: "ACTIVE",
      isPublished: true,
      isFeatured: true,
      displayOrder: 1,
    },
  });
  await db.business.create({
    data: {
      name: "Etar AI",
      slug: "etar-ai",
      summary:
        "Applied intelligence research and automation tooling — currently in active development.",
      description:
        "Etar AI is ETARNITY's applied intelligence initiative: practical automation and AI-assisted tooling built around real workflows, not demos.\n\nThe initiative is in active development. We publish it here because we believe in being transparent about what is operating versus what is being built — and because its early outputs already support internal workflows across the studio.",
      category: "Applied AI & Automation",
      relationshipType: "OWNED",
      operationalStatus: "IN_DEVELOPMENT",
      isPublished: true,
      isFeatured: true,
      displayOrder: 2,
    },
  });
  await db.business.create({
    data: {
      name: "Signalpath",
      slug: "signalpath",
      summary:
        "Growth analytics and marketing automation infrastructure for digital businesses.",
      description:
        "Signalpath is a marketing technology initiative — analytics and automation infrastructure designed to help digital businesses understand and grow their audiences.\n\nIt is in development inside the ETARNITY ecosystem, shaped by the studio's client work. Status updates will be published as the platform matures.",
      category: "Marketing Technology",
      relationshipType: "OWNED",
      operationalStatus: "IN_DEVELOPMENT",
      isPublished: true,
      isFeatured: false,
      displayOrder: 3,
    },
  });
  await db.business.create({
    data: {
      name: "Northcell",
      slug: "northcell",
      summary:
        "A planned suite of cloud and infrastructure tooling — a long-term initiative, honestly labeled.",
      description:
        "Northcell is a planned initiative: a suite of cloud and infrastructure tooling that extends the ecosystem's technical depth.\n\nWe deliberately mark it as planned rather than operating. When development begins in earnest, this page — and the public status — will say so.",
      category: "Cloud & Infrastructure",
      relationshipType: "OWNED",
      operationalStatus: "PLANNED",
      isPublished: true,
      isFeatured: false,
      displayOrder: 4,
    },
  });
  console.log("  ✓ businesses");

  /* ---------- people ---------- */
  const people: {
    name: string;
    slug: string;
    position: string;
    department: string;
    isFounder: boolean;
    biography: string;
    responsibilities: string;
    expertise: string[];
    displayOrder: number;
  }[] = [
    {
      name: "Ayesha Rahman",
      slug: "ayesha-rahman",
      position: "Founder & Chief Executive Officer",
      department: "LEADERSHIP",
      isFounder: true,
      biography:
        "Ayesha founded ETARNITY in 2025 with a simple conviction: that a team from Dhaka can build technology to an international standard — and prove it one shipped product at a time.\n\nShe leads company strategy, client partnerships, and the ecosystem's direction: deciding what ETARNITY builds, what it declines, and how the businesses under it grow together.",
      responsibilities:
        "Company strategy, partnerships, ecosystem direction, and final say on what ships under the ETARNITY name.",
      expertise: ["Strategy", "Corporate Development", "Product Direction", "Client Partnerships"],
      displayOrder: 1,
    },
    {
      name: "Tanvir Hasan",
      slug: "tanvir-hasan",
      position: "Founder & Chief Technology Officer",
      department: "ENGINEERING",
      isFounder: true,
      biography:
        "Tanvir is the engineering half of ETARNITY's founding team. He owns the technical bar: architecture reviews, security practice, and the engineering culture that keeps quality from depending on heroics.\n\nHe leads the studio's most demanding builds and directs the Etar AI initiative's applied research.",
      responsibilities: "Engineering standards, architecture, security practice, and the Etar AI initiative.",
      expertise: ["Software Architecture", "TypeScript", "Applied AI", "Security Engineering"],
      displayOrder: 2,
    },
    {
      name: "Nabila Karim",
      slug: "nabila-karim",
      position: "Lead Product Designer",
      department: "DESIGN",
      isFounder: false,
      biography:
        "Nabila leads product design across the ecosystem — from the studio's client work to ETARNITY's own platforms.\n\nHer work centers on interfaces that respect the user: clear hierarchy, honest states, and accessibility treated as a requirement rather than a checklist item.",
      responsibilities: "Product design, design systems, and interface quality across ETARNITY products.",
      expertise: ["Product Design", "Design Systems", "Accessibility", "Interaction Design"],
      displayOrder: 3,
    },
    {
      name: "Rafi Ahmed",
      slug: "rafi-ahmed",
      position: "Senior Software Engineer",
      department: "ENGINEERING",
      isFounder: false,
      biography:
        "Rafi builds the systems behind the interfaces — APIs, data models, and the infrastructure that keeps them running.\n\nHe is a core engineer on the corporate platform and a quiet defender of boring, reliable infrastructure.",
      responsibilities: "Backend engineering, infrastructure, and platform reliability.",
      expertise: ["Backend Engineering", "Databases", "DevOps", "TypeScript"],
      displayOrder: 4,
    },
    {
      name: "Samira Alam",
      slug: "samira-alam",
      position: "Growth & Operations Lead",
      department: "OPERATIONS",
      isFounder: false,
      biography:
        "Samira keeps the company running and growing — operations, communications, and the growth motion behind the ecosystem's products.\n\nShe also runs the hiring process, which means the careers page and every application route passes through her first.",
      responsibilities: "Operations, communications, growth, and hiring.",
      expertise: ["Operations", "Growth", "Communications", "Recruiting"],
      displayOrder: 5,
    },
  ];
  const personIds: Record<string, number> = {};
  for (const p of people) {
    const row = await db.person.create({
      data: {
        name: p.name,
        slug: p.slug,
        position: p.position,
        department: p.department,
        isFounder: p.isFounder,
        isPublic: true,
        biography: p.biography,
        responsibilities: p.responsibilities,
        expertise: JSON.stringify(p.expertise),
        links: JSON.stringify([]),
        displayOrder: p.displayOrder,
      },
    });
    personIds[p.slug] = row.id;
  }
  console.log("  ✓ people");

  /* ---------- projects ---------- */
  await db.project.create({
    data: {
      title: "ETARNITY Corporate Platform",
      slug: "etarnity-corporate-platform",
      summary:
        "The platform you are viewing — ETARNITY's digital headquarters, with a managed content system powering every public page.",
      problem:
        "A company that builds technology is judged by its own digital presence first. ETARNITY needed a corporate platform that could present the ecosystem honestly — distinguishing what operates from what is being built — while staying fast, accessible, and maintainable by a small team.",
      solution:
        "A single-page application architecture with a fully managed backend: every business, project, person, and article on this site is a database record — created and edited through a role-based admin panel, never by editing code.",
      process:
        "Design and engineering ran together from week one: a shared design system, review checkpoints at every stage, and an editorial pass on all copy before publication. The 3D hero was engineered to be a signature element — not decoration — with graceful fallbacks for any device that cannot render it.",
      outcomes:
        "The platform you are reading is the outcome. It ships with a working CMS, role-based permissions, media management, and a public site that renders entirely from database content. It is also the first production user of the Atlas Design System.",
      stack: JSON.stringify(["Next.js", "React", "TypeScript", "Tailwind CSS", "Prisma", "SQLite", "Three.js", "Framer Motion"]),
      category: "Web Applications",
      ownershipType: "INTERNAL_PRODUCT",
      projectStatus: "LIVE",
      isPublished: true,
      isFeatured: true,
      displayOrder: 1,
      coverMediaId: corporateCover,
    },
  });
  await db.project.create({
    data: {
      title: "Atlas Design System",
      slug: "atlas-design-system",
      summary:
        "ETARNITY's internal design system — the shared component language and quality bar behind every product we ship.",
      problem:
        "Small teams ship inconsistently without a shared system. Every product starting from scratch means wasted effort and interfaces that feel like different companies built them.",
      solution:
        "Atlas: a versioned library of components, tokens, and documentation that encodes ETARNITY's design decisions — typography, spacing, states, accessibility rules — once, so every product inherits them.",
      process:
        "Atlas grows opportunistically: components are extracted from real product work rather than invented speculatively. The corporate platform is its first production consumer.",
      outcomes:
        "In active development. The first components are live in production on this platform; the library expands as the ecosystem's products grow.",
      stack: JSON.stringify(["TypeScript", "React", "Radix UI", "Tailwind CSS", "Figma"]),
      category: "Internal Products",
      ownershipType: "INTERNAL_PRODUCT",
      projectStatus: "IN_DEVELOPMENT",
      isPublished: true,
      isFeatured: true,
      displayOrder: 2,
      coverMediaId: atlasCover,
    },
  });
  await db.project.create({
    data: {
      title: "Meridian Commerce",
      slug: "meridian-commerce",
      summary:
        "A demonstration commerce experience — built to showcase ETARNITY Studio's engineering and design range on a realistic storefront problem.",
      problem:
        "Commerce interfaces concentrate every hard problem at once: performance, trust, hierarchy, and conversion pressure. It is the perfect demonstration surface.",
      solution:
        "Meridian is a fully engineered demonstration storefront: catalog browsing, product pages, and a checkout flow — with the same performance and accessibility bar we apply to client work.",
      process:
        "Built as a studio demonstration project: real architecture, real componentry, no shortcuts — but clearly labeled as a demonstration rather than an operating business.",
      outcomes:
        "A complete demonstration build. We present it as exactly that — evidence of capability, not an operating store.",
      stack: JSON.stringify(["Next.js", "TypeScript", "Tailwind CSS", "React", "Edge Runtime"]),
      category: "Web Applications",
      ownershipType: "DEMONSTRATION",
      projectStatus: "LIVE",
      isPublished: true,
      isFeatured: true,
      displayOrder: 3,
      coverMediaId: meridianCover,
    },
  });
  await db.project.create({
    data: {
      title: "Pulse Analytics",
      slug: "pulse-analytics",
      summary:
        "An experimental real-time analytics interface — streaming data visualization and anomaly hints, exploring what applied AI can honestly do.",
      problem:
        "Dashboards usually show you everything and tell you nothing. Pulse asks the opposite question: what is the minimum interface that tells you something is wrong?",
      solution:
        "A prototype streaming pipeline with a deliberately minimal interface: live metrics, threshold anomalies, and pattern hints from a lightweight anomaly model — no dashboards for their own sake.",
      process:
        "An Etar AI initiative experiment. We label it experimental because it is: the findings feed internal tooling first, productization decisions come later.",
      outcomes:
        "Experimental prototype. Active development, internal use first; public outcomes will be published honestly as they exist.",
      stack: JSON.stringify(["TypeScript", "React", "WebSockets", "Python", "Time-series Storage"]),
      category: "AI & Automation",
      ownershipType: "EXPERIMENT",
      projectStatus: "IN_DEVELOPMENT",
      isPublished: true,
      isFeatured: true,
      displayOrder: 4,
      coverMediaId: pulseCover,
    },
  });
  console.log("  ✓ projects");

  /* ---------- technology areas ---------- */
  const techAreas: {
    key: string;
    title: string;
    description: string;
    items: [string, string][];
  }[] = [
    {
      key: "engineering",
      title: "Engineering",
      description: "How we write software — the standards every ETARNITY codebase shares.",
      items: [
        ["Review discipline", "Nothing ships unreviewed. Every codebase — client or internal — passes the same review bar, because quality cannot be retrofitted."],
        ["Type safety end-to-end", "TypeScript from interface to database. Types are documentation that cannot rot."],
        ["Testing where it matters", "Tests focused on critical paths and regressions, chosen for signal rather than coverage theater."],
        ["Boring, reliable choices", "We pick proven technology for production and save novelty for experiments, where it belongs."],
      ],
    },
    {
      key: "software",
      title: "Software & Applications",
      description: "What we build: the product surfaces and the systems behind them.",
      items: [
        ["Web applications", "The studio's core craft — full lifecycle, from discovery through launch and operation."],
        ["Backend systems & APIs", "The systems behind interfaces: data models, APIs, integrations, and the discipline to keep them simple."],
        ["Digital platforms", "Multi-tenant and content-managed platforms — like the one you are reading — built to be operated by small teams."],
        ["Design systems", "Shared component languages (Atlas) that keep every product consistent without slowing it down."],
      ],
    },
    {
      key: "ai",
      title: "AI & Automation",
      description: "Applied intelligence — practical systems, honestly labeled.",
      items: [
        ["Applied, not speculative", "We automate real workflows with measurable outcomes. If it needs a demo to justify itself, it isn't ready."],
        ["Assistive tooling", "AI that helps people work — drafting, classifying, summarizing — with humans making final calls."],
        ["The Etar AI initiative", "Our applied research arm, currently in active development. Its first outputs support internal workflows."],
        ["Experiments, labeled", "Prototypes like Pulse Analytics are labeled experiments — because pretending research is product helps no one."],
      ],
    },
    {
      key: "security",
      title: "Security",
      description: "Protection as a default posture, not a feature list.",
      items: [
        ["Secure by default", "Hashed credentials, validated inputs, least-privilege access — the non-negotiables in every system we ship."],
        ["Honest boundaries", "We implement sound practices and say clearly what we do not claim: no invented certifications, no guarantees."],
        ["Dependency hygiene", "Minimal, maintained dependencies with known provenance — the supply chain is part of the attack surface."],
        ["Safe file handling", "Upload validation, type checks, and isolated storage on every system that accepts files."],
      ],
    },
    {
      key: "infrastructure",
      title: "Infrastructure & Cloud",
      description: "Running what we build — deliberately unexciting, deliberately reliable.",
      items: [
        ["Reproducible deployments", "Versioned, scripted, and boring. Deployments should be routine, not events."],
        ["Observability first", "Logs, errors, and health checks wired in from day one — you cannot operate what you cannot see."],
        ["Sensible hosting", "Modern platforms and containers, chosen per workload, with costs reviewed like any engineering decision."],
        ["Backups & recovery", "Every production system has a recovery story that has actually been tested."],
      ],
    },
    {
      key: "design",
      title: "Design & Product Engineering",
      description: "Interfaces engineered with the same rigor as the systems behind them.",
      items: [
        ["User-centered by default", "Design starts from the people using it — their context, their vocabulary, their constraints."],
        ["Accessibility as requirement", "Keyboard paths, contrast, semantics, and reduced-motion support are baseline, not polish."],
        ["Prototype fast, decide slowly", "We explore quickly in code and design, but shipping decisions get real consideration."],
        ["Design and engineering, one team", "Designers who understand constraints, engineers who care about interfaces — the gap is where quality dies."],
      ],
    },
    {
      key: "research",
      title: "Research & Innovation",
      description: "Experiments and prototypes — status labeled, honestly.",
      items: [
        ["Pulse Analytics — Status: active experiment", "Real-time streaming analytics with anomaly hints. Internal prototype, informing productization decisions."],
        ["Etar AI workflows — Status: in development", "Applied automation for internal studio workflows. Early outputs in daily internal use."],
        ["Atlas extraction — Status: ongoing", "Components extracted from production work into the shared design system, one real use at a time."],
        ["Northcell — Status: planned", "Cloud tooling initiative. Deliberately labeled planned until real development begins."],
      ],
    },
  ];
  for (let i = 0; i < techAreas.length; i++) {
    const a = techAreas[i];
    await db.technologyArea.create({
      data: {
        key: a.key,
        title: a.title,
        description: a.description,
        items: JSON.stringify(
          a.items.map(([title, description]) => ({ title, description }))
        ),
        displayOrder: i,
      },
    });
  }
  console.log("  ✓ technology areas");

  /* ---------- articles ---------- */
  await db.article.create({
    data: {
      title: "Introducing ETARNITY",
      slug: "introducing-etarnity",
      summary:
        "Why we started a technology company in Dhaka — and what we intend to build.",
      category: "Company Announcement",
      status: "PUBLISHED",
      publishedAt: new Date("2025-10-20T09:00:00+06:00"),
      isFeatured: true,
      authorId: personIds["ayesha-rahman"],
      coverMediaId: articleIntro,
      body: `ETARNITY exists because of a conviction the two of us have shared for years: that a team from Dhaka can engineer at the standard of the best teams anywhere in the world — and that the way to prove it is not to say it, but to ship it.

## What we are building

ETARNITY is a technology company. Not an agency that resells hours, and not a marketplace — a company that designs, builds, and operates digital products and platforms.

That word *operates* matters. Building something is table stakes. We want to run what we build: keep it secure, keep it fast, keep improving it, and let it compound.

## Why honesty is a strategy

You will notice this website says *in development* and *planned* in several places. That is deliberate.

We could have launched with a bigger story — more logos, more claims, more certainty. But every inflated claim becomes a debt you repay with credibility later. We would rather show you a small, real portfolio that grows than a large, fictional one that shrinks.

## The plan

The plan is patience. Client engineering work keeps us sharp and funded. Internal products — like the platform you are reading, and the experiments behind it — compound what we learn. The ecosystem grows one honest, working system at a time.

> The ambition is global. The information is honest. The technology is reliable.

We are just getting started. If you are building something meaningful and want engineering that respects it — [talk to us](/contact).`,
    },
  });
  await db.article.create({
    data: {
      title: "Engineering for the Long Term",
      slug: "engineering-for-the-long-term",
      summary:
        "Most technical debt isn't from bad engineering — it's from treating decisions as temporary. Notes on building systems that survive their authors.",
      category: "Engineering",
      status: "PUBLISHED",
      publishedAt: new Date("2025-10-28T09:00:00+06:00"),
      isFeatured: false,
      authorId: personIds["tanvir-hasan"],
      coverMediaId: articleEng,
      body: `Every codebase tells the truth eventually. Not the architecture diagrams — the code. Diagrams are what we hoped; the code is what we built.

## Decisions are the unit of engineering

Most teams think in files and sprints. The teams that last think in *decisions*: the ones you'll have to live with, and the ones you can cheaply reverse.

- **Reversible decisions** should be made fast. Pick, try, learn.
- **Irreversible decisions** deserve slowness. Data models, public contracts, security boundaries.

Confusing the two is how good teams die slow: agonizing over reversible things while strolling into irreversible ones.

## What "long-term" actually costs

Long-term engineering is not about predicting the future. It is about leaving room for the version of you that knows more:

1. **Types at the boundaries.** Where systems meet — APIs, databases, external services — types prevent entire categories of silent failure.
2. **Boring technology in production.** Save the novelty budget for experiments, where failure is a feature.
3. **Small blast radius.** The question isn't *if* something breaks, it's *how much it takes with it*.
4. **Documentation as you go.** Not documents — documentation. Comments that explain *why*, in the place you'll need it.

## The uncomfortable part

The hardest part of long-term engineering isn't technical. It's declining things — features, shortcuts, migrations that would be easier today and worse forever.

Every system we run at ETARNITY is built this way, including this website. It's slower to start this way. It's much faster to still be shipping three years from now.`,
    },
  });
  await db.article.create({
    data: {
      title: "Applied AI Without the Hype",
      slug: "applied-ai-without-the-hype",
      summary:
        "Where machine assistance genuinely earns its place in production workflows — and where we deliberately don't use it.",
      category: "AI & Automation",
      status: "PUBLISHED",
      publishedAt: new Date("2025-11-05T09:00:00+06:00"),
      isFeatured: false,
      authorId: personIds["tanvir-hasan"],
      coverMediaId: articleAi,
      body: `We run an applied AI initiative, which means we spend a lot of time explaining what we *don't* use AI for.

## The honest hierarchy of AI usefulness

In production systems, usefulness runs inverse to glamour:

1. **Classification and routing** — sorting inquiries, tagging content, routing requests. Unglamorous, measurable, immediately valuable.
2. **Summarization and drafting** — first drafts and recaps that a human edits and approves. The human stays in the loop because the human *should*.
3. **Anomaly detection** — "something changed, look here" — not oracles, but good attention directors.
4. **Generation at the edge** — where mistakes are cheap, visible, and correctable.

Notice what's missing: fully autonomous decisions in high-stakes paths. Not because the technology can't, but because the failure modes are asymmetric.

## What we actually built

Inside the studio, our first applied systems do exactly what the hierarchy suggests: routing, drafting, and anomaly hints. Pulse Analytics — our experimental streaming dashboard — is a research vehicle for the third category.

## The test we apply

> If a human can't verify the output in less time than doing the task, the automation isn't helping.

That test kills most demo-ware. What survives is boring, reliable, and quietly changes how a team spends its day. That's the goal — applied intelligence that earns its electricity.`,
    },
  });
  await db.article.create({
    data: {
      title: "The Case for Boring Infrastructure",
      slug: "the-case-for-boring-infrastructure",
      summary:
        "The most reliable systems we run are also the least interesting ones. On deployment scripts, tested backups, and the joy of nothing happening.",
      category: "Infrastructure",
      status: "PUBLISHED",
      publishedAt: new Date("2025-11-12T09:00:00+06:00"),
      isFeatured: false,
      authorId: personIds["rafi-ahmed"],
      coverMediaId: articleInfra,
      body: `The best compliment an infrastructure can receive is that nobody thinks about it. Nobody writes blog posts about the deploy that worked, the backup that restored, the certificate that renewed. This is a blog post about those things.

## Boring is a feature

When we say boring infrastructure, we mean:

- **Scripted deployments** — identical every time, versioned in git, executable by anyone on the team (and by a machine).
- **Tested recovery** — a backup nobody has restored is a hope, not a backup. We rehearse restores.
- **Logs you can find** — when something breaks at 2 a.m., grep-ability is a UX feature.
- **The dependency minimum** — every dependency is a promise someone else has to keep. We take on few, deliberately.

## The economics of dull

Exciting infrastructure has a hidden cost: it consumes the attention of your best engineer, permanently. The boring stack has a flat retainer and no opinion about your weekends.

There is a time for exciting infrastructure — scale, regulation, or genuine novel constraints. None of those apply to most products, including most of ours.

## What this looks like at ETARNITY

The platform you're reading runs on a deliberately dull stack: a standard runtime, a relational database, scripted migrations, and health checks that page us before users notice. The 3D hero uses more novelty budget than the entire deployment pipeline.

> Reliability isn't the absence of failure. It's the presence of a plan when failure happens.

Boring infrastructure is that plan, pre-paid.`,
    },
  });
  console.log("  ✓ articles");

  /* ---------- job positions ---------- */
  await db.jobPosition.create({
    data: {
      title: "Senior Frontend Engineer",
      department: "Engineering",
      location: "Dhaka / Remote",
      type: "Full-time",
      description:
        "Own significant surfaces of ETARNITY's products — from the corporate platform to client builds. You will set frontend quality standards alongside the founding team, work directly with design, and ship to real users from week one.\n\nThis is a hands-on senior role in a small team: your decisions will be visible in the product and your code in production.",
      requirements: JSON.stringify([
        "5+ years building production web applications",
        "Deep TypeScript and modern React experience",
        "Strong CSS fundamentals and an eye for interface detail",
        "Comfortable owning features end-to-end, from design review to production monitoring",
        "Clear written communication — we work async and document deliberately",
      ]),
      isOpen: true,
      displayOrder: 1,
    },
  });
  await db.jobPosition.create({
    data: {
      title: "Product Designer",
      department: "Design",
      location: "Dhaka / Remote",
      type: "Full-time",
      description:
        "Shape the interfaces of the ETARNITY ecosystem. You will work across product surfaces — from marketing pages to application interfaces — with a team that treats design as engineering, not decoration.\n\nYou should care about accessibility without being asked, and about shipping as much as about pixel-perfection.",
      requirements: JSON.stringify([
        "4+ years of product/interface design experience",
        "A portfolio showing shipped work and the thinking behind it",
        "Fluency in modern design tooling (Figma) and design systems",
        "Practical understanding of HTML/CSS capabilities and constraints",
        "Interest in working directly with engineers in a small team",
      ]),
      isOpen: true,
      displayOrder: 2,
    },
  });
  console.log("  ✓ job positions");

  /* ---------- sample inquiries ---------- */
  await db.contactInquiry.create({
    data: {
      name: "Daniel Fischer",
      email: "d.fischer@example.com",
      organization: "Fischer Logistics",
      inquiryType: "BUSINESS",
      subject: "Platform rebuild — logistics dashboard",
      message:
        "We reviewed your corporate platform and would like to discuss a rebuild of our internal logistics dashboard. Current stack is legacy PHP and the team cannot move fast enough. Could we schedule a call to scope the work?",
      status: "NEW",
    },
  });
  await db.contactInquiry.create({
    data: {
      name: "Priya Nair",
      email: "priya@example.io",
      organization: "Scalecart",
      inquiryType: "PARTNERSHIP",
      subject: "Integration partnership inquiry",
      message:
        "We operate a commerce platform in South Asia and are exploring engineering partners for white-label storefront builds. Interested in discussing a partnership model and seeing more of your commerce work.",
      status: "IN_PROGRESS",
    },
  });
  console.log("  ✓ sample inquiries");

  /* ---------- settings ---------- */
  await db.siteSetting.create({
    data: { key: "footer.description", value: "ETARNITY is a technology company building products, digital platforms, and digital businesses — founded in Dhaka, Bangladesh." },
  });

  console.log("\nSeed complete.");
  console.log("  Admin login: admin@etarnity.com / Etarnity@2025!");
  console.log("  Content manager: content@etarnity.com / Etarnity@2025!");
  const files = existsSync(UPLOAD_DIR) ? readdirSync(UPLOAD_DIR).length : 0;
  console.log(`  Media files in db/uploads: ${files}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());

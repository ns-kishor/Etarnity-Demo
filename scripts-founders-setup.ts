/**
 * ETARNITY — one-off data setup for the real founders (Task 8).
 * Idempotent: safe to run any number of times. Run: bun scripts-founders-setup.ts
 *
 * 1. Hides the five fictional demo people (isPublic: false, all other fields
 *    untouched — articles still reference them as authors).
 * 2. Upserts the five REAL founders by slug (update listed fields if the row
 *    exists, create when missing). contactEmail / location / profileMediaId
 *    are never fabricated and never clobbered by the update path.
 * 3. Seeds the 4 homepage ProblemPairs only when the table is completely empty.
 * 4. Seeds default availability (Sun–Thu 10:00–17:00 BST, 30-min slots,
 *    15-min buffer) for each real founder that has zero availability rules.
 */
import { db } from "./src/lib/db";

const FICTIONAL_SLUGS = [
  "ayesha-rahman",
  "tanvir-hasan",
  "nabila-karim",
  "rafi-ahmed",
  "samira-alam",
];

interface FounderSeed {
  slug: string;
  name: string;
  position: string;
  positionAbbr: string;
  cardIntro: string;
  department: string;
  biography: string;
  responsibilities: string;
  expertise: string[];
  displayOrder: number;
}

const FOUNDERS: FounderSeed[] = [
  {
    slug: "abu-nayem",
    name: "Abu Nayem",
    position: "Chief Executive Officer",
    positionAbbr: "CEO",
    cardIntro:
      "Leads ETARNITY's overall direction — what we build, who we build it for, and the standard every product is held to.",
    department: "LEADERSHIP",
    biography:
      "Abu Nayem is the Chief Executive Officer of ETARNITY. He holds overall responsibility for the company's direction: what ETARNITY builds, the clients and problems it takes on, and the standard each product must meet before it ships.\n\nHe works across strategy, partnerships, and delivery — making sure the company's ambitions stay matched by what it can actually engineer.",
    responsibilities:
      "Company direction, client partnerships, and final quality standards across the ETARNITY ecosystem.",
    expertise: ["Company Strategy", "Partnerships", "Product Direction", "Operations"],
    displayOrder: 1,
  },
  {
    slug: "fahim-shaikh",
    name: "Fahim Shaikh",
    position: "Chief Financial Officer",
    positionAbbr: "CFO",
    cardIntro:
      "Keeps ETARNITY financially disciplined — budgets, forecasting, and the numbers behind every build decision.",
    department: "LEADERSHIP",
    biography:
      "Fahim Shaikh is the Chief Financial Officer of ETARNITY. He is responsible for the company's financial planning, budgeting, and reporting — keeping early-stage spending deliberate rather than reactive.\n\nHe evaluates the financial side of every initiative: what a build costs, what it needs to sustain itself, and how the ecosystem's investments compound over time.",
    responsibilities:
      "Financial planning, budgets, forecasting, and financial review of ETARNITY initiatives.",
    expertise: ["Financial Planning", "Budgeting", "Forecasting", "Financial Reporting"],
    displayOrder: 2,
  },
  {
    slug: "abrar-hasan",
    name: "Abrar Hasan",
    position: "Chief Technology Officer",
    positionAbbr: "CTO",
    cardIntro:
      "Owns ETARNITY's engineering bar — architecture, security practice, and systems that stay maintainable.",
    department: "LEADERSHIP",
    biography:
      "Abrar Hasan is the Chief Technology Officer of ETARNITY. He owns the technical standard everything is built to: architecture decisions, security practice, and the engineering discipline that keeps quality from depending on heroics.\n\nHe leads the design of the company's technical roadmap and reviews the systems ETARNITY ships — its own products and client builds alike.",
    responsibilities:
      "Engineering standards, architecture, security practice, and the technical roadmap.",
    expertise: ["Software Architecture", "Engineering Leadership", "Security Practice", "System Design"],
    displayOrder: 3,
  },
  {
    slug: "kishor-biswas",
    name: "Kishor Biswas",
    position: "Chief Design Officer",
    positionAbbr: "CDO",
    cardIntro:
      "Directs design across ETARNITY — products that look considered and respect the people using them.",
    department: "LEADERSHIP",
    biography:
      "Kishor Biswas is the Chief Design Officer of ETARNITY. He directs design across the ecosystem — product interfaces, design systems, and the overall visual language of what the company builds.\n\nHis focus is interfaces that respect people: clear hierarchy, honest states, and accessibility treated as a requirement rather than a checklist item.",
    responsibilities:
      "Design direction, design systems, and interface quality across ETARNITY products.",
    expertise: ["Product Design", "Design Systems", "Interaction Design", "Accessibility"],
    displayOrder: 4,
  },
  {
    slug: "hasib-hossain",
    name: "Hasib Hossain",
    position: "Chief Strategy Officer",
    positionAbbr: "CSO",
    cardIntro:
      "Shapes where ETARNITY goes next — positioning, partnerships, and the ecosystem's long-term plan.",
    department: "LEADERSHIP",
    biography:
      "Hasib Hossain is the Chief Strategy Officer of ETARNITY. He shapes the company's long-term direction: which problems to pursue, how the ecosystem's businesses fit together, and where to invest next.\n\nHe works closely with the CEO on positioning and partnerships, turning the company's ambitions into a sequenced, realistic plan.",
    responsibilities: "Long-term strategy, positioning, and partnership development.",
    expertise: ["Strategy", "Market Analysis", "Positioning", "Partnerships"],
    displayOrder: 5,
  },
];

const PROBLEM_PAIRS: {
  problemTitle: string;
  problemDesc: string;
  solutionTitle: string;
  solutionDesc: string;
  displayOrder: number;
}[] = [
  {
    problemTitle: "Manual processes that don't scale",
    problemDesc:
      "Daily operations still run on spreadsheets, chat threads, and repeated hand-offs — work that only grows with headcount.",
    solutionTitle: "Practical process software",
    solutionDesc:
      "We map the workflow as it actually runs, then build focused tools that remove the highest-friction manual steps first.",
    displayOrder: 1,
  },
  {
    problemTitle: "Products people abandon",
    problemDesc:
      "Powerful features don't help when the interface gets in the way — unclear flows quietly cost teams time, trust, and users.",
    solutionTitle: "Thoughtful product design",
    solutionDesc:
      "We design around real user tasks — clear hierarchy, honest states, and interfaces that respect attention — then verify them with the people who use them.",
    displayOrder: 2,
  },
  {
    problemTitle: "Systems that stall after launch",
    problemDesc:
      "Many digital products ship once and then drift: nobody owns quality, security, or what comes next, and the codebase slowly works against the business.",
    solutionTitle: "Engineering that stays accountable",
    solutionDesc:
      "We build maintainable systems and stay responsible after release — monitoring, iteration, and a technical bar that doesn't decay.",
    displayOrder: 3,
  },
  {
    problemTitle: "Invisible where it matters",
    problemDesc:
      "Good work that can't be found: unclear positioning and unmeasured marketing spend instead of an evidence-driven digital presence.",
    solutionTitle: "Data-informed presence",
    solutionDesc:
      "We ground digital marketing in measurement — analytics, search, and content decisions driven by evidence rather than instinct.",
    displayOrder: 4,
  },
];

async function main() {
  console.log("Setting up ETARNITY founders data…\n");
  const actions: string[] = [];

  /* 1. Hide fictional demo people. */
  for (const slug of FICTIONAL_SLUGS) {
    const person = await db.person.findUnique({ where: { slug } });
    if (!person) {
      actions.push(`skip  fictional "${slug}" (not found)`);
      continue;
    }
    if (!person.isPublic) {
      actions.push(`ok    fictional "${slug}" already hidden`);
      continue;
    }
    await db.person.update({
      where: { slug },
      data: { isPublic: false },
    });
    actions.push(`hide  fictional "${slug}" (isPublic → false, other fields untouched)`);
  }

  /* 2. Upsert real founders. */
  const founderIds: Record<string, number> = {};
  for (const f of FOUNDERS) {
    const existing = await db.person.findUnique({ where: { slug: f.slug } });
    const data = {
      name: f.name,
      position: f.position,
      positionAbbr: f.positionAbbr,
      cardIntro: f.cardIntro,
      department: f.department,
      biography: f.biography,
      responsibilities: f.responsibilities,
      expertise: JSON.stringify(f.expertise),
      links: JSON.stringify([]),
      isFounder: true,
      isPublic: true,
      displayOrder: f.displayOrder,
    };
    if (existing) {
      await db.person.update({ where: { slug: f.slug }, data });
      founderIds[f.slug] = existing.id;
      actions.push(`upd   founder "${f.slug}" (#${existing.id})`);
    } else {
      const row = await db.person.create({ data: { ...data, slug: f.slug } });
      founderIds[f.slug] = row.id;
      actions.push(`new   founder "${f.slug}" (#${row.id})`);
    }
  }

  /* 3. Problem pairs — only seed an empty table. */
  const pairCount = await db.problemPair.count();
  if (pairCount === 0) {
    for (const pair of PROBLEM_PAIRS) {
      await db.problemPair.create({ data: { ...pair, isActive: true } });
    }
    actions.push(`new   ${PROBLEM_PAIRS.length} problem pairs seeded`);
  } else {
    actions.push(`skip  problem pairs (${pairCount} already exist — left untouched)`);
  }

  /* 4. Default availability — only for founders with zero rules. */
  for (const f of FOUNDERS) {
    const personId = founderIds[f.slug];
    const ruleCount = await db.availabilityRule.count({ where: { personId } });
    if (ruleCount > 0) {
      actions.push(`skip  availability "${f.slug}" (${ruleCount} rules exist — left untouched)`);
      continue;
    }
    for (let dayOfWeek = 0; dayOfWeek <= 4; dayOfWeek++) {
      await db.availabilityRule.create({
        data: {
          personId,
          dayOfWeek,
          startMinute: 600,
          endMinute: 1020,
          slotMinutes: 30,
          bufferMinutes: 15,
          isActive: true,
        },
      });
    }
    actions.push(`new   availability "${f.slug}" (Sun–Thu 10:00–17:00 BST, 30/15)`);
  }

  console.log(actions.join("\n"));

  const publicPeople = await db.person.findMany({
    where: { isPublic: true },
    orderBy: { displayOrder: "asc" },
    select: { slug: true, isFounder: true },
  });
  console.log(
    `\nPublic people now: ${publicPeople.map((p) => p.slug).join(", ")}`
  );
  console.log("Done.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());

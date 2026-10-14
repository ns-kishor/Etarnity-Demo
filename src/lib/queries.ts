import { db } from "./db";
import type {
  Article,
  Business,
  CompanyProfile,
  JobPosition,
  MediaRef,
  Person,
  PersonLink,
  ProblemPair,
  Project,
  TechnologyArea,
} from "./types";

/**
 * Server-side data access layer.
 * Used by API routes AND by the home page server component.
 * All list endpoints order deterministically and only expose published rows.
 * NOTE: Prisma rows are structurally compatible with the `*Row` types below.
 */

type MediaRow = {
  id: number;
  altText: string | null;
  mimeType: string;
};

type MediaLike = MediaRow | null | undefined;

function mediaRef(m: MediaLike): MediaRef | null {
  if (!m) return null;
  return {
    id: m.id,
    url: `/api/media/${m.id}`,
    altText: m.altText,
    mimeType: m.mimeType,
  };
}

function parseJsonArray<T>(raw: string | null | undefined, fallback: T[]): T[] {
  if (!raw) return fallback;
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

/* ---------- Company ---------- */

export async function getCompanyProfile(): Promise<CompanyProfile | null> {
  try {
    const profile = await db.companyProfile.findUnique({ where: { id: 1 } });
    if (!profile) return null;
    const [principles, milestones] = await Promise.all([
      db.principle.findMany({ orderBy: [{ displayOrder: "asc" }, { id: "asc" }] }).catch(() => []),
      db.milestone.findMany({ orderBy: [{ displayOrder: "asc" }, { id: "asc" }] }).catch(() => []),
    ]);
    return {
      name: profile.name,
      tagline: profile.tagline,
      overview: profile.overview,
      mission: profile.mission,
      vision: profile.vision,
      foundingYear: profile.foundingYear,
      headquarters: profile.headquarters,
      operatingStatus: profile.operatingStatus,
      contactEmail: profile.contactEmail,
      principles: principles.map((p) => ({
        id: p.id,
        title: p.title,
        description: p.description,
      })),
      milestones: milestones.map((m) => ({
        id: m.id,
        year: m.year,
        title: m.title,
        description: m.description,
      })),
    };
  } catch (error) {
    console.warn("getCompanyProfile db error:", error);
    return null;
  }
}

/* ---------- Businesses ---------- */

export async function getPublishedBusinesses(): Promise<Business[]> {
  try {
    const rows = await db.business.findMany({
      where: { isPublished: true },
      orderBy: [{ displayOrder: "asc" }, { id: "asc" }],
      include: { logoMedia: true },
    });
    return rows.map(serializeBusiness);
  } catch (error) {
    console.warn("getPublishedBusinesses db error:", error);
    return [];
  }
}

export async function getBusinessBySlug(slug: string): Promise<Business | null> {
  try {
    const row = await db.business.findFirst({
      where: { slug, isPublished: true },
      include: { logoMedia: true },
    });
    return row ? serializeBusiness(row) : null;
  } catch (error) {
    console.warn("getBusinessBySlug db error:", error);
    return null;
  }
}

type BusinessRow = {
  id: number;
  name: string;
  slug: string;
  summary: string;
  description: string | null;
  category: string;
  relationshipType: string;
  operationalStatus: string;
  websiteUrl: string | null;
  isFeatured: boolean;
  logoMedia?: MediaLike;
};

export function serializeBusiness(row: BusinessRow): Business {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    summary: row.summary,
    description: row.description,
    category: row.category,
    relationshipType: row.relationshipType as Business["relationshipType"],
    operationalStatus: row.operationalStatus as Business["operationalStatus"],
    websiteUrl: row.websiteUrl,
    isFeatured: row.isFeatured,
    logo: mediaRef(row.logoMedia ?? null),
  };
}

/* ---------- Projects ---------- */

export async function getPublishedProjects(): Promise<Project[]> {
  try {
    const rows = await db.project.findMany({
      where: { isPublished: true },
      orderBy: [{ displayOrder: "asc" }, { id: "asc" }],
      include: { coverMedia: true, assets: { include: { media: true } } },
    });
    return rows.map(serializeProject);
  } catch (error) {
    console.warn("getPublishedProjects db error:", error);
    return [];
  }
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  try {
    const row = await db.project.findFirst({
      where: { slug, isPublished: true },
      include: { coverMedia: true, assets: { include: { media: true } } },
    });
    return row ? serializeProject(row) : null;
  } catch (error) {
    console.warn("getProjectBySlug db error:", error);
    return null;
  }
}

type ProjectRow = {
  id: number;
  title: string;
  slug: string;
  summary: string;
  problem: string | null;
  solution: string | null;
  process: string | null;
  outcomes: string | null;
  stack: string;
  category: string;
  ownershipType: string;
  projectStatus: string;
  liveUrl: string | null;
  isFeatured: boolean;
  coverMedia?: MediaLike;
  assets?: { media: MediaRow; displayOrder: number }[];
};

export function serializeProject(row: ProjectRow): Project {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    summary: row.summary,
    problem: row.problem,
    solution: row.solution,
    process: row.process,
    outcomes: row.outcomes,
    stack: parseJsonArray<string>(row.stack, []),
    category: row.category,
    ownershipType: row.ownershipType as Project["ownershipType"],
    projectStatus: row.projectStatus as Project["projectStatus"],
    liveUrl: row.liveUrl,
    isFeatured: row.isFeatured,
    cover: mediaRef(row.coverMedia ?? null),
    gallery: (row.assets ?? [])
      .slice()
      .sort((a, b) => a.displayOrder - b.displayOrder)
      .map((a) => mediaRef(a.media))
      .filter((m): m is MediaRef => m !== null),
  };
}

/* ---------- People ---------- */

export async function getPublicPeople(): Promise<Person[]> {
  try {
    const rows = await db.person.findMany({
      where: { isPublic: true },
      orderBy: [{ displayOrder: "asc" }, { id: "asc" }],
      include: { profileMedia: true },
    });
    return rows.map(serializePerson);
  } catch (error) {
    console.warn("getPublicPeople db error:", error);
    return [];
  }
}

export async function getPersonBySlug(slug: string): Promise<Person | null> {
  try {
    const row = await db.person.findFirst({
      where: { slug, isPublic: true },
      include: { profileMedia: true },
    });
    return row ? serializePerson(row) : null;
  } catch (error) {
    console.warn("getPersonBySlug db error:", error);
    return null;
  }
}

type PersonRow = {
  id: number;
  name: string;
  slug: string;
  position: string;
  positionAbbr: string | null;
  cardIntro: string | null;
  contactEmail: string | null;
  location: string | null;
  biography: string | null;
  department: string | null;
  responsibilities: string | null;
  expertise: string;
  links: string;
  isFounder: boolean;
  profileMedia?: MediaLike;
};

export function serializePerson(row: PersonRow): Person {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    position: row.position,
    positionAbbr: row.positionAbbr,
    cardIntro: row.cardIntro,
    contactEmail: row.contactEmail,
    location: row.location,
    biography: row.biography,
    department: row.department,
    responsibilities: row.responsibilities,
    expertise: parseJsonArray<string>(row.expertise, []),
    links: parseJsonArray<PersonLink>(row.links, []),
    isFounder: row.isFounder,
    portrait: mediaRef(row.profileMedia ?? null),
  };
}

/* ---------- Articles ---------- */

export async function getPublishedArticles(): Promise<Article[]> {
  try {
    const rows = await db.article.findMany({
      where: { status: "PUBLISHED" },
      orderBy: [{ publishedAt: "desc" }, { id: "desc" }],
      include: { author: true, coverMedia: true },
    });
    return rows.map(serializeArticle);
  } catch (error) {
    console.warn("getPublishedArticles db error:", error);
    return [];
  }
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  try {
    const row = await db.article.findFirst({
      where: { slug, status: "PUBLISHED" },
      include: { author: true, coverMedia: true },
    });
    return row ? serializeArticle(row) : null;
  } catch (error) {
    console.warn("getArticleBySlug db error:", error);
    return null;
  }
}

type ArticleRow = {
  id: number;
  title: string;
  slug: string;
  summary: string;
  body: string;
  category: string;
  status: string;
  publishedAt: Date | null;
  isFeatured: boolean;
  coverMedia?: MediaLike;
  author?: {
    id: number;
    name: string;
    slug: string;
    position: string;
    isPublic: boolean;
  } | null;
};

export function serializeArticle(row: ArticleRow): Article {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    summary: row.summary,
    body: row.body,
    category: row.category,
    status: row.status as Article["status"],
    publishedAt: row.publishedAt ? row.publishedAt.toISOString() : null,
    isFeatured: row.isFeatured,
    author: row.author
      ? {
          id: row.author.id,
          name: row.author.name,
          slug: row.author.slug,
          position: row.author.position,
          isPublic: row.author.isPublic,
        }
      : null,
    cover: mediaRef(row.coverMedia ?? null),
  };
}

/* ---------- Technology & careers ---------- */

export async function getTechnologyAreas(): Promise<TechnologyArea[]> {
  try {
    const rows = await db.technologyArea.findMany({
      orderBy: [{ displayOrder: "asc" }, { id: "asc" }],
    });
    return rows.map((r) => ({
      id: r.id,
      key: r.key,
      title: r.title,
      description: r.description,
      items: parseJsonArray<{ title: string; description: string }>(r.items, []),
    }));
  } catch (error) {
    console.warn("getTechnologyAreas db error:", error);
    return [];
  }
}

export async function getJobPositions(): Promise<JobPosition[]> {
  try {
    const rows = await db.jobPosition.findMany({
      where: { isOpen: true },
      orderBy: [{ displayOrder: "asc" }, { id: "asc" }],
    });
    return rows.map((r) => ({
      id: r.id,
      title: r.title,
      department: r.department,
      location: r.location,
      type: r.type,
      description: r.description,
      requirements: parseJsonArray<string>(r.requirements, []),
    }));
  } catch (error) {
    console.warn("getJobPositions db error:", error);
    return [];
  }
}

/* ---------- Homepage: Problem Solving ---------- */

export async function getProblemPairs(): Promise<ProblemPair[]> {
  try {
    const rows = await db.problemPair.findMany({
      where: { isActive: true },
      orderBy: [{ displayOrder: "asc" }, { id: "asc" }],
    });
    return rows.map((r) => ({
      id: r.id,
      problemTitle: r.problemTitle,
      problemDesc: r.problemDesc,
      solutionTitle: r.solutionTitle,
      solutionDesc: r.solutionDesc,
      displayOrder: r.displayOrder,
      isActive: r.isActive,
    }));
  } catch (error) {
    console.warn("getProblemPairs db error:", error);
    return [];
  }
}

/* ---------- Initial home payload ---------- */

export interface HomePayload {
  company: CompanyProfile | null;
  businesses: Business[];
  projects: Project[];
  problems: ProblemPair[];
}

export async function getHomePayload(): Promise<HomePayload> {
  try {
    const [company, businesses, projects, problems] = await Promise.all([
      getCompanyProfile().catch(() => null),
      getPublishedBusinesses().catch(() => []),
      getPublishedProjects().catch(() => []),
      getProblemPairs().catch(() => []),
    ]);
    return {
      company,
      businesses: businesses ?? [],
      projects: (projects ?? []).filter((p) => p.isFeatured).slice(0, 4),
      problems: problems ?? [],
    };
  } catch (error) {
    console.warn("getHomePayload error:", error);
    return {
      company: null,
      businesses: [],
      projects: [],
      problems: [],
    };
  }
}

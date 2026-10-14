/**
 * ETARNITY — Shared API types (single source of truth for all agents).
 * Server routes, query helpers, and client pages must conform to these shapes.
 */

/* ---------- Enums (stored as strings in SQLite) ---------- */

export type RelationshipType =
  | "OWNED"
  | "SUBSIDIARY"
  | "OPERATED_BRAND"
  | "PARTNER"
  | "CLIENT_PROJECT"
  | "PLANNED_INITIATIVE";

export type OperationalStatus =
  | "ACTIVE"
  | "IN_DEVELOPMENT"
  | "PLANNED"
  | "ARCHIVED";

export type OwnershipType =
  | "INTERNAL_PRODUCT"
  | "CLIENT_PROJECT"
  | "DEMONSTRATION"
  | "EXPERIMENT"
  | "PERSONAL_PROJECT";

export type ProjectStatus =
  | "LIVE"
  | "IN_DEVELOPMENT"
  | "MAINTENANCE"
  | "ARCHIVED";

export type InquiryType =
  | "GENERAL"
  | "BUSINESS"
  | "PARTNERSHIP"
  | "PRODUCT"
  | "CAREERS"
  | "PRESS";

export type InquiryStatus = "NEW" | "IN_PROGRESS" | "RESOLVED" | "ARCHIVED";

export type ArticleStatus = "DRAFT" | "SCHEDULED" | "PUBLISHED" | "ARCHIVED";

export type AdminRole =
  | "SUPER_ADMIN"
  | "CONTENT_MANAGER"
  | "BUSINESS_MANAGER"
  | "VIEWER";

export type UserStatus = "ACTIVE" | "SUSPENDED";

/* ---------- Public shapes ---------- */

export interface MediaRef {
  id: number;
  url: string; // /api/media/{id}
  altText: string | null;
  mimeType: string;
}

export interface Business {
  id: number;
  name: string;
  slug: string;
  summary: string;
  description: string | null;
  category: string;
  relationshipType: RelationshipType;
  operationalStatus: OperationalStatus;
  websiteUrl: string | null;
  isFeatured: boolean;
  logo: MediaRef | null;
}

export interface Project {
  id: number;
  title: string;
  slug: string;
  summary: string;
  problem: string | null;
  solution: string | null;
  process: string | null;
  outcomes: string | null;
  stack: string[];
  category: string;
  ownershipType: OwnershipType;
  projectStatus: ProjectStatus;
  liveUrl: string | null;
  isFeatured: boolean;
  cover: MediaRef | null;
  gallery: MediaRef[];
}

export interface PersonLink {
  label: string;
  url: string;
}

export interface Person {
  id: number;
  name: string;
  slug: string;
  position: string;
  /** Short badge, e.g. "CEO" — shown on founder cards when present. */
  positionAbbr: string | null;
  /** 2–3 line founder-card intro. */
  cardIntro: string | null;
  /** Public business email — only shown publicly when provided. */
  contactEmail: string | null;
  /** Published location — only shown publicly when provided. */
  location: string | null;
  biography: string | null;
  department: string | null;
  responsibilities: string | null;
  expertise: string[];
  links: PersonLink[];
  isFounder: boolean;
  portrait: MediaRef | null;
}

export interface Article {
  id: number;
  title: string;
  slug: string;
  summary: string;
  body: string;
  category: string;
  status: ArticleStatus;
  publishedAt: string | null;
  isFeatured: boolean;
  author: {
    id: number;
    name: string;
    slug: string;
    position: string;
    /** Whether the author has a public profile page (`/people/{slug}`). */
    isPublic: boolean;
  } | null;
  cover: MediaRef | null;
}

export interface Principle {
  id: number;
  title: string;
  description: string;
}

export interface Milestone {
  id: number;
  year: string;
  title: string;
  description: string;
}

export interface CompanyProfile {
  name: string;
  tagline: string | null;
  overview: string | null;
  mission: string | null;
  vision: string | null;
  foundingYear: number | null;
  headquarters: string | null;
  operatingStatus: string | null;
  contactEmail: string | null;
  principles: Principle[];
  milestones: Milestone[];
}

export interface TechnologyItem {
  title: string;
  description: string;
}

export interface TechnologyArea {
  id: number;
  key: string;
  title: string;
  description: string | null;
  items: TechnologyItem[];
}

export interface JobPosition {
  id: number;
  title: string;
  department: string | null;
  location: string | null;
  type: string | null;
  description: string | null;
  requirements: string[];
}

/* ---------- Admin shapes ---------- */

export interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: AdminRole;
  status: UserStatus;
  createdAt: string;
}

export interface ContactInquiry {
  id: number;
  name: string;
  email: string;
  organization: string | null;
  inquiryType: InquiryType;
  subject: string;
  message: string;
  status: InquiryStatus;
  internalNotes: string | null;
  createdAt: string;
}

export interface MediaItem {
  id: number;
  url: string;
  fileName: string;
  mimeType: string;
  size: number;
  altText: string | null;
  createdAt: string;
}

export interface AuditEntry {
  id: number;
  action: string;
  entityType: string;
  entityId: string | null;
  actor: string | null;
  createdAt: string;
}

export interface DashboardStats {
  publishedBusinesses: number;
  totalBusinesses: number;
  publishedProjects: number;
  totalProjects: number;
  publishedArticles: number;
  totalArticles: number;
  draftArticles: number;
  publicPeople: number;
  openInquiries: number;
  totalInquiries: number;
  mediaCount: number;
  recentActivity: AuditEntry[];
}

/* ---------- Homepage: Problem Solving ---------- */

export interface ProblemPair {
  id: number;
  problemTitle: string;
  problemDesc: string;
  solutionTitle: string;
  solutionDesc: string;
  displayOrder: number;
  isActive: boolean;
}

/* ---------- Founder meeting booking ---------- */

/** One weekday's availability configuration (0 = Sunday … 6 = Saturday, BST week). */
export interface FounderAvailabilityRule {
  dayOfWeek: number;
  startMinute: number;
  endMinute: number;
  slotMinutes: number;
  bufferMinutes: number;
  isActive: boolean;
}

export interface FounderBlockedDate {
  id: number;
  date: string; // "YYYY-MM-DD" (BST)
  note: string | null;
}

export interface AvailabilityDayResult {
  founderSlug: string;
  date: string; // "YYYY-MM-DD" (BST)
  timezone: string;
  notConfigured: boolean;
  slots: { minute: number; label: string; available: boolean }[];
}

export interface AvailabilityMonthResult {
  founderSlug: string;
  month: string; // "YYYY-MM"
  timezone: string;
  dates: string[]; // "YYYY-MM-DD" dates with ≥1 bookable slot
}

export interface BookingResult {
  reference: string;
  founderName: string;
  founderSlug: string;
  date: string;
  startMinute: number;
  label: string;
  durationMinutes: number;
}

export interface AdminBooking {
  id: number;
  personId: number;
  founderName: string;
  founderSlug: string;
  date: string;
  startMinute: number;
  label: string;
  durationMinutes: number;
  name: string;
  email: string;
  mobile: string;
  status: string;
  createdAt: string;
}

/* ---------- Contact form ---------- */

export interface ContactFormPayload {
  name: string;
  email: string;
  organization?: string;
  inquiryType: InquiryType;
  subject: string;
  message: string;
  consent: boolean;
  website?: string; // honeypot — must stay empty
}

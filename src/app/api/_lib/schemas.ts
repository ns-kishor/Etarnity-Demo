import { z } from "zod";

/**
 * Zod schemas for every API request body.
 *
 * NOTE: update ("PUT") schemas are deliberately written out in full rather
 * than derived with `.partial()` — zod 4.3's `.partial()` still fires
 * `.default()` values for absent keys, which would clobber existing rows on
 * partial updates. Update schemas therefore contain NO defaults: absent
 * keys simply stay undefined and routes skip them.
 */

/* ---------- field helpers ---------- */

const str = (label: string, min: number, max: number) =>
  z
    .string()
    .min(min, `${label} must be at least ${min} characters.`)
    .max(max, `${label} must be at most ${max} characters.`);

/** Nullable, optional free-text field ("" is normalized to null by routes). */
const text = (label: string, max: number) =>
  z.string().max(max, `${label} must be at most ${max} characters.`).nullish();

/** Optional URL: a valid URL or the empty string (routes store "" as null). */
const urlField = z
  .union([z.url("Please provide a valid URL."), z.literal("")], {
    error: "Please provide a valid URL.",
  })
  .nullish();

const slugField = z
  .string()
  .min(2, "Slug must be at least 2 characters.")
  .max(140, "Slug must be at most 140 characters.")
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    "Slug may only contain lowercase letters, numbers and hyphens (e.g. \"etar-ai\")."
  );

/** Optional date: accepts ISO strings, "" and null ("" and null → null). */
const dateField = z.preprocess(
  (v) => (v === "" ? null : v),
  z.coerce
    .date({ error: "Please provide a valid date." })
    .nullish()
);

const intField = z
  .coerce
  .number({ error: "Display order must be a number." })
  .int("Display order must be a whole number.");

/** Optional reference to a media/user row — number or null. */
const refId = z
  .number({ error: "The id must be a number." })
  .int("The id must be a whole number.")
  .nullish();

/* ---------- enums (mirror src/lib/types.ts) ---------- */

export const RELATIONSHIP_TYPES = [
  "OWNED",
  "SUBSIDIARY",
  "OPERATED_BRAND",
  "PARTNER",
  "CLIENT_PROJECT",
  "PLANNED_INITIATIVE",
] as const;

export const OPERATIONAL_STATUSES = [
  "ACTIVE",
  "IN_DEVELOPMENT",
  "PLANNED",
  "ARCHIVED",
] as const;

export const OWNERSHIP_TYPES = [
  "INTERNAL_PRODUCT",
  "CLIENT_PROJECT",
  "DEMONSTRATION",
  "EXPERIMENT",
  "PERSONAL_PROJECT",
] as const;

export const PROJECT_STATUSES = [
  "LIVE",
  "IN_DEVELOPMENT",
  "MAINTENANCE",
  "ARCHIVED",
] as const;

export const ARTICLE_STATUSES = [
  "DRAFT",
  "SCHEDULED",
  "PUBLISHED",
  "ARCHIVED",
] as const;

export const INQUIRY_TYPES = [
  "GENERAL",
  "BUSINESS",
  "PARTNERSHIP",
  "PRODUCT",
  "CAREERS",
  "PRESS",
] as const;

export const INQUIRY_STATUSES = [
  "NEW",
  "IN_PROGRESS",
  "RESOLVED",
  "ARCHIVED",
] as const;

export const ADMIN_ROLES = [
  "SUPER_ADMIN",
  "CONTENT_MANAGER",
  "BUSINESS_MANAGER",
  "VIEWER",
] as const;

export const USER_STATUSES = ["ACTIVE", "SUSPENDED"] as const;

/* ---------- auth & public forms ---------- */

export const loginSchema = z.object({
  email: z.email("Please provide a valid email address."),
  password: z.string().min(1, "Password is required."),
});

export const contactSchema = z.object({
  name: str("Name", 2, 80),
  email: z.email("Please provide a valid email address."),
  organization: text("Organization", 120),
  inquiryType: z.enum(INQUIRY_TYPES, { error: "Invalid inquiry type." }),
  subject: str("Subject", 3, 120),
  message: str("Message", 10, 5000),
  consent: z.literal(true, {
    error: "Consent is required to submit the form.",
  }),
  website: z.string().max(2000).optional(), // honeypot
});

/* ---------- businesses ---------- */

export const businessCreateSchema = z.object({
  name: str("Name", 2, 120),
  slug: slugField,
  summary: str("Summary", 10, 500),
  description: text("Description", 20000),
  category: str("Category", 2, 80),
  relationshipType: z.enum(RELATIONSHIP_TYPES, {
    error: "Invalid relationship type.",
  }),
  operationalStatus: z.enum(OPERATIONAL_STATUSES, {
    error: "Invalid operational status.",
  }),
  websiteUrl: urlField,
  isPublished: z.boolean().default(false),
  isFeatured: z.boolean().default(false),
  displayOrder: intField.default(0),
  logoMediaId: refId,
});

export const businessUpdateSchema = z.object({
  name: str("Name", 2, 120).optional(),
  slug: slugField.optional(),
  summary: str("Summary", 10, 500).optional(),
  description: text("Description", 20000),
  category: str("Category", 2, 80).optional(),
  relationshipType: z.enum(RELATIONSHIP_TYPES, {
    error: "Invalid relationship type.",
  }).optional(),
  operationalStatus: z.enum(OPERATIONAL_STATUSES, {
    error: "Invalid operational status.",
  }).optional(),
  websiteUrl: urlField,
  isPublished: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  displayOrder: intField.optional(),
  logoMediaId: refId,
});

/* ---------- projects ---------- */

const stackField = z
  .array(str("Stack item", 1, 60))
  .max(30, "Stack may contain at most 30 items.");

export const projectCreateSchema = z.object({
  title: str("Title", 2, 140),
  slug: slugField,
  summary: str("Summary", 10, 500),
  problem: text("Problem", 20000),
  solution: text("Solution", 20000),
  process: text("Process", 20000),
  outcomes: text("Outcomes", 20000),
  stack: stackField.default([]),
  category: str("Category", 2, 80),
  ownershipType: z.enum(OWNERSHIP_TYPES, {
    error: "Invalid ownership type.",
  }),
  projectStatus: z.enum(PROJECT_STATUSES, {
    error: "Invalid project status.",
  }),
  liveUrl: urlField,
  isPublished: z.boolean().default(false),
  isFeatured: z.boolean().default(false),
  displayOrder: intField.default(0),
  coverMediaId: refId,
  galleryMediaIds: z
    .array(z.number({ error: "Media ids must be numbers." }).int())
    .max(30, "Gallery may contain at most 30 images.")
    .optional(),
});

export const projectUpdateSchema = z.object({
  title: str("Title", 2, 140).optional(),
  slug: slugField.optional(),
  summary: str("Summary", 10, 500).optional(),
  problem: text("Problem", 20000),
  solution: text("Solution", 20000),
  process: text("Process", 20000),
  outcomes: text("Outcomes", 20000),
  stack: stackField.optional(),
  category: str("Category", 2, 80).optional(),
  ownershipType: z.enum(OWNERSHIP_TYPES, {
    error: "Invalid ownership type.",
  }).optional(),
  projectStatus: z.enum(PROJECT_STATUSES, {
    error: "Invalid project status.",
  }).optional(),
  liveUrl: urlField,
  isPublished: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  displayOrder: intField.optional(),
  coverMediaId: refId,
  galleryMediaIds: z
    .array(z.number({ error: "Media ids must be numbers." }).int())
    .max(30, "Gallery may contain at most 30 images.")
    .optional(),
});

/* ---------- people ---------- */

const expertiseField = z
  .array(str("Expertise item", 1, 80))
  .max(40, "Expertise may contain at most 40 items.");

const linksField = z
  .array(
    z.object({
      label: str("Label", 1, 40),
      url: str("URL", 1, 500),
    })
  )
  .max(20, "A person may have at most 20 links.");

export const personCreateSchema = z.object({
  name: str("Name", 2, 120),
  slug: slugField,
  position: str("Position", 2, 120),
  biography: text("Biography", 20000),
  department: text("Department", 120),
  responsibilities: text("Responsibilities", 20000),
  expertise: expertiseField.default([]),
  links: linksField.default([]),
  isFounder: z.boolean().default(false),
  isPublic: z.boolean().default(true),
  displayOrder: intField.default(0),
  profileMediaId: refId,
});

export const personUpdateSchema = z.object({
  name: str("Name", 2, 120).optional(),
  slug: slugField.optional(),
  position: str("Position", 2, 120).optional(),
  biography: text("Biography", 20000),
  department: text("Department", 120),
  responsibilities: text("Responsibilities", 20000),
  expertise: expertiseField.optional(),
  links: linksField.optional(),
  isFounder: z.boolean().optional(),
  isPublic: z.boolean().optional(),
  displayOrder: intField.optional(),
  profileMediaId: refId,
});

/* ---------- articles ---------- */

export const articleCreateSchema = z.object({
  title: str("Title", 2, 200),
  slug: slugField,
  summary: str("Summary", 10, 400),
  body: z
    .string()
    .min(1, "Body must not be empty.")
    .max(100000, "Body must be at most 100000 characters."),
  category: str("Category", 2, 60),
  status: z.enum(ARTICLE_STATUSES, { error: "Invalid status." }).default(
    "DRAFT"
  ),
  publishedAt: dateField,
  isFeatured: z.boolean().default(false),
  authorId: refId,
  coverMediaId: refId,
});

export const articleUpdateSchema = z.object({
  title: str("Title", 2, 200).optional(),
  slug: slugField.optional(),
  summary: str("Summary", 10, 400).optional(),
  body: z
    .string()
    .min(1, "Body must not be empty.")
    .max(100000, "Body must be at most 100000 characters.")
    .optional(),
  category: str("Category", 2, 60).optional(),
  status: z.enum(ARTICLE_STATUSES, { error: "Invalid status." }).optional(),
  publishedAt: dateField,
  isFeatured: z.boolean().optional(),
  authorId: refId,
  coverMediaId: refId,
});

/* ---------- media / inquiries ---------- */

export const mediaUpdateSchema = z.object({
  altText: text("Alt text", 300),
});

export const inquiryUpdateSchema = z.object({
  status: z.enum(INQUIRY_STATUSES, { error: "Invalid status." }).optional(),
  internalNotes: text("Notes", 5000),
});

/* ---------- company ---------- */

export const companyUpdateSchema = z.object({
  profile: z
    .object({
      name: str("Name", 2, 120).optional(),
      tagline: text("Tagline", 300),
      overview: text("Overview", 20000),
      mission: text("Mission", 20000),
      vision: text("Vision", 20000),
      foundingYear: z.coerce
        .number({ error: "Founding year must be a number." })
        .int("Founding year must be a whole number.")
        .min(1800, "Founding year must be 1800 or later.")
        .max(2200, "Founding year must be 2200 or earlier.")
        .nullish(),
      headquarters: text("Headquarters", 120),
      operatingStatus: text("Operating status", 60),
      contactEmail: z
        .union([z.email("Please provide a valid email address."), z.literal("")])
        .nullish(),
    })
    .optional(),
  principles: z
    .array(
      z.object({
        title: str("Title", 2, 120),
        description: str("Description", 5, 600),
      })
    )
    .max(20, "At most 20 principles are allowed.")
    .optional(),
  milestones: z
    .array(
      z.object({
        year: str("Year", 2, 20),
        title: str("Title", 2, 160),
        description: str("Description", 5, 600),
      })
    )
    .max(50, "At most 50 milestones are allowed.")
    .optional(),
});

/* ---------- users ---------- */

export const userCreateSchema = z.object({
  name: str("Name", 2, 120),
  email: z.email("Please provide a valid email address."),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters.")
    .max(128, "Password must be at most 128 characters."),
  role: z.enum(ADMIN_ROLES, { error: "Invalid role." }),
});

export const userUpdateSchema = z.object({
  name: str("Name", 2, 120).optional(),
  email: z.email("Please provide a valid email address.").optional(),
  role: z.enum(ADMIN_ROLES, { error: "Invalid role." }).optional(),
  status: z.enum(USER_STATUSES, { error: "Invalid status." }).optional(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters.")
    .max(128, "Password must be at most 128 characters.")
    .optional(),
});

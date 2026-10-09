/**
 * ETARNITY — attach generated imagery to seeded entities.
 * Idempotent: creates MediaItems for files in db/uploads and links
 * project/article covers. Run any time: bun scripts-attach-media.ts
 */
import { db } from "./src/lib/db";
import { statSync, existsSync } from "fs";
import path from "path";

const UPLOAD_DIR = path.join(process.cwd(), "db", "uploads");

const ALT: Record<string, string> = {
  "project-corporate.png": "Dark corporate dashboard interface — ETARNITY corporate platform",
  "project-atlas.png": "Design system component cards — Atlas Design System",
  "project-meridian.png": "Minimal e-commerce storefront presentation — Meridian Commerce",
  "project-pulse.png": "Real-time analytics visualization with glowing line charts — Pulse Analytics",
  "article-introducing.png": "Chrome sphere with elliptical orbit ring — ETARNITY brand visual",
  "article-engineering.png": "White technical line drawings on graphite — engineering blueprint",
  "article-ai.png": "Constellation of connected nodes, one glowing — applied AI",
  "article-infrastructure.png": "Dark server racks with status lights — infrastructure",
};

const PROJECT_COVERS: Record<string, string> = {
  "etarnity-corporate-platform": "project-corporate.png",
  "atlas-design-system": "project-atlas.png",
  "meridian-commerce": "project-meridian.png",
  "pulse-analytics": "project-pulse.png",
};

const ARTICLE_COVERS: Record<string, string> = {
  "introducing-etarnity": "article-introducing.png",
  "engineering-for-the-long-term": "article-engineering.png",
  "applied-ai-without-the-hype": "article-ai.png",
  "the-case-for-boring-infrastructure": "article-infrastructure.png",
};

async function ensureMedia(fileName: string): Promise<number | null> {
  const existing = await db.mediaItem.findUnique({ where: { storageKey: fileName } });
  if (existing) return existing.id;
  const full = path.join(UPLOAD_DIR, fileName);
  if (!existsSync(full)) {
    console.warn(`  ! missing file: ${fileName}`);
    return null;
  }
  const row = await db.mediaItem.create({
    data: {
      storageKey: fileName,
      fileName,
      mimeType: "image/png",
      size: statSync(full).size,
      altText: ALT[fileName] ?? fileName,
    },
  });
  console.log(`  + media #${row.id} ${fileName}`);
  return row.id;
}

async function main() {
  console.log("Attaching media to ETARNITY entities…");

  for (const [slug, fileName] of Object.entries(PROJECT_COVERS)) {
    const id = await ensureMedia(fileName);
    if (!id) continue;
    await db.project.update({ where: { slug }, data: { coverMediaId: id } });
    console.log(`  → project ${slug} ← ${fileName}`);
  }

  for (const [slug, fileName] of Object.entries(ARTICLE_COVERS)) {
    const id = await ensureMedia(fileName);
    if (!id) continue;
    await db.article.update({ where: { slug }, data: { coverMediaId: id } });
    console.log(`  → article ${slug} ← ${fileName}`);
  }

  console.log("Done.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { audit, authErrorResponse, requireAdmin } from "@/lib/auth";
import { getCompanyProfile } from "@/lib/queries";
import { has, readJsonBody } from "@/app/api/_lib/http";
import { companyUpdateSchema } from "@/app/api/_lib/schemas";

/** Full company profile (incl. principles + milestones). */
export async function GET(req: Request) {
  try {
    await requireAdmin(req, "VIEWER");
    const profile = await getCompanyProfile();
    return NextResponse.json({ profile });
  } catch (error) {
    return authErrorResponse(error);
  }
}

/**
 * Update the company profile. `principles` / `milestones`, when provided,
 * replace the existing set (displayOrder follows array index). All applied
 * in a single transaction.
 */
export async function PUT(req: Request) {
  try {
    const user = await requireAdmin(req, "CONTENT_MANAGER");

    const parsed = await readJsonBody(req, companyUpdateSchema);
    if (!parsed.ok) return parsed.response;
    const body = parsed.data;
    const { raw } = parsed;

    const profileData: Record<string, string | number | null> = {};
    if (body.profile) {
      const rawProfile =
        typeof raw.profile === "object" && raw.profile !== null
          ? (raw.profile as Record<string, unknown>)
          : {};
      if (body.profile.name !== undefined) profileData.name = body.profile.name;
      if (has(rawProfile, "tagline")) {
        profileData.tagline = body.profile.tagline || null;
      }
      if (has(rawProfile, "overview")) {
        profileData.overview = body.profile.overview || null;
      }
      if (has(rawProfile, "mission")) {
        profileData.mission = body.profile.mission || null;
      }
      if (has(rawProfile, "vision")) {
        profileData.vision = body.profile.vision || null;
      }
      if (has(rawProfile, "foundingYear")) {
        profileData.foundingYear = body.profile.foundingYear ?? null;
      }
      if (has(rawProfile, "headquarters")) {
        profileData.headquarters = body.profile.headquarters || null;
      }
      if (has(rawProfile, "operatingStatus")) {
        profileData.operatingStatus = body.profile.operatingStatus || null;
      }
      if (has(rawProfile, "contactEmail")) {
        profileData.contactEmail = body.profile.contactEmail || null;
      }
    }

    await db.$transaction(async (tx) => {
      if (body.profile && Object.keys(profileData).length > 0) {
        await tx.companyProfile.upsert({
          where: { id: 1 },
          update: profileData,
          create: { id: 1, ...profileData },
        });
      }

      if (has(raw, "principles")) {
        await tx.principle.deleteMany({});
        const principles = body.principles ?? [];
        if (principles.length > 0) {
          await tx.principle.createMany({
            data: principles.map((item, index) => ({
              title: item.title,
              description: item.description,
              displayOrder: index,
            })),
          });
        }
      }

      if (has(raw, "milestones")) {
        await tx.milestone.deleteMany({});
        const milestones = body.milestones ?? [];
        if (milestones.length > 0) {
          await tx.milestone.createMany({
            data: milestones.map((item, index) => ({
              year: item.year,
              title: item.title,
              description: item.description,
              displayOrder: index,
            })),
          });
        }
      }
    });

    await audit(user.id, "company.update", "company", 1);
    const profile = await getCompanyProfile();
    return NextResponse.json({ profile });
  } catch (error) {
    return authErrorResponse(error);
  }
}

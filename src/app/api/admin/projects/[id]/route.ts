import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { audit, authErrorResponse, requireAdmin } from "@/lib/auth";
import { serializeProject } from "@/lib/queries";
import {
  badRequest,
  has,
  isForeignKeyConstraintError,
  isUniqueConstraintError,
  notFound,
  parseId,
  readJsonBody,
} from "@/app/api/_lib/http";
import { projectUpdateSchema } from "@/app/api/_lib/schemas";

/** Partial update. When `galleryMediaIds` is present the whole gallery is
 *  replaced (delete existing assets, then re-create in the given order). */
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAdmin(req, "CONTENT_MANAGER");

    const { id } = await params;
    const numId = parseId(id);
    if (numId === null) return badRequest("Invalid id.");

    const parsed = await readJsonBody(req, projectUpdateSchema);
    if (!parsed.ok) return parsed.response;
    const body = parsed.data;
    const { raw } = parsed;

    const existing = await db.project.findUnique({ where: { id: numId } });
    if (!existing) return notFound("Project not found.");

    const data: {
      title?: string;
      slug?: string;
      summary?: string;
      problem?: string | null;
      solution?: string | null;
      process?: string | null;
      outcomes?: string | null;
      stack?: string;
      category?: string;
      ownershipType?: string;
      projectStatus?: string;
      liveUrl?: string | null;
      isPublished?: boolean;
      isFeatured?: boolean;
      displayOrder?: number;
      coverMediaId?: number | null;
    } = {};

    if (has(raw, "title")) data.title = body.title;
    if (has(raw, "slug")) data.slug = body.slug;
    if (has(raw, "summary")) data.summary = body.summary;
    if (has(raw, "problem")) data.problem = body.problem ?? null;
    if (has(raw, "solution")) data.solution = body.solution ?? null;
    if (has(raw, "process")) data.process = body.process ?? null;
    if (has(raw, "outcomes")) data.outcomes = body.outcomes ?? null;
    if (has(raw, "stack")) data.stack = JSON.stringify(body.stack ?? []);
    if (has(raw, "category")) data.category = body.category;
    if (has(raw, "ownershipType")) data.ownershipType = body.ownershipType;
    if (has(raw, "projectStatus")) data.projectStatus = body.projectStatus;
    if (has(raw, "liveUrl")) data.liveUrl = body.liveUrl || null;
    if (has(raw, "isPublished")) data.isPublished = body.isPublished;
    if (has(raw, "isFeatured")) data.isFeatured = body.isFeatured;
    if (has(raw, "displayOrder")) data.displayOrder = body.displayOrder;
    if (has(raw, "coverMediaId")) data.coverMediaId = body.coverMediaId ?? null;

    const replaceGallery = has(raw, "galleryMediaIds");
    if (Object.keys(data).length === 0 && !replaceGallery) {
      const unchanged = await db.project.findUnique({
        where: { id: numId },
        include: {
          coverMedia: true,
          assets: { include: { media: true } },
        },
      });
      return NextResponse.json(serializeProject(unchanged!));
    }

    try {
      if (replaceGallery) {
        const ids = body.galleryMediaIds ?? [];
        await db.$transaction([
          db.projectAsset.deleteMany({ where: { projectId: numId } }),
          ...(ids.length > 0
            ? [
                db.projectAsset.createMany({
                  data: ids.map((mediaId, index) => ({
                    projectId: numId,
                    mediaId,
                    displayOrder: index,
                  })),
                }),
              ]
            : []),
        ]);
      }

      const updated =
        Object.keys(data).length > 0
          ? await db.project.update({
              where: { id: numId },
              data,
              include: {
                coverMedia: true,
                assets: { include: { media: true } },
              },
            })
          : (await db.project.findUnique({
              where: { id: numId },
              include: {
                coverMedia: true,
                assets: { include: { media: true } },
              },
            }))!;

      await audit(user.id, "project.update", "project", numId);
      return NextResponse.json(serializeProject(updated));
    } catch (e) {
      if (isUniqueConstraintError(e)) return badRequest("Slug is already in use.");
      if (isForeignKeyConstraintError(e)) {
        return badRequest("Referenced media item does not exist.");
      }
      throw e;
    }
  } catch (error) {
    return authErrorResponse(error);
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAdmin(req, "CONTENT_MANAGER");

    const { id } = await params;
    const numId = parseId(id);
    if (numId === null) return badRequest("Invalid id.");

    const existing = await db.project.findUnique({ where: { id: numId } });
    if (!existing) return notFound("Project not found.");

    await db.project.delete({ where: { id: numId } }); // assets cascade
    await audit(user.id, "project.delete", "project", numId);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return authErrorResponse(error);
  }
}

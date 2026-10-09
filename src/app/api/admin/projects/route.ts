import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { audit, authErrorResponse, requireAdmin } from "@/lib/auth";
import { serializeProject } from "@/lib/queries";
import {
  badRequest,
  isForeignKeyConstraintError,
  isUniqueConstraintError,
  readJsonBody,
} from "@/app/api/_lib/http";
import { projectCreateSchema } from "@/app/api/_lib/schemas";

/** All projects (including unpublished), ordered for the admin list. */
export async function GET(req: Request) {
  try {
    await requireAdmin(req, "VIEWER");
    const rows = await db.project.findMany({
      orderBy: [{ displayOrder: "asc" }, { id: "desc" }],
      include: {
        coverMedia: true,
        assets: { include: { media: true } },
      },
    });
    return NextResponse.json(rows.map(serializeProject));
  } catch (error) {
    return authErrorResponse(error);
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireAdmin(req, "CONTENT_MANAGER");

    const parsed = await readJsonBody(req, projectCreateSchema);
    if (!parsed.ok) return parsed.response;
    const body = parsed.data;

    let created;
    try {
      created = await db.project.create({
        data: {
          title: body.title,
          slug: body.slug,
          summary: body.summary,
          problem: body.problem ?? null,
          solution: body.solution ?? null,
          process: body.process ?? null,
          outcomes: body.outcomes ?? null,
          stack: JSON.stringify(body.stack ?? []),
          category: body.category,
          ownershipType: body.ownershipType,
          projectStatus: body.projectStatus,
          liveUrl: body.liveUrl || null,
          isPublished: body.isPublished,
          isFeatured: body.isFeatured,
          displayOrder: body.displayOrder,
          coverMediaId: body.coverMediaId ?? null,
          assets: body.galleryMediaIds?.length
            ? {
                create: body.galleryMediaIds.map((mediaId, index) => ({
                  mediaId,
                  displayOrder: index,
                })),
              }
            : undefined,
        },
        include: {
          coverMedia: true,
          assets: { include: { media: true } },
        },
      });
    } catch (e) {
      if (isUniqueConstraintError(e)) return badRequest("Slug is already in use.");
      if (isForeignKeyConstraintError(e)) {
        return badRequest("Referenced media item does not exist.");
      }
      throw e;
    }

    await audit(user.id, "project.create", "project", created.id);
    return NextResponse.json(serializeProject(created));
  } catch (error) {
    return authErrorResponse(error);
  }
}

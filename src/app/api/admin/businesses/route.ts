import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { audit, authErrorResponse, requireAdmin } from "@/lib/auth";
import { serializeBusiness } from "@/lib/queries";
import {
  badRequest,
  has,
  isForeignKeyConstraintError,
  isUniqueConstraintError,
  readJsonBody,
} from "@/app/api/_lib/http";
import { businessCreateSchema } from "@/app/api/_lib/schemas";

/** All businesses (including unpublished), ordered for the admin list. */
export async function GET(req: Request) {
  try {
    await requireAdmin(req, "VIEWER");
    const rows = await db.business.findMany({
      orderBy: [{ displayOrder: "asc" }, { id: "asc" }],
      include: { logoMedia: true },
    });
    return NextResponse.json(rows.map(serializeBusiness));
  } catch (error) {
    return authErrorResponse(error);
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireAdmin(req, "CONTENT_MANAGER");

    const parsed = await readJsonBody(req, businessCreateSchema);
    if (!parsed.ok) return parsed.response;
    const body = parsed.data;

    let created;
    try {
      created = await db.business.create({
        data: {
          name: body.name,
          slug: body.slug,
          summary: body.summary,
          description: body.description ?? null,
          category: body.category,
          relationshipType: body.relationshipType,
          operationalStatus: body.operationalStatus,
          websiteUrl: body.websiteUrl || null,
          isPublished: body.isPublished,
          isFeatured: body.isFeatured,
          displayOrder: body.displayOrder,
          logoMediaId: body.logoMediaId ?? null,
        },
        include: { logoMedia: true },
      });
    } catch (e) {
      if (isUniqueConstraintError(e)) return badRequest("Slug is already in use.");
      if (isForeignKeyConstraintError(e)) {
        return badRequest("Referenced media item does not exist.");
      }
      throw e;
    }

    await audit(user.id, "business.create", "business", created.id);
    return NextResponse.json(serializeBusiness(created));
  } catch (error) {
    return authErrorResponse(error);
  }
}

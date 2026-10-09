import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { audit, authErrorResponse, requireAdmin } from "@/lib/auth";
import { serializeBusiness } from "@/lib/queries";
import {
  badRequest,
  has,
  isForeignKeyConstraintError,
  isUniqueConstraintError,
  notFound,
  parseId,
  readJsonBody,
} from "@/app/api/_lib/http";
import { businessUpdateSchema } from "@/app/api/_lib/schemas";

/** Partial update — only fields present in the request body are changed. */
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAdmin(req, "CONTENT_MANAGER");

    const { id } = await params;
    const numId = parseId(id);
    if (numId === null) return badRequest("Invalid id.");

    const parsed = await readJsonBody(req, businessUpdateSchema);
    if (!parsed.ok) return parsed.response;
    const body = parsed.data;
    const { raw } = parsed;

    const existing = await db.business.findUnique({ where: { id: numId } });
    if (!existing) return notFound("Business not found.");

    const data: {
      name?: string;
      slug?: string;
      summary?: string;
      description?: string | null;
      category?: string;
      relationshipType?: string;
      operationalStatus?: string;
      websiteUrl?: string | null;
      isPublished?: boolean;
      isFeatured?: boolean;
      displayOrder?: number;
      logoMediaId?: number | null;
    } = {};

    if (has(raw, "name")) data.name = body.name;
    if (has(raw, "slug")) data.slug = body.slug;
    if (has(raw, "summary")) data.summary = body.summary;
    if (has(raw, "description")) data.description = body.description ?? null;
    if (has(raw, "category")) data.category = body.category;
    if (has(raw, "relationshipType")) data.relationshipType = body.relationshipType;
    if (has(raw, "operationalStatus")) data.operationalStatus = body.operationalStatus;
    if (has(raw, "websiteUrl")) data.websiteUrl = body.websiteUrl || null;
    if (has(raw, "isPublished")) data.isPublished = body.isPublished;
    if (has(raw, "isFeatured")) data.isFeatured = body.isFeatured;
    if (has(raw, "displayOrder")) data.displayOrder = body.displayOrder;
    if (has(raw, "logoMediaId")) data.logoMediaId = body.logoMediaId ?? null;

    if (Object.keys(data).length === 0) {
      const unchanged = await db.business.findUnique({
        where: { id: numId },
        include: { logoMedia: true },
      });
      return NextResponse.json(serializeBusiness(unchanged!));
    }

    let updated;
    try {
      updated = await db.business.update({
        where: { id: numId },
        data,
        include: { logoMedia: true },
      });
    } catch (e) {
      if (isUniqueConstraintError(e)) return badRequest("Slug is already in use.");
      if (isForeignKeyConstraintError(e)) {
        return badRequest("Referenced media item does not exist.");
      }
      throw e;
    }

    await audit(user.id, "business.update", "business", numId);
    return NextResponse.json(serializeBusiness(updated));
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

    const existing = await db.business.findUnique({ where: { id: numId } });
    if (!existing) return notFound("Business not found.");

    await db.business.delete({ where: { id: numId } });
    await audit(user.id, "business.delete", "business", numId);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return authErrorResponse(error);
  }
}

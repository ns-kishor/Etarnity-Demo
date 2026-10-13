import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { audit, authErrorResponse, requireAdmin } from "@/lib/auth";
import { serializePerson } from "@/lib/queries";
import {
  badRequest,
  has,
  isForeignKeyConstraintError,
  isUniqueConstraintError,
  notFound,
  parseId,
  readJsonBody,
} from "@/app/api/_lib/http";
import { personUpdateSchema } from "@/app/api/_lib/schemas";

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

    const parsed = await readJsonBody(req, personUpdateSchema);
    if (!parsed.ok) return parsed.response;
    const body = parsed.data;
    const { raw } = parsed;

    const existing = await db.person.findUnique({ where: { id: numId } });
    if (!existing) return notFound("Person not found.");

    const data: {
      name?: string;
      slug?: string;
      position?: string;
      positionAbbr?: string | null;
      cardIntro?: string | null;
      contactEmail?: string | null;
      location?: string | null;
      biography?: string | null;
      department?: string | null;
      responsibilities?: string | null;
      expertise?: string;
      links?: string;
      isFounder?: boolean;
      isPublic?: boolean;
      displayOrder?: number;
      profileMediaId?: number | null;
    } = {};

    if (has(raw, "name")) data.name = body.name;
    if (has(raw, "slug")) data.slug = body.slug;
    if (has(raw, "position")) data.position = body.position;
    if (has(raw, "positionAbbr")) data.positionAbbr = body.positionAbbr || null;
    if (has(raw, "cardIntro")) data.cardIntro = body.cardIntro || null;
    if (has(raw, "contactEmail")) data.contactEmail = body.contactEmail || null;
    if (has(raw, "location")) data.location = body.location || null;
    if (has(raw, "biography")) data.biography = body.biography ?? null;
    if (has(raw, "department")) data.department = body.department ?? null;
    if (has(raw, "responsibilities")) {
      data.responsibilities = body.responsibilities ?? null;
    }
    if (has(raw, "expertise")) {
      data.expertise = JSON.stringify(body.expertise ?? []);
    }
    if (has(raw, "links")) data.links = JSON.stringify(body.links ?? []);
    if (has(raw, "isFounder")) data.isFounder = body.isFounder;
    if (has(raw, "isPublic")) data.isPublic = body.isPublic;
    if (has(raw, "displayOrder")) data.displayOrder = body.displayOrder;
    if (has(raw, "profileMediaId")) {
      data.profileMediaId = body.profileMediaId ?? null;
    }

    if (Object.keys(data).length === 0) {
      const unchanged = await db.person.findUnique({
        where: { id: numId },
        include: { profileMedia: true },
      });
      return NextResponse.json(serializePerson(unchanged!));
    }

    let updated;
    try {
      updated = await db.person.update({
        where: { id: numId },
        data,
        include: { profileMedia: true },
      });
    } catch (e) {
      if (isUniqueConstraintError(e)) return badRequest("Slug is already in use.");
      if (isForeignKeyConstraintError(e)) {
        return badRequest("Referenced media item does not exist.");
      }
      throw e;
    }

    await audit(user.id, "person.update", "person", numId);
    return NextResponse.json(serializePerson(updated));
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

    const existing = await db.person.findUnique({ where: { id: numId } });
    if (!existing) return notFound("Person not found.");

    await db.person.delete({ where: { id: numId } });
    await audit(user.id, "person.delete", "person", numId);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return authErrorResponse(error);
  }
}

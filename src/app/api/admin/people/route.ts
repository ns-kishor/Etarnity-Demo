import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { audit, authErrorResponse, requireAdmin } from "@/lib/auth";
import { serializePerson } from "@/lib/queries";
import {
  badRequest,
  isForeignKeyConstraintError,
  isUniqueConstraintError,
  readJsonBody,
} from "@/app/api/_lib/http";
import { personCreateSchema } from "@/app/api/_lib/schemas";

/** All people (including non-public), ordered for the admin list. */
export async function GET(req: Request) {
  try {
    await requireAdmin(req, "VIEWER");
    const rows = await db.person.findMany({
      orderBy: [{ displayOrder: "asc" }, { id: "asc" }],
      include: { profileMedia: true },
    });
    return NextResponse.json(rows.map(serializePerson));
  } catch (error) {
    return authErrorResponse(error);
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireAdmin(req, "CONTENT_MANAGER");

    const parsed = await readJsonBody(req, personCreateSchema);
    if (!parsed.ok) return parsed.response;
    const body = parsed.data;

    let created;
    try {
      created = await db.person.create({
        data: {
          name: body.name,
          slug: body.slug,
          position: body.position,
          positionAbbr: body.positionAbbr || null,
          cardIntro: body.cardIntro || null,
          contactEmail: body.contactEmail || null,
          location: body.location || null,
          biography: body.biography ?? null,
          department: body.department ?? null,
          responsibilities: body.responsibilities ?? null,
          expertise: JSON.stringify(body.expertise ?? []),
          links: JSON.stringify(body.links ?? []),
          isFounder: body.isFounder,
          isPublic: body.isPublic,
          displayOrder: body.displayOrder,
          profileMediaId: body.profileMediaId ?? null,
        },
        include: { profileMedia: true },
      });
    } catch (e) {
      if (isUniqueConstraintError(e)) return badRequest("Slug is already in use.");
      if (isForeignKeyConstraintError(e)) {
        return badRequest("Referenced media item does not exist.");
      }
      throw e;
    }

    await audit(user.id, "person.create", "person", created.id);
    return NextResponse.json(serializePerson(created));
  } catch (error) {
    return authErrorResponse(error);
  }
}

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { audit, authErrorResponse, requireAdmin } from "@/lib/auth";
import { deleteUpload } from "@/lib/storage";
import {
  badRequest,
  has,
  notFound,
  parseId,
  readJsonBody,
  serializeMedia,
} from "@/app/api/_lib/http";
import { mediaUpdateSchema } from "@/app/api/_lib/schemas";

/** Update alt text. */
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAdmin(req, "CONTENT_MANAGER");

    const { id } = await params;
    const numId = parseId(id);
    if (numId === null) return badRequest("Invalid id.");

    const parsed = await readJsonBody(req, mediaUpdateSchema);
    if (!parsed.ok) return parsed.response;
    const body = parsed.data;
    const { raw } = parsed;

    const existing = await db.mediaItem.findUnique({ where: { id: numId } });
    if (!existing) return notFound("Media not found.");

    const data: { altText?: string | null } = {};
    if (has(raw, "altText")) data.altText = body.altText || null;

    const updated =
      Object.keys(data).length > 0
        ? await db.mediaItem.update({ where: { id: numId }, data })
        : existing;

    await audit(user.id, "media.update", "media", numId);
    return NextResponse.json(serializeMedia(updated));
  } catch (error) {
    return authErrorResponse(error);
  }
}

/** Remove the file from disk and the row from the DB. */
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAdmin(req, "CONTENT_MANAGER");

    const { id } = await params;
    const numId = parseId(id);
    if (numId === null) return badRequest("Invalid id.");

    const existing = await db.mediaItem.findUnique({ where: { id: numId } });
    if (!existing) return notFound("Media not found.");

    await db.mediaItem.delete({ where: { id: numId } });
    await deleteUpload(existing.storageKey);
    await audit(user.id, "media.delete", "media", numId);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return authErrorResponse(error);
  }
}

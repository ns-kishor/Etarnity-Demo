import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { audit, authErrorResponse, requireAdmin } from "@/lib/auth";
import { serializeArticle } from "@/lib/queries";
import {
  badRequest,
  has,
  isForeignKeyConstraintError,
  isUniqueConstraintError,
  notFound,
  parseId,
  readJsonBody,
} from "@/app/api/_lib/http";
import { articleUpdateSchema } from "@/app/api/_lib/schemas";

/**
 * Partial update. Transition rule: when status is set to PUBLISHED and the
 * effective publication date (body value, else the stored value) is null,
 * publishedAt is stamped with the current time.
 */
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAdmin(req, "CONTENT_MANAGER");

    const { id } = await params;
    const numId = parseId(id);
    if (numId === null) return badRequest("Invalid id.");

    const parsed = await readJsonBody(req, articleUpdateSchema);
    if (!parsed.ok) return parsed.response;
    const body = parsed.data;
    const { raw } = parsed;

    const existing = await db.article.findUnique({ where: { id: numId } });
    if (!existing) return notFound("Article not found.");

    const data: {
      title?: string;
      slug?: string;
      summary?: string;
      body?: string;
      category?: string;
      status?: string;
      publishedAt?: Date | null;
      isFeatured?: boolean;
      authorId?: number | null;
      coverMediaId?: number | null;
    } = {};

    if (has(raw, "title")) data.title = body.title;
    if (has(raw, "slug")) data.slug = body.slug;
    if (has(raw, "summary")) data.summary = body.summary;
    if (has(raw, "body")) data.body = body.body;
    if (has(raw, "category")) data.category = body.category;
    if (has(raw, "status")) data.status = body.status;
    if (has(raw, "isFeatured")) data.isFeatured = body.isFeatured;
    if (has(raw, "authorId")) data.authorId = body.authorId ?? null;
    if (has(raw, "coverMediaId")) data.coverMediaId = body.coverMediaId ?? null;

    if (has(raw, "publishedAt")) {
      data.publishedAt = body.publishedAt ?? null;
    }
    if (body.status === "PUBLISHED") {
      const candidate = has(raw, "publishedAt")
        ? data.publishedAt
        : existing.publishedAt;
      if (!candidate) {
        data.publishedAt = new Date();
      }
    }

    if (Object.keys(data).length === 0) {
      const unchanged = await db.article.findUnique({
        where: { id: numId },
        include: { author: true, coverMedia: true },
      });
      return NextResponse.json(serializeArticle(unchanged!));
    }

    let updated;
    try {
      updated = await db.article.update({
        where: { id: numId },
        data,
        include: { author: true, coverMedia: true },
      });
    } catch (e) {
      if (isUniqueConstraintError(e)) return badRequest("Slug is already in use.");
      if (isForeignKeyConstraintError(e)) {
        return badRequest("Referenced record does not exist.");
      }
      throw e;
    }

    await audit(user.id, "article.update", "article", numId);
    return NextResponse.json(serializeArticle(updated));
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

    const existing = await db.article.findUnique({ where: { id: numId } });
    if (!existing) return notFound("Article not found.");

    await db.article.delete({ where: { id: numId } });
    await audit(user.id, "article.delete", "article", numId);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return authErrorResponse(error);
  }
}

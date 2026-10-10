import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { audit, authErrorResponse, requireAdmin } from "@/lib/auth";
import { serializeArticle } from "@/lib/queries";
import {
  badRequest,
  isForeignKeyConstraintError,
  isUniqueConstraintError,
  readJsonBody,
} from "@/app/api/_lib/http";
import { articleCreateSchema } from "@/app/api/_lib/schemas";

/** All articles, any status, newest first. */
export async function GET(req: Request) {
  try {
    await requireAdmin(req, "VIEWER");
    const rows = await db.article.findMany({
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      include: { author: true, coverMedia: true },
    });
    return NextResponse.json(rows.map(serializeArticle));
  } catch (error) {
    return authErrorResponse(error);
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireAdmin(req, "CONTENT_MANAGER");

    const parsed = await readJsonBody(req, articleCreateSchema);
    if (!parsed.ok) return parsed.response;
    const body = parsed.data;

    // Publishing without an explicit date stamps "now".
    let publishedAt = body.publishedAt ?? null;
    if (body.status === "PUBLISHED" && !publishedAt) {
      publishedAt = new Date();
    }

    let created;
    try {
      created = await db.article.create({
        data: {
          title: body.title,
          slug: body.slug,
          summary: body.summary,
          body: body.body,
          category: body.category,
          status: body.status,
          publishedAt,
          isFeatured: body.isFeatured,
          authorId: body.authorId ?? null,
          coverMediaId: body.coverMediaId ?? null,
        },
        include: { author: true, coverMedia: true },
      });
    } catch (e) {
      if (isUniqueConstraintError(e)) return badRequest("Slug is already in use.");
      if (isForeignKeyConstraintError(e)) {
        return badRequest("Referenced record does not exist.");
      }
      throw e;
    }

    await audit(user.id, "article.create", "article", created.id);
    return NextResponse.json(serializeArticle(created));
  } catch (error) {
    return authErrorResponse(error);
  }
}

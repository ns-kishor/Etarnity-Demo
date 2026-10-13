import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { audit, authErrorResponse, requireAdmin } from "@/lib/auth";
import {
  badRequest,
  has,
  notFound,
  parseId,
  readJsonBody,
} from "@/app/api/_lib/http";
import { problemUpdateSchema } from "@/app/api/_lib/schemas";

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

    const parsed = await readJsonBody(req, problemUpdateSchema);
    if (!parsed.ok) return parsed.response;
    const body = parsed.data;
    const { raw } = parsed;

    const existing = await db.problemPair.findUnique({ where: { id: numId } });
    if (!existing) return notFound("Problem pair not found.");

    const data: {
      problemTitle?: string;
      problemDesc?: string;
      solutionTitle?: string;
      solutionDesc?: string;
      displayOrder?: number;
      isActive?: boolean;
    } = {};

    if (has(raw, "problemTitle")) data.problemTitle = body.problemTitle;
    if (has(raw, "problemDesc")) data.problemDesc = body.problemDesc;
    if (has(raw, "solutionTitle")) data.solutionTitle = body.solutionTitle;
    if (has(raw, "solutionDesc")) data.solutionDesc = body.solutionDesc;
    if (has(raw, "displayOrder")) data.displayOrder = body.displayOrder;
    if (has(raw, "isActive")) data.isActive = body.isActive;

    const updated =
      Object.keys(data).length === 0
        ? existing
        : await db.problemPair.update({ where: { id: numId }, data });

    await audit(user.id, "problem.update", "problem_pair", numId);
    return NextResponse.json(updated);
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

    const existing = await db.problemPair.findUnique({ where: { id: numId } });
    if (!existing) return notFound("Problem pair not found.");

    await db.problemPair.delete({ where: { id: numId } });
    await audit(user.id, "problem.delete", "problem_pair", numId);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return authErrorResponse(error);
  }
}

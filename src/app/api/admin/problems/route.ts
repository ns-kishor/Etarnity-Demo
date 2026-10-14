import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { audit, authErrorResponse, requireAdmin } from "@/lib/auth";
import { readJsonBody } from "@/app/api/_lib/http";
import { problemCreateSchema } from "@/app/api/_lib/schemas";

/** All problem pairs (including inactive), ordered. */
export async function GET(req: Request) {
  try {
    await requireAdmin(req, "VIEWER");
    const rows = await db.problemPair.findMany({
      orderBy: [{ displayOrder: "asc" }, { id: "asc" }],
    });
    return NextResponse.json(rows);
  } catch (error) {
    return authErrorResponse(error);
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireAdmin(req, "CONTENT_MANAGER");

    const parsed = await readJsonBody(req, problemCreateSchema);
    if (!parsed.ok) return parsed.response;
    const body = parsed.data;

    const created = await db.problemPair.create({
      data: {
        problemTitle: body.problemTitle,
        problemDesc: body.problemDesc,
        solutionTitle: body.solutionTitle,
        solutionDesc: body.solutionDesc,
        displayOrder: body.displayOrder,
        isActive: body.isActive,
      },
    });

    await audit(user.id, "problem.create", "problem_pair", created.id);
    return NextResponse.json(created);
  } catch (error) {
    return authErrorResponse(error);
  }
}

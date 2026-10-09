import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { audit, authErrorResponse, requireAdmin } from "@/lib/auth";
import { hashPassword } from "@/lib/password";
import {
  badRequest,
  has,
  isUniqueConstraintError,
  notFound,
  parseId,
  readJsonBody,
  serializeUser,
} from "@/app/api/_lib/http";
import { userUpdateSchema } from "@/app/api/_lib/schemas";

/** Partial update — only fields present in the request body are changed. */
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const actor = await requireAdmin(req, "SUPER_ADMIN");

    const { id } = await params;
    const numId = parseId(id);
    if (numId === null) return badRequest("Invalid id.");

    const parsed = await readJsonBody(req, userUpdateSchema);
    if (!parsed.ok) return parsed.response;
    const body = parsed.data;
    const { raw } = parsed;

    const existing = await db.user.findUnique({
      where: { id: numId },
      include: { role: true },
    });
    if (!existing) return notFound("User not found.");

    const data: {
      name?: string;
      email?: string;
      roleId?: number;
      status?: string;
      passwordHash?: string;
    } = {};

    if (has(raw, "name")) data.name = body.name;
    if (has(raw, "email")) data.email = body.email;
    if (has(raw, "status")) data.status = body.status;
    if (has(raw, "password")) data.passwordHash = hashPassword(body.password!);
    if (has(raw, "role")) {
      const role = await db.role.findUnique({ where: { name: body.role! } });
      if (!role) {
        return NextResponse.json(
          { error: "Role not found. Please seed roles first." },
          { status: 500 }
        );
      }
      data.roleId = role.id;
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json(serializeUser(existing));
    }

    let updated;
    try {
      updated = await db.user.update({
        where: { id: numId },
        data,
        include: { role: true },
      });
    } catch (e) {
      if (isUniqueConstraintError(e)) {
        return badRequest("A user with this email already exists.");
      }
      throw e;
    }

    await audit(actor.id, "user.update", "user", numId);
    return NextResponse.json(serializeUser(updated));
  } catch (error) {
    return authErrorResponse(error);
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const actor = await requireAdmin(req, "SUPER_ADMIN");

    const { id } = await params;
    const numId = parseId(id);
    if (numId === null) return badRequest("Invalid id.");

    if (numId === actor.id) {
      return badRequest("You cannot delete your own account.");
    }

    const existing = await db.user.findUnique({ where: { id: numId } });
    if (!existing) return notFound("User not found.");

    await db.user.delete({ where: { id: numId } }); // sessions cascade
    await audit(actor.id, "user.delete", "user", numId);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return authErrorResponse(error);
  }
}

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { audit, authErrorResponse, requireAdmin } from "@/lib/auth";
import { hashPassword } from "@/lib/password";
import {
  badRequest,
  isUniqueConstraintError,
  readJsonBody,
  serializeUser,
} from "@/app/api/_lib/http";
import { userCreateSchema } from "@/app/api/_lib/schemas";

/** All admin users (never exposes password hashes). SUPER_ADMIN only. */
export async function GET(req: Request) {
  try {
    await requireAdmin(req, "SUPER_ADMIN");
    const rows = await db.user.findMany({
      orderBy: { id: "asc" },
      include: { role: true },
    });
    return NextResponse.json(rows.map(serializeUser));
  } catch (error) {
    return authErrorResponse(error);
  }
}

export async function POST(req: Request) {
  try {
    const actor = await requireAdmin(req, "SUPER_ADMIN");

    const parsed = await readJsonBody(req, userCreateSchema);
    if (!parsed.ok) return parsed.response;
    const body = parsed.data;

    const role = await db.role.findUnique({ where: { name: body.role } });
    if (!role) {
      return NextResponse.json(
        { error: "Role not found. Please seed roles first." },
        { status: 500 }
      );
    }

    let created;
    try {
      created = await db.user.create({
        data: {
          name: body.name,
          email: body.email,
          passwordHash: hashPassword(body.password),
          roleId: role.id,
          status: "ACTIVE",
        },
        include: { role: true },
      });
    } catch (e) {
      if (isUniqueConstraintError(e)) {
        return badRequest("A user with this email already exists.");
      }
      throw e;
    }

    await audit(actor.id, "user.create", "user", created.id);
    return NextResponse.json(serializeUser(created));
  } catch (error) {
    return authErrorResponse(error);
  }
}

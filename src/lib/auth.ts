import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { db } from "./db";
import { generateToken } from "./password";
import type { AdminRole } from "./types";

/**
 * Session-based admin authentication.
 * - Sessions are stored in DB; token lives in an httpOnly cookie.
 * - Mutations require a same-origin Origin header (CSRF defense) + SameSite=Lax.
 */

export const SESSION_COOKIE = "etarnity_session";
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

const ROLE_RANK: Record<AdminRole, number> = {
  SUPER_ADMIN: 4,
  CONTENT_MANAGER: 3,
  BUSINESS_MANAGER: 3,
  VIEWER: 1,
};

export interface SessionUser {
  id: number;
  name: string;
  email: string;
  role: AdminRole;
  status: string;
}

export async function createSession(userId: number): Promise<string> {
  const token = generateToken(32);
  await db.session.create({
    data: {
      token,
      userId,
      expiresAt: new Date(Date.now() + SESSION_TTL_MS),
    },
  });
  return token;
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const session = await db.session.findUnique({
    where: { token },
    include: {
      user: { include: { role: true } },
    },
  });

  if (!session) return null;
  if (session.expiresAt < new Date()) {
    await db.session.delete({ where: { id: session.id } }).catch(() => {});
    return null;
  }
  if (session.user.status !== "ACTIVE") return null;

  return {
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
    role: session.user.role.name as AdminRole,
    status: session.user.status,
  };
}

export async function destroySession(): Promise<void> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) {
    await db.session.deleteMany({ where: { token } });
  }
}

/* ---------- Route guards ---------- */

export class AuthError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

function sameOrigin(req: Request): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return true; // non-browser / same-origin GETs may omit it
  try {
    const host = req.headers.get("host");
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

/**
 * Require an authenticated admin for an API route.
 * `minRole` enforces coarse role rank; specific permission checks
 * live in each route (server-side, never client-side).
 */
export async function requireAdmin(
  req: Request,
  minRole: AdminRole = "VIEWER"
): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) throw new AuthError(401, "Authentication required.");

  const method = req.method.toUpperCase();
  if (method !== "GET" && !sameOrigin(req)) {
    throw new AuthError(403, "Cross-origin request rejected.");
  }

  if (ROLE_RANK[user.role] < ROLE_RANK[minRole]) {
    throw new AuthError(403, "Insufficient permissions.");
  }
  return user;
}

/** Standard error response helper. */
export function authErrorResponse(error: unknown): NextResponse {
  if (error instanceof AuthError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }
  console.error("[admin-api]", error);
  return NextResponse.json(
    { error: "Internal server error." },
    { status: 500 }
  );
}

/** Write an audit log entry (best-effort). */
export async function audit(
  actorId: number | null,
  action: string,
  entityType: string,
  entityId?: string | number | null
): Promise<void> {
  await db.auditLog
    .create({
      data: {
        actorId,
        action,
        entityType,
        entityId: entityId != null ? String(entityId) : null,
      },
    })
    .catch(() => {});
}

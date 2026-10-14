import { NextResponse } from "next/server";
import type { MediaItem, Role, User } from "@prisma/client";
import type { z } from "zod";
import type { AdminUser, MediaItem as MediaItemType } from "@/lib/types";

/**
 * Shared request/response helpers for API route handlers.
 * (Private folder — the leading underscore keeps Next from routing it.)
 */

export function jsonError(message: string, status: number): NextResponse {
  return NextResponse.json({ error: message }, { status });
}

export function badRequest(message: string): NextResponse {
  return jsonError(message, 400);
}

export function notFound(message: string): NextResponse {
  return jsonError(message, 404);
}

/** 429 with `retryAfterSeconds` in the body and a `Retry-After` header. */
export function tooManyRequests(
  message: string,
  retryAfterSeconds: number
): NextResponse {
  return NextResponse.json(
    { error: message, retryAfterSeconds },
    { status: 429, headers: { "Retry-After": String(retryAfterSeconds) } }
  );
}

export type BodyResult<T> =
  | { ok: true; data: T; raw: Record<string, unknown> }
  | { ok: false; response: NextResponse };

/**
 * Parse + validate a JSON request body.
 * - Unparseable JSON → 400 { error: "Invalid request body." }
 * - Schema violation → 400 { error: <first zod issue message> }
 * Returns the parsed data plus the *raw* JSON object so partial-update
 * handlers can distinguish "field absent" from "field provided as null".
 */
export async function readJsonBody<S extends z.ZodType>(
  req: Request,
  schema: S
): Promise<BodyResult<z.infer<S>>> {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return { ok: false, response: badRequest("Invalid request body.") };
  }
  const result = schema.safeParse(json);
  if (!result.success) {
    return {
      ok: false,
      response: badRequest(
        result.error.issues[0]?.message ?? "Validation failed."
      ),
    };
  }
  const raw =
    typeof json === "object" && json !== null && !Array.isArray(json)
      ? (json as Record<string, unknown>)
      : {};
  return { ok: true, data: result.data, raw };
}

/** True when `key` was present in the original request JSON body. */
export function has(raw: Record<string, unknown>, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(raw, key);
}

/** Parse a numeric route param. Returns null for non-integer / non-positive. */
export function parseId(value: string): number | null {
  const n = Number(value);
  if (!Number.isInteger(n) || n < 1) return null;
  return n;
}

/** Prisma unique-constraint violation (slug / email already exists). */
export function isUniqueConstraintError(e: unknown): boolean {
  return (
    typeof e === "object" &&
    e !== null &&
    (e as { code?: string }).code === "P2002"
  );
}

/** Prisma foreign-key violation (e.g. media id that does not exist). */
export function isForeignKeyConstraintError(e: unknown): boolean {
  return (
    typeof e === "object" &&
    e !== null &&
    (e as { code?: string }).code === "P2003"
  );
}

/** MediaItem DB row → public MediaItem shape (url points at /api/media/:id). */
export function serializeMedia(row: MediaItem): MediaItemType {
  return {
    id: row.id,
    url: `/api/media/${row.id}`,
    fileName: row.fileName,
    mimeType: row.mimeType,
    size: row.size,
    altText: row.altText,
    createdAt: row.createdAt.toISOString(),
  };
}

/** User DB row (with role) → AdminUser shape. Never exposes passwordHash. */
export function serializeUser(row: User & { role: Role }): AdminUser {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role.name as AdminUser["role"],
    status: row.status as AdminUser["status"],
    createdAt: row.createdAt.toISOString(),
  };
}

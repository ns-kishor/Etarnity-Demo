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
import { inquiryUpdateSchema } from "@/app/api/_lib/schemas";
import type { ContactInquiry } from "@/lib/types";

function serializeInquiry(row: {
  id: number;
  name: string;
  email: string;
  organization: string | null;
  inquiryType: string;
  subject: string;
  message: string;
  status: string;
  internalNotes: string | null;
  createdAt: Date;
}): ContactInquiry {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    organization: row.organization,
    inquiryType: row.inquiryType as ContactInquiry["inquiryType"],
    subject: row.subject,
    message: row.message,
    status: row.status as ContactInquiry["status"],
    internalNotes: row.internalNotes,
    createdAt: row.createdAt.toISOString(),
  };
}

/** Update inquiry status / internal notes. */
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAdmin(req, "CONTENT_MANAGER");

    const { id } = await params;
    const numId = parseId(id);
    if (numId === null) return badRequest("Invalid id.");

    const parsed = await readJsonBody(req, inquiryUpdateSchema);
    if (!parsed.ok) return parsed.response;
    const body = parsed.data;
    const { raw } = parsed;

    const existing = await db.contactInquiry.findUnique({
      where: { id: numId },
    });
    if (!existing) return notFound("Inquiry not found.");

    const data: { status?: string; internalNotes?: string | null } = {};
    if (has(raw, "status")) data.status = body.status;
    if (has(raw, "internalNotes")) {
      data.internalNotes = body.internalNotes || null;
    }

    const updated =
      Object.keys(data).length > 0
        ? await db.contactInquiry.update({ where: { id: numId }, data })
        : existing;

    await audit(user.id, "inquiry.update", "inquiry", numId);
    return NextResponse.json(serializeInquiry(updated));
  } catch (error) {
    return authErrorResponse(error);
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAdmin(req, "SUPER_ADMIN");

    const { id } = await params;
    const numId = parseId(id);
    if (numId === null) return badRequest("Invalid id.");

    const existing = await db.contactInquiry.findUnique({
      where: { id: numId },
    });
    if (!existing) return notFound("Inquiry not found.");

    await db.contactInquiry.delete({ where: { id: numId } });
    await audit(user.id, "inquiry.delete", "inquiry", numId);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return authErrorResponse(error);
  }
}

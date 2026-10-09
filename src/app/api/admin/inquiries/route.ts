import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { authErrorResponse, requireAdmin } from "@/lib/auth";
import type { ContactInquiry } from "@/lib/types";

/** All contact inquiries, newest first. */
export async function GET(req: Request) {
  try {
    await requireAdmin(req, "CONTENT_MANAGER");
    const rows = await db.contactInquiry.findMany({
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    });
    const inquiries: ContactInquiry[] = rows.map((row) => ({
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
    }));
    return NextResponse.json(inquiries);
  } catch (error) {
    return authErrorResponse(error);
  }
}

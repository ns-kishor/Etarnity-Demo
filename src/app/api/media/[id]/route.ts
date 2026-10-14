import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { readUpload } from "@/lib/storage";
import { badRequest, notFound } from "@/app/api/_lib/http";

/**
 * Public media file stream from db/uploads.
 * Immutable caching — storage keys are write-once, so ids never change file.
 * SVGs get a restrictive CSP to neutralize any embedded scripting.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const numId = Number(id);
    if (!Number.isInteger(numId) || numId < 1) {
      return badRequest("Invalid media id.");
    }

    const item = await db.mediaItem.findUnique({ where: { id: numId } });
    if (!item) {
      return notFound("Media not found.");
    }

    let buffer: Buffer;
    try {
      buffer = await readUpload(item.storageKey);
    } catch {
      return notFound("Media not found.");
    }

    const headers: Record<string, string> = {
      "Content-Type": item.mimeType,
      "Cache-Control": "public, max-age=31536000, immutable",
    };
    if (item.mimeType.includes("svg")) {
      headers["Content-Security-Policy"] = "script-src 'none'; sandbox";
    }

    return new NextResponse(new Uint8Array(buffer), { headers });
  } catch (error) {
    console.error("[api/media/[id]]", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

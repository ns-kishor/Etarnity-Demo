import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { audit, authErrorResponse, requireAdmin } from "@/lib/auth";
import { isAllowedMimeType, saveUpload } from "@/lib/storage";
import { badRequest, serializeMedia } from "@/app/api/_lib/http";

const MAX_ALT_TEXT = 300;

/** All media items, newest first. */
export async function GET(req: Request) {
  try {
    await requireAdmin(req, "VIEWER");
    const rows = await db.mediaItem.findMany({
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    });
    return NextResponse.json(rows.map(serializeMedia));
  } catch (error) {
    return authErrorResponse(error);
  }
}

/** Multipart upload: field "file" (required) + "altText" (optional). */
export async function POST(req: Request) {
  try {
    const user = await requireAdmin(req, "CONTENT_MANAGER");

    let form: FormData;
    try {
      form = await req.formData();
    } catch {
      return badRequest("Invalid form data.");
    }

    const file = form.get("file");
    if (!(file instanceof File)) {
      return badRequest("No file provided.");
    }

    const altTextRaw = form.get("altText");
    const altText =
      typeof altTextRaw === "string" && altTextRaw.trim() !== ""
        ? altTextRaw
        : null;
    if (altText !== null && altText.length > MAX_ALT_TEXT) {
      return badRequest("Alt text must be at most 300 characters.");
    }

    if (!isAllowedMimeType(file.type)) {
      return badRequest(
        "Only PNG, JPEG, WebP, GIF or SVG images are allowed."
      );
    }

    let stored: { storageKey: string; size: number };
    try {
      stored = await saveUpload(file);
    } catch (e) {
      const message = e instanceof Error ? e.message : "";
      if (
        message === "File exceeds 5 MB limit." ||
        message === "Unsupported file type."
      ) {
        return badRequest(message);
      }
      throw e;
    }

    const row = await db.mediaItem.create({
      data: {
        storageKey: stored.storageKey,
        fileName: file.name || "upload",
        mimeType: file.type,
        size: stored.size,
        altText,
        uploadedById: user.id,
      },
    });

    await audit(user.id, "media.upload", "media", row.id);
    return NextResponse.json(serializeMedia(row));
  } catch (error) {
    return authErrorResponse(error);
  }
}

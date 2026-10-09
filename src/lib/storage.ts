import { mkdir, readFile, writeFile, unlink } from "fs/promises";
import path from "path";
import { generateToken } from "./password";

/**
 * Media storage — files live in db/uploads, referenced by MediaItem.storageKey.
 * Served through GET /api/media/[id] with validated content types.
 */

const UPLOAD_DIR = path.join(process.cwd(), "db", "uploads");

const ALLOWED_TYPES: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/svg+xml": "svg",
};

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024; // 5 MB

export function isAllowedMimeType(mime: string): boolean {
  return mime in ALLOWED_TYPES;
}

/** Persist an uploaded file buffer; returns { storageKey, size }. */
export async function saveUpload(
  file: File
): Promise<{ storageKey: string; size: number }> {
  const ext = ALLOWED_TYPES[file.type];
  if (!ext) throw new Error("Unsupported file type.");
  if (file.size > MAX_UPLOAD_BYTES) throw new Error("File exceeds 5 MB limit.");

  const buffer = Buffer.from(await file.arrayBuffer());
  await mkdir(UPLOAD_DIR, { recursive: true });

  const storageKey = `${Date.now()}-${generateToken(8)}.${ext}`;
  await writeFile(path.join(UPLOAD_DIR, storageKey), buffer);

  return { storageKey, size: buffer.length };
}

/** Read a stored file by key. */
export async function readUpload(storageKey: string): Promise<Buffer> {
  // Prevent path traversal — storage keys must be plain filenames
  if (!/^[a-zA-Z0-9._-]+$/.test(storageKey)) {
    throw new Error("Invalid storage key.");
  }
  return readFile(path.join(UPLOAD_DIR, storageKey));
}

export async function deleteUpload(storageKey: string): Promise<void> {
  if (!/^[a-zA-Z0-9._-]+$/.test(storageKey)) return;
  try {
    await unlink(path.join(UPLOAD_DIR, storageKey));
  } catch {
    /* already gone — fine */
  }
}

/**
 * Register a pre-existing file that was placed directly into db/uploads
 * (used by the seed script for generated imagery).
 */
export function externalKey(fileName: string): string {
  return fileName;
}

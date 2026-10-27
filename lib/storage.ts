import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { del, put } from "@vercel/blob";

/**
 * Where uploaded photos are stored (the "public" disk of the Laravel app):
 *
 * - BLOB_READ_WRITE_TOKEN is set: Vercel Blob, the stored value is the file's full URL.
 * - Otherwise, only outside Vercel: public/uploads, the stored value is "/uploads/<file>".
 */
const LOCAL_FOLDER = path.join(process.cwd(), "public", "uploads");

export class UploadsNotConfiguredError extends Error {
  constructor() {
    super("Uploads are not set up yet: connect a Vercel Blob store to this project.");
  }
}

export function canStoreUploads(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN) || !process.env.VERCEL;
}

export async function storeImage(file: File): Promise<string> {
  const extension = path.extname(file.name).toLowerCase() || ".jpg";
  const fileName = `${randomUUID()}${extension}`;

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(`photos/${fileName}`, file, { access: "public", contentType: file.type });
    return blob.url;
  }

  // The file system of a Vercel function is read-only, so uploads there need Blob
  if (process.env.VERCEL) {
    throw new UploadsNotConfiguredError();
  }

  await mkdir(LOCAL_FOLDER, { recursive: true });
  await writeFile(path.join(LOCAL_FOLDER, fileName), Buffer.from(await file.arrayBuffer()));
  return `/uploads/${fileName}`;
}

/**
 * Delete an uploaded file. Seeded sample images and external links are left alone.
 */
export async function deleteImage(imagePath: string): Promise<void> {
  if (isBlobUrl(imagePath)) {
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      await del(imagePath);
    }
    return;
  }

  if (imagePath.startsWith("/uploads/")) {
    await unlink(path.join(LOCAL_FOLDER, path.basename(imagePath))).catch(() => {});
  }
}

export function isUploadedImage(imagePath: string): boolean {
  return isBlobUrl(imagePath) || imagePath.startsWith("/uploads/");
}

function isBlobUrl(imagePath: string): boolean {
  return /^https:\/\/[^/]+\.blob\.vercel-storage\.com\//.test(imagePath);
}

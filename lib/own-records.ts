import { eq } from "drizzle-orm";
import { forbidden, notFound } from "next/navigation";
import { getDb } from "@/db";
import { photos, weddingFolders, type Photo, type User, type WeddingFolder } from "@/db/schema";
import { ownsFolder } from "@/lib/folders";
import { ownsPhoto } from "@/lib/photos";
import { routeId } from "@/lib/validation";

/**
 * Load a folder from the URL for its owner: 404 when it does not exist, 403 for anyone else
 * (route model binding + Gate::authorize in Laravel).
 */
export async function ownFolderOrFail(user: User, id: string): Promise<WeddingFolder> {
  const folderId = routeId(id);
  const db = await getDb();
  const folder = folderId ? await db.query.weddingFolders.findFirst({ where: eq(weddingFolders.id, folderId) }) : null;

  if (!folder) {
    notFound();
  }
  if (!ownsFolder(user, folder)) {
    forbidden();
  }

  return folder;
}

export async function ownPhotoOrFail(user: User, id: string): Promise<Photo> {
  const photoId = routeId(id);
  const db = await getDb();
  const photo = photoId ? await db.query.photos.findFirst({ where: eq(photos.id, photoId) }) : null;

  if (!photo) {
    notFound();
  }
  if (!ownsPhoto(user, photo)) {
    forbidden();
  }

  return photo;
}

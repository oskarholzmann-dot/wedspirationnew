import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { getDb } from "@/db";
import { photos, users, weddingFolders } from "@/db/schema";
import { routeId } from "@/lib/validation";

/**
 * Load a record from the admin URL, or show 404 (route model binding in Laravel).
 */
export async function photoOrFail(id: string) {
  const photoId = routeId(id);
  const db = await getDb();
  const photo = photoId
    ? await db.query.photos.findFirst({
        where: eq(photos.id, photoId),
        with: { user: true, subcategory: true, folderPhotos: { with: { folder: true } } },
      })
    : undefined;

  return photo ?? notFound();
}

export async function userOrFail(id: string) {
  const userId = routeId(id);
  const db = await getDb();
  const user = userId
    ? await db.query.users.findFirst({ where: eq(users.id, userId), with: { folders: true } })
    : undefined;

  return user ?? notFound();
}

export async function folderOrFail(id: string) {
  const folderId = routeId(id);
  const db = await getDb();
  const folder = folderId
    ? await db.query.weddingFolders.findFirst({
        where: eq(weddingFolders.id, folderId),
        with: { user: true, folderPhotos: { with: { photo: true } } },
      })
    : undefined;

  return folder ?? notFound();
}

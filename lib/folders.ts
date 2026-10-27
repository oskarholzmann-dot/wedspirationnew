import { and, asc, eq, inArray } from "drizzle-orm";
import type { Database } from "@/db";
import { folderPhoto, photos, weddingFolders, type WeddingFolder } from "@/db/schema";
import { deletePhoto } from "@/lib/photos";

/**
 * The user's main wedding folder (their oldest), created when they have none yet.
 */
export async function defaultFolder(db: Database, user: { id: number; name: string }): Promise<WeddingFolder> {
  const existing = await db.query.weddingFolders.findFirst({
    where: eq(weddingFolders.userId, user.id),
    orderBy: asc(weddingFolders.id),
  });

  if (existing) {
    return existing;
  }

  const [created] = await db
    .insert(weddingFolders)
    .values({ userId: user.id, name: `${user.name}'s wedding` })
    .returning();

  return created;
}

/**
 * Ids of the photos in the user's main folder (used to mark photos as saved).
 */
export async function savedPhotoIds(db: Database, userId: number): Promise<number[]> {
  const folder = await db.query.weddingFolders.findFirst({
    where: eq(weddingFolders.userId, userId),
    orderBy: asc(weddingFolders.id),
    columns: { id: true },
  });

  if (!folder) {
    return [];
  }

  const rows = await db
    .select({ photoId: folderPhoto.photoId })
    .from(folderPhoto)
    .where(eq(folderPhoto.folderId, folder.id));

  return rows.map((row) => row.photoId);
}

/**
 * Save any public photo into the user's own folder. The photo itself is not copied:
 * only a row in folder_photo is added, and the uploader stays its owner.
 * Saving the same photo twice changes nothing.
 */
export async function savePhotoToFolder(
  db: Database,
  user: { id: number; name: string },
  photoId: number,
): Promise<WeddingFolder> {
  const folder = await defaultFolder(db, user);
  await db.insert(folderPhoto).values({ folderId: folder.id, photoId }).onConflictDoNothing();
  return folder;
}

/**
 * Remove a photo from the user's folder. The photo itself stays in the gallery.
 */
export async function removePhotoFromFolder(
  db: Database,
  user: { id: number; name: string },
  photoId: number,
): Promise<WeddingFolder> {
  const folder = await defaultFolder(db, user);
  await db
    .delete(folderPhoto)
    .where(and(eq(folderPhoto.folderId, folder.id), eq(folderPhoto.photoId, photoId)));
  return folder;
}

/**
 * Delete the folder together with the photos the owner uploaded into it.
 * Photos saved from other couples only lose the link; they stay with their owners.
 * Returns how many photos were deleted.
 */
export async function deleteFolderWithOwnUploads(db: Database, folder: WeddingFolder): Promise<number> {
  const ownUploads = await db
    .select({ photo: photos })
    .from(photos)
    .innerJoin(folderPhoto, eq(folderPhoto.photoId, photos.id))
    .where(and(eq(folderPhoto.folderId, folder.id), eq(photos.userId, folder.userId)));

  for (const { photo } of ownUploads) {
    await deletePhoto(db, photo);
  }

  await db.delete(weddingFolders).where(eq(weddingFolders.id, folder.id));

  return ownUploads.length;
}

/**
 * Delete several folders; with withPhotos also the photos their owners uploaded into them.
 */
export async function deleteFolders(
  db: Database,
  folderIds: number[],
  withPhotos: boolean,
): Promise<{ folders: number; photos: number }> {
  if (folderIds.length === 0) {
    return { folders: 0, photos: 0 };
  }

  const folders = await db.select().from(weddingFolders).where(inArray(weddingFolders.id, folderIds));
  let deletedPhotos = 0;

  for (const folder of folders) {
    if (withPhotos) {
      deletedPhotos += await deleteFolderWithOwnUploads(db, folder);
    } else {
      await db.delete(weddingFolders).where(eq(weddingFolders.id, folder.id));
    }
  }

  return { folders: folders.length, photos: deletedPhotos };
}

/**
 * Only the owner may view, edit or delete a folder in the user zone (WeddingFolderPolicy).
 */
export function ownsFolder(user: { id: number } | null, folder: { userId: number }): boolean {
  return user !== null && folder.userId === user.id;
}

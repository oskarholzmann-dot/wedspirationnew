import { eq } from "drizzle-orm";
import type { Database } from "@/db";
import { folderPhoto, photos, type Photo } from "@/db/schema";
import { defaultFolder } from "@/lib/folders";
import { deleteImage } from "@/lib/storage";

export type NewPhotoData = {
  title: string;
  description: string | null;
  category: string | null;
  subcategoryId?: number | null;
  imagePath: string;
  imageWidth: number;
  imageHeight: number;
};

/**
 * Store a new photo for the owner and add it to their main folder.
 */
export async function createPhotoForOwner(
  db: Database,
  owner: { id: number; name: string },
  data: NewPhotoData,
): Promise<{ photo: Photo; folderId: number }> {
  const [photo] = await db
    .insert(photos)
    .values({ ...data, userId: owner.id })
    .returning();

  const folder = await defaultFolder(db, owner);
  await db.insert(folderPhoto).values({ folderId: folder.id, photoId: photo.id }).onConflictDoNothing();

  return { photo, folderId: folder.id };
}

/**
 * Delete the photo together with its uploaded image file.
 */
export async function deletePhoto(db: Database, photo: Pick<Photo, "id" | "imagePath">): Promise<void> {
  await deleteImage(photo.imagePath);
  await db.delete(photos).where(eq(photos.id, photo.id));
}

/**
 * Only the uploader may edit or delete a photo in the user zone (PhotoPolicy).
 */
export function ownsPhoto(user: { id: number } | null, photo: { userId: number }): boolean {
  return user !== null && photo.userId === user.id;
}

/**
 * A title from the file name when none was given: "peony-bouquet.jpg" becomes "Peony bouquet".
 */
export function titleFromFileName(fileName: string): string {
  const name = fileName
    .replace(/\.[^.]+$/, "")
    .replace(/[-_]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 255);

  return name.charAt(0).toUpperCase() + name.slice(1);
}

"use server";

import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { photos } from "@/db/schema";
import { currentUser } from "@/lib/auth-user";
import { removePhotoFromFolder, savePhotoToFolder } from "@/lib/folders";
import { deletePhoto, ownsPhoto } from "@/lib/photos";

/**
 * The buttons on the photo tiles and in the lightbox call these without reloading the page.
 * The tiles update themselves; other pages show the change the next time they are opened.
 */

export async function setPhotoSaved(
  photoId: number,
  saved: boolean,
): Promise<{ saved: boolean; message: string } | { error: string }> {
  const user = await currentUser();
  if (!user) {
    return { error: "Please log in to save photos." };
  }

  const db = await getDb();
  const photo = await db.query.photos.findFirst({ where: eq(photos.id, photoId), columns: { id: true } });
  if (!photo) {
    return { error: "This photo no longer exists." };
  }

  const folder = saved ? await savePhotoToFolder(db, user, photo.id) : await removePhotoFromFolder(db, user, photo.id);

  return { saved, message: saved ? `Saved to ${folder.name}.` : `Removed from ${folder.name}.` };
}

export async function deletePhotoFromTile(photoId: number): Promise<{ deleted: true } | { error: string }> {
  const user = await currentUser();
  const db = await getDb();
  const photo = await db.query.photos.findFirst({ where: eq(photos.id, photoId) });

  if (!photo) {
    return { error: "This photo no longer exists." };
  }

  // Admins may delete any photo; everyone else only their own (PhotoPolicy)
  if (!user || !(user.isAdmin || ownsPhoto(user, photo))) {
    return { error: "You may not delete this photo." };
  }

  await deletePhoto(db, photo);

  return { deleted: true };
}

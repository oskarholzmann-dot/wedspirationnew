"use server";

import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { getDb } from "@/db";
import { photos, users, weddingFolders } from "@/db/schema";
import { signOut } from "@/auth";
import { requireUser } from "@/lib/auth-user";
import { flash } from "@/lib/flash";
import { deleteFolderWithOwnUploads, ownsFolder } from "@/lib/folders";
import { plural } from "@/lib/format";
import { createPhotoForOwner, deletePhoto, ownsPhoto, titleFromFileName } from "@/lib/photos";
import { deleteImage, storeImage, UploadsNotConfiguredError } from "@/lib/storage";
import { readUploadedImage } from "@/lib/uploads";
import { checkPassword, deleteUserWithFiles, findUserByEmail, hashPassword } from "@/lib/users";
import {
  fieldError,
  invalid,
  photoFieldsSchema,
  profileSchema,
  updatePasswordSchema,
  userFolderFieldsSchema,
  type FormState,
} from "@/lib/validation";

/**
 * Upload one photo into the user's folder. The upload page sends one request per photo,
 * so many photos together never hit the size limit of a single request.
 */
export async function uploadPhoto(
  formData: FormData,
): Promise<{ ok: true; folderId: number } | { ok: false; error: string }> {
  const user = await requireUser();

  const uploaded = readUploadedImage(formData, { required: true });
  if ("error" in uploaded) {
    return { ok: false, error: uploaded.error };
  }
  const image = uploaded.image!;

  // Without a title, use the file name: "peony-bouquet.jpg" becomes "Peony bouquet"
  const title = String(formData.get("title") ?? "").trim() || titleFromFileName(image.file.name);

  const parsed = photoFieldsSchema.safeParse({ ...Object.fromEntries(formData), title });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0].message };
  }

  let imagePath: string;
  try {
    imagePath = await storeImage(image.file);
  } catch (error) {
    if (error instanceof UploadsNotConfiguredError) {
      return { ok: false, error: error.message };
    }
    throw error;
  }

  const db = await getDb();
  const { folderId } = await createPhotoForOwner(db, user, {
    ...parsed.data,
    imagePath,
    imageWidth: image.width,
    imageHeight: image.height,
  });

  return { ok: true, folderId };
}

/**
 * Called once after the last photo of an upload, to show the message on the folder page.
 */
export async function finishUpload(folderId: number, count: number): Promise<void> {
  await requireUser();
  await flash(count === 1 ? "Your photo was uploaded." : "Your photos were uploaded.");
  redirect(`/folders/${folderId}`);
}

async function findOwnPhoto(photoId: number) {
  const user = await requireUser();
  const db = await getDb();
  const photo = await db.query.photos.findFirst({ where: eq(photos.id, photoId) });

  if (!photo || !ownsPhoto(user, photo)) {
    throw new Error("You may not change this photo.");
  }

  return { db, photo };
}

/**
 * Update the photo, and replace the image file when a new one was uploaded.
 */
export async function updatePhoto(photoId: number, _state: FormState, formData: FormData): Promise<FormState> {
  const { db, photo } = await findOwnPhoto(photoId);

  const parsed = photoFieldsSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return invalid(parsed.error, formData);
  }

  const uploaded = readUploadedImage(formData, { required: false });
  if ("error" in uploaded) {
    return fieldError("image", uploaded.error, formData);
  }

  const changes: Partial<typeof photos.$inferInsert> = parsed.data;
  if (uploaded.image) {
    try {
      changes.imagePath = await storeImage(uploaded.image.file);
    } catch (error) {
      if (error instanceof UploadsNotConfiguredError) {
        return fieldError("image", error.message, formData);
      }
      throw error;
    }
    changes.imageWidth = uploaded.image.width;
    changes.imageHeight = uploaded.image.height;
    await deleteImage(photo.imagePath);
  }

  await db.update(photos).set(changes).where(eq(photos.id, photo.id));

  await flash("Your photo was updated.");
  redirect(`/gallery/${photo.id}`);
}

export async function deleteOwnPhoto(photoId: number): Promise<void> {
  const { db, photo } = await findOwnPhoto(photoId);

  await deletePhoto(db, photo);

  await flash("Your photo was deleted.");
  redirect("/dashboard");
}

async function findOwnFolder(folderId: number) {
  const user = await requireUser();
  const db = await getDb();
  const folder = await db.query.weddingFolders.findFirst({ where: eq(weddingFolders.id, folderId) });

  if (!folder || !ownsFolder(user, folder)) {
    throw new Error("You may not change this folder.");
  }

  return { db, folder };
}

/**
 * Save the folder's name, wedding date and notes.
 */
export async function updateFolder(folderId: number, _state: FormState, formData: FormData): Promise<FormState> {
  const { db, folder } = await findOwnFolder(folderId);

  const parsed = userFolderFieldsSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return invalid(parsed.error, formData);
  }

  await db
    .update(weddingFolders)
    .set({ name: parsed.data.name, notes: parsed.data.notes, weddingDate: parsed.data.wedding_date })
    .where(eq(weddingFolders.id, folder.id));

  await flash("Your folder was updated.");
  redirect(`/folders/${folder.id}`);
}

/**
 * Delete the folder together with the photos the owner uploaded into it.
 */
export async function deleteFolder(folderId: number): Promise<void> {
  const { db, folder } = await findOwnFolder(folderId);

  const deletedPhotos = await deleteFolderWithOwnUploads(db, folder);

  await flash(`Your folder and ${plural(deletedPhotos, "uploaded photo")} were deleted.`);
  redirect("/dashboard");
}

export async function updateProfile(_state: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser();

  const parsed = profileSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return invalid(parsed.error, formData);
  }

  const db = await getDb();
  const owner = await findUserByEmail(db, parsed.data.email);
  if (owner && owner.id !== user.id) {
    return fieldError("email", "The email has already been taken.", formData);
  }

  await db.update(users).set(parsed.data).where(eq(users.id, user.id));

  return { message: "Saved.", values: parsed.data };
}

export async function updatePassword(_state: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser();

  const parsed = updatePasswordSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return invalid(parsed.error);
  }

  if (!(await checkPassword(parsed.data.current_password, user.password))) {
    return fieldError("current_password", "The password is incorrect.");
  }

  const db = await getDb();
  await db
    .update(users)
    .set({ password: await hashPassword(parsed.data.password) })
    .where(eq(users.id, user.id));

  return { message: "Saved." };
}

export async function deleteAccount(_state: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser();

  const password = String(formData.get("password") ?? "");
  if (!(await checkPassword(password, user.password))) {
    return fieldError("password", "The password is incorrect.");
  }

  await deleteUserWithFiles(await getDb(), user.id);
  await signOut({ redirectTo: "/" });

  return {};
}

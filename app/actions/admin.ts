"use server";

import { eq, inArray } from "drizzle-orm";
import { redirect } from "next/navigation";
import { getDb } from "@/db";
import { photos, subcategories, users, weddingFolders } from "@/db/schema";
import { requireAdmin } from "@/lib/auth-user";
import { flash } from "@/lib/flash";
import { deleteFolders } from "@/lib/folders";
import { plural } from "@/lib/format";
import { createPhotoForOwner, deletePhoto } from "@/lib/photos";
import { deleteImage, storeImage, UploadsNotConfiguredError } from "@/lib/storage";
import { readUploadedImage } from "@/lib/uploads";
import { createUserWithFolder, deleteUserWithFiles, findUserByEmail, hashPassword } from "@/lib/users";
import {
  adminPhotoFieldsSchema,
  adminUserSchema,
  fieldError,
  folderFieldsSchema,
  idsFrom,
  invalid,
  passwordSchema,
  subcategorySchema,
  type FormState,
} from "@/lib/validation";

/*
 * Admin actions. The /admin pages already require an admin, but server actions can be
 * called directly, so every action checks it again with requireAdmin().
 */

async function existingSubcategoryId(id: number | null): Promise<boolean> {
  if (id === null) {
    return true;
  }
  const db = await getDb();
  return Boolean(await db.query.subcategories.findFirst({ where: eq(subcategories.id, id) }));
}

async function findOwner(formData: FormData) {
  const id = Number(formData.get("user_id"));
  if (!Number.isInteger(id) || id <= 0) {
    return null;
  }
  const db = await getDb();
  return (await db.query.users.findFirst({ where: eq(users.id, id) })) ?? null;
}

async function storeUploadedImage(formData: FormData, required: boolean) {
  const uploaded = readUploadedImage(formData, { required });
  if ("error" in uploaded) {
    return { error: uploaded.error };
  }
  if (!uploaded.image) {
    return { image: null };
  }

  try {
    const path = await storeImage(uploaded.image.file);
    return { image: { path, width: uploaded.image.width, height: uploaded.image.height } };
  } catch (error) {
    if (error instanceof UploadsNotConfiguredError) {
      return { error: error.message };
    }
    throw error;
  }
}

/* Photos */

export async function adminCreatePhoto(_state: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();

  const parsed = adminPhotoFieldsSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return invalid(parsed.error, formData);
  }

  const owner = await findOwner(formData);
  if (!owner) {
    return fieldError("user_id", "The owner field is required.", formData);
  }
  if (!(await existingSubcategoryId(parsed.data.subcategory_id))) {
    return fieldError("subcategory_id", "The selected subcategory is invalid.", formData);
  }

  const stored = await storeUploadedImage(formData, true);
  if ("error" in stored) {
    return fieldError("image", stored.error!, formData);
  }

  const { subcategory_id: subcategoryId, ...fields } = parsed.data;
  const { photo } = await createPhotoForOwner(await getDb(), owner, {
    ...fields,
    subcategoryId,
    imagePath: stored.image!.path,
    imageWidth: stored.image!.width,
    imageHeight: stored.image!.height,
  });

  await flash("The photo was created.");
  redirect(`/admin/photos/${photo.id}`);
}

export async function adminUpdatePhoto(photoId: number, _state: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const db = await getDb();
  const photo = await db.query.photos.findFirst({ where: eq(photos.id, photoId) });
  if (!photo) {
    redirect("/admin/photos");
  }

  const parsed = adminPhotoFieldsSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return invalid(parsed.error, formData);
  }
  if (!(await existingSubcategoryId(parsed.data.subcategory_id))) {
    return fieldError("subcategory_id", "The selected subcategory is invalid.", formData);
  }

  const stored = await storeUploadedImage(formData, false);
  if ("error" in stored) {
    return fieldError("image", stored.error!, formData);
  }

  const { subcategory_id: subcategoryId, ...fields } = parsed.data;
  const changes: Partial<typeof photos.$inferInsert> = { ...fields, subcategoryId };
  if (stored.image) {
    changes.imagePath = stored.image.path;
    changes.imageWidth = stored.image.width;
    changes.imageHeight = stored.image.height;
    await deleteImage(photo.imagePath);
  }

  await db.update(photos).set(changes).where(eq(photos.id, photo.id));

  await flash("The photo was updated.");
  redirect(`/admin/photos/${photo.id}`);
}

export async function adminDeletePhoto(photoId: number): Promise<void> {
  await requireAdmin();
  const db = await getDb();
  const photo = await db.query.photos.findFirst({ where: eq(photos.id, photoId) });

  if (photo) {
    await deletePhoto(db, photo);
  }

  await flash("The photo was deleted.");
  redirect("/admin/photos");
}

/**
 * Delete several photos at once (the ticked checkboxes in the list), image files included.
 */
export async function adminBulkDeletePhotos(_state: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();

  const ids = idsFrom(formData, "photos");
  if (ids.length === 0) {
    return fieldError("photos", "Tick at least one photo to delete.");
  }

  const db = await getDb();
  const selected = await db.select().from(photos).where(inArray(photos.id, ids));
  for (const photo of selected) {
    await deletePhoto(db, photo);
  }

  await flash(`${plural(selected.length, "photo")} deleted.`);
  redirect("/admin/photos");
}

/* Subcategories (created and deleted right in the gallery) */

export async function createSubcategory(_state: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();

  const parsed = subcategorySchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return invalid(parsed.error, formData);
  }

  const db = await getDb();
  if (await db.query.subcategories.findFirst({ where: eq(subcategories.name, parsed.data.name) })) {
    return fieldError("name", "The subcategory name has already been taken.", formData);
  }

  const [subcategory] = await db.insert(subcategories).values(parsed.data).returning();

  await flash(`Subcategory "${subcategory.name}" created. Sort photos into it when you edit them in the admin.`);
  redirect(`/gallery?subcategory=${subcategory.id}`);
}

/**
 * Delete a subcategory. Its photos stay in the gallery, just without a subcategory.
 */
export async function deleteSubcategory(subcategoryId: number): Promise<void> {
  await requireAdmin();
  const db = await getDb();
  const [deleted] = await db.delete(subcategories).where(eq(subcategories.id, subcategoryId)).returning();

  if (deleted) {
    await flash(`Subcategory "${deleted.name}" deleted. Its photos are still in the gallery.`);
  }
  redirect("/gallery");
}

/* Users */

async function emailTakenByOther(email: string, userId?: number): Promise<boolean> {
  const owner = await findUserByEmail(await getDb(), email);
  return Boolean(owner && owner.id !== userId);
}

export async function adminCreateUser(_state: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();

  const parsed = adminUserSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return invalid(parsed.error, formData);
  }

  const password = passwordSchema.safeParse(parsed.data.password ?? "");
  if (!password.success) {
    return fieldError("password", password.error.issues[0].message, formData);
  }
  if (await emailTakenByOther(parsed.data.email)) {
    return fieldError("email", "The email has already been taken.", formData);
  }

  const user = await createUserWithFolder(await getDb(), { ...parsed.data, password: password.data });

  await flash("The user was created.");
  redirect(`/admin/users/${user.id}`);
}

/**
 * Update the user. An empty password field keeps the current password.
 */
export async function adminUpdateUser(userId: number, _state: FormState, formData: FormData): Promise<FormState> {
  const admin = await requireAdmin();

  const parsed = adminUserSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return invalid(parsed.error, formData);
  }
  if (await emailTakenByOther(parsed.data.email, userId)) {
    return fieldError("email", "The email has already been taken.", formData);
  }

  const changes: Partial<typeof users.$inferInsert> = { name: parsed.data.name, email: parsed.data.email };

  if (parsed.data.password) {
    const password = passwordSchema.safeParse(parsed.data.password);
    if (!password.success) {
      return fieldError("password", password.error.issues[0].message, formData);
    }
    changes.password = await hashPassword(password.data);
  }

  // Admins cannot take away their own admin rights, so they can't lock themselves out
  if (userId !== admin.id) {
    changes.isAdmin = parsed.data.is_admin;
  }

  await (await getDb()).update(users).set(changes).where(eq(users.id, userId));

  await flash("The user was updated.");
  redirect(`/admin/users/${userId}`);
}

/**
 * Delete the user together with their folders, photos and image files.
 */
export async function adminDeleteUser(userId: number): Promise<void> {
  const admin = await requireAdmin();

  if (userId === admin.id) {
    await flash("You cannot delete your own account here.");
    redirect(`/admin/users/${userId}`);
  }

  await deleteUserWithFiles(await getDb(), userId);

  await flash("The user was deleted.");
  redirect("/admin/users");
}

/* Folders */

export async function adminCreateFolder(_state: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();

  const parsed = folderFieldsSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return invalid(parsed.error, formData);
  }

  const owner = await findOwner(formData);
  if (!owner) {
    return fieldError("user_id", "The owner field is required.", formData);
  }

  const [folder] = await (await getDb())
    .insert(weddingFolders)
    .values({
      userId: owner.id,
      name: parsed.data.name,
      notes: parsed.data.notes,
      weddingDate: parsed.data.wedding_date,
    })
    .returning();

  await flash("The folder was created.");
  redirect(`/admin/folders/${folder.id}`);
}

export async function adminUpdateFolder(folderId: number, _state: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();

  const parsed = folderFieldsSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return invalid(parsed.error, formData);
  }

  await (await getDb())
    .update(weddingFolders)
    .set({ name: parsed.data.name, notes: parsed.data.notes, weddingDate: parsed.data.wedding_date })
    .where(eq(weddingFolders.id, folderId));

  await flash("The folder was updated.");
  redirect(`/admin/folders/${folderId}`);
}

/**
 * Delete the folder. Its photos stay in the gallery.
 */
export async function adminDeleteFolder(folderId: number): Promise<void> {
  await requireAdmin();
  await deleteFolders(await getDb(), [folderId], false);

  await flash("The folder was deleted.");
  redirect("/admin/folders");
}

/**
 * Delete several folders at once; optionally also the photos their owners uploaded into them.
 */
export async function adminBulkDeleteFolders(_state: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();

  const ids = idsFrom(formData, "folders");
  if (ids.length === 0) {
    return fieldError("folders", "Tick at least one folder to delete.");
  }

  const withPhotos = formData.get("with_photos") === "1";
  const result = await deleteFolders(await getDb(), ids, withPhotos);

  await flash(
    `${plural(result.folders, "folder")} deleted${withPhotos ? ` together with ${plural(result.photos, "photo")}` : ""}.`,
  );
  redirect("/admin/folders");
}

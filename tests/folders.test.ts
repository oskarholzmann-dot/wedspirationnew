import { beforeEach, describe, expect, it } from "vitest";
import { eq } from "drizzle-orm";
import type { Database } from "@/db";
import { photos, weddingFolders } from "@/db/schema";
import {
  defaultFolder,
  deleteFolderWithOwnUploads,
  deleteFolders,
  ownsFolder,
  removePhotoFromFolder,
  savePhotoToFolder,
  savedPhotoIds,
} from "@/lib/folders";
import { createFolder, createPhoto, createUser, freshDatabase } from "./helpers";

let db: Database;

beforeEach(async () => {
  db = await freshDatabase();
});

describe("defaultFolder", () => {
  it("creates a folder named after the user when they have none", async () => {
    const user = await createUser(db, { name: "Anna" });

    const folder = await defaultFolder(db, user);

    expect(folder.name).toBe("Anna's wedding");
    expect(folder.userId).toBe(user.id);
  });

  it("returns the oldest folder when the user has several", async () => {
    const user = await createUser(db);
    const first = await createFolder(db, user.id, "First");
    await createFolder(db, user.id, "Second");

    expect((await defaultFolder(db, user)).id).toBe(first.id);
  });
});

describe("saving photos", () => {
  it("saves another couple's photo once, even when saved twice, and removes it again", async () => {
    const owner = await createUser(db);
    const photo = await createPhoto(db, owner.id);
    const saver = await createUser(db);

    await savePhotoToFolder(db, saver, photo.id);
    await savePhotoToFolder(db, saver, photo.id);
    expect(await savedPhotoIds(db, saver.id)).toEqual([photo.id]);

    await removePhotoFromFolder(db, saver, photo.id);
    expect(await savedPhotoIds(db, saver.id)).toEqual([]);

    // The photo itself stays in the gallery
    expect(await db.query.photos.findFirst({ where: eq(photos.id, photo.id) })).toBeDefined();
  });
});

describe("deleting folders", () => {
  it("deletes the owner's own uploads but keeps photos saved from other couples", async () => {
    const owner = await createUser(db);
    const folder = await createFolder(db, owner.id);
    const ownPhoto = await createPhoto(db, owner.id, folder.id);

    const otherCouple = await createUser(db);
    const savedPhoto = await createPhoto(db, otherCouple.id, folder.id);

    const deleted = await deleteFolderWithOwnUploads(db, folder);

    expect(deleted).toBe(1);
    expect(await db.query.weddingFolders.findFirst({ where: eq(weddingFolders.id, folder.id) })).toBeUndefined();
    expect(await db.query.photos.findFirst({ where: eq(photos.id, ownPhoto.id) })).toBeUndefined();
    expect(await db.query.photos.findFirst({ where: eq(photos.id, savedPhoto.id) })).toBeDefined();
  });

  it("bulk deletes folders and keeps their photos unless asked otherwise", async () => {
    const owner = await createUser(db);
    const folder = await createFolder(db, owner.id);
    const photo = await createPhoto(db, owner.id, folder.id);

    const result = await deleteFolders(db, [folder.id], false);

    expect(result).toEqual({ folders: 1, photos: 0 });
    expect(await db.query.photos.findFirst({ where: eq(photos.id, photo.id) })).toBeDefined();
  });
});

describe("ownsFolder", () => {
  it("only lets the owner manage a folder", () => {
    expect(ownsFolder({ id: 1 }, { userId: 1 })).toBe(true);
    expect(ownsFolder({ id: 2 }, { userId: 1 })).toBe(false);
    expect(ownsFolder(null, { userId: 1 })).toBe(false);
  });
});

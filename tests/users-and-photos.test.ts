import { beforeEach, describe, expect, it } from "vitest";
import { eq } from "drizzle-orm";
import type { Database } from "@/db";
import { photos, users, weddingFolders } from "@/db/schema";
import { seedDatabase } from "@/db/seed";
import { createPhotoForOwner, ownsPhoto, titleFromFileName } from "@/lib/photos";
import { checkPassword, createUserWithFolder, deleteUserWithFiles, findUserByEmail } from "@/lib/users";
import { savedPhotoIds } from "@/lib/folders";
import { createUser, freshDatabase } from "./helpers";

let db: Database;

beforeEach(async () => {
  db = await freshDatabase();
});

describe("users", () => {
  it("creates a user with a hashed password and a wedding folder", async () => {
    const user = await createUserWithFolder(db, { name: "Mia", email: "Mia@Example.com", password: "secret123" });

    expect(user.email).toBe("mia@example.com");
    expect(user.password).not.toBe("secret123");
    expect(await checkPassword("secret123", user.password)).toBe(true);
    expect(await db.query.weddingFolders.findFirst({ where: eq(weddingFolders.userId, user.id) })).toBeDefined();
    expect(await findUserByEmail(db, "MIA@example.com")).toBeDefined();
  });

  it("deletes the user together with their folders and photos", async () => {
    const user = await createUserWithFolder(db, { name: "Lena", email: "lena@example.com", password: "secret123" });
    await createPhotoForOwner(db, user, {
      title: "Bouquet",
      description: null,
      category: "flowers",
      imagePath: "/images/seed/flowers-1.jpg",
      imageWidth: 1200,
      imageHeight: 900,
    });

    await deleteUserWithFiles(db, user.id);

    expect(await db.query.users.findFirst({ where: eq(users.id, user.id) })).toBeUndefined();
    expect(await db.query.photos.findFirst({ where: eq(photos.userId, user.id) })).toBeUndefined();
    expect(await db.query.weddingFolders.findFirst({ where: eq(weddingFolders.userId, user.id) })).toBeUndefined();
  });
});

describe("photos", () => {
  it("adds a new photo to the owner's folder", async () => {
    const owner = await createUser(db, { name: "Ben" });

    const { photo, folderId } = await createPhotoForOwner(db, owner, {
      title: "Veil",
      description: null,
      category: null,
      imagePath: "/uploads/veil.jpg",
      imageWidth: 800,
      imageHeight: 1200,
    });

    expect(await savedPhotoIds(db, owner.id)).toEqual([photo.id]);
    expect((await db.query.weddingFolders.findFirst({ where: eq(weddingFolders.id, folderId) }))?.name).toBe(
      "Ben's wedding",
    );
  });

  it("only lets the uploader manage a photo", () => {
    expect(ownsPhoto({ id: 1 }, { userId: 1 })).toBe(true);
    expect(ownsPhoto({ id: 2 }, { userId: 1 })).toBe(false);
    expect(ownsPhoto(null, { userId: 1 })).toBe(false);
  });

  it("turns a file name into a title", () => {
    expect(titleFromFileName("peony-bouquet.jpg")).toBe("Peony bouquet");
    expect(titleFromFileName("golden__hour   shot.JPEG")).toBe("Golden hour shot");
  });
});

describe("seeder", () => {
  it("creates the admin and the test couple with sample photos", async () => {
    await seedDatabase(db);

    const admin = await findUserByEmail(db, "admin@admin.com");
    expect(admin?.isAdmin).toBe(true);
    expect(await checkPassword("password", admin!.password)).toBe(true);
    expect((await findUserByEmail(db, "couple@example.com"))?.isAdmin).toBe(false);
    expect((await db.select().from(photos)).length).toBeGreaterThanOrEqual(20);
  });
});

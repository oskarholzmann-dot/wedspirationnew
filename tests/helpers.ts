import { createPgliteDatabase, type Database } from "@/db";
import { folderPhoto, photos, users, weddingFolders } from "@/db/schema";

/**
 * A fresh, empty in-memory Postgres with all migrations (like RefreshDatabase in Pest).
 */
export function freshDatabase(): Promise<Database> {
  return createPgliteDatabase(undefined, { seed: false });
}

let nextNumber = 1;

export async function createUser(db: Database, overrides: Partial<typeof users.$inferInsert> = {}) {
  const number = nextNumber++;
  const [user] = await db
    .insert(users)
    .values({ name: `User ${number}`, email: `user${number}@example.com`, password: "hash", ...overrides })
    .returning();
  return user;
}

export async function createFolder(db: Database, userId: number, name = "Our wedding") {
  const [folder] = await db.insert(weddingFolders).values({ userId, name }).returning();
  return folder;
}

export async function createPhoto(db: Database, userId: number, folderId?: number) {
  const [photo] = await db
    .insert(photos)
    .values({ userId, title: `Photo ${nextNumber++}`, imagePath: "/images/seed/ceremony-1.jpg" })
    .returning();

  if (folderId) {
    await db.insert(folderPhoto).values({ folderId, photoId: photo.id });
  }

  return photo;
}

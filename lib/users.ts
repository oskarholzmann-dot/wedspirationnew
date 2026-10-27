import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import type { Database } from "@/db";
import { photos, users, type User } from "@/db/schema";
import { defaultFolder } from "@/lib/folders";
import { deleteImage } from "@/lib/storage";

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export function checkPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Create a user and give them their wedding folder right away.
 */
export async function createUserWithFolder(
  db: Database,
  data: { name: string; email: string; password: string; isAdmin?: boolean },
): Promise<User> {
  const [user] = await db
    .insert(users)
    .values({
      name: data.name,
      email: data.email.toLowerCase(),
      password: await hashPassword(data.password),
      isAdmin: data.isAdmin ?? false,
    })
    .returning();

  await defaultFolder(db, user);

  return user;
}

/**
 * Delete the user. The database removes their folders and photos (cascade),
 * but not the uploaded image files, so those are deleted first.
 */
export async function deleteUserWithFiles(db: Database, userId: number): Promise<void> {
  const ownPhotos = await db
    .select({ imagePath: photos.imagePath })
    .from(photos)
    .where(eq(photos.userId, userId));

  for (const photo of ownPhotos) {
    await deleteImage(photo.imagePath);
  }

  await db.delete(users).where(eq(users.id, userId));
}

export async function findUserByEmail(db: Database, email: string): Promise<User | undefined> {
  return db.query.users.findFirst({ where: eq(users.email, email.toLowerCase()) });
}

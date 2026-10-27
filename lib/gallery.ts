import { and, count, desc, eq, inArray, type SQL } from "drizzle-orm";
import type { Database } from "@/db";
import { folderPhoto, photos, users, type Photo, type User } from "@/db/schema";
import { categoryLabel } from "@/lib/categories";
import { ownsPhoto } from "@/lib/photos";

export const PER_PAGE = 24;

export type PhotoWithOwner = Photo & { ownerName: string };

/**
 * What a photo tile needs, ready to be sent to the browser.
 */
export type PhotoCardData = {
  id: number;
  title: string;
  category: string | null;
  imageUrl: string;
  width: number;
  height: number;
  ownerName: string;
  canDelete: boolean;
};

const photoWithOwner = { photo: photos, ownerName: users.name };

/**
 * Newest first. Photos uploaded in the same second are ordered by id, so the order never jumps around.
 */
const newestFirst = [desc(photos.createdAt), desc(photos.id)];

/**
 * One page of photos with their owner's name, optionally filtered (category, subcategory, folder).
 */
export async function paginatedPhotos(
  db: Database,
  { where, folderId, page, perPage = PER_PAGE }: { where?: SQL; folderId?: number; page: number; perPage?: number },
): Promise<{ items: PhotoWithOwner[]; total: number }> {
  const conditions = and(where, folderId ? eq(folderPhoto.folderId, folderId) : undefined);

  const baseQuery = db.select(photoWithOwner).from(photos).innerJoin(users, eq(users.id, photos.userId));
  const rows = await (folderId ? baseQuery.innerJoin(folderPhoto, eq(folderPhoto.photoId, photos.id)) : baseQuery)
    .where(conditions)
    .orderBy(...newestFirst)
    .limit(perPage)
    .offset((page - 1) * perPage);

  const countQuery = db.select({ total: count() }).from(photos);
  const [{ total }] = await (
    folderId ? countQuery.innerJoin(folderPhoto, eq(folderPhoto.photoId, photos.id)) : countQuery
  ).where(conditions);

  return { items: rows.map(({ photo, ownerName }) => ({ ...photo, ownerName })), total };
}

/**
 * The newest photos of each of the given folders, at most `limit` per folder.
 */
export async function newestPhotosPerFolder(
  db: Database,
  folderIds: number[],
  limit: number,
): Promise<Map<number, PhotoWithOwner[]>> {
  const perFolder = new Map<number, PhotoWithOwner[]>(folderIds.map((id) => [id, []]));
  if (folderIds.length === 0) {
    return perFolder;
  }

  const rows = await db
    .select({ ...photoWithOwner, folderId: folderPhoto.folderId })
    .from(photos)
    .innerJoin(users, eq(users.id, photos.userId))
    .innerJoin(folderPhoto, eq(folderPhoto.photoId, photos.id))
    .where(inArray(folderPhoto.folderId, folderIds))
    .orderBy(...newestFirst);

  for (const { photo, ownerName, folderId } of rows) {
    const list = perFolder.get(folderId)!;
    if (list.length < limit) {
      list.push({ ...photo, ownerName });
    }
  }

  return perFolder;
}

/**
 * Turn photos into tiles for the viewer: admins may delete any photo, everyone else only their own.
 */
export function photoCards(items: PhotoWithOwner[], viewer: User | null): PhotoCardData[] {
  return items.map((photo) => ({
    id: photo.id,
    title: photo.title,
    category: categoryLabel(photo.category),
    imageUrl: photo.imagePath,
    width: photo.imageWidth,
    height: photo.imageHeight,
    ownerName: photo.ownerName,
    canDelete: Boolean(viewer?.isAdmin) || ownsPhoto(viewer, photo),
  }));
}

/**
 * The page number from ?page=, at least 1.
 */
export function pageFrom(value: string | string[] | undefined): number {
  const page = Number(Array.isArray(value) ? value[0] : value);
  return Number.isInteger(page) && page > 1 ? page : 1;
}

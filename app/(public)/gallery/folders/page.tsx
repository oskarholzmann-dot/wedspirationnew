import type { Metadata } from "next";
import Link from "next/link";
import { count, countDistinct, desc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { folderPhoto, users, weddingFolders } from "@/db/schema";
import { Pagination } from "@/components/pagination";
import { plural } from "@/lib/format";
import { newestPhotosPerFolder, pageFrom, PER_PAGE } from "@/lib/gallery";
import { GalleryTabs } from "../gallery-tabs";

export const metadata: Metadata = { title: "Gallery folders" };

/**
 * All folders that contain photos, each with its newest photo as cover.
 */
export default async function GalleryFoldersPage({ searchParams }: PageProps<"/gallery/folders">) {
  const page = pageFrom((await searchParams).page);
  const db = await getDb();

  const folders = await db
    .select({
      id: weddingFolders.id,
      name: weddingFolders.name,
      ownerName: users.name,
      photoCount: count(folderPhoto.photoId),
    })
    .from(weddingFolders)
    .innerJoin(users, eq(users.id, weddingFolders.userId))
    .innerJoin(folderPhoto, eq(folderPhoto.folderId, weddingFolders.id))
    .groupBy(weddingFolders.id, users.name)
    .orderBy(desc(weddingFolders.id))
    .limit(PER_PAGE)
    .offset((page - 1) * PER_PAGE);

  const [{ total }] = await db.select({ total: countDistinct(folderPhoto.folderId) }).from(folderPhoto);
  const covers = await newestPhotosPerFolder(
    db,
    folders.map((folder) => folder.id),
    1,
  );

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="font-serif text-3xl text-stone-900">Gallery</h1>
      <p className="mt-2 text-stone-600">Every couple&apos;s collection of inspiration, one folder each.</p>

      <GalleryTabs active="folders" />

      {folders.length === 0 ? (
        <p className="mt-8 text-stone-500">No folders with photos yet.</p>
      ) : (
        <>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {folders.map((folder) => {
              const cover = covers.get(folder.id)?.[0];
              return (
                <Link
                  key={folder.id}
                  href={`/gallery/folders/${folder.id}`}
                  className="group block overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-stone-200 hover:shadow-md transition"
                >
                  <div className="aspect-[4/3] overflow-hidden bg-stone-100">
                    {cover && (
                      // eslint-disable-next-line @next/next/no-img-element -- photos come from several hosts
                      <img
                        src={cover.imagePath}
                        alt={folder.name}
                        loading="lazy"
                        className="h-full w-full object-cover group-hover:scale-105 transition duration-300"
                      />
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium text-stone-900">{folder.name}</h3>
                    <p className="mt-1 text-sm text-stone-500">
                      {plural(folder.photoCount, "photo")} &middot; by {folder.ownerName}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>

          <div className="mt-10">
            <Pagination page={page} total={total} perPage={PER_PAGE} basePath="/gallery/folders" />
          </div>
        </>
      )}
    </section>
  );
}

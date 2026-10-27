import type { Metadata } from "next";
import Link from "next/link";
import { asc, count, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { folderPhoto, weddingFolders } from "@/db/schema";
import { PhotoGrid } from "@/components/photo-grid";
import { darkButtonLinkClasses, PageHeader, PageTitle } from "@/components/ui";
import { requireUser } from "@/lib/auth-user";
import { savedPhotoIds } from "@/lib/folders";
import { formatDate, plural } from "@/lib/format";
import { newestPhotosPerFolder, photoCards } from "@/lib/gallery";

export const metadata: Metadata = { title: "My folder" };

/**
 * The user's wedding folders, each with its four newest photos.
 */
export default async function DashboardPage() {
  const user = await requireUser();
  const db = await getDb();

  const folders = await db
    .select({
      id: weddingFolders.id,
      name: weddingFolders.name,
      weddingDate: weddingFolders.weddingDate,
      photoCount: count(folderPhoto.photoId),
    })
    .from(weddingFolders)
    .leftJoin(folderPhoto, eq(folderPhoto.folderId, weddingFolders.id))
    .where(eq(weddingFolders.userId, user.id))
    .groupBy(weddingFolders.id)
    .orderBy(asc(weddingFolders.id));

  const newestPhotos = await newestPhotosPerFolder(
    db,
    folders.map((folder) => folder.id),
    4,
  );
  const saved = await savedPhotoIds(db, user.id);

  return (
    <>
      <PageHeader>
        <PageTitle>Welcome, {user.name}</PageTitle>
      </PageHeader>

      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
          <div className="px-4 sm:px-0 flex flex-wrap items-center justify-between gap-4">
            <p className="text-gray-600">
              Your wedding folders. Every photo you upload is added to your folder and to the public gallery.
            </p>
            <Link href="/photos/create" className={darkButtonLinkClasses}>
              Upload photo
            </Link>
          </div>

          {folders.length === 0 ? (
            <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6 text-gray-500">
              You don&apos;t have a wedding folder yet. Upload a photo or save one from the gallery, and a new folder is
              created for you.
            </div>
          ) : (
            folders.map((folder) => {
              const folderPhotos = newestPhotos.get(folder.id) ?? [];
              return (
                <div key={folder.id} className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      <Link href={`/folders/${folder.id}`} className="hover:underline">
                        {folder.name}
                      </Link>
                    </h3>
                    <p className="text-sm text-gray-500">
                      {plural(folder.photoCount, "photo")}
                      {folder.weddingDate && <> &middot; Wedding on {formatDate(folder.weddingDate)}</>}
                    </p>
                  </div>

                  {folderPhotos.length === 0 ? (
                    <p className="mt-4 text-gray-500">No photos yet - upload your first inspiration.</p>
                  ) : (
                    <>
                      <div className="mt-4">
                        <PhotoGrid
                          photos={photoCards(folderPhotos, user)}
                          savedIds={saved}
                          canSave
                          columnsClassName="columns-2 gap-2 sm:columns-4"
                        />
                      </div>
                      <Link
                        href={`/folders/${folder.id}`}
                        className="mt-2 inline-block text-sm text-gray-600 hover:text-gray-900 hover:underline"
                      >
                        Show all {plural(folder.photoCount, "photo")} &rarr;
                      </Link>
                    </>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
}

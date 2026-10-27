import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { folderPhoto, photos, weddingFolders } from "@/db/schema";
import { categoryLabel } from "@/lib/categories";
import { currentUser } from "@/lib/auth-user";
import { savedPhotoIds } from "@/lib/folders";
import { formatDate } from "@/lib/format";
import { ownsPhoto } from "@/lib/photos";
import { routeId } from "@/lib/validation";
import { PhotoSaveToggle } from "./photo-save-toggle";

async function findPhoto(id: string) {
  const photoId = routeId(id);
  if (!photoId) {
    return undefined;
  }

  const db = await getDb();
  return db.query.photos.findFirst({ where: eq(photos.id, photoId), with: { user: { columns: { name: true } } } });
}

export async function generateMetadata({ params }: PageProps<"/gallery/[photo]">): Promise<Metadata> {
  const photo = await findPhoto((await params).photo);
  return { title: photo?.title ?? "Photo" };
}

/**
 * One photo with the folders it is in.
 */
export default async function PhotoPage({ params }: PageProps<"/gallery/[photo]">) {
  const photo = await findPhoto((await params).photo);
  if (!photo) {
    notFound();
  }

  const db = await getDb();
  const user = await currentUser();
  const folders = await db
    .select({ id: weddingFolders.id, name: weddingFolders.name })
    .from(weddingFolders)
    .innerJoin(folderPhoto, eq(folderPhoto.folderId, weddingFolders.id))
    .where(eq(folderPhoto.photoId, photo.id));

  return (
    <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link href="/gallery" className="text-sm text-stone-500 hover:text-stone-800">
        &larr; Back to the gallery
      </Link>

      <div className="mt-6 overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-stone-200">
        {/* eslint-disable-next-line @next/next/no-img-element -- photos come from several hosts */}
        <img src={photo.imagePath} alt={photo.title} className="w-full max-h-[70vh] object-cover" />

        <div className="p-6 sm:p-8">
          {photo.category && (
            <p className="text-xs uppercase tracking-wide text-rose-700">{categoryLabel(photo.category)}</p>
          )}

          <h1 className="mt-1 font-serif text-3xl text-stone-900">{photo.title}</h1>

          {photo.description && <p className="mt-4 text-stone-700">{photo.description}</p>}

          <p className="mt-6 text-sm text-stone-500">
            Shared by {photo.user.name} on {formatDate(photo.createdAt)}
            {folders.map((folder) => (
              <span key={folder.id}>
                {" "}
                &middot; in{" "}
                <Link href={`/gallery/folders/${folder.id}`} className="text-rose-700 hover:underline">
                  {folder.name}
                </Link>
              </span>
            ))}
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            {user && (
              <PhotoSaveToggle
                photoId={photo.id}
                initiallySaved={(await savedPhotoIds(db, user.id)).includes(photo.id)}
              />
            )}

            {ownsPhoto(user, photo) && (
              <Link
                href={`/photos/${photo.id}/edit`}
                className="inline-block rounded-md bg-stone-900 px-4 py-2 text-sm text-white hover:bg-stone-700"
              >
                Edit or delete this photo
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

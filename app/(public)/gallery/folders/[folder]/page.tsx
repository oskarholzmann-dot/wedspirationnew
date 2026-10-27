import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { weddingFolders } from "@/db/schema";
import { Pagination } from "@/components/pagination";
import { PhotoGrid } from "@/components/photo-grid";
import { WhatsAppShareButton } from "@/components/whatsapp-button";
import { currentUser } from "@/lib/auth-user";
import { ownsFolder, savedPhotoIds } from "@/lib/folders";
import { plural } from "@/lib/format";
import { pageFrom, paginatedPhotos, PER_PAGE, photoCards } from "@/lib/gallery";
import { absoluteUrl } from "@/lib/url";
import { routeId } from "@/lib/validation";

async function findFolder(id: string) {
  const folderId = routeId(id);
  if (!folderId) {
    return undefined;
  }

  const db = await getDb();
  return db.query.weddingFolders.findFirst({
    where: eq(weddingFolders.id, folderId),
    with: { user: { columns: { name: true } } },
  });
}

export async function generateMetadata({ params }: PageProps<"/gallery/folders/[folder]">): Promise<Metadata> {
  const folder = await findFolder((await params).folder);
  return { title: folder?.name ?? "Folder" };
}

/**
 * The photos of one folder. The notes for the photographer stay private.
 */
export default async function PublicFolderPage({ params, searchParams }: PageProps<"/gallery/folders/[folder]">) {
  const folder = await findFolder((await params).folder);
  if (!folder) {
    notFound();
  }

  const db = await getDb();
  const user = await currentUser();
  const page = pageFrom((await searchParams).page);
  const { items, total } = await paginatedPhotos(db, { folderId: folder.id, page });

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link href="/gallery/folders" className="text-sm text-stone-500 hover:text-stone-800">
        &larr; All folders
      </Link>

      <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl text-stone-900">{folder.name}</h1>
          <p className="mt-2 text-stone-600">
            {plural(total, "photo")} collected by {folder.user.name}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <WhatsAppShareButton url={absoluteUrl(await headers(), `/gallery/folders/${folder.id}`)} />

          {ownsFolder(user, folder) && (
            <Link
              href={`/folders/${folder.id}/edit`}
              className="rounded-md bg-stone-900 px-4 py-2 text-sm text-white hover:bg-stone-700"
            >
              Edit folder
            </Link>
          )}
        </div>
      </div>

      {items.length === 0 ? (
        <p className="mt-8 text-stone-500">This folder has no photos yet.</p>
      ) : (
        <>
          <div className="mt-8">
            <PhotoGrid
              key={page}
              photos={photoCards(items, user)}
              savedIds={user ? await savedPhotoIds(db, user.id) : []}
              canSave={user !== null}
            />
          </div>

          <div className="mt-10">
            <Pagination page={page} total={total} perPage={PER_PAGE} basePath={`/gallery/folders/${folder.id}`} />
          </div>
        </>
      )}
    </section>
  );
}

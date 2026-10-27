import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import { getDb } from "@/db";
import { PhotoGrid } from "@/components/photo-grid";
import { WhatsAppShareButton } from "@/components/whatsapp-button";
import { Card, darkButtonLinkClasses, PageHeader, PageTitle } from "@/components/ui";
import { requireUser } from "@/lib/auth-user";
import { savedPhotoIds } from "@/lib/folders";
import { formatDate, plural } from "@/lib/format";
import { paginatedPhotos, photoCards } from "@/lib/gallery";
import { ownFolderOrFail } from "@/lib/own-records";
import { absoluteUrl } from "@/lib/url";

export const metadata: Metadata = { title: "My folder" };

/**
 * One of the user's wedding folders with all its photos and the private notes.
 */
export default async function FolderPage({ params }: PageProps<"/folders/[folder]">) {
  const user = await requireUser();
  const folder = await ownFolderOrFail(user, (await params).folder);
  const db = await getDb();
  const { items } = await paginatedPhotos(db, { folderId: folder.id, page: 1, perPage: 1000 });

  return (
    <>
      <PageHeader>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <PageTitle>{folder.name}</PageTitle>
          <div className="flex flex-wrap gap-2">
            {/* Shares the public folder page, because this page is only visible to the owner */}
            <WhatsAppShareButton
              url={absoluteUrl(await headers(), `/gallery/folders/${folder.id}`)}
              text="Here is our wedding inspiration:"
            />
            <Link href={`/folders/${folder.id}/edit`} className={darkButtonLinkClasses}>
              Edit folder
            </Link>
          </div>
        </div>
      </PageHeader>

      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
          <Link href="/dashboard" className="inline-block px-4 sm:px-0 text-sm text-gray-500 hover:text-gray-800">
            &larr; Back to my folders
          </Link>

          <Card className="space-y-2">
            {folder.weddingDate && <p className="text-sm text-gray-500">Wedding on {formatDate(folder.weddingDate)}</p>}

            {folder.notes && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700">Notes for the photographer</h3>
                <p className="mt-1 text-gray-700">{folder.notes}</p>
              </div>
            )}

            <p className="text-sm text-gray-500">{plural(items.length, "photo")} in this folder</p>
          </Card>

          {items.length === 0 ? (
            <Card className="text-gray-500">No photos yet - upload your first inspiration.</Card>
          ) : (
            <PhotoGrid photos={photoCards(items, user)} savedIds={await savedPhotoIds(db, user.id)} canSave />
          )}
        </div>
      </div>
    </>
  );
}

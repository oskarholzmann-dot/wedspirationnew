import type { Metadata } from "next";
import Link from "next/link";
import { count, desc, eq } from "drizzle-orm";
import { adminBulkDeleteFolders, adminDeleteFolder } from "@/app/actions/admin";
import { getDb } from "@/db";
import { folderPhoto, users, weddingFolders } from "@/db/schema";
import { BulkDeleteTable } from "@/components/bulk-delete-table";
import { ConfirmForm } from "@/components/confirm-form";
import { Pagination } from "@/components/pagination";
import { darkButtonLinkClasses, PageHeader, PageTitle } from "@/components/ui";
import { formatDate } from "@/lib/format";
import { pageFrom } from "@/lib/gallery";

export const metadata: Metadata = { title: "Admin · Folders" };

const PER_PAGE = 15;

export default async function AdminFoldersPage({ searchParams }: PageProps<"/admin/folders">) {
  const page = pageFrom((await searchParams).page);
  const db = await getDb();

  const folders = await db
    .select({
      id: weddingFolders.id,
      name: weddingFolders.name,
      weddingDate: weddingFolders.weddingDate,
      ownerName: users.name,
      photoCount: count(folderPhoto.photoId),
    })
    .from(weddingFolders)
    .innerJoin(users, eq(users.id, weddingFolders.userId))
    .leftJoin(folderPhoto, eq(folderPhoto.folderId, weddingFolders.id))
    .groupBy(weddingFolders.id, users.name)
    .orderBy(desc(weddingFolders.createdAt), desc(weddingFolders.id))
    .limit(PER_PAGE)
    .offset((page - 1) * PER_PAGE);

  const total = await db.$count(weddingFolders);

  return (
    <>
      <PageHeader>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <PageTitle>Admin &middot; Folders</PageTitle>
          <Link href="/admin/folders/create" className={darkButtonLinkClasses}>
            New folder
          </Link>
        </div>
      </PageHeader>

      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-4">
          <BulkDeleteTable
            key={page}
            action={adminBulkDeleteFolders}
            field="folders"
            noun="folder"
            withPhotosOption
            emptyText="No folders yet."
            headers={["Name", "Owner", "Wedding date", "Photos", "Actions"]}
            rows={folders.map((folder) => ({
              id: folder.id,
              label: folder.name,
              cells: [
                <td key="name" className="px-4 py-2 font-medium text-gray-900">
                  {folder.name}
                </td>,
                <td key="owner" className="px-4 py-2 text-gray-600">
                  {folder.ownerName}
                </td>,
                <td key="date" className="px-4 py-2 text-gray-600">
                  {formatDate(folder.weddingDate)}
                </td>,
                <td key="photos" className="px-4 py-2 text-gray-600">
                  {folder.photoCount}
                </td>,
                <td key="actions" className="px-4 py-2 text-right whitespace-nowrap">
                  <div className="inline-flex items-center gap-3">
                    <Link href={`/admin/folders/${folder.id}`} className="text-indigo-600 hover:underline">
                      View
                    </Link>
                    <Link href={`/admin/folders/${folder.id}/edit`} className="text-indigo-600 hover:underline">
                      Edit
                    </Link>
                    <ConfirmForm
                      action={adminDeleteFolder.bind(null, folder.id)}
                      question={`Delete the folder "${folder.name}"? Its photos stay in the gallery.`}
                    >
                      <button type="submit" className="text-red-600 hover:underline">
                        Delete
                      </button>
                    </ConfirmForm>
                  </div>
                </td>,
              ],
            }))}
          />

          <Pagination page={page} total={total} perPage={PER_PAGE} basePath="/admin/folders" />
        </div>
      </div>
    </>
  );
}

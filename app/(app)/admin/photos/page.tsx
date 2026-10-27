import type { Metadata } from "next";
import Link from "next/link";
import { adminBulkDeletePhotos, adminDeletePhoto } from "@/app/actions/admin";
import { getDb } from "@/db";
import { BulkDeleteTable } from "@/components/bulk-delete-table";
import { ConfirmForm } from "@/components/confirm-form";
import { Pagination } from "@/components/pagination";
import { darkButtonLinkClasses, PageHeader, PageTitle } from "@/components/ui";
import { categoryLabel } from "@/lib/categories";
import { formatDate } from "@/lib/format";
import { pageFrom, paginatedPhotos } from "@/lib/gallery";

export const metadata: Metadata = { title: "Admin · Photos" };

const PER_PAGE = 15;

export default async function AdminPhotosPage({ searchParams }: PageProps<"/admin/photos">) {
  const page = pageFrom((await searchParams).page);
  const { items, total } = await paginatedPhotos(await getDb(), { page, perPage: PER_PAGE });

  return (
    <>
      <PageHeader>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <PageTitle>Admin &middot; Photos</PageTitle>
          <Link href="/admin/photos/create" className={darkButtonLinkClasses}>
            New photo
          </Link>
        </div>
      </PageHeader>

      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-4">
          <BulkDeleteTable
            key={page}
            action={adminBulkDeletePhotos}
            field="photos"
            noun="photo"
            emptyText="No photos yet."
            headers={["Photo", "Title", "Category", "Owner", "Uploaded", "Actions"]}
            rows={items.map((photo) => ({
              id: photo.id,
              label: photo.title,
              cells: [
                <td key="image" className="px-4 py-2">
                  {/* eslint-disable-next-line @next/next/no-img-element -- photos come from several hosts */}
                  <img src={photo.imagePath} alt="" className="h-12 w-16 rounded object-cover" />
                </td>,
                <td key="title" className="px-4 py-2 font-medium text-gray-900">
                  {photo.title}
                </td>,
                <td key="category" className="px-4 py-2 text-gray-600">
                  {categoryLabel(photo.category) ?? "-"}
                </td>,
                <td key="owner" className="px-4 py-2 text-gray-600">
                  {photo.ownerName}
                </td>,
                <td key="uploaded" className="px-4 py-2 text-gray-600">
                  {formatDate(photo.createdAt)}
                </td>,
                <td key="actions" className="px-4 py-2 text-right whitespace-nowrap">
                  <div className="inline-flex items-center gap-3">
                    <Link href={`/admin/photos/${photo.id}`} className="text-indigo-600 hover:underline">
                      View
                    </Link>
                    <Link href={`/admin/photos/${photo.id}/edit`} className="text-indigo-600 hover:underline">
                      Edit
                    </Link>
                    <ConfirmForm
                      action={adminDeletePhoto.bind(null, photo.id)}
                      question={`Delete the photo "${photo.title}"? This cannot be undone.`}
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

          <Pagination page={page} total={total} perPage={PER_PAGE} basePath="/admin/photos" />
        </div>
      </div>
    </>
  );
}

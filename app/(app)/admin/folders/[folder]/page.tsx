import type { Metadata } from "next";
import Link from "next/link";
import { adminDeleteFolder } from "@/app/actions/admin";
import { ConfirmForm } from "@/components/confirm-form";
import { DangerButton, darkButtonLinkClasses, PageHeader, PageTitle } from "@/components/ui";
import { folderOrFail } from "@/lib/admin-records";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = { title: "Admin · Folder" };

/**
 * One folder with its owner and photos.
 */
export default async function AdminFolderPage({ params }: PageProps<"/admin/folders/[folder]">) {
  const folder = await folderOrFail((await params).folder);
  const folderPhotos = folder.folderPhotos.map(({ photo }) => photo);

  return (
    <>
      <PageHeader>
        <PageTitle>Admin &middot; {folder.name}</PageTitle>
      </PageHeader>

      <div className="py-12">
        <div className="max-w-5xl mx-auto sm:px-6 lg:px-8 space-y-6">
          <Link href="/admin/folders" className="inline-block px-4 sm:px-0 text-sm text-gray-500 hover:text-gray-800">
            &larr; All folders
          </Link>

          <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
            <dl className="p-6 grid gap-4 sm:grid-cols-2 text-sm">
              <div>
                <dt className="text-gray-500">Name</dt>
                <dd className="mt-1 font-medium text-gray-900">{folder.name}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Owner</dt>
                <dd className="mt-1 text-gray-900">
                  <Link href={`/admin/users/${folder.user.id}`} className="text-indigo-600 hover:underline">
                    {folder.user.name}
                  </Link>
                </dd>
              </div>
              <div>
                <dt className="text-gray-500">Wedding date</dt>
                <dd className="mt-1 text-gray-900">{formatDate(folder.weddingDate)}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Photos</dt>
                <dd className="mt-1 text-gray-900">{folderPhotos.length}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-gray-500">Notes</dt>
                <dd className="mt-1 text-gray-900">{folder.notes ?? "-"}</dd>
              </div>
            </dl>
          </div>

          {folderPhotos.length > 0 && (
            <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
              {folderPhotos.map((photo) => (
                <Link key={photo.id} href={`/admin/photos/${photo.id}`} className="block">
                  {/* eslint-disable-next-line @next/next/no-img-element -- photos come from several hosts */}
                  <img src={photo.imagePath} alt={photo.title} className="aspect-[4/3] w-full rounded-md object-cover" />
                  <p className="mt-1 text-xs text-gray-600 truncate">{photo.title}</p>
                </Link>
              ))}
            </div>
          )}

          <div className="flex flex-wrap items-center gap-4">
            <Link href={`/admin/folders/${folder.id}/edit`} className={darkButtonLinkClasses}>
              Edit
            </Link>

            <ConfirmForm
              action={adminDeleteFolder.bind(null, folder.id)}
              question="Delete this folder? Its photos stay in the gallery."
            >
              <DangerButton>Delete</DangerButton>
            </ConfirmForm>
          </div>
        </div>
      </div>
    </>
  );
}

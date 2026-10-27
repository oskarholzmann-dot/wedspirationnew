import type { Metadata } from "next";
import Link from "next/link";
import { adminDeletePhoto } from "@/app/actions/admin";
import { ConfirmForm } from "@/components/confirm-form";
import { DangerButton, darkButtonLinkClasses, PageHeader, PageTitle } from "@/components/ui";
import { photoOrFail } from "@/lib/admin-records";
import { categoryLabel } from "@/lib/categories";

export const metadata: Metadata = { title: "Admin · Photo" };

/**
 * One photo with its owner and folders.
 */
export default async function AdminPhotoPage({ params }: PageProps<"/admin/photos/[photo]">) {
  const photo = await photoOrFail((await params).photo);
  const folderNames = photo.folderPhotos.map(({ folder }) => folder.name).join(", ");

  const details = [
    { label: "Title", value: photo.title, strong: true },
    { label: "Category", value: categoryLabel(photo.category) ?? "-" },
    { label: "Subcategory", value: photo.subcategory?.name ?? "-" },
    { label: "Owner", value: `${photo.user.name} (${photo.user.email})` },
    { label: "In folders", value: folderNames || "-" },
  ];

  return (
    <>
      <PageHeader>
        <PageTitle>Admin &middot; {photo.title}</PageTitle>
      </PageHeader>

      <div className="py-12">
        <div className="max-w-3xl mx-auto sm:px-6 lg:px-8 space-y-6">
          <Link href="/admin/photos" className="inline-block px-4 sm:px-0 text-sm text-gray-500 hover:text-gray-800">
            &larr; All photos
          </Link>

          <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
            {/* eslint-disable-next-line @next/next/no-img-element -- photos come from several hosts */}
            <img src={photo.imagePath} alt={photo.title} className="w-full max-h-[60vh] object-cover" />

            <dl className="p-6 grid gap-4 sm:grid-cols-2 text-sm">
              {details.map(({ label, value, strong }) => (
                <div key={label}>
                  <dt className="text-gray-500">{label}</dt>
                  <dd className={`mt-1 text-gray-900 ${strong ? "font-medium" : ""}`}>{value}</dd>
                </div>
              ))}
              <div className="sm:col-span-2">
                <dt className="text-gray-500">Description</dt>
                <dd className="mt-1 text-gray-900">{photo.description ?? "-"}</dd>
              </div>
            </dl>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <Link href={`/admin/photos/${photo.id}/edit`} className={darkButtonLinkClasses}>
              Edit
            </Link>

            <ConfirmForm action={adminDeletePhoto.bind(null, photo.id)} question="Do you really want to delete this photo?">
              <DangerButton>Delete</DangerButton>
            </ConfirmForm>
          </div>
        </div>
      </div>
    </>
  );
}

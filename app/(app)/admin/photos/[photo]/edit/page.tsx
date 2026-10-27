import type { Metadata } from "next";
import { asc } from "drizzle-orm";
import { adminUpdatePhoto } from "@/app/actions/admin";
import { getDb } from "@/db";
import { subcategories } from "@/db/schema";
import { Card, PageHeader, PageTitle } from "@/components/ui";
import { photoOrFail } from "@/lib/admin-records";
import { AdminPhotoForm } from "../../admin-photo-form";

export const metadata: Metadata = { title: "Admin · Edit photo" };

export default async function AdminEditPhotoPage({ params }: PageProps<"/admin/photos/[photo]/edit">) {
  const photo = await photoOrFail((await params).photo);
  const subcategoryList = await (await getDb())
    .select({ id: subcategories.id, name: subcategories.name })
    .from(subcategories)
    .orderBy(asc(subcategories.name));

  return (
    <>
      <PageHeader>
        <PageTitle>Admin &middot; Edit photo</PageTitle>
      </PageHeader>

      <div className="py-12">
        <div className="max-w-2xl mx-auto sm:px-6 lg:px-8">
          <Card>
            {/* eslint-disable-next-line @next/next/no-img-element -- photos come from several hosts */}
            <img src={photo.imagePath} alt={photo.title} className="aspect-[4/3] w-full rounded-md object-cover" />
            <p className="mt-2 mb-6 text-sm text-gray-500">Owner: {photo.user.name}</p>

            <AdminPhotoForm
              action={adminUpdatePhoto.bind(null, photo.id)}
              subcategories={subcategoryList}
              photo={{
                title: photo.title,
                description: photo.description,
                category: photo.category,
                subcategoryId: photo.subcategoryId,
              }}
              cancelHref={`/admin/photos/${photo.id}`}
            />
          </Card>
        </div>
      </div>
    </>
  );
}

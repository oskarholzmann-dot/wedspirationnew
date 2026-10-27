import type { Metadata } from "next";
import { deleteOwnPhoto, updatePhoto } from "@/app/actions/userzone";
import { ConfirmForm } from "@/components/confirm-form";
import { Card, DangerButton, PageHeader, PageTitle } from "@/components/ui";
import { requireUser } from "@/lib/auth-user";
import { ownPhotoOrFail } from "@/lib/own-records";
import { EditPhotoForm } from "./edit-photo-form";

export const metadata: Metadata = { title: "Edit photo" };

export default async function EditPhotoPage({ params }: PageProps<"/photos/[photo]/edit">) {
  const user = await requireUser();
  const photo = await ownPhotoOrFail(user, (await params).photo);

  return (
    <>
      <PageHeader>
        <PageTitle>Edit photo</PageTitle>
      </PageHeader>

      <div className="py-12">
        <div className="max-w-2xl mx-auto sm:px-6 lg:px-8 space-y-6">
          <Card>
            {/* eslint-disable-next-line @next/next/no-img-element -- photos come from several hosts */}
            <img src={photo.imagePath} alt={photo.title} className="aspect-[4/3] w-full rounded-md object-cover" />

            <EditPhotoForm
              action={updatePhoto.bind(null, photo.id)}
              photo={{ id: photo.id, title: photo.title, description: photo.description, category: photo.category }}
            />
          </Card>

          <Card>
            <h3 className="text-lg font-medium text-gray-900">Delete photo</h3>
            <p className="mt-1 text-sm text-gray-600">
              The photo is removed from your folder and from the public gallery. This cannot be undone.
            </p>

            <ConfirmForm
              action={deleteOwnPhoto.bind(null, photo.id)}
              question="Do you really want to delete this photo?"
              className="mt-4"
            >
              <DangerButton>Delete photo</DangerButton>
            </ConfirmForm>
          </Card>
        </div>
      </div>
    </>
  );
}

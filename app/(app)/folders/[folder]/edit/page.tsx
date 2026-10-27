import type { Metadata } from "next";
import { deleteFolder, updateFolder } from "@/app/actions/userzone";
import { ConfirmForm } from "@/components/confirm-form";
import { Card, DangerButton, PageHeader, PageTitle } from "@/components/ui";
import { requireUser } from "@/lib/auth-user";
import { ownFolderOrFail } from "@/lib/own-records";
import { EditFolderForm } from "./edit-folder-form";

export const metadata: Metadata = { title: "Edit folder" };

export default async function EditFolderPage({ params }: PageProps<"/folders/[folder]/edit">) {
  const user = await requireUser();
  const folder = await ownFolderOrFail(user, (await params).folder);

  return (
    <>
      <PageHeader>
        <PageTitle>Edit folder</PageTitle>
      </PageHeader>

      <div className="py-12">
        <div className="max-w-2xl mx-auto sm:px-6 lg:px-8">
          <Card>
            <EditFolderForm
              action={updateFolder.bind(null, folder.id)}
              folder={{ id: folder.id, name: folder.name, notes: folder.notes, weddingDate: folder.weddingDate }}
            />
          </Card>

          <Card className="mt-6">
            <h3 className="text-lg font-medium text-gray-900">Delete folder</h3>
            <p className="mt-1 text-sm text-gray-600">
              Deletes this folder and the photos you uploaded into it, also from the public gallery. Photos you saved
              from other couples stay with them. This cannot be undone.
            </p>

            <ConfirmForm
              action={deleteFolder.bind(null, folder.id)}
              question="Delete this folder and all photos you uploaded into it?"
              className="mt-4"
            >
              <DangerButton>Delete folder</DangerButton>
            </ConfirmForm>
          </Card>
        </div>
      </div>
    </>
  );
}

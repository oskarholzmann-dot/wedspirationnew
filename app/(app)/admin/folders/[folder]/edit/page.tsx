import type { Metadata } from "next";
import { adminUpdateFolder } from "@/app/actions/admin";
import { Card, PageHeader, PageTitle } from "@/components/ui";
import { folderOrFail } from "@/lib/admin-records";
import { AdminFolderForm } from "../../admin-folder-form";

export const metadata: Metadata = { title: "Admin · Edit folder" };

export default async function AdminEditFolderPage({ params }: PageProps<"/admin/folders/[folder]/edit">) {
  const folder = await folderOrFail((await params).folder);

  return (
    <>
      <PageHeader>
        <PageTitle>Admin &middot; Edit {folder.name}</PageTitle>
      </PageHeader>

      <div className="py-12">
        <div className="max-w-2xl mx-auto sm:px-6 lg:px-8">
          <Card>
            <p className="mb-6 text-sm text-gray-500">Owner: {folder.user.name}</p>

            <AdminFolderForm
              action={adminUpdateFolder.bind(null, folder.id)}
              folder={{ name: folder.name, notes: folder.notes, weddingDate: folder.weddingDate }}
              cancelHref={`/admin/folders/${folder.id}`}
            />
          </Card>
        </div>
      </div>
    </>
  );
}

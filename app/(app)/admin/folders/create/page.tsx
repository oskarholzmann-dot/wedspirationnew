import type { Metadata } from "next";
import { asc } from "drizzle-orm";
import { adminCreateFolder } from "@/app/actions/admin";
import { getDb } from "@/db";
import { users } from "@/db/schema";
import { Card, PageHeader, PageTitle } from "@/components/ui";
import { AdminFolderForm } from "../admin-folder-form";

export const metadata: Metadata = { title: "Admin · New folder" };

export default async function AdminCreateFolderPage() {
  const owners = await (await getDb())
    .select({ id: users.id, name: users.name, email: users.email })
    .from(users)
    .orderBy(asc(users.name));

  return (
    <>
      <PageHeader>
        <PageTitle>Admin &middot; New folder</PageTitle>
      </PageHeader>

      <div className="py-12">
        <div className="max-w-2xl mx-auto sm:px-6 lg:px-8">
          <Card>
            <AdminFolderForm action={adminCreateFolder} owners={owners} cancelHref="/admin/folders" />
          </Card>
        </div>
      </div>
    </>
  );
}

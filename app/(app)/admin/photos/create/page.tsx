import type { Metadata } from "next";
import { asc } from "drizzle-orm";
import { adminCreatePhoto } from "@/app/actions/admin";
import { getDb } from "@/db";
import { subcategories, users } from "@/db/schema";
import { Card, PageHeader, PageTitle } from "@/components/ui";
import { AdminPhotoForm } from "../admin-photo-form";

export const metadata: Metadata = { title: "Admin · New photo" };

export default async function AdminCreatePhotoPage() {
  const db = await getDb();
  const owners = await db
    .select({ id: users.id, name: users.name, email: users.email })
    .from(users)
    .orderBy(asc(users.name));
  const subcategoryList = await db
    .select({ id: subcategories.id, name: subcategories.name })
    .from(subcategories)
    .orderBy(asc(subcategories.name));

  return (
    <>
      <PageHeader>
        <PageTitle>Admin &middot; New photo</PageTitle>
      </PageHeader>

      <div className="py-12">
        <div className="max-w-2xl mx-auto sm:px-6 lg:px-8">
          <Card>
            <AdminPhotoForm
              action={adminCreatePhoto}
              owners={owners}
              subcategories={subcategoryList}
              cancelHref="/admin/photos"
            />
          </Card>
        </div>
      </div>
    </>
  );
}

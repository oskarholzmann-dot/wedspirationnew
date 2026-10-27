import type { Metadata } from "next";
import { adminCreateUser } from "@/app/actions/admin";
import { Card, PageHeader, PageTitle } from "@/components/ui";
import { AdminUserForm } from "../admin-user-form";

export const metadata: Metadata = { title: "Admin · New user" };

export default function AdminCreateUserPage() {
  return (
    <>
      <PageHeader>
        <PageTitle>Admin &middot; New user</PageTitle>
      </PageHeader>

      <div className="py-12">
        <div className="max-w-2xl mx-auto sm:px-6 lg:px-8">
          <Card>
            <AdminUserForm action={adminCreateUser} cancelHref="/admin/users" />
          </Card>
        </div>
      </div>
    </>
  );
}

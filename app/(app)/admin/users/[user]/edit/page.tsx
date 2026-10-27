import type { Metadata } from "next";
import { adminUpdateUser } from "@/app/actions/admin";
import { Card, PageHeader, PageTitle } from "@/components/ui";
import { userOrFail } from "@/lib/admin-records";
import { requireAdmin } from "@/lib/auth-user";
import { AdminUserForm } from "../../admin-user-form";

export const metadata: Metadata = { title: "Admin · Edit user" };

export default async function AdminEditUserPage({ params }: PageProps<"/admin/users/[user]/edit">) {
  const admin = await requireAdmin();
  const user = await userOrFail((await params).user);

  return (
    <>
      <PageHeader>
        <PageTitle>Admin &middot; Edit {user.name}</PageTitle>
      </PageHeader>

      <div className="py-12">
        <div className="max-w-2xl mx-auto sm:px-6 lg:px-8">
          <Card>
            <AdminUserForm
              action={adminUpdateUser.bind(null, user.id)}
              user={{ name: user.name, email: user.email, isAdmin: user.isAdmin }}
              isSelf={user.id === admin.id}
              cancelHref={`/admin/users/${user.id}`}
            />
          </Card>
        </div>
      </div>
    </>
  );
}

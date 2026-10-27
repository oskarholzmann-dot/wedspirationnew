import type { Metadata } from "next";
import Link from "next/link";
import { eq } from "drizzle-orm";
import { adminDeleteUser } from "@/app/actions/admin";
import { getDb } from "@/db";
import { photos } from "@/db/schema";
import { ConfirmForm } from "@/components/confirm-form";
import { DangerButton, darkButtonLinkClasses, PageHeader, PageTitle } from "@/components/ui";
import { userOrFail } from "@/lib/admin-records";
import { requireAdmin } from "@/lib/auth-user";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = { title: "Admin · User" };

/**
 * One user with their folders and photo count.
 */
export default async function AdminUserPage({ params }: PageProps<"/admin/users/[user]">) {
  const admin = await requireAdmin();
  const user = await userOrFail((await params).user);
  const photoCount = await (await getDb()).$count(photos, eq(photos.userId, user.id));

  const details = [
    { label: "Name", value: user.name },
    { label: "Email", value: user.email },
    { label: "Role", value: user.isAdmin ? "Admin" : "User" },
    { label: "Registered", value: formatDate(user.createdAt) },
    { label: "Photos", value: String(photoCount) },
    { label: "Folders", value: user.folders.map((folder) => folder.name).join(", ") || "-" },
  ];

  return (
    <>
      <PageHeader>
        <PageTitle>Admin &middot; {user.name}</PageTitle>
      </PageHeader>

      <div className="py-12">
        <div className="max-w-3xl mx-auto sm:px-6 lg:px-8 space-y-6">
          <Link href="/admin/users" className="inline-block px-4 sm:px-0 text-sm text-gray-500 hover:text-gray-800">
            &larr; All users
          </Link>

          <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
            <dl className="p-6 grid gap-4 sm:grid-cols-2 text-sm">
              {details.map(({ label, value }, index) => (
                <div key={label}>
                  <dt className="text-gray-500">{label}</dt>
                  <dd className={`mt-1 text-gray-900 ${index === 0 ? "font-medium" : ""}`}>{value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <Link href={`/admin/users/${user.id}/edit`} className={darkButtonLinkClasses}>
              Edit
            </Link>

            {user.id !== admin.id && (
              <ConfirmForm
                action={adminDeleteUser.bind(null, user.id)}
                question="Delete this user with all their folders and photos?"
              >
                <DangerButton>Delete</DangerButton>
              </ConfirmForm>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

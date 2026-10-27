import type { Metadata } from "next";
import Link from "next/link";
import { asc, countDistinct, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { photos, users, weddingFolders } from "@/db/schema";
import { Pagination } from "@/components/pagination";
import { darkButtonLinkClasses, PageHeader, PageTitle } from "@/components/ui";
import { pageFrom } from "@/lib/gallery";

export const metadata: Metadata = { title: "Admin · Users" };

const PER_PAGE = 15;

export default async function AdminUsersPage({ searchParams }: PageProps<"/admin/users">) {
  const page = pageFrom((await searchParams).page);
  const db = await getDb();

  const rows = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      isAdmin: users.isAdmin,
      folderCount: countDistinct(weddingFolders.id),
      photoCount: countDistinct(photos.id),
    })
    .from(users)
    .leftJoin(weddingFolders, eq(weddingFolders.userId, users.id))
    .leftJoin(photos, eq(photos.userId, users.id))
    .groupBy(users.id)
    .orderBy(asc(users.name))
    .limit(PER_PAGE)
    .offset((page - 1) * PER_PAGE);

  const total = await db.$count(users);

  return (
    <>
      <PageHeader>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <PageTitle>Admin &middot; Users</PageTitle>
          <Link href="/admin/users/create" className={darkButtonLinkClasses}>
            New user
          </Link>
        </div>
      </PageHeader>

      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="bg-white shadow-sm sm:rounded-lg overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50 text-left text-gray-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Role</th>
                  <th className="px-4 py-3 font-medium">Folders</th>
                  <th className="px-4 py-3 font-medium">Photos</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rows.map((user) => (
                  <tr key={user.id}>
                    <td className="px-4 py-2 font-medium text-gray-900">{user.name}</td>
                    <td className="px-4 py-2 text-gray-600">{user.email}</td>
                    <td className="px-4 py-2 text-gray-600">{user.isAdmin ? "Admin" : "User"}</td>
                    <td className="px-4 py-2 text-gray-600">{user.folderCount}</td>
                    <td className="px-4 py-2 text-gray-600">{user.photoCount}</td>
                    <td className="px-4 py-2 text-right whitespace-nowrap space-x-3">
                      <Link href={`/admin/users/${user.id}`} className="text-indigo-600 hover:underline">
                        View
                      </Link>
                      <Link href={`/admin/users/${user.id}/edit`} className="text-indigo-600 hover:underline">
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6">
            <Pagination page={page} total={total} perPage={PER_PAGE} basePath="/admin/users" />
          </div>
        </div>
      </div>
    </>
  );
}

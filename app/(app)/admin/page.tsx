import type { Metadata } from "next";
import Link from "next/link";
import { count } from "drizzle-orm";
import { getDb } from "@/db";
import { photos, users, weddingFolders } from "@/db/schema";
import { PageHeader, PageTitle } from "@/components/ui";

export const metadata: Metadata = { title: "Admin" };

/**
 * An overview of all content in the app.
 */
export default async function AdminDashboardPage() {
  const db = await getDb();
  const [[userCount], [folderCount], [photoCount]] = await Promise.all([
    db.select({ total: count() }).from(users),
    db.select({ total: count() }).from(weddingFolders),
    db.select({ total: count() }).from(photos),
  ]);

  const counts = [
    { label: "users", total: userCount.total },
    { label: "folders", total: folderCount.total },
    { label: "photos", total: photoCount.total },
  ];

  return (
    <>
      <PageHeader>
        <PageTitle>Admin</PageTitle>
      </PageHeader>

      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="grid gap-6 sm:grid-cols-3">
            {counts.map(({ label, total }) => (
              <div key={label} className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                <p className="text-sm text-gray-500">{label.charAt(0).toUpperCase() + label.slice(1)}</p>
                <p className="mt-2 text-3xl font-semibold text-gray-900">{total}</p>
                <Link href={`/admin/${label}`} className="mt-4 inline-block text-sm text-indigo-600 hover:underline">
                  Manage {label} &rarr;
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

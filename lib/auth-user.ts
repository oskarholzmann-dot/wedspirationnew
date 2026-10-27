import { cache } from "react";
import { eq } from "drizzle-orm";
import { forbidden, redirect } from "next/navigation";
import { auth } from "@/auth";
import { getDb } from "@/db";
import { users, type User } from "@/db/schema";

/**
 * The logged-in user, read from the database once per request (Auth::user() in Laravel).
 * A login cookie whose user no longer exists counts as logged out.
 */
export const currentUser = cache(async (): Promise<User | null> => {
  const session = await auth();
  const id = Number(session?.user?.id);

  if (!Number.isInteger(id) || id <= 0) {
    return null;
  }

  const db = await getDb();
  return (await db.query.users.findFirst({ where: eq(users.id, id) })) ?? null;
});

/**
 * The "auth" middleware: send guests to the login page.
 */
export async function requireUser(): Promise<User> {
  const user = await currentUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}

/**
 * The "admin" middleware: only users with is_admin get through, everyone else sees 403.
 */
export async function requireAdmin(): Promise<User> {
  const user = await requireUser();

  if (!user.isAdmin) {
    forbidden();
  }

  return user;
}

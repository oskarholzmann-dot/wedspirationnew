import { requireAdmin } from "@/lib/auth-user";

/**
 * Everything under /admin is only for users with is_admin (the "admin" middleware).
 * The actions in app/actions/admin.ts check this again, because they can be called directly.
 */
export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  await requireAdmin();

  return children;
}

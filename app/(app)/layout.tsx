import { AppNavigation } from "@/components/app-navigation";
import { FlashMessage } from "@/components/flash-message";
import { requireUser } from "@/lib/auth-user";
import { readFlash } from "@/lib/flash";

/**
 * The logged-in area: user zone and admin (layouts/app.blade.php behind the "auth" middleware).
 */
export default async function AppLayout({ children }: LayoutProps<"/">) {
  const user = await requireUser();

  return (
    <div className="min-h-screen bg-gray-100">
      <AppNavigation user={{ name: user.name, email: user.email, isAdmin: user.isAdmin }} />
      <FlashMessage message={await readFlash()} />
      <main>{children}</main>
    </div>
  );
}

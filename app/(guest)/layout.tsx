import Link from "next/link";
import { redirect } from "next/navigation";
import { ApplicationLogo } from "@/components/application-logo";
import { currentUser } from "@/lib/auth-user";

/**
 * Login and register (layouts/guest.blade.php behind the "guest" middleware).
 */
export default async function GuestLayout({ children }: LayoutProps<"/">) {
  if (await currentUser()) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen flex flex-col sm:justify-center items-center pt-6 sm:pt-0 bg-gray-100 text-gray-900">
      <div>
        <Link href="/" aria-label="Home">
          <ApplicationLogo className="w-20 h-20 fill-current text-gray-500" />
        </Link>
      </div>

      <div className="w-full sm:max-w-md mt-6 px-6 py-4 bg-white shadow-md overflow-hidden sm:rounded-lg">{children}</div>
    </div>
  );
}

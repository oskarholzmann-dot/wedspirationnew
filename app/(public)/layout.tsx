import Link from "next/link";
import { FlashMessage } from "@/components/flash-message";
import { PublicNavigation } from "@/components/public-navigation";
import { currentUser } from "@/lib/auth-user";
import { readFlash } from "@/lib/flash";

/**
 * The public website (layouts/public.blade.php).
 */
export default async function PublicLayout({ children }: LayoutProps<"/">) {
  const user = await currentUser();

  return (
    <div className="min-h-screen flex flex-col bg-stone-50">
      <PublicNavigation isLoggedIn={user !== null} />
      <FlashMessage message={await readFlash()} />

      <main className="flex-1">{children}</main>

      <footer className="border-t border-stone-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-sm text-stone-500 flex flex-col sm:flex-row gap-2 justify-between">
          <p>&copy; {new Date().getFullYear()} Wedspiration</p>
          <div className="flex gap-4">
            <Link href="/about" className="hover:text-stone-800">
              About
            </Link>
            <Link href="/contact" className="hover:text-stone-800">
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

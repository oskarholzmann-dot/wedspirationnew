import Link from "next/link";
import { headers } from "next/headers";
import { WhatsAppShareButton } from "@/components/whatsapp-button";
import { currentUser } from "@/lib/auth-user";
import { absoluteUrl } from "@/lib/url";

export default async function WelcomePage() {
  const user = await currentUser();

  return (
    // Hero: fills the screen between navigation and footer
    <section className="flex min-h-[70vh] items-center bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h1 className="font-serif text-4xl sm:text-5xl text-stone-900">Collect the moments you dream of</h1>
        <p className="mt-6 text-lg text-stone-600">
          Wedspiration is a visual inspiration archive for couples planning their wedding. Upload the photos that
          inspire you, keep them in your personal wedding folder and share it with your photographer as a visual brief.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link href="/gallery" className="rounded-md bg-stone-900 px-6 py-3 text-white hover:bg-stone-700">
            Browse the gallery
          </Link>
          {!user && (
            <Link
              href="/register"
              className="rounded-md border border-stone-300 px-6 py-3 text-stone-800 hover:bg-stone-100"
            >
              Start your folder
            </Link>
          )}
          <WhatsAppShareButton
            url={absoluteUrl(await headers(), "/")}
            text="Plan your wedding inspiration with Wedspiration:"
            className="px-6 py-3 text-base"
          />
        </div>
      </div>
    </section>
  );
}

import type { Metadata } from "next";

export const metadata: Metadata = { title: "About" };

export default function AboutPage() {
  return (
    <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="font-serif text-3xl text-stone-900">About Wedspiration</h1>

      <div className="mt-6 space-y-4 text-stone-700">
        <p>
          Planning a wedding means collecting a lot of ideas: the dress, the flowers, the venue, the little details.
          Wedspiration gives couples one place to keep all of that inspiration.
        </p>
        <p>
          Every couple gets a personal wedding folder. Each photo you upload lands in your folder and in the public
          gallery, so other couples can be inspired by it too.
        </p>
        <p>
          Your folder doubles as a visual brief for your photographer: instead of explaining the mood you have in mind,
          you simply show it.
        </p>
      </div>
    </section>
  );
}

import type { Metadata } from "next";

export const metadata: Metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="font-serif text-3xl text-stone-900">Contact</h1>

      <div className="mt-6 space-y-4 text-stone-700">
        <p>Questions about Wedspiration or your wedding photography? We would love to hear from you.</p>

        <dl className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg bg-white p-6 ring-1 ring-stone-200">
            <dt className="text-sm text-stone-500">Email</dt>
            <dd className="mt-1 font-medium text-stone-900">hello@oskarholly.com</dd>
          </div>
          <div className="rounded-lg bg-white p-6 ring-1 ring-stone-200">
            <dt className="text-sm text-stone-500">Website</dt>
            <dd className="mt-1 font-medium text-stone-900">
              <a href="https://www.oskarholly.com" target="_blank" rel="noopener" className="hover:underline">
                www.oskarholly.com
              </a>
            </dd>
          </div>
        </dl>
      </div>
    </section>
  );
}

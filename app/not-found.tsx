import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-stone-50 px-4 text-center">
      <p className="font-serif text-5xl text-stone-900">404</p>
      <p className="text-stone-600">This page could not be found.</p>
      <Link href="/" className="text-sm text-rose-700 hover:underline">
        Back to Wedspiration
      </Link>
    </div>
  );
}

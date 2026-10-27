import Link from "next/link";

export default function Forbidden() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-stone-50 px-4 text-center">
      <p className="font-serif text-5xl text-stone-900">403</p>
      <p className="text-stone-600">You are not allowed to see this page.</p>
      <Link href="/" className="text-sm text-rose-700 hover:underline">
        Back to Wedspiration
      </Link>
    </div>
  );
}

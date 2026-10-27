import Link from "next/link";

/**
 * Switch between the photo view and the folder view of the gallery.
 */
export function GalleryTabs({ active }: { active: "photos" | "folders" }) {
  const tab = (isActive: boolean) =>
    `rounded-md px-4 py-1.5 ${isActive ? "bg-white text-stone-900 shadow-sm" : "text-stone-600 hover:text-stone-900"}`;

  return (
    <div className="mt-6 inline-flex rounded-lg bg-stone-200/60 p-1 text-sm">
      <Link href="/gallery" className={tab(active === "photos")}>
        Photos
      </Link>
      <Link href="/gallery/folders" className={tab(active === "folders")}>
        Folders
      </Link>
    </div>
  );
}

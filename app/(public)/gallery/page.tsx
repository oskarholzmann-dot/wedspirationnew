import type { Metadata } from "next";
import Link from "next/link";
import { and, asc, count, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { photos, subcategories } from "@/db/schema";
import { PhotoGrid } from "@/components/photo-grid";
import { Pagination } from "@/components/pagination";
import { categoryLabel, isPhotoCategory, PHOTO_CATEGORIES } from "@/lib/categories";
import { currentUser } from "@/lib/auth-user";
import { savedPhotoIds } from "@/lib/folders";
import { pageFrom, paginatedPhotos, PER_PAGE, photoCards } from "@/lib/gallery";
import { GalleryTabs } from "./gallery-tabs";
import { DeleteSubcategoryButton, NewSubcategoryForm } from "./subcategory-forms";

export const metadata: Metadata = { title: "Gallery" };

/**
 * All public photos, optionally filtered by category and subcategory.
 * Unknown categories or subcategories in the URL are simply ignored.
 */
export default async function GalleryPage({ searchParams }: PageProps<"/gallery">) {
  const query = await searchParams;
  const db = await getDb();
  const user = await currentUser();
  const isAdmin = Boolean(user?.isAdmin);

  const activeCategory = isPhotoCategory(query.category) ? query.category : null;

  const subcategoryList = await db
    .select({ id: subcategories.id, name: subcategories.name, photoCount: count(photos.id) })
    .from(subcategories)
    .leftJoin(photos, eq(photos.subcategoryId, subcategories.id))
    .groupBy(subcategories.id)
    .orderBy(asc(subcategories.name));

  const activeSubcategory = subcategoryList.find((subcategory) => String(subcategory.id) === query.subcategory) ?? null;

  const page = pageFrom(query.page);
  const { items, total } = await paginatedPhotos(db, {
    where: and(
      activeCategory ? eq(photos.category, activeCategory) : undefined,
      activeSubcategory ? eq(photos.subcategoryId, activeSubcategory.id) : undefined,
    ),
    page,
  });

  // Filters combine: changing one row keeps the choice in the other
  const galleryUrl = (category: string | null, subcategoryId: number | null) => {
    const params = new URLSearchParams();
    if (category) {
      params.set("category", category);
    }
    if (subcategoryId) {
      params.set("subcategory", String(subcategoryId));
    }
    const search = params.toString();
    return search ? `/gallery?${search}` : "/gallery";
  };

  const pill = "rounded-full px-4 py-1.5 ring-1";
  const smallPill = "rounded-full px-3 py-1 ring-1";
  const pillActive = "bg-stone-900 text-white ring-stone-900";
  const pillIdle = "bg-white text-stone-700 ring-stone-300 hover:bg-stone-100";

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="font-serif text-3xl text-stone-900">Gallery</h1>
      <p className="mt-2 text-stone-600">Every photo our couples have shared as inspiration.</p>

      <GalleryTabs active="photos" />

      {/* Sticky: the filters stay visible while scrolling */}
      <div className="sticky top-0 z-30 -mx-4 mt-6 space-y-3 bg-stone-50/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <nav className="flex flex-wrap gap-2 text-sm" aria-label="Categories">
          <Link
            href={galleryUrl(null, activeSubcategory?.id ?? null)}
            className={`${pill} ${activeCategory ? pillIdle : pillActive}`}
          >
            All
          </Link>
          {PHOTO_CATEGORIES.map((category) => (
            <Link
              key={category}
              href={galleryUrl(category, activeSubcategory?.id ?? null)}
              className={`${pill} ${activeCategory === category ? pillActive : pillIdle}`}
            >
              {categoryLabel(category)}
            </Link>
          ))}
        </nav>

        {(subcategoryList.length > 0 || isAdmin) && (
          <nav className="flex flex-wrap items-center gap-2 text-sm" aria-label="Subcategories">
            <span className="me-1 text-xs uppercase tracking-wide text-stone-500">Subcategories</span>

            <Link
              href={galleryUrl(activeCategory, null)}
              className={`${smallPill} ${activeSubcategory ? pillIdle : pillActive}`}
            >
              All
            </Link>

            {subcategoryList.map((subcategory) => (
              <Link
                key={subcategory.id}
                href={galleryUrl(activeCategory, subcategory.id)}
                className={`${smallPill} ${activeSubcategory?.id === subcategory.id ? pillActive : pillIdle}`}
              >
                {subcategory.name}
                <span className="ms-1 opacity-60">{subcategory.photoCount}</span>
              </Link>
            ))}

            {isAdmin && <NewSubcategoryForm />}
            {isAdmin && activeSubcategory && (
              <DeleteSubcategoryButton id={activeSubcategory.id} name={activeSubcategory.name} />
            )}
          </nav>
        )}
      </div>

      {items.length === 0 ? (
        <p className="mt-8 text-stone-500">
          {activeSubcategory
            ? `No photos in ${activeSubcategory.name} yet.`
            : activeCategory
              ? `No photos in ${categoryLabel(activeCategory)} yet.`
              : "No photos yet - be the first to share your inspiration."}
        </p>
      ) : (
        <>
          <div className="mt-6">
            <PhotoGrid
              key={`${activeCategory}-${activeSubcategory?.id}-${page}`}
              photos={photoCards(items, user)}
              savedIds={user ? await savedPhotoIds(db, user.id) : []}
              canSave={user !== null}
            />
          </div>

          <div className="mt-10">
            <Pagination
              page={page}
              total={total}
              perPage={PER_PAGE}
              basePath="/gallery"
              query={{ category: activeCategory ?? undefined, subcategory: activeSubcategory?.id.toString() }}
            />
          </div>
        </>
      )}
    </section>
  );
}

import Link from "next/link";

/**
 * Previous / next page links that keep the other query parameters ($paginator->links()).
 */
export function Pagination({
  page,
  total,
  perPage,
  basePath,
  query = {},
}: {
  page: number;
  total: number;
  perPage: number;
  basePath: string;
  query?: Record<string, string | undefined>;
}) {
  const lastPage = Math.max(1, Math.ceil(total / perPage));
  if (lastPage === 1) {
    return null;
  }

  const href = (target: number) => {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(query)) {
      if (value) {
        params.set(key, value);
      }
    }
    if (target > 1) {
      params.set("page", String(target));
    }
    const search = params.toString();
    return search ? `${basePath}?${search}` : basePath;
  };

  const linkClasses = "rounded-md bg-white px-4 py-2 text-sm text-stone-700 ring-1 ring-stone-300 hover:bg-stone-100";
  const disabledClasses = "rounded-md px-4 py-2 text-sm text-stone-400 ring-1 ring-stone-200";

  return (
    <nav className="flex items-center justify-between gap-4" aria-label="Pagination">
      {page > 1 ? (
        <Link href={href(page - 1)} className={linkClasses}>
          &larr; Previous
        </Link>
      ) : (
        <span className={disabledClasses}>&larr; Previous</span>
      )}

      <p className="text-sm text-stone-500">
        Page {page} of {lastPage}
      </p>

      {page < lastPage ? (
        <Link href={href(page + 1)} className={linkClasses}>
          Next &rarr;
        </Link>
      ) : (
        <span className={disabledClasses}>Next &rarr;</span>
      )}
    </nav>
  );
}

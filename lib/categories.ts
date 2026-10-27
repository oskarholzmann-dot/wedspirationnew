/**
 * The fixed photo categories (the PhotoCategory enum of the Laravel app).
 */
export const PHOTO_CATEGORIES = ["ceremony", "reception", "dress", "flowers", "venue", "details"] as const;

export type PhotoCategory = (typeof PHOTO_CATEGORIES)[number];

export function isPhotoCategory(value: unknown): value is PhotoCategory {
  return typeof value === "string" && (PHOTO_CATEGORIES as readonly string[]).includes(value);
}

/**
 * Human readable label: "ceremony" becomes "Ceremony".
 */
export function categoryLabel(category: string | null | undefined): string | null {
  return category ? category.charAt(0).toUpperCase() + category.slice(1) : null;
}

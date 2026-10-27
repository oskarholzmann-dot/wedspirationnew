/**
 * "1 photo", "3 photos" (Str::plural in Laravel; only regular English plurals are needed here).
 */
export function plural(count: number, word: string): string {
  return `${count} ${count === 1 ? word : `${word}s`}`;
}

/**
 * Dates as d.m.Y, e.g. 07.10.2026. Accepts a Date or a "YYYY-MM-DD" string from a date column.
 */
export function formatDate(value: Date | string | null | undefined): string {
  if (!value) {
    return "-";
  }

  const [year, month, day] =
    typeof value === "string"
      ? value.slice(0, 10).split("-")
      : [String(value.getFullYear()), String(value.getMonth() + 1), String(value.getDate())];

  return `${day.padStart(2, "0")}.${month.padStart(2, "0")}.${year}`;
}

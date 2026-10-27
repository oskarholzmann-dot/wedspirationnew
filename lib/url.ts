/**
 * A full URL for sharing (route() in Laravel), built from the address the page was opened with.
 */
export function absoluteUrl(requestHeaders: Headers, path: string): string {
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "localhost:3000";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");

  return `${protocol}://${host}${path}`;
}

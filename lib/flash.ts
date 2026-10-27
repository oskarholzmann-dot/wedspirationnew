import { cookies } from "next/headers";

/**
 * One-time success message for the next page (Laravel's ->with('success', ...)).
 * The message component removes the cookie as soon as it has been shown.
 */
const COOKIE = "flash";

export async function flash(message: string): Promise<void> {
  (await cookies()).set(COOKIE, message, { path: "/", maxAge: 60, sameSite: "lax" });
}

export async function readFlash(): Promise<string | null> {
  return (await cookies()).get(COOKIE)?.value ?? null;
}

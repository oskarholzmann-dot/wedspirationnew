"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

/**
 * Shows the one-time success message (see lib/flash.ts) and removes its cookie,
 * so it does not appear again on the next page.
 */
export function FlashMessage({ message }: { message: string | null }) {
  const pathname = usePathname();
  const [shown, setShown] = useState<{ message: string; pathname: string } | null>(null);

  useEffect(() => {
    if (message) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- the cookie can only be removed in the browser
      setShown({ message, pathname });
      document.cookie = "flash=; Max-Age=0; path=/";
    }
    // Only a new message should show it again, not a page change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [message]);

  // Hide the message once the user moves on to another page
  if (!shown || shown.pathname !== pathname) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-6">
      <div className="rounded-md bg-green-50 p-4 text-sm text-green-800 ring-1 ring-green-200">{shown.message}</div>
    </div>
  );
}

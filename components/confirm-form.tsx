"use client";

import type { ReactNode } from "react";

/**
 * A form that asks before it is sent (onsubmit="return confirm(...)" in Blade),
 * e.g. for delete buttons.
 */
export function ConfirmForm({
  action,
  question,
  className,
  children,
}: {
  action: () => Promise<void>;
  question: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <form
      action={action}
      className={className}
      onSubmit={(event) => {
        if (!confirm(question)) {
          event.preventDefault();
        }
      }}
    >
      {children}
    </form>
  );
}

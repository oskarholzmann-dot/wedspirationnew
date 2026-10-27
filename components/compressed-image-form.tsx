"use client";

import { useActionState, type ReactNode } from "react";
import type { FormState } from "@/lib/validation";
import { prepareImageField } from "./image-compression";

/**
 * A form with an optional or required image: the photo is shrunk in the browser first,
 * then the form is sent to the server action.
 */
export function CompressedImageForm({
  action,
  className,
  children,
}: {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  className?: string;
  children: (state: FormState, pending: boolean) => ReactNode;
}) {
  const [state, formAction, pending] = useActionState(async (previous: FormState, formData: FormData) => {
    const error = await prepareImageField(formData);
    if (error) {
      return { ...previous, errors: { ...previous.errors, image: [error] } };
    }
    return action(previous, formData);
  }, {});

  return (
    <form action={formAction} className={className}>
      {children(state, pending)}
    </form>
  );
}

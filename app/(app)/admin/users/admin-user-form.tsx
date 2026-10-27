"use client";

import Link from "next/link";
import { useActionState } from "react";
import { InputError, InputLabel, PrimaryButton, TextInput } from "@/components/ui";
import type { FormState } from "@/lib/validation";

/**
 * Create or edit a user (admin/users/_fields.blade.php).
 */
export function AdminUserForm({
  action,
  user,
  isSelf = false,
  cancelHref,
}: {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  user?: { name: string; email: string; isAdmin: boolean };
  isSelf?: boolean;
  cancelHref: string;
}) {
  const [state, formAction, pending] = useActionState(action, {});
  const wasAdmin = state.values ? state.values.is_admin === "1" : (user?.isAdmin ?? false);

  return (
    <form action={formAction} className="space-y-6">
      <div>
        <InputLabel htmlFor="name">Name</InputLabel>
        <TextInput
          id="name"
          name="name"
          type="text"
          className="mt-1 block w-full"
          defaultValue={state.values?.name ?? user?.name ?? ""}
          required
        />
        <InputError className="mt-2" messages={state.errors?.name} />
      </div>

      <div>
        <InputLabel htmlFor="email">Email</InputLabel>
        <TextInput
          id="email"
          name="email"
          type="email"
          className="mt-1 block w-full"
          defaultValue={state.values?.email ?? user?.email ?? ""}
          required
        />
        <InputError className="mt-2" messages={state.errors?.email} />
      </div>

      <div>
        <InputLabel htmlFor="password">
          {user ? "New password (leave empty to keep the current one)" : "Password"}
        </InputLabel>
        <TextInput
          id="password"
          name="password"
          type="password"
          className="mt-1 block w-full"
          autoComplete="new-password"
          required={!user}
        />
        <InputError className="mt-2" messages={state.errors?.password} />
      </div>

      <div>
        <label className="inline-flex items-center gap-2">
          <input
            type="checkbox"
            name="is_admin"
            value="1"
            className="rounded border-gray-400"
            defaultChecked={wasAdmin}
            key={String(wasAdmin)}
            disabled={isSelf}
          />
          <span className="text-sm text-gray-700">Administrator</span>
        </label>
        {isSelf && <p className="mt-1 text-xs text-gray-500">You cannot remove your own admin rights.</p>}
      </div>

      <div className="flex items-center gap-4">
        <PrimaryButton disabled={pending}>{user ? "Save" : "Create"}</PrimaryButton>
        <Link href={cancelHref} className="text-sm text-gray-600 hover:text-gray-900">
          Cancel
        </Link>
      </div>
    </form>
  );
}

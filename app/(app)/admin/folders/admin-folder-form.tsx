"use client";

import Link from "next/link";
import { useActionState } from "react";
import { FolderFields } from "@/components/form-fields";
import { InputError, InputLabel, PrimaryButton, Select } from "@/components/ui";
import type { FormState } from "@/lib/validation";

/**
 * Create a folder for any user (with owner choice), or edit any folder.
 */
export function AdminFolderForm({
  action,
  owners,
  folder,
  cancelHref,
}: {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  owners?: { id: number; name: string; email: string }[];
  folder?: { name: string; notes: string | null; weddingDate: string | null };
  cancelHref: string;
}) {
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <form action={formAction} className="space-y-6">
      {owners && (
        <div>
          <InputLabel htmlFor="user_id">Owner</InputLabel>
          <Select
            id="user_id"
            name="user_id"
            required
            className="mt-1 block w-full"
            defaultValue={state.values?.user_id ?? ""}
            key={state.values?.user_id}
          >
            <option value="">- Choose a user -</option>
            {owners.map((owner) => (
              <option key={owner.id} value={owner.id}>
                {owner.name} ({owner.email})
              </option>
            ))}
          </Select>
          <InputError className="mt-2" messages={state.errors?.user_id} />
        </div>
      )}

      <FolderFields state={state} folder={folder} />

      <div className="flex items-center gap-4">
        <PrimaryButton disabled={pending}>{folder ? "Save" : "Create"}</PrimaryButton>
        <Link href={cancelHref} className="text-sm text-gray-600 hover:text-gray-900">
          Cancel
        </Link>
      </div>
    </form>
  );
}

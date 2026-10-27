"use client";

import Link from "next/link";
import { useActionState } from "react";
import { FolderFields } from "@/components/form-fields";
import { PrimaryButton } from "@/components/ui";
import type { FormState } from "@/lib/validation";

export function EditFolderForm({
  action,
  folder,
}: {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  folder: { id: number; name: string; notes: string | null; weddingDate: string | null };
}) {
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <form action={formAction} className="space-y-6">
      <FolderFields state={state} folder={folder} />

      <div className="flex items-center gap-4">
        <PrimaryButton disabled={pending}>Save</PrimaryButton>
        <Link href={`/folders/${folder.id}`} className="text-sm text-gray-600 hover:text-gray-900">
          Cancel
        </Link>
      </div>
    </form>
  );
}

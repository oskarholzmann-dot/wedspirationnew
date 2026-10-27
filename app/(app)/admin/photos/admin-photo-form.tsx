"use client";

import Link from "next/link";
import { CompressedImageForm } from "@/components/compressed-image-form";
import { ImageInput, PhotoFields } from "@/components/form-fields";
import { InputError, InputLabel, PrimaryButton, Select } from "@/components/ui";
import type { FormState } from "@/lib/validation";

/**
 * Create a photo for any user, or edit any photo (admin/photos/_fields.blade.php).
 */
export function AdminPhotoForm({
  action,
  owners,
  subcategories,
  photo,
  cancelHref,
}: {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  owners?: { id: number; name: string; email: string }[];
  subcategories: { id: number; name: string }[];
  photo?: { title: string; description: string | null; category: string | null; subcategoryId: number | null };
  cancelHref: string;
}) {
  return (
    <CompressedImageForm action={action} className="space-y-6">
      {(state, pending) => (
        <>
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
              <p className="mt-1 text-xs text-gray-500">The photo is added to this user&apos;s wedding folder.</p>
              <InputError className="mt-2" messages={state.errors?.user_id} />
            </div>
          )}

          <PhotoFields state={state} photo={photo} />

          <div>
            <InputLabel htmlFor="subcategory_id">Subcategory (optional)</InputLabel>
            <Select
              id="subcategory_id"
              name="subcategory_id"
              className="mt-1 block w-full"
              defaultValue={state.values?.subcategory_id ?? photo?.subcategoryId?.toString() ?? ""}
              key={state.values?.subcategory_id}
            >
              <option value="">- No subcategory -</option>
              {subcategories.map((subcategory) => (
                <option key={subcategory.id} value={subcategory.id}>
                  {subcategory.name}
                </option>
              ))}
            </Select>
            <InputError className="mt-2" messages={state.errors?.subcategory_id} />
          </div>

          <ImageInput
            state={state}
            label={photo ? "Replace image (optional, max. 2 MB)" : "Image (max. 2 MB)"}
            required={!photo}
          />

          <div className="flex items-center gap-4">
            <PrimaryButton disabled={pending}>{photo ? "Save" : "Create"}</PrimaryButton>
            <Link href={cancelHref} className="text-sm text-gray-600 hover:text-gray-900">
              Cancel
            </Link>
          </div>
        </>
      )}
    </CompressedImageForm>
  );
}

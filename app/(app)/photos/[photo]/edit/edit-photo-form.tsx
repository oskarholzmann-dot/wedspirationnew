"use client";

import Link from "next/link";
import { CompressedImageForm } from "@/components/compressed-image-form";
import { ImageInput, PhotoFields } from "@/components/form-fields";
import { PrimaryButton } from "@/components/ui";
import type { FormState } from "@/lib/validation";

export function EditPhotoForm({
  action,
  photo,
}: {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  photo: { id: number; title: string; description: string | null; category: string | null };
}) {
  return (
    <CompressedImageForm action={action} className="mt-6 space-y-6">
      {(state, pending) => (
        <>
          <PhotoFields state={state} photo={photo} />
          <ImageInput state={state} label="Replace image (optional; large photos are made smaller automatically)" />

          <div className="flex items-center gap-4">
            <PrimaryButton disabled={pending}>Save</PrimaryButton>
            <Link href={`/gallery/${photo.id}`} className="text-sm text-gray-600 hover:text-gray-900">
              Cancel
            </Link>
          </div>
        </>
      )}
    </CompressedImageForm>
  );
}

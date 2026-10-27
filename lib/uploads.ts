/**
 * Reads the uploaded image from a form ("image" plus the size the browser measured).
 * Photos are shrunk in the browser first (components/image-compression.ts), so 2 MB is plenty.
 */
export const MAX_IMAGE_BYTES = 2 * 1024 * 1024;

export type UploadedImage = { file: File; width: number; height: number };

export function readUploadedImage(
  formData: FormData,
  { required }: { required: boolean },
): { image: UploadedImage | null } | { error: string } {
  const file = formData.get("image");

  if (!(file instanceof File) || file.size === 0) {
    return required ? { error: "The image field is required." } : { image: null };
  }

  if (!file.type.startsWith("image/")) {
    return { error: "The image field must be an image." };
  }

  if (file.size > MAX_IMAGE_BYTES) {
    return { error: "The image field must not be greater than 2048 kilobytes." };
  }

  const width = Number(formData.get("image_width"));
  const height = Number(formData.get("image_height"));
  const hasSize = Number.isInteger(width) && Number.isInteger(height) && width > 0 && height > 0;

  // Unknown size: assume a typical 4:3 photo, like the Laravel app did
  return { image: { file, width: hasSize ? width : 1200, height: hasSize ? height : 900 } };
}

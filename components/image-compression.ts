/**
 * Shrinks big photos in the browser before they are sent.
 * A server action accepts at most a few megabytes per request, and phone photos are often larger.
 */

// Stay a bit below 2 MB: the request also carries the other form fields
const MAX_BYTES = 1.8 * 1024 * 1024;
// Longest side in pixels; plenty for a gallery and keeps files small
const MAX_SIDE = 2400;

export type PreparedImage = { file: File; width: number; height: number };

export async function prepareImage(file: File): Promise<PreparedImage> {
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new Error("this file type cannot be read by your browser (try JPG or PNG)");
  }

  if (file.size <= MAX_BYTES) {
    return { file, width: bitmap.width, height: bitmap.height };
  }

  let scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  let quality = 0.85;

  // Try lower quality first, then smaller dimensions, until the photo fits
  for (let attempt = 0; attempt < 10; attempt++) {
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));

    if (blob && blob.size <= MAX_BYTES) {
      const name = `${file.name.replace(/\.[^.]+$/, "")}.jpg`;
      return { file: new File([blob], name, { type: "image/jpeg" }), width: canvas.width, height: canvas.height };
    }

    if (quality > 0.6) {
      quality -= 0.1;
    } else {
      scale *= 0.8;
    }
  }

  throw new Error("could not be made small enough");
}

/**
 * Replace the form's "image" with the prepared one and add its size.
 * Returns an error message, or null when everything is ready to send.
 */
export async function prepareImageField(formData: FormData): Promise<string | null> {
  const file = formData.get("image");
  if (!(file instanceof File) || file.size === 0) {
    return null;
  }

  try {
    const image = await prepareImage(file);
    formData.set("image", image.file, image.file.name);
    formData.set("image_width", String(image.width));
    formData.set("image_height", String(image.height));
    return null;
  } catch (error) {
    return `${file.name}: ${(error as Error).message}`;
  }
}

/**
 * Only real photos: skip hidden files (.DS_Store), sidecar files (.xmp), RAW files and so on.
 */
export function isPhotoFile(file: File): boolean {
  return (
    !file.name.startsWith(".") &&
    (file.type.startsWith("image/") || /\.(jpe?g|png|gif|webp|heic|heif)$/i.test(file.name))
  );
}

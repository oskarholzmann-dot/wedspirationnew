"use client";

import Link from "next/link";
import { useEffect, useState, type DragEvent, type FormEvent } from "react";
import { finishUpload, uploadPhoto } from "@/app/actions/userzone";
import { CategorySelect } from "@/components/form-fields";
import { isPhotoFile, prepareImage } from "@/components/image-compression";
import { InputLabel, PrimaryButton, Textarea, TextInput } from "@/components/ui";

/**
 * Multi and folder upload: every selected photo is shrunk in the browser and sent in its own request.
 */
export function UploadForm() {
  const [files, setFiles] = useState<File[]>([]);
  const [summary, setSummary] = useState<string | null>(null);
  const [isOver, setIsOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [folderId, setFolderId] = useState<number | null>(null);

  // Dropping a file next to the drop area would make the browser open it and leave the page
  useEffect(() => {
    const prevent = (event: Event) => event.preventDefault();
    window.addEventListener("dragover", prevent);
    window.addEventListener("drop", prevent);
    return () => {
      window.removeEventListener("dragover", prevent);
      window.removeEventListener("drop", prevent);
    };
  }, []);

  const select = (chosen: File[]) => {
    // Upload in file name order: "photo 2" before "photo 10"
    const photos = chosen
      .filter(isPhotoFile)
      .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
    const skipped = chosen.length - photos.length;

    setFiles(photos);
    setSummary(
      photos.length === 0
        ? "No photos found in your selection."
        : `${photos.length} ${photos.length === 1 ? "photo" : "photos"} selected` +
            (skipped > 0 ? ` (${skipped} other ${skipped === 1 ? "file" : "files"} skipped)` : ""),
    );
  };

  const onDrop = async (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsOver(false);

    // The entries must be read right away, before the first "await"
    const entries = [...event.dataTransfer.items]
      .map((item) => item.webkitGetAsEntry?.())
      .filter((entry): entry is FileSystemEntry => Boolean(entry));
    const droppedFiles = [...event.dataTransfer.files];

    setSummary("Reading folder…");
    const dropped: File[] = [];
    for (const entry of entries) {
      dropped.push(...(await filesFromEntry(entry)));
    }
    select(dropped.length > 0 ? dropped : droppedFiles);
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (files.length === 0) {
      setSummary("Please choose photos or a folder first.");
      return;
    }

    const shared = new FormData(event.currentTarget);
    setUploading(true);
    setErrors([]);

    const failed: string[] = [];
    let lastFolderId: number | null = null;

    for (const [index, file] of files.entries()) {
      setStatus(`Uploading ${index + 1} of ${files.length}: ${file.name}`);

      try {
        const image = await prepareImage(file);
        const data = new FormData();
        for (const field of ["title", "description", "category"]) {
          data.set(field, String(shared.get(field) ?? ""));
        }
        data.set("image", image.file, image.file.name);
        data.set("image_width", String(image.width));
        data.set("image_height", String(image.height));

        const result = await uploadPhoto(data);
        if (result.ok) {
          lastFolderId = result.folderId;
        } else {
          failed.push(`${file.name}: ${result.error}`);
        }
      } catch (error) {
        failed.push(`${file.name}: ${(error as Error).message}`);
      }
    }

    if (failed.length === 0 && lastFolderId) {
      await finishUpload(lastFolderId, files.length);
      return;
    }

    // Show what went wrong; photos that did upload are already in the folder
    setStatus(`${files.length - failed.length} of ${files.length} photos uploaded. Not uploaded:`);
    setErrors(failed);
    setFolderId(lastFolderId);
    setUploading(false);
  };

  const chooseButton =
    "cursor-pointer rounded-md px-4 py-2 text-xs font-semibold uppercase tracking-widest focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2";

  return (
    <form onSubmit={onSubmit} className="mt-6 space-y-6">
      <div>
        <InputLabel>Photos</InputLabel>

        {/* Drop photos or whole folders here, or use one of the two buttons */}
        <div
          onDragOver={(event) => {
            event.preventDefault();
            setIsOver(true);
          }}
          onDragLeave={() => setIsOver(false)}
          onDrop={onDrop}
          className={`mt-1 rounded-lg border-2 border-dashed px-6 py-8 text-center transition ${
            isOver ? "border-gray-800 bg-gray-50" : "border-gray-300"
          }`}
        >
          <p className="text-sm text-gray-600">Drag photos or whole folders here</p>
          <p className="mt-1 text-xs text-gray-500">or</p>

          <div className="mt-3 flex flex-wrap justify-center gap-3">
            <label className={`${chooseButton} bg-gray-800 text-white hover:bg-gray-700`}>
              Choose photos
              <input
                type="file"
                accept="image/*"
                multiple
                className="sr-only"
                onChange={(event) => select([...(event.target.files ?? [])])}
              />
            </label>
            <label className={`${chooseButton} border border-gray-800 text-gray-800 hover:bg-gray-100`}>
              Choose a folder
              <input
                type="file"
                multiple
                className="sr-only"
                // webkitdirectory lets the user pick a whole folder; React does not know the attribute
                {...{ webkitdirectory: "" }}
                onChange={(event) => select([...(event.target.files ?? [])])}
              />
            </label>
          </div>

          {summary && (
            <p className="mt-4 text-sm font-medium text-gray-800" aria-live="polite">
              {summary}
            </p>
          )}
        </div>

        <p className="mt-2 text-xs text-gray-500">
          Only photos are uploaded; other files in a folder are skipped. Large photos are made smaller automatically.
        </p>
      </div>

      <div>
        <InputLabel htmlFor="title">Title (optional - otherwise taken from the file name)</InputLabel>
        <TextInput id="title" name="title" type="text" className="mt-1 block w-full" />
      </div>

      <div>
        <InputLabel htmlFor="description">Description (optional, for all selected photos)</InputLabel>
        <Textarea id="description" name="description" rows={3} className="mt-1 block w-full" />
      </div>

      <CategorySelect state={{}} label="Category (optional, for all selected photos)" />

      <div className="flex items-center gap-4">
        <PrimaryButton disabled={uploading}>Upload</PrimaryButton>
        <Link href="/dashboard" className="text-sm text-gray-600 hover:text-gray-900">
          Cancel
        </Link>
      </div>

      {status && (
        <div className="text-sm text-gray-700" aria-live="polite">
          {status}
          {errors.length > 0 && (
            <ul className="mt-2 list-disc ps-5 text-red-600">
              {errors.map((error) => (
                <li key={error}>{error}</li>
              ))}
            </ul>
          )}
          {folderId && errors.length > 0 && (
            <Link href={`/folders/${folderId}`} className="mt-2 inline-block underline">
              Go to your folder
            </Link>
          )}
        </div>
      )}
    </form>
  );
}

/**
 * A dropped folder: read every file inside it, including subfolders.
 */
async function filesFromEntry(entry: FileSystemEntry): Promise<File[]> {
  if (entry.isFile) {
    return [await new Promise<File>((resolve, reject) => (entry as FileSystemFileEntry).file(resolve, reject))];
  }

  const reader = (entry as FileSystemDirectoryEntry).createReader();
  const files: File[] = [];

  // readEntries returns the folder's content in batches until a batch is empty
  while (true) {
    const batch = await new Promise<FileSystemEntry[]>((resolve, reject) => reader.readEntries(resolve, reject));
    if (batch.length === 0) {
      break;
    }
    for (const child of batch) {
      files.push(...(await filesFromEntry(child)));
    }
  }

  return files;
}

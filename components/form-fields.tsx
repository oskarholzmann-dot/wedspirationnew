import { PHOTO_CATEGORIES, categoryLabel } from "@/lib/categories";
import type { FormState } from "@/lib/validation";
import { InputError, InputLabel, Select, Textarea, TextInput } from "./ui";

/**
 * Shared form fields for creating and editing a folder (partials/folder-fields.blade.php).
 */
export function FolderFields({
  state,
  folder,
}: {
  state: FormState;
  folder?: { name: string; notes: string | null; weddingDate: string | null };
}) {
  return (
    <>
      <div>
        <InputLabel htmlFor="name">Name</InputLabel>
        <TextInput
          id="name"
          name="name"
          type="text"
          className="mt-1 block w-full"
          defaultValue={state.values?.name ?? folder?.name ?? ""}
          required
        />
        <InputError className="mt-2" messages={state.errors?.name} />
      </div>

      <div>
        <InputLabel htmlFor="wedding_date">Wedding date (optional)</InputLabel>
        <TextInput
          id="wedding_date"
          name="wedding_date"
          type="date"
          className="mt-1 block w-full"
          defaultValue={state.values?.wedding_date ?? folder?.weddingDate ?? ""}
        />
        <InputError className="mt-2" messages={state.errors?.wedding_date} />
      </div>

      <div>
        <InputLabel htmlFor="notes">Notes for the photographer (optional)</InputLabel>
        <Textarea
          id="notes"
          name="notes"
          rows={4}
          className="mt-1 block w-full"
          defaultValue={state.values?.notes ?? folder?.notes ?? ""}
        />
        <InputError className="mt-2" messages={state.errors?.notes} />
      </div>
    </>
  );
}

/**
 * Title, description and category of a photo.
 */
export function PhotoFields({
  state,
  photo,
  titleLabel = "Title",
  titleRequired = true,
}: {
  state: FormState;
  photo?: { title: string; description: string | null; category: string | null };
  titleLabel?: string;
  titleRequired?: boolean;
}) {
  return (
    <>
      <div>
        <InputLabel htmlFor="title">{titleLabel}</InputLabel>
        <TextInput
          id="title"
          name="title"
          type="text"
          className="mt-1 block w-full"
          defaultValue={state.values?.title ?? photo?.title ?? ""}
          required={titleRequired}
        />
        <InputError className="mt-2" messages={state.errors?.title} />
      </div>

      <div>
        <InputLabel htmlFor="description">Description (optional)</InputLabel>
        <Textarea
          id="description"
          name="description"
          rows={3}
          className="mt-1 block w-full"
          defaultValue={state.values?.description ?? photo?.description ?? ""}
        />
        <InputError className="mt-2" messages={state.errors?.description} />
      </div>

      <CategorySelect state={state} value={photo?.category} />
    </>
  );
}

export function CategorySelect({
  state,
  value,
  label = "Category (optional)",
}: {
  state: FormState;
  value?: string | null;
  label?: string;
}) {
  return (
    <div>
      <InputLabel htmlFor="category">{label}</InputLabel>
      <Select
        id="category"
        name="category"
        className="mt-1 block w-full"
        defaultValue={state.values?.category ?? value ?? ""}
        key={state.values?.category ?? value ?? ""}
      >
        <option value="">- No category -</option>
        {PHOTO_CATEGORIES.map((category) => (
          <option key={category} value={category}>
            {categoryLabel(category)}
          </option>
        ))}
      </Select>
      <InputError className="mt-2" messages={state.errors?.category} />
    </div>
  );
}

export function ImageInput({ state, label, required = false }: { state: FormState; label: string; required?: boolean }) {
  return (
    <div>
      <InputLabel htmlFor="image">{label}</InputLabel>
      <input
        id="image"
        name="image"
        type="file"
        accept="image/*"
        required={required}
        className="mt-1 block w-full text-sm text-gray-700 file:mr-4 file:rounded-md file:border-0 file:bg-gray-800 file:px-4 file:py-2 file:text-white hover:file:bg-gray-700"
      />
      <InputError className="mt-2" messages={state.errors?.image} />
    </div>
  );
}

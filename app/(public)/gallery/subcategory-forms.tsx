"use client";

import { useActionState } from "react";
import { createSubcategory, deleteSubcategory } from "@/app/actions/admin";

/**
 * Admins create and delete subcategories right in the gallery.
 */
export function NewSubcategoryForm() {
  const [state, formAction, pending] = useActionState(createSubcategory, {});

  return (
    <form action={formAction} className="flex flex-wrap items-center gap-1">
      <input
        type="text"
        name="name"
        placeholder="New subcategory"
        maxLength={50}
        required
        aria-label="Name of the new subcategory"
        defaultValue={state.values?.name}
        className="w-40 rounded-full border border-stone-300 bg-white px-3 py-1 text-sm focus:border-stone-800 focus:ring-0"
      />
      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-stone-900 px-3 py-1 text-white hover:bg-stone-700"
        aria-label="Create subcategory"
      >
        +
      </button>
      {state.errors?.name && <span className="text-sm text-red-600">{state.errors.name[0]}</span>}
    </form>
  );
}

export function DeleteSubcategoryButton({ id, name }: { id: number; name: string }) {
  return (
    <form
      action={deleteSubcategory.bind(null, id)}
      onSubmit={(event) => {
        if (!confirm(`Delete the subcategory "${name}"? Its photos stay in the gallery.`)) {
          event.preventDefault();
        }
      }}
    >
      <button type="submit" className="rounded-full px-3 py-1 text-red-700 ring-1 ring-red-200 hover:bg-red-600 hover:text-white">
        Delete &quot;{name}&quot;
      </button>
    </form>
  );
}

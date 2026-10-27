"use client";

import { useActionState, useState, type ReactNode } from "react";
import type { FormState } from "@/lib/validation";
import { InputError } from "./ui";

/**
 * An admin list with checkboxes to delete several entries at once.
 * The checkboxes belong to the bulk form; the cells may contain their own buttons and forms.
 */
export function BulkDeleteTable({
  action,
  field,
  noun,
  headers,
  rows,
  emptyText,
  withPhotosOption = false,
}: {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  field: string;
  noun: string;
  headers: string[];
  rows: { id: number; label: string; cells: ReactNode[] }[];
  emptyText: string;
  withPhotosOption?: boolean;
}) {
  const [state, formAction, pending] = useActionState(action, {});
  const [selected, setSelected] = useState<number[]>([]);
  const allIds = rows.map((row) => row.id);
  const formId = `bulk-delete-${field}`;

  const toggle = (id: number, checked: boolean) =>
    setSelected((current) => (checked ? [...current, id] : current.filter((selectedId) => selectedId !== id)));

  return (
    <div className="space-y-4">
      <form
        id={formId}
        action={formAction}
        onSubmit={(event) => {
          const question =
            noun === "photo"
              ? `Delete ${selected.length} photo(s)? This cannot be undone.`
              : `Delete ${selected.length} ${noun}(s)?`;
          if (!confirm(question)) {
            event.preventDefault();
          }
        }}
        className="flex flex-wrap items-center gap-4 bg-white px-4 py-3 shadow-sm sm:rounded-lg"
      >
        <p className="text-sm text-gray-700">{selected.length} selected</p>

        {withPhotosOption && (
          <label className="inline-flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" name="with_photos" value="1" className="rounded border-gray-400" />
            Also delete the photos the owners uploaded into them
          </label>
        )}

        <button
          type="submit"
          disabled={selected.length === 0 || pending}
          className="ms-auto inline-flex items-center px-4 py-2 bg-red-600 rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-red-500 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Delete selected
        </button>
      </form>

      <InputError messages={state.errors?.[field]} className="px-4 sm:px-0" />

      <div className="bg-white shadow-sm sm:rounded-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50 text-left text-gray-500">
            <tr>
              <th className="w-10 px-4 py-3">
                <input
                  type="checkbox"
                  aria-label={`Select all ${noun}s`}
                  className="rounded border-gray-400"
                  checked={allIds.length > 0 && selected.length === allIds.length}
                  onChange={(event) => setSelected(event.target.checked ? allIds : [])}
                />
              </th>
              {headers.map((header, index) => (
                <th key={header} className={`px-4 py-3 font-medium ${index === headers.length - 1 ? "text-right" : ""}`}>
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={headers.length + 1} className="px-4 py-6 text-center text-gray-500">
                  {emptyText}
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id} className={selected.includes(row.id) ? "bg-red-50" : ""}>
                  <td className="px-4 py-2">
                    <input
                      type="checkbox"
                      name={field}
                      value={row.id}
                      form={formId}
                      aria-label={`Select ${row.label}`}
                      className="rounded border-gray-400"
                      checked={selected.includes(row.id)}
                      onChange={(event) => toggle(row.id, event.target.checked)}
                    />
                  </td>
                  {row.cells}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

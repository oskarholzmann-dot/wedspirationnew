import { z } from "zod";
import { PHOTO_CATEGORIES } from "@/lib/categories";

/**
 * What a form action returns: the error messages per field and the values that were sent,
 * so the form can show them again (like Laravel's $errors and old()).
 */
export type FormState = {
  errors?: Record<string, string[] | undefined>;
  values?: Record<string, string>;
  message?: string;
};

/**
 * Turn a failed validation into the state the form shows.
 */
export function invalid(error: z.ZodError, formData?: FormData): FormState {
  return { errors: z.flattenError(error).fieldErrors, values: textValues(formData) };
}

/**
 * One error message on one field, for checks that happen after validation (e.g. "email taken").
 */
export function fieldError(field: string, message: string, formData?: FormData): FormState {
  return { errors: { [field]: [message] }, values: textValues(formData) };
}

function textValues(formData?: FormData): Record<string, string> {
  const values: Record<string, string> = {};
  formData?.forEach((value, key) => {
    // Passwords are never sent back, like Laravel's old() which skips them
    if (typeof value === "string" && !key.toLowerCase().includes("password") && !key.startsWith("$")) {
      values[key] = value;
    }
  });
  return values;
}

/**
 * An optional text field: empty input becomes null.
 */
function optionalText(label: string, max: number) {
  return z
    .string()
    .trim()
    .max(max, `The ${label} field must not be greater than ${max} characters.`)
    .optional()
    .transform((value) => (value ? value : null));
}

function requiredText(label: string, max: number, min = 1) {
  return z
    .string(`The ${label} field is required.`)
    .trim()
    .min(1, `The ${label} field is required.`)
    .min(min, `The ${label} field must be at least ${min} characters.`)
    .max(max, `The ${label} field must not be greater than ${max} characters.`);
}

const optionalCategory = z
  .union([z.literal(""), z.enum(PHOTO_CATEGORIES, "The selected category is invalid.")])
  .optional()
  .transform((value) => (value ? value : null));

const optionalId = (label: string) =>
  z
    .string()
    .optional()
    .transform((value, context) => {
      if (!value) {
        return null;
      }
      const id = Number(value);
      if (!Number.isInteger(id) || id <= 0) {
        context.addIssue({ code: "custom", message: `The selected ${label} is invalid.` });
        return z.NEVER;
      }
      return id;
    });

const optionalDate = z
  .string()
  .optional()
  .transform((value, context) => {
    if (!value) {
      return null;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || Number.isNaN(Date.parse(value))) {
      context.addIssue({ code: "custom", message: "The wedding date field must be a valid date." });
      return z.NEVER;
    }
    return value;
  });

const email = z
  .string("The email field is required.")
  .trim()
  .toLowerCase()
  .min(1, "The email field is required.")
  .max(255, "The email field must not be greater than 255 characters.")
  .pipe(z.email("The email field must be a valid email address."));

const password = z.string("The password field is required.").min(8, "The password field must be at least 8 characters.");

export const photoFieldsSchema = z.object({
  title: requiredText("title", 255),
  description: optionalText("description", 2000),
  category: optionalCategory,
});

export const adminPhotoFieldsSchema = photoFieldsSchema.extend({
  subcategory_id: optionalId("subcategory"),
});

export const folderFieldsSchema = z.object({
  name: requiredText("name", 255),
  notes: optionalText("notes", 2000),
  wedding_date: optionalDate,
});

// Couples editing their own folder need a name of at least 3 characters (UpdateFolderRequest)
export const userFolderFieldsSchema = folderFieldsSchema.extend({
  name: requiredText("name", 255, 3),
});

export const registerSchema = z
  .object({
    name: requiredText("name", 255),
    email,
    password,
    password_confirmation: z.string().optional(),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "The password field confirmation does not match.",
    path: ["password"],
  });

export const loginSchema = z.object({
  email: z.string().trim().min(1, "The email field is required."),
  password: z.string().min(1, "The password field is required."),
});

export const profileSchema = z.object({
  name: requiredText("name", 255),
  email,
});

export const updatePasswordSchema = z
  .object({
    current_password: z.string().min(1, "The current password field is required."),
    password,
    password_confirmation: z.string().optional(),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "The password field confirmation does not match.",
    path: ["password"],
  });

export const adminUserSchema = z.object({
  name: requiredText("name", 255),
  email,
  // Required for new users; when editing, leave empty to keep the current password
  password: z.string().optional(),
  is_admin: z.string().optional().transform((value) => value === "1"),
});

export { password as passwordSchema };

export const subcategorySchema = z.object({
  name: requiredText("subcategory name", 50),
});

/**
 * The ids of the ticked checkboxes (folders[] / photos[] in the Laravel forms).
 */
export function idsFrom(formData: FormData, field: string): number[] {
  return formData
    .getAll(field)
    .map((value) => Number(value))
    .filter((id) => Number.isInteger(id) && id > 0);
}

/**
 * A positive integer from a route parameter, or null for anything else ("abc", "-1", "1.5").
 */
export function routeId(value: string): number | null {
  return /^\d+$/.test(value) && Number(value) > 0 ? Number(value) : null;
}

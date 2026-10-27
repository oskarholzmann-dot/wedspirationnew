"use server";

import { AuthError } from "next-auth";
import { signIn, signOut } from "@/auth";
import { getDb } from "@/db";
import { createUserWithFolder, findUserByEmail } from "@/lib/users";
import { fieldError, invalid, loginSchema, registerSchema, type FormState } from "@/lib/validation";

export async function login(_state: FormState, formData: FormData): Promise<FormState> {
  const parsed = loginSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return invalid(parsed.error, formData);
  }

  try {
    await signIn("credentials", { ...parsed.data, redirectTo: "/dashboard" });
  } catch (error) {
    // A successful login "throws" a redirect, which has to go through
    if (error instanceof AuthError) {
      return fieldError("email", "These credentials do not match our records.", formData);
    }
    throw error;
  }

  return {};
}

export async function register(_state: FormState, formData: FormData): Promise<FormState> {
  const parsed = registerSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return invalid(parsed.error, formData);
  }

  const db = await getDb();
  if (await findUserByEmail(db, parsed.data.email)) {
    return fieldError("email", "The email has already been taken.", formData);
  }

  // Every couple starts with their own wedding folder
  await createUserWithFolder(db, parsed.data);

  await signIn("credentials", {
    email: parsed.data.email,
    password: parsed.data.password,
    redirectTo: "/dashboard",
  });

  return {};
}

export async function logout(): Promise<void> {
  await signOut({ redirectTo: "/" });
}

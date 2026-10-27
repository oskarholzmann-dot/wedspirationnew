"use client";

import Link from "next/link";
import { useActionState } from "react";
import { login } from "@/app/actions/auth";
import { InputError, InputLabel, PrimaryButton, TextInput } from "@/components/ui";

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(login, {});

  return (
    <form action={formAction}>
      <div>
        <InputLabel htmlFor="email">Email</InputLabel>
        <TextInput
          id="email"
          className="block mt-1 w-full"
          type="email"
          name="email"
          defaultValue={state.values?.email}
          required
          autoFocus
          autoComplete="username"
        />
        <InputError messages={state.errors?.email} className="mt-2" />
      </div>

      <div className="mt-4">
        <InputLabel htmlFor="password">Password</InputLabel>
        <TextInput
          id="password"
          className="block mt-1 w-full"
          type="password"
          name="password"
          required
          autoComplete="current-password"
        />
        <InputError messages={state.errors?.password} className="mt-2" />
      </div>

      <div className="flex items-center justify-end mt-4">
        <Link className="underline text-sm text-gray-600 hover:text-gray-900" href="/register">
          No account yet?
        </Link>

        <PrimaryButton className="ms-3" disabled={pending}>
          Log in
        </PrimaryButton>
      </div>
    </form>
  );
}

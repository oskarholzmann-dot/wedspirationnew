"use client";

import Link from "next/link";
import { useActionState } from "react";
import { register } from "@/app/actions/auth";
import { InputError, InputLabel, PrimaryButton, TextInput } from "@/components/ui";

export default function RegisterPage() {
  const [state, formAction, pending] = useActionState(register, {});

  return (
    <form action={formAction}>
      <div>
        <InputLabel htmlFor="name">Name</InputLabel>
        <TextInput
          id="name"
          className="block mt-1 w-full"
          type="text"
          name="name"
          defaultValue={state.values?.name}
          required
          autoFocus
          autoComplete="name"
        />
        <InputError messages={state.errors?.name} className="mt-2" />
      </div>

      <div className="mt-4">
        <InputLabel htmlFor="email">Email</InputLabel>
        <TextInput
          id="email"
          className="block mt-1 w-full"
          type="email"
          name="email"
          defaultValue={state.values?.email}
          required
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
          autoComplete="new-password"
        />
        <InputError messages={state.errors?.password} className="mt-2" />
      </div>

      <div className="mt-4">
        <InputLabel htmlFor="password_confirmation">Confirm Password</InputLabel>
        <TextInput
          id="password_confirmation"
          className="block mt-1 w-full"
          type="password"
          name="password_confirmation"
          required
          autoComplete="new-password"
        />
      </div>

      <div className="flex items-center justify-end mt-4">
        <Link className="underline text-sm text-gray-600 hover:text-gray-900" href="/login">
          Already registered?
        </Link>

        <PrimaryButton className="ms-4" disabled={pending}>
          Register
        </PrimaryButton>
      </div>
    </form>
  );
}

"use client";

import { useActionState, useEffect, useState, type ReactNode } from "react";
import { deleteAccount, updatePassword, updateProfile } from "@/app/actions/userzone";
import { DangerButton, InputError, InputLabel, PrimaryButton, SecondaryButton, TextInput } from "@/components/ui";
import type { FormState } from "@/lib/validation";

function SectionHeader({ title, children }: { title: string; children: ReactNode }) {
  return (
    <header>
      <h2 className="text-lg font-medium text-gray-900">{title}</h2>
      <p className="mt-1 text-sm text-gray-600">{children}</p>
    </header>
  );
}

/**
 * "Saved." next to the button for two seconds after a successful save.
 */
function SavedNote({ state }: { state: FormState }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (state.message) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- shown once per save, then hidden by the timer
      setVisible(true);
      const timer = setTimeout(() => setVisible(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [state]);

  return visible ? <p className="text-sm text-gray-600">{state.message}</p> : null;
}

export function ProfileForm({ user }: { user: { name: string; email: string } }) {
  const [state, formAction, pending] = useActionState(updateProfile, {});

  return (
    <section>
      <SectionHeader title="Profile Information">Update your account&apos;s profile information and email address.</SectionHeader>

      <form action={formAction} className="mt-6 space-y-6">
        <div>
          <InputLabel htmlFor="name">Name</InputLabel>
          <TextInput
            id="name"
            name="name"
            type="text"
            className="mt-1 block w-full"
            defaultValue={state.values?.name ?? user.name}
            required
            autoComplete="name"
          />
          <InputError className="mt-2" messages={state.errors?.name} />
        </div>

        <div>
          <InputLabel htmlFor="email">Email</InputLabel>
          <TextInput
            id="email"
            name="email"
            type="email"
            className="mt-1 block w-full"
            defaultValue={state.values?.email ?? user.email}
            required
            autoComplete="username"
          />
          <InputError className="mt-2" messages={state.errors?.email} />
        </div>

        <div className="flex items-center gap-4">
          <PrimaryButton disabled={pending}>Save</PrimaryButton>
          <SavedNote state={state} />
        </div>
      </form>
    </section>
  );
}

export function PasswordForm() {
  const [state, formAction, pending] = useActionState(updatePassword, {});

  return (
    <section>
      <SectionHeader title="Update Password">Ensure your account is using a long, random password to stay secure.</SectionHeader>

      <form action={formAction} className="mt-6 space-y-6">
        <div>
          <InputLabel htmlFor="current_password">Current Password</InputLabel>
          <TextInput
            id="current_password"
            name="current_password"
            type="password"
            className="mt-1 block w-full"
            autoComplete="current-password"
          />
          <InputError className="mt-2" messages={state.errors?.current_password} />
        </div>

        <div>
          <InputLabel htmlFor="password">New Password</InputLabel>
          <TextInput id="password" name="password" type="password" className="mt-1 block w-full" autoComplete="new-password" />
          <InputError className="mt-2" messages={state.errors?.password} />
        </div>

        <div>
          <InputLabel htmlFor="password_confirmation">Confirm Password</InputLabel>
          <TextInput
            id="password_confirmation"
            name="password_confirmation"
            type="password"
            className="mt-1 block w-full"
            autoComplete="new-password"
          />
        </div>

        <div className="flex items-center gap-4">
          <PrimaryButton disabled={pending}>Save</PrimaryButton>
          <SavedNote state={state} />
        </div>
      </form>
    </section>
  );
}

export function DeleteAccountForm() {
  const [state, formAction, pending] = useActionState(deleteAccount, {});
  const [confirming, setConfirming] = useState(false);
  const isOpen = confirming || Boolean(state.errors);

  return (
    <section className="space-y-6">
      <SectionHeader title="Delete Account">
        Once your account is deleted, all of its resources and data will be permanently deleted. Before deleting your
        account, please download any data or information that you wish to retain.
      </SectionHeader>

      <DangerButton type="button" onClick={() => setConfirming(true)}>
        Delete Account
      </DangerButton>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-500/75 px-4" role="dialog" aria-modal="true">
          <form action={formAction} className="w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl">
            <h2 className="text-lg font-medium text-gray-900">Are you sure you want to delete your account?</h2>

            <p className="mt-1 text-sm text-gray-600">
              Once your account is deleted, all of its resources and data will be permanently deleted. Please enter your
              password to confirm you would like to permanently delete your account.
            </p>

            <div className="mt-6">
              <InputLabel htmlFor="delete_password" className="sr-only">
                Password
              </InputLabel>
              <TextInput
                id="delete_password"
                name="password"
                type="password"
                className="mt-1 block w-3/4"
                placeholder="Password"
                autoFocus
              />
              <InputError messages={state.errors?.password} className="mt-2" />
            </div>

            <div className="mt-6 flex justify-end">
              <SecondaryButton onClick={() => setConfirming(false)}>Cancel</SecondaryButton>
              <DangerButton className="ms-3" disabled={pending}>
                Delete Account
              </DangerButton>
            </div>
          </form>
        </div>
      )}
    </section>
  );
}

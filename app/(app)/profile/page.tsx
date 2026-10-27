import type { Metadata } from "next";
import type { ReactNode } from "react";
import { PageHeader, PageTitle } from "@/components/ui";
import { requireUser } from "@/lib/auth-user";
import { DeleteAccountForm, PasswordForm, ProfileForm } from "./profile-forms";

export const metadata: Metadata = { title: "Profile" };

function Panel({ children }: { children: ReactNode }) {
  return (
    <div className="p-4 sm:p-8 bg-white shadow sm:rounded-lg">
      <div className="max-w-xl">{children}</div>
    </div>
  );
}

export default async function ProfilePage() {
  const user = await requireUser();

  return (
    <>
      <PageHeader>
        <PageTitle>Profile</PageTitle>
      </PageHeader>

      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
          <Panel>
            <ProfileForm user={{ name: user.name, email: user.email }} />
          </Panel>
          <Panel>
            <PasswordForm />
          </Panel>
          <Panel>
            <DeleteAccountForm />
          </Panel>
        </div>
      </div>
    </>
  );
}

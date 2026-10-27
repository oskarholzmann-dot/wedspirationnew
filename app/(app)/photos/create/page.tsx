import type { Metadata } from "next";
import { Card, PageHeader, PageTitle } from "@/components/ui";
import { UploadForm } from "./upload-form";

export const metadata: Metadata = { title: "Upload photos" };

export default function UploadPhotosPage() {
  return (
    <>
      <PageHeader>
        <PageTitle>Upload photos</PageTitle>
      </PageHeader>

      <div className="py-12">
        <div className="max-w-2xl mx-auto sm:px-6 lg:px-8">
          <Card>
            <p className="text-sm text-gray-600">
              Your photos are added to your wedding folder and shown in the public gallery. You can select several at
              once; large photos are made smaller automatically.
            </p>

            <UploadForm />
          </Card>
        </div>
      </div>
    </>
  );
}

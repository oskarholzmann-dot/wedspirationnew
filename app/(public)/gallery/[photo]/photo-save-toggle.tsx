"use client";

import { useState, useTransition } from "react";
import { setPhotoSaved } from "@/app/actions/photo-tiles";
import { SaveButton } from "@/components/photo-grid";

export function PhotoSaveToggle({ photoId, initiallySaved }: { photoId: number; initiallySaved: boolean }) {
  const [isSaved, setIsSaved] = useState(initiallySaved);
  const [message, setMessage] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const toggle = () =>
    startTransition(async () => {
      const result = await setPhotoSaved(photoId, !isSaved);
      if ("error" in result) {
        setMessage(result.error);
        return;
      }
      setIsSaved(result.saved);
      setMessage(result.message);
    });

  return (
    <div className="inline-flex items-center gap-3">
      <SaveButton isSaved={isSaved} onClick={toggle} />
      {message && <span className="text-sm text-stone-500">{message}</span>}
    </div>
  );
}

"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { deletePhotoFromTile, setPhotoSaved } from "@/app/actions/photo-tiles";
import type { PhotoCardData } from "@/lib/gallery";

/**
 * Photo tiles in their own shape (no cropping), in columns like a masonry wall.
 *
 * - A click opens the photo large in the lightbox (‹ › or arrow keys browse, Esc closes).
 *   Ctrl/Cmd-click still opens the photo page in a new tab.
 * - Logged-in users can save any photo into their folder; owners and admins can delete it.
 */
export function PhotoGrid({
  photos,
  savedIds,
  canSave,
  columnsClassName = "columns-2 gap-2 sm:columns-3 md:columns-4 lg:columns-5 xl:columns-6",
}: {
  photos: PhotoCardData[];
  savedIds: number[];
  canSave: boolean;
  columnsClassName?: string;
}) {
  const [removedIds, setRemovedIds] = useState<Set<number>>(new Set());
  const [saved, setSaved] = useState<Set<number>>(new Set(savedIds));
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const visible = photos.filter((photo) => !removedIds.has(photo.id));

  // A short message at the bottom, e.g. "Saved to Anna & Ben."
  useEffect(() => {
    if (!notice) {
      return;
    }
    const timer = setTimeout(() => setNotice(null), 2500);
    return () => clearTimeout(timer);
  }, [notice]);

  const toggleSaved = (photoId: number) => {
    const shouldSave = !saved.has(photoId);

    startTransition(async () => {
      const result = await setPhotoSaved(photoId, shouldSave);
      if ("error" in result) {
        alert(result.error);
        return;
      }
      setSaved((current) => {
        const next = new Set(current);
        if (result.saved) {
          next.add(photoId);
        } else {
          next.delete(photoId);
        }
        return next;
      });
      setNotice(result.message);
    });
  };

  const remove = (photoId: number) => {
    startTransition(async () => {
      const result = await deletePhotoFromTile(photoId);
      if ("error" in result) {
        alert(result.error);
        return;
      }

      const remaining = visible.filter((photo) => photo.id !== photoId).length;
      setRemovedIds((current) => new Set(current).add(photoId));
      setNotice("The photo was deleted.");

      // In the lightbox: move on to the next photo, or close it when none are left
      setOpenIndex((index) => (index === null || remaining === 0 ? null : Math.min(index, remaining - 1)));
    });
  };

  return (
    <>
      <div className={columnsClassName}>
        {visible.map((photo, index) => (
          <PhotoTile
            key={photo.id}
            photo={photo}
            canSave={canSave}
            isSaved={saved.has(photo.id)}
            onOpen={() => setOpenIndex(index)}
            onToggleSaved={() => toggleSaved(photo.id)}
            onDelete={() => remove(photo.id)}
          />
        ))}
      </div>

      {openIndex !== null && visible[openIndex] && (
        <Lightbox
          photos={visible}
          index={openIndex}
          onIndexChange={setOpenIndex}
          onClose={() => setOpenIndex(null)}
          canSave={canSave}
          isSaved={saved.has(visible[openIndex].id)}
          onToggleSaved={() => toggleSaved(visible[openIndex].id)}
          onDelete={() => remove(visible[openIndex].id)}
        />
      )}

      {notice && (
        <div
          role="status"
          className="fixed inset-x-0 bottom-4 z-50 mx-auto w-fit rounded-full bg-stone-900 px-5 py-2 text-sm text-white shadow-lg"
        >
          {notice}
        </div>
      )}
    </>
  );
}

function PhotoTile({
  photo,
  canSave,
  isSaved,
  onOpen,
  onToggleSaved,
  onDelete,
}: {
  photo: PhotoCardData;
  canSave: boolean;
  isSaved: boolean;
  onOpen: () => void;
  onToggleSaved: () => void;
  onDelete: () => void;
}) {
  const hoverButton = "transition sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100";

  return (
    <div className="group relative mb-2 break-inside-avoid rounded-md">
      <Link
        href={`/gallery/${photo.id}`}
        onClick={(event) => {
          if (event.metaKey || event.ctrlKey || event.shiftKey) {
            return;
          }
          event.preventDefault();
          onOpen();
        }}
        className="block overflow-hidden rounded-md bg-stone-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-700 focus-visible:ring-offset-2"
      >
        {/* width/height let the browser reserve the right space before the image has loaded */}
        {/* eslint-disable-next-line @next/next/no-img-element -- photos come from several hosts and keep their own shape */}
        <img
          src={photo.imageUrl}
          alt={photo.title}
          loading="lazy"
          width={photo.width}
          height={photo.height}
          className="block h-auto w-full transition duration-300 group-hover:scale-105"
        />

        <span className="pointer-events-none absolute inset-x-0 bottom-0 rounded-b-md bg-gradient-to-t from-black/70 to-transparent p-3 pt-10 text-white opacity-0 transition group-hover:opacity-100 group-focus-within:opacity-100">
          {photo.category && (
            <span className="block text-[11px] uppercase tracking-wide text-white/80">{photo.category}</span>
          )}
          <span className="block text-sm font-medium leading-snug">{photo.title}</span>
        </span>
      </Link>

      {photo.canDelete && (
        <button
          type="button"
          onClick={onDelete}
          title="Delete this photo"
          className={`absolute top-2 left-2 rounded-full bg-white/90 px-3 py-1.5 text-xs font-medium text-red-700 shadow-sm ring-1 ring-red-200 hover:bg-red-600 hover:text-white hover:ring-red-600 ${hoverButton}`}
        >
          Delete
        </button>
      )}

      {canSave && (
        <div className={`absolute top-2 right-2 ${isSaved ? "" : hoverButton}`}>
          <SaveButton isSaved={isSaved} onClick={onToggleSaved} />
        </div>
      )}
    </div>
  );
}

export function SaveButton({
  isSaved,
  onClick,
  large = false,
}: {
  isSaved: boolean;
  onClick: () => void;
  large?: boolean;
}) {
  const size = large ? "px-5 py-2 text-sm" : "px-3 py-1.5 text-xs shadow-sm";
  const look = isSaved
    ? "bg-rose-700 text-white ring-rose-700"
    : large
      ? "bg-white text-stone-900 ring-white"
      : "bg-white/90 text-stone-800 ring-stone-300 hover:bg-white";

  return (
    <button
      type="button"
      onClick={onClick}
      title={isSaved ? "Remove from your folder" : "Save to your folder"}
      className={`rounded-full font-medium ring-1 transition ${size} ${look}`}
    >
      {isSaved ? "Saved" : "Save"}
    </button>
  );
}

function Lightbox({
  photos,
  index,
  onIndexChange,
  onClose,
  canSave,
  isSaved,
  onToggleSaved,
  onDelete,
}: {
  photos: PhotoCardData[];
  index: number;
  onIndexChange: (index: number) => void;
  onClose: () => void;
  canSave: boolean;
  isSaved: boolean;
  onToggleSaved: () => void;
  onDelete: () => void;
}) {
  const photo = photos[index];
  const closeButton = useRef<HTMLButtonElement>(null);
  const hasPrevious = index > 0;
  const hasNext = index < photos.length - 1;

  const previous = useCallback(() => hasPrevious && onIndexChange(index - 1), [hasPrevious, index, onIndexChange]);
  const next = useCallback(() => hasNext && onIndexChange(index + 1), [hasNext, index, onIndexChange]);

  // Keyboard: Esc closes, arrow keys browse. The page behind does not scroll while it is open.
  useEffect(() => {
    const openedFrom = document.activeElement as HTMLElement | null;
    closeButton.current?.focus();
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
      openedFrom?.focus();
    };
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      } else if (event.key === "ArrowLeft") {
        previous();
      } else if (event.key === "ArrowRight") {
        next();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose, previous, next]);

  const arrowButton =
    "absolute z-10 rounded-full bg-black/30 p-3 text-white/80 hover:bg-white/10 hover:text-white disabled:opacity-20";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="lightbox-title"
      className="fixed inset-0 z-40 flex flex-col bg-stone-950/95 text-white"
    >
      <div className="flex items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <p className="text-sm text-white/60">
          {index + 1} / {photos.length}
        </p>
        <button
          ref={closeButton}
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="rounded-full p-2 text-white/80 hover:bg-white/10 hover:text-white"
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </div>

      {/* A click on the dark background (not on the photo or a button) closes it */}
      <div
        className="relative flex min-h-0 flex-1 items-center justify-center px-4 sm:px-16"
        onClick={(event) => event.target === event.currentTarget && onClose()}
      >
        <button
          type="button"
          onClick={previous}
          disabled={!hasPrevious}
          aria-label="Previous photo"
          className={`${arrowButton} left-2 sm:left-4`}
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 5l-7 7 7 7" />
          </svg>
        </button>

        {/* eslint-disable-next-line @next/next/no-img-element -- see PhotoTile */}
        <img src={photo.imageUrl} alt={photo.title} className="max-h-full max-w-full rounded object-contain" />

        <button
          type="button"
          onClick={next}
          disabled={!hasNext}
          aria-label="Next photo"
          className={`${arrowButton} right-2 sm:right-4`}
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <div className="flex flex-wrap items-end justify-between gap-4 px-4 py-4 sm:px-6 pb-[calc(1rem+env(safe-area-inset-bottom))]">
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-wide text-rose-300">{photo.category}</p>
          <h2 id="lightbox-title" className="font-serif text-xl">
            {photo.title}
          </h2>
          <p className="mt-1 text-sm text-white/60">
            Shared by {photo.ownerName} &middot;{" "}
            <Link href={`/gallery/${photo.id}`} className="underline hover:text-white">
              Open photo page
            </Link>
          </p>
        </div>

        <div className="flex items-center gap-3">
          {photo.canDelete && (
            <button
              type="button"
              onClick={onDelete}
              className="rounded-full px-5 py-2 text-sm font-medium text-red-300 ring-1 ring-red-400/60 hover:bg-red-600 hover:text-white hover:ring-red-600"
            >
              Delete
            </button>
          )}
          {canSave && <SaveButton isSaved={isSaved} onClick={onToggleSaved} large />}
        </div>
      </div>
    </div>
  );
}

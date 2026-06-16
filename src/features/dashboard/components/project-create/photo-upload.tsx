'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { CloseIcon, UploadIcon } from '@/components/icons';

const MAX_PHOTOS = 5;
const K = 'dashboard.createProject.steps.location';

type Photo = { file: File; url: string };

/** Local photo state with object-URL previews, revoked on remove + unmount. */
function usePhotoFiles() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const photosRef = useRef<Photo[]>([]);
  useEffect(() => {
    photosRef.current = photos;
  }, [photos]);
  useEffect(() => () => photosRef.current.forEach((p) => URL.revokeObjectURL(p.url)), []);

  const add = (list: FileList | null) => {
    if (!list) return;
    const next = Array.from(list)
      .slice(0, MAX_PHOTOS - photos.length)
      .map((file) => ({ file, url: URL.createObjectURL(file) }));
    setPhotos((prev) => [...prev, ...next]);
  };
  const removeAt = (i: number) => {
    const target = photos[i];
    if (target) URL.revokeObjectURL(target.url);
    setPhotos((prev) => prev.filter((_, j) => j !== i));
  };
  return { photos, add, removeAt };
}

/** A 101px image preview tile with a remove button. */
function PhotoThumb({
  url,
  removeLabel,
  onRemove,
}: {
  url: string;
  removeLabel: string;
  onRemove: () => void;
}) {
  return (
    <div
      className="bg-create-phase-panel relative size-[101px] overflow-hidden rounded-xl bg-cover bg-center"
      style={{ backgroundImage: `url(${url})` }}
    >
      <button
        type="button"
        aria-label={removeLabel}
        onClick={onRemove}
        className="bg-card/90 text-foreground absolute end-1 top-1 flex size-6 items-center justify-center rounded-full shadow-sm"
      >
        <CloseIcon aria-hidden className="size-3" />
      </button>
    </div>
  );
}

/**
 * Optional project photos (Figma 1394:7581) — image previews with add/remove.
 * Files are captured client-side only: the create endpoint (per the RN reference)
 * receives no photo parts, so they are not submitted yet.
 */
export function PhotoUpload() {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);
  const { photos, add, removeAt } = usePhotoFiles();

  return (
    <div className="flex w-full flex-col items-end gap-4">
      <p className="text-foreground w-full text-end text-sm font-medium">
        {t(`${K}.photosLabel`, { count: photos.length, max: MAX_PHOTOS })}
      </p>
      <div className="flex flex-wrap items-center justify-end gap-3">
        {photos.map((p, i) => (
          <PhotoThumb
            key={p.url}
            url={p.url}
            removeLabel={t(`${K}.removePhoto`)}
            onRemove={() => removeAt(i)}
          />
        ))}
        {photos.length < MAX_PHOTOS ? (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="bg-create-phase-panel border-primary text-brand-dark-navy flex size-[101px] flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed text-sm"
          >
            <UploadIcon aria-hidden className="size-5" />
            {t(`${K}.addPhoto`)}
          </button>
        ) : null}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        hidden
        aria-label={t(`${K}.addPhoto`)}
        onChange={(e) => add(e.target.files)}
      />
    </div>
  );
}

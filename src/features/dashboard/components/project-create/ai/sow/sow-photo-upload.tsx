'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { CloseIcon, UploadIcon } from '@/components/icons';

const MAX_PHOTOS = 5;
const K = 'dashboard.createProject.ai.sow.publish.photos';

type Photo = { file: File; url: string };

/** Local object-URL preview state, revoked on remove + unmount; reports `File[]` up. */
function usePhotoFiles(onChange: (files: File[]) => void) {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const photosRef = useRef<Photo[]>([]);

  useEffect(() => {
    photosRef.current = photos;
    onChange(photos.map((p) => p.file));
  }, [photos, onChange]);
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

/**
 * Optional project photos for the published project (uploaded best-effort after
 * create, iOS attachments step). The parent receives the raw `File[]` via `onChange`.
 */
export function SowPhotoUpload({ onChange }: { onChange: (files: File[]) => void }) {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);
  const { photos, add, removeAt } = usePhotoFiles(onChange);

  return (
    <div className="flex w-full flex-col gap-3">
      <p className="text-foreground text-start text-sm font-medium">
        {t(`${K}.label`, { count: photos.length, max: MAX_PHOTOS })}
      </p>
      <div className="flex flex-wrap gap-3">
        {photos.map((p, i) => (
          <PhotoThumb
            key={p.url}
            url={p.url}
            removeLabel={t(`${K}.remove`)}
            onRemove={() => removeAt(i)}
          />
        ))}
        {photos.length < MAX_PHOTOS ? (
          <AddPhotoButton label={t(`${K}.add`)} onClick={() => inputRef.current?.click()} />
        ) : null}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        hidden
        aria-label={t(`${K}.add`)}
        onChange={(e) => add(e.target.files)}
      />
    </div>
  );
}

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
      className="bg-muted relative size-[88px] overflow-hidden rounded-xl bg-cover bg-center"
      style={{ backgroundImage: `url(${url})` }}
    >
      <button
        type="button"
        aria-label={removeLabel}
        onClick={onRemove}
        className="bg-card/90 text-foreground focus-visible:outline-ring absolute end-1 top-1 flex size-6 items-center justify-center rounded-full shadow-sm focus-visible:outline-2"
      >
        <CloseIcon aria-hidden className="size-3" />
      </button>
    </div>
  );
}

function AddPhotoButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="border-job-accent/50 text-job-accent hover:bg-job-accent/5 focus-visible:outline-ring flex size-[88px] flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed text-xs focus-visible:outline-2"
    >
      <UploadIcon aria-hidden className="size-5" />
      {label}
    </button>
  );
}

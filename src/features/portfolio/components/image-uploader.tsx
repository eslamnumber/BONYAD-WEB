'use client';

import { type ChangeEvent, useEffect, useId, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { CloseIcon, UploadIcon } from '@/components/icons';
import { Label } from '@/components/ui';
import { buildAssetUrl } from '@/lib/backend';

/** Square thumbnail (kept URL or new-file preview) with a remove button. */
function Thumb({
  src,
  onRemove,
  removeLabel,
}: {
  src: string;
  onRemove: () => void;
  removeLabel: string;
}) {
  return (
    <li className="relative">
      <span
        aria-hidden
        style={{ backgroundImage: `url("${encodeURI(src)}")` }}
        className="bg-field-surface border-border block aspect-square rounded-lg border bg-cover bg-center"
      />
      <button
        type="button"
        onClick={onRemove}
        aria-label={removeLabel}
        className="bg-card text-foreground focus-visible:outline-ring absolute end-1 top-1 flex size-6 items-center justify-center rounded-full border shadow-sm focus-visible:outline-2"
      >
        <CloseIcon className="size-3" aria-hidden />
      </button>
    </li>
  );
}

/** The dashed "add photos" tile wrapping a hidden multi-file input. */
function AddTile({ onPick }: { onPick: (e: ChangeEvent<HTMLInputElement>) => void }) {
  const { t } = useTranslation();
  const inputId = useId();
  return (
    <li>
      <label
        htmlFor={inputId}
        className="border-border text-muted-foreground hover:border-primary/50 hover:text-primary flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border border-dashed text-xs transition-colors"
      >
        <UploadIcon className="size-5" aria-hidden />
        {t('portfolio.fields.addPhoto')}
        <input
          id={inputId}
          type="file"
          accept="image/*"
          multiple
          onChange={onPick}
          className="sr-only"
        />
      </label>
    </li>
  );
}

type Props = {
  existing: string[];
  onExistingChange: (next: string[]) => void;
  files: File[];
  onFilesChange: (next: File[]) => void;
  max?: number;
};

/**
 * Multi-image picker for a project. Holds kept URLs (`existing`) + newly-picked
 * `File`s separately so edit can keep server images while adding new ones; the parent
 * uploads the files on submit and concatenates. My own web design — a responsive
 * thumbnail grid with an "add" tile, gated at `max` (10, matching the iOS limit).
 */
export function ImageUploader({
  existing,
  onExistingChange,
  files,
  onFilesChange,
  max = 10,
}: Props) {
  const { t } = useTranslation();
  const total = existing.length + files.length;
  const removeLabel = t('portfolio.fields.removePhoto');

  const previews = useMemo(() => files.map((file) => URL.createObjectURL(file)), [files]);
  useEffect(() => () => previews.forEach((url) => URL.revokeObjectURL(url)), [previews]);

  function onPick(e: ChangeEvent<HTMLInputElement>) {
    const picked = Array.from(e.target.files ?? []);
    onFilesChange([...files, ...picked.slice(0, Math.max(0, max - total))]);
    e.target.value = '';
  }

  return (
    <div className="flex flex-col gap-2">
      <Label className="text-foreground text-start text-sm font-medium">
        {t('portfolio.fields.photos', { count: total, max })}
      </Label>
      <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {existing.map((url) => (
          <Thumb
            key={url}
            src={buildAssetUrl(url)}
            removeLabel={removeLabel}
            onRemove={() => onExistingChange(existing.filter((u) => u !== url))}
          />
        ))}
        {files.map((file, i) => (
          <Thumb
            key={`${file.name}-${i}`}
            src={previews[i] ?? ''}
            removeLabel={removeLabel}
            onRemove={() => onFilesChange(files.filter((_, idx) => idx !== i))}
          />
        ))}
        {total < max ? <AddTile onPick={onPick} /> : null}
      </ul>
    </div>
  );
}

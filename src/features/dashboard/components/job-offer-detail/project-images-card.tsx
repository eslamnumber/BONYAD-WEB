'use client';

import { useTranslation } from 'react-i18next';

import { buildAssetUrl } from '@/lib/backend';

/**
 * Project images gallery (Figma node 1211:6759 "صور المشروع", thumbnail variant
 * 1211:6770). Read-only — renders the project's image files as a responsive grid
 * of thumbnails; the upload dropzone from the Figma empty state is intentionally
 * dropped (images come from the project detail GET, not an upload here). Sibling
 * of {@link AttachmentsCard}, which renders the non-image files of the same list.
 */
export function ProjectImagesCard({ images }: { images: string[] }) {
  const { t } = useTranslation();

  return (
    <section className="bg-card border-border flex w-full flex-col gap-5 rounded-xl border p-6">
      <div className="flex w-full flex-col gap-3">
        <h2 className="text-foreground text-end text-lg font-semibold">
          {t('dashboard.projectDetail.images.heading')}
        </h2>
        <div className="bg-border h-px w-full" />
      </div>
      {images.length > 0 ? (
        <ul className="grid w-full grid-cols-2 gap-3 sm:grid-cols-3">
          {images.map((path, i) => (
            <ImageThumb key={`${path}-${i}`} path={path} index={i} />
          ))}
        </ul>
      ) : (
        <p className="text-foreground/60 text-end text-sm">
          {t('dashboard.projectDetail.images.empty')}
        </p>
      )}
    </section>
  );
}

function ImageThumb({ path, index }: { path: string; index: number }) {
  const { t } = useTranslation();
  const src = buildAssetUrl(path);
  const alt = t('dashboard.projectDetail.images.alt', { number: index + 1 });
  if (!src) return null;

  // Loaded as a CSS background (not next/image) — robust for arbitrary backend
  // hosts with no remotePatterns entry, matching the Avatar convention; CSP
  // `img-src https:` covers it. The link's aria-label is the accessible name.
  return (
    <li>
      <a
        href={src}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={alt}
        style={{ backgroundImage: `url("${encodeURI(src)}")` }}
        className="bg-field-surface border-border focus-visible:outline-ring block aspect-[3/2] overflow-hidden rounded-lg border bg-cover bg-center focus-visible:outline-2 focus-visible:-outline-offset-2"
      />
    </li>
  );
}

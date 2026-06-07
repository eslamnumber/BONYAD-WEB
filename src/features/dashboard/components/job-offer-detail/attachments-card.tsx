'use client';

import { useTranslation } from 'react-i18next';

import { FileIcon } from '@/components/icons';
import { buildAssetUrl } from '@/lib/backend';

import { type ProjectDetail } from '../../schemas/project';

/** Last path segment as a display file name (decoded), falling back to the raw path. */
function fileName(path: string): string {
  const seg = path.split('/').pop() || path;
  try {
    return decodeURIComponent(seg);
  } catch {
    return seg;
  }
}

/**
 * Attachments card (Figma node 1046:7039): a responsive grid of file tiles, each
 * a download link with a file glyph. Backend-driven from `PROJECTS.DETAILS.files`
 * (a list of paths/URLs — no size metadata, so only the name is shown); renders
 * an empty state when there are no files.
 */
export function AttachmentsCard({ project }: { project: ProjectDetail }) {
  const { t } = useTranslation();
  const files = project.files?.filter(Boolean) ?? [];

  return (
    <section className="bg-card border-border flex w-full flex-col gap-5 rounded-xl border p-6">
      <div className="flex w-full flex-col gap-3">
        <h2 className="text-foreground text-end text-lg font-semibold">
          {t('dashboard.jobOffer.attachments.heading')}
        </h2>
        <div className="bg-border h-px w-full" />
      </div>
      {files.length > 0 ? (
        <ul className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2">
          {files.map((path, i) => (
            <AttachmentItem key={`${path}-${i}`} path={path} />
          ))}
        </ul>
      ) : (
        <p className="text-foreground/60 text-end text-sm">
          {t('dashboard.jobOffer.attachments.empty')}
        </p>
      )}
    </section>
  );
}

function AttachmentItem({ path }: { path: string }) {
  const href = buildAssetUrl(path);
  return (
    <li>
      <a
        href={href || undefined}
        target="_blank"
        rel="noopener noreferrer"
        className="bg-field-surface border-border focus-visible:outline-ring motion-safe:hover:bg-nav-hover flex items-center justify-end gap-3 rounded-lg border p-3 transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2"
      >
        <span className="text-foreground min-w-0 flex-1 truncate text-end text-sm font-medium">
          <bdi>{fileName(path)}</bdi>
        </span>
        <span className="bg-card flex size-8 shrink-0 items-center justify-center rounded-md">
          <FileIcon className="text-job-accent size-4" aria-hidden />
        </span>
      </a>
    </li>
  );
}

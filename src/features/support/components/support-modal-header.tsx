'use client';

import { X } from 'lucide-react';

type Props = { titleId: string; title: string; closeLabel: string; onClose: () => void };

/**
 * Conventional-direction modal header for the support screen (the shared `ModalHeader` is
 * tuned for the inverted map, so under this screen's `dir` override its close-X + title land
 * on the wrong sides). Title leads at the reading-start (`text-start`); close-X trails at the
 * reading-end — so close sits top-right in en, top-left in ar.
 */
export function SupportModalHeader({ titleId, title, closeLabel, onClose }: Props) {
  return (
    <div className="border-border flex items-center justify-between gap-3 border-b px-6 py-5">
      <h2 id={titleId} className="text-foreground min-w-0 truncate text-start text-xl font-medium">
        {title}
      </h2>
      <button
        type="button"
        onClick={onClose}
        aria-label={closeLabel}
        className="text-muted-foreground hover:text-foreground focus-visible:ring-ring shrink-0 rounded-lg p-2 focus-visible:ring-2 focus-visible:outline-none"
      >
        <X className="size-4" aria-hidden />
      </button>
    </div>
  );
}

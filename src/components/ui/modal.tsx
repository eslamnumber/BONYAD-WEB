'use client';

import { X } from 'lucide-react';
import { type ReactNode, type RefObject, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

import { cn } from '@/lib/utils';

const FOCUSABLE =
  'a[href],button:not([disabled]),input:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

/** Modal-dialog a11y: focus the panel on open, trap Tab, ESC to close, lock body scroll, restore focus. */
function useDialogA11y(
  open: boolean,
  onClose: () => void,
  panelRef: RefObject<HTMLDivElement | null>,
) {
  useEffect(() => {
    if (!open) return;
    const opener = document.activeElement as HTMLElement | null;
    const panel = panelRef.current;
    panel?.focus();
    document.body.style.overflow = 'hidden';

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') return onClose();
      if (e.key !== 'Tab' || !panel) return;
      const items = panel.querySelectorAll<HTMLElement>(FOCUSABLE);
      const first = items[0];
      const last = items[items.length - 1];
      if (!first || !last) return;
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
      opener?.focus?.();
    };
  }, [open, onClose, panelRef]);
}

type ModalProps = {
  open: boolean;
  onClose: () => void;
  /** id of the element labelling the dialog (the title rendered by {@link ModalHeader}). */
  labelledBy: string;
  className?: string;
  /** Optional explicit direction for the panel — portalled dialogs don't inherit a caller's
   *  `dir`, so a screen that overrides the document direction passes it here. */
  dir?: 'ltr' | 'rtl';
  children: ReactNode;
};

/**
 * Centered modal dialog: portalled scrim + 440px card with focus trap, ESC, and
 * body-scroll lock. Compose with {@link ModalHeader} / {@link ModalFooter}.
 * The scrim click closes the dialog (cancel-equivalent).
 */
export function Modal({ open, onClose, labelledBy, className, dir, children }: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  useDialogA11y(open, onClose, panelRef);

  if (!open || typeof document === 'undefined') return null;

  return createPortal(
    <div dir={dir} className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        aria-hidden
        onClick={onClose}
        className="bg-card-scrim absolute inset-0 motion-safe:animate-[notif-fade-in_0.2s_ease-out]"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        tabIndex={-1}
        className={cn(
          'bg-card border-border relative flex max-h-[calc(100dvh-2rem)] w-full max-w-[440px] flex-col overflow-y-auto rounded-xl border shadow-xl outline-none',
          className,
        )}
      >
        {children}
      </div>
    </div>,
    document.body,
  );
}

/** Dialog header: close-X at the inline-start, title at the inline-end, hairline divider below. */
export function ModalHeader({
  titleId,
  title,
  closeLabel,
  onClose,
}: {
  titleId: string;
  title: string;
  closeLabel: string;
  onClose: () => void;
}) {
  return (
    <div className="border-border flex items-center justify-between border-b px-6 py-5">
      <button
        type="button"
        onClick={onClose}
        aria-label={closeLabel}
        className="text-muted-foreground hover:text-foreground focus-visible:ring-ring rounded-lg p-2 focus-visible:ring-2 focus-visible:outline-none"
      >
        <X className="size-4" aria-hidden />
      </button>
      <h2 id={titleId} className="text-foreground text-end text-xl font-medium">
        {title}
      </h2>
    </div>
  );
}

/** Dialog footer: button row on a muted surface with a top divider. */
export function ModalFooter({ children }: { children: ReactNode }) {
  return (
    <div className="bg-muted border-border flex items-center gap-3 border-t p-6">{children}</div>
  );
}

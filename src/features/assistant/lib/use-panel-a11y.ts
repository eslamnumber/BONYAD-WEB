'use client';

import { type RefObject, useEffect } from 'react';

const FOCUSABLE =
  'a[href],button:not([disabled]),input:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

/**
 * Modal-dialog a11y for the assistant panel: focus the panel on mount, trap Tab,
 * ESC to close, lock body scroll, and restore focus to the opener (the launcher
 * button) on unmount. The panel mounts only while open, so this runs once per
 * open/close cycle. Mirrors the notifications drawer's focus management.
 */
export function usePanelA11y(onClose: () => void, panelRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
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
  }, [onClose, panelRef]);
}

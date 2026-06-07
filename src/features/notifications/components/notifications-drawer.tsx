'use client';

import { type RefObject, useEffect, useRef } from 'react';

import { useNotificationsStore } from '@/stores/notifications-store';

import { NotificationsDrawerContent } from './notifications-drawer-content';
import { NotificationsDrawerHeader } from './notifications-drawer-header';

const FOCUSABLE =
  'a[href],button:not([disabled]),input:not([disabled]),[tabindex]:not([tabindex="-1"])';

/** Modal-dialog a11y: focus the panel on open, trap Tab, ESC to close, lock body scroll, restore focus. */
function useDrawerA11y(
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

export function NotificationsDrawer() {
  const isOpen = useNotificationsStore((s) => s.isOpen);
  const close = useNotificationsStore((s) => s.close);
  const panelRef = useRef<HTMLDivElement>(null);
  useDrawerA11y(isOpen, close, panelRef);

  if (!isOpen) return null;

  // Resting state is on-screen; the slide-in keyframe runs only under motion-safe,
  // so reduced-motion users see the panel in place (never an off-screen state).
  return (
    <div className="fixed inset-0 z-50">
      <div
        onClick={close}
        aria-hidden
        className="bg-notif-scrim absolute inset-y-0 start-0 end-0 motion-safe:animate-[notif-fade-in_0.3s_ease-out] lg:end-72"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="notifications-title"
        tabIndex={-1}
        className="bg-card absolute inset-y-2 end-2 flex w-[calc(100%-1rem)] max-w-[498px] flex-col overflow-hidden rounded-[12px] shadow-xl outline-none sm:inset-y-4 sm:end-4 lg:inset-y-8 lg:end-80 ltr:motion-safe:animate-[notif-slide-in-end_0.3s_ease-out] rtl:motion-safe:animate-[notif-slide-in-end-rtl_0.3s_ease-out]"
      >
        <NotificationsDrawerHeader onClose={close} />
        <NotificationsDrawerContent />
      </div>
    </div>
  );
}

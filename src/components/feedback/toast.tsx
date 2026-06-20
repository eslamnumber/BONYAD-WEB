'use client';

import { AlertCircle, Check, X } from 'lucide-react';
import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';

type Tone = 'success' | 'error';

const TONE: Record<Tone, string> = {
  success: 'bg-success text-success-foreground',
  error: 'bg-destructive text-destructive-foreground',
};

const TONE_ICON: Record<Tone, typeof Check> = {
  success: Check,
  error: AlertCircle,
};

type Props = {
  open: boolean;
  message: string;
  onClose: () => void;
  tone?: Tone;
  /** Auto-dismiss delay in ms. */
  duration?: number;
};

/**
 * Top-of-screen status toast — a portalled pill that pops down from the viewport
 * top, announces politely (`role="status"` + `aria-live`), and auto-dismisses. A
 * manual dismiss button keeps the timing controllable (WCAG 2.2.1). Colours are
 * tokens with `.dark` pairs; the message is dynamic copy so it carries `dir="auto"`.
 * Portalled (no inherited `dir`), so it sits above modals (`z-[60]`).
 */
export function Toast({ open, message, onClose, tone = 'success', duration = 3500 }: Props) {
  const { t } = useTranslation();

  useEffect(() => {
    if (!open) return;
    const id = setTimeout(onClose, duration);
    return () => clearTimeout(id);
  }, [open, duration, onClose]);

  if (!open || typeof document === 'undefined') return null;
  const Icon = TONE_ICON[tone];

  return createPortal(
    <div className="pointer-events-none fixed inset-x-0 top-4 z-[60] flex justify-center px-4">
      <div
        role="status"
        aria-live="polite"
        className={`pointer-events-auto flex max-w-[calc(100vw-2rem)] items-center gap-2.5 rounded-full py-2.5 ps-4 pe-2.5 shadow-lg motion-safe:animate-[toast-slide-down_0.25s_ease-out] ${TONE[tone]}`}
      >
        <Icon className="size-4 shrink-0" aria-hidden />
        <span dir="auto" className="text-start text-sm font-medium">
          {message}
        </span>
        <button
          type="button"
          onClick={onClose}
          aria-label={t('common.dismiss')}
          className="-me-1 inline-flex size-7 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-black/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current"
        >
          <X className="size-3.5" aria-hidden />
        </button>
      </div>
    </div>,
    document.body,
  );
}

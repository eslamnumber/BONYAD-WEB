'use client';

import { useTranslation } from 'react-i18next';

import { useAssistantStore } from '../store/assistant-store';

import { AssistantOrb } from './assistant-orb';

/**
 * The floating launcher button (Figma 1811:3169) — the assistant orb in a circular,
 * elevated button fixed to the inline-end bottom corner. Under the app's inverted
 * direction mapping `-end` resolves to bottom-right in Arabic / bottom-left in English,
 * exactly as required. Stays mounted while the panel is open (the panel covers it).
 */
export function AssistantFab() {
  const { t } = useTranslation();
  const open = useAssistantStore((s) => s.open);
  return (
    <button
      type="button"
      onClick={open}
      aria-label={t('assistant.fabLabel')}
      aria-haspopup="dialog"
      className="ring-border/40 focus-visible:outline-ring fixed end-5 bottom-6 z-40 flex size-[60px] items-center justify-center overflow-hidden rounded-full shadow-xl ring-1 focus-visible:outline-2 focus-visible:outline-offset-2 motion-safe:transition-transform motion-safe:hover:scale-105 sm:end-6 sm:size-[68px] lg:bottom-28"
    >
      <AssistantOrb className="size-full scale-110" />
    </button>
  );
}

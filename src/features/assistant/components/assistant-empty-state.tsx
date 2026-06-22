'use client';

import { useTranslation } from 'react-i18next';

import { AssistantOrb } from './assistant-orb';
import { AssistantSuggestions } from './assistant-suggestions';

/**
 * The panel's empty state (Figma 1811:3820) — the large orb, a title and subtitle, and
 * a few starter prompts. Picking a starter sends it as the first message. The subtitle
 * carries `dir="auto"` (it ends in weak punctuation); the title is a static label, so
 * it does not (per the inverted-mapping bidi rule).
 */
export function AssistantEmptyState({ onPick }: { onPick: (value: string) => void }) {
  const { t } = useTranslation();
  const starters = [
    { label: t('assistant.starter1'), value: t('assistant.starter1') },
    { label: t('assistant.starter2'), value: t('assistant.starter2') },
    { label: t('assistant.starter3'), value: t('assistant.starter3') },
  ];

  return (
    <div className="flex h-full flex-col items-center justify-center gap-8 px-2 text-center">
      <AssistantOrb className="size-36" />
      <div className="flex flex-col items-center gap-2">
        <p className="text-foreground text-2xl font-semibold">{t('assistant.emptyTitle')}</p>
        <p className="text-foreground/80 text-base" dir="auto">
          {t('assistant.emptySubtitle')}
        </p>
      </div>
      <AssistantSuggestions items={starters} onPick={onPick} center />
    </div>
  );
}

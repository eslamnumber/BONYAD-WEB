'use client';

import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui';

import { OmdahOrb } from './omdah-orb';

const K = 'dashboard.createProject.ai';

/**
 * AI intro / start screen (Figma 1583:2747, simplified) — just the big animated Omdah
 * orb, a short intro, and a "Let's start" button. No input or suggestions; clicking the
 * button enters the chat interview.
 */
export function InterviewIntro({ onStart }: { onStart: () => void }) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-8 py-8 text-center">
      <OmdahOrb className="size-44" />
      <div className="flex max-w-[420px] flex-col items-center gap-3">
        <h1 className="text-foreground text-2xl font-semibold">{t(`${K}.intro.title`)}</h1>
        <p dir="auto" className="text-foreground/80 text-base leading-relaxed">
          {t(`${K}.intro.subtitle`)}
        </p>
      </div>
      <Button onClick={onStart} className="h-12 rounded-full px-8 text-base font-semibold">
        {t(`${K}.start`)}
      </Button>
    </div>
  );
}

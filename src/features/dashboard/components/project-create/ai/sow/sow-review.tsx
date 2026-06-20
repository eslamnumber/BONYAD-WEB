'use client';

import { Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui';
import type { Locale } from '@/types/locale';

import type { SowDocument } from '../../../../api/ai/sow-types';

import { SowRefineBar } from './sow-refine-bar';
import { SowReviewHeader } from './sow-review-header';
import { SowSections } from './sow-sections';

const K = 'dashboard.createProject.ai.sow.review';

/**
 * SOW review document — the generated scope of work, fully rendered, with the
 * refine bar and the publish CTA. While a refine is applying, the document dims
 * behind a "refining…" overlay and re-renders when the updated SOW returns.
 */
export function SowReview({
  sow,
  degraded,
  isRefining,
  locale,
  onRefine,
  onContinue,
}: {
  sow: SowDocument;
  degraded: boolean;
  isRefining: boolean;
  locale: Locale;
  onRefine: (message: string) => Promise<boolean>;
  onContinue: () => void;
}) {
  const { t } = useTranslation();

  return (
    <div className="mx-auto flex w-full max-w-[680px] flex-col gap-6">
      <div className="relative">
        <div
          className={`flex flex-col gap-5 transition-opacity ${isRefining ? 'pointer-events-none opacity-40' : ''}`}
        >
          <SowReviewHeader sow={sow} degraded={degraded} t={t} />
          <SowSections sow={sow} locale={locale} t={t} />
        </div>
        {isRefining ? (
          <div
            className="absolute inset-0 flex items-start justify-center pt-24"
            aria-live="polite"
          >
            <div className="border-border/60 bg-card/90 flex items-center gap-2.5 rounded-full border px-4 py-2.5 shadow-lg backdrop-blur">
              <Loader2 className="text-job-accent size-4 motion-safe:animate-spin" aria-hidden />
              <span className="text-foreground text-sm font-medium">{t(`${K}.refining`)}</span>
            </div>
          </div>
        ) : null}
      </div>

      <div className="border-border/60 flex flex-col gap-3 border-t pt-5">
        <SowRefineBar onRefine={onRefine} isRefining={isRefining} />
        <Button
          onClick={onContinue}
          disabled={isRefining}
          className="h-12 rounded-full text-base font-semibold"
        >
          {t(`${K}.continue`)}
        </Button>
      </div>
    </div>
  );
}

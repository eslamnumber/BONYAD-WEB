'use client';

import { useTranslation } from 'react-i18next';

import { ChevronLeftIcon } from '@/components/icons';
import { conventionalDirection, type Locale } from '@/types/locale';

import type { InterviewAnswers } from '../../../../api/ai/sow-types';

import { SowError } from './sow-error';
import { SowGenerating } from './sow-generating';
import { SowPublishAddress } from './sow-publish-address';
import { SowPublishReview } from './sow-publish-review';
import { SowPublishing } from './sow-publishing';
import { SowReview } from './sow-review';
import { SowSuccess } from './sow-success';
import { useOmdahSow, type OmdahSowController } from './use-omdah-sow';

const K = 'dashboard.createProject.ai.sow';
const CENTERED = new Set(['generating', 'publishing', 'success', 'error']);

/**
 * Omdah SOW flow — the whole AI path from generation through publish, picked up
 * after the interview hands over its answers. Scoped CONVENTIONAL direction
 * (en→ltr, ar→rtl) per the product request, applied on the root.
 */
export function OmdahSowFlow({
  answers,
  onExit,
}: {
  answers: InterviewAnswers;
  onExit: () => void;
}) {
  const { t, i18n } = useTranslation();
  const locale: Locale = i18n.language?.startsWith('ar') ? 'ar' : 'en';
  const controller = useOmdahSow(answers, locale);
  const centered = CENTERED.has(controller.step);
  const showBack = controller.step === 'generating' || controller.step === 'review';
  // Flip is computed from conventionalDirection — a `rtl:`/`ltr:` variant tracks the inverted
  // `<html dir>`, not this flow's local `dir` override, so it would point the wrong way.
  const flip = conventionalDirection(locale) === 'rtl' ? '-scale-x-100' : '';

  return (
    <div
      dir={conventionalDirection(locale)}
      className="relative isolate flex min-h-full w-full flex-col px-4 py-8 sm:px-6"
    >
      <Backdrop />
      {showBack ? (
        <button
          type="button"
          onClick={onExit}
          className="text-foreground/70 hover:text-foreground focus-visible:outline-ring inline-flex w-fit items-center gap-1 rounded text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          <ChevronLeftIcon className={`size-3 shrink-0 ${flip}`} aria-hidden />
          {t(`${K}.back`)}
        </button>
      ) : (
        <span className="h-5" />
      )}
      <div className={`flex flex-1 flex-col py-6 ${centered ? 'items-center justify-center' : ''}`}>
        <StepView controller={controller} locale={locale} onExit={onExit} />
      </div>
    </div>
  );
}

function StepView({
  controller,
  locale,
  onExit,
}: {
  controller: OmdahSowController;
  locale: Locale;
  onExit: () => void;
}) {
  const { step, sow, actions } = controller;

  if (step === 'generating')
    return <SowGenerating arrived={controller.arrived} thinking={controller.thinking} />;
  if (step === 'publishing') return <SowPublishing />;
  if (step === 'success' && controller.projectId)
    return <SowSuccess projectId={controller.projectId} />;
  if (step === 'error' && controller.errorKind)
    return <SowError kind={controller.errorKind} onRetry={actions.retry} onExit={onExit} />;

  if (!sow) return <SowPublishing />; // transient guard while sow settles

  if (step === 'review')
    return (
      <SowReview
        sow={sow}
        degraded={controller.degraded}
        isRefining={controller.isRefining}
        locale={locale}
        onRefine={actions.refine}
        onContinue={actions.toAddress}
      />
    );
  if (step === 'publishAddress')
    return (
      <SowPublishAddress
        draft={controller.draft}
        onUpdate={actions.updateDraft}
        onBack={actions.toReview}
        onContinue={actions.toPublishReview}
      />
    );
  return (
    <SowPublishReview
      sow={sow}
      draft={controller.draft}
      onBack={actions.backToAddress}
      onPublish={actions.publish}
    />
  );
}

function Backdrop() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div className="bg-deco-blob-purple absolute inset-x-0 -top-32 mx-auto h-[26rem] w-[120%] rounded-[50%] opacity-15 blur-[100px]" />
    </div>
  );
}

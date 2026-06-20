'use client';

import { useId } from 'react';
import { useTranslation } from 'react-i18next';

import { CloseIcon } from '@/components/icons';
import { Button, Modal, ModalFooter } from '@/components/ui';
import { conventionalDirection, type Locale } from '@/types/locale';

import { FeedbackFormFields } from './feedback-form-fields';
import { useSubmitFeedback } from './use-submit-feedback';

const ACTION = 'h-11 flex-1 rounded-lg text-base font-medium';

type Props = { open: boolean; locale: Locale; onClose: () => void };

/** Dialog header — title leads, close-X trails (conventional-direction order). */
function FeedbackModalHeader({ titleId, onClose }: { titleId: string; onClose: () => void }) {
  const { t } = useTranslation();
  return (
    <div className="border-border flex items-center justify-between gap-3 border-b px-6 py-5">
      <h2 id={titleId} className="text-foreground min-w-0 truncate text-start text-xl font-medium">
        {t('feedback.new.title')}
      </h2>
      <button
        type="button"
        onClick={onClose}
        aria-label={t('feedback.new.close')}
        className="text-muted-foreground hover:text-foreground focus-visible:ring-ring shrink-0 rounded-lg p-2 focus-visible:ring-2 focus-visible:outline-none"
      >
        <CloseIcon className="size-4" aria-hidden />
      </button>
    </div>
  );
}

/**
 * Compose dialog — category / subject / message → POST /app-feedback. Submit is disabled until
 * the message is non-blank; on success the form resets, the modal closes, and the list
 * refetches. Conventional-direction header (title leads, close-X trails) to match the screen's
 * `dir` override.
 */
export function SubmitFeedbackModal({ open, locale, onClose }: Props) {
  const { t } = useTranslation();
  const titleId = useId();
  const { form, onSubmit, isPending } = useSubmitFeedback(locale, onClose);
  const rootError = form.formState.errors.root?.message;
  const canSubmit = (form.watch('message') ?? '').trim().length > 0 && !isPending;

  return (
    <Modal open={open} onClose={onClose} labelledBy={titleId} dir={conventionalDirection(locale)}>
      <FeedbackModalHeader titleId={titleId} onClose={onClose} />
      <form onSubmit={onSubmit} noValidate className="flex flex-col">
        <div className="flex flex-col gap-4 p-6">
          <FeedbackFormFields form={form} />
          {rootError ? (
            <p role="alert" className="text-destructive text-start text-sm">
              {rootError}
            </p>
          ) : null}
        </div>
        <ModalFooter>
          <Button type="submit" disabled={!canSubmit} className={ACTION}>
            {isPending ? t('feedback.new.submitting') : t('feedback.new.submit')}
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={isPending}
            onClick={onClose}
            className={`border-border text-muted-foreground ${ACTION}`}
          >
            {t('feedback.new.cancel')}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}

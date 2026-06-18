'use client';

import { useId } from 'react';
import { useTranslation } from 'react-i18next';

import { Button, Modal, ModalFooter } from '@/components/ui';
import { type Locale } from '@/types/locale';

import { conventionalDir } from '../lib/support-format';

import { RequestFormFields } from './request-form-fields';
import { SupportModalHeader } from './support-modal-header';
import { useNewRequestForm } from './use-new-request-form';

const ACTION = 'h-11 flex-1 rounded-lg text-base font-medium';

type Props = { open: boolean; locale: Locale; onClose: () => void };

/** New-request dialog — the create form (subject / details / category / priority) → POST /support/request. */
export function NewRequestModal({ open, locale, onClose }: Props) {
  const { t } = useTranslation();
  const titleId = useId();
  const { form, onSubmit, isPending } = useNewRequestForm(locale, onClose);
  const rootError = form.formState.errors.root?.message;

  return (
    <Modal open={open} onClose={onClose} labelledBy={titleId} dir={conventionalDir(locale)}>
      <SupportModalHeader
        titleId={titleId}
        title={t('support.new.title')}
        closeLabel={t('support.new.close')}
        onClose={onClose}
      />
      <form onSubmit={onSubmit} noValidate className="flex flex-col">
        <div className="flex flex-col gap-4 p-6">
          <RequestFormFields form={form} />
          {rootError ? (
            <p role="alert" className="text-destructive text-start text-sm">
              {rootError}
            </p>
          ) : null}
        </div>
        <ModalFooter>
          <Button type="submit" disabled={isPending} className={ACTION}>
            {isPending ? t('support.new.submitting') : t('support.new.submit')}
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={isPending}
            onClick={onClose}
            className={`border-border text-muted-foreground ${ACTION}`}
          >
            {t('support.new.cancel')}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}

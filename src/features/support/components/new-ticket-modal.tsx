'use client';

import { useId } from 'react';
import { useTranslation } from 'react-i18next';

import { Button, Modal, ModalFooter } from '@/components/ui';
import { type Locale } from '@/types/locale';

import { conventionalDir } from '../lib/support-format';

import { NewTicketFormFields } from './new-ticket-form-fields';
import { SupportModalHeader } from './support-modal-header';
import { useNewTicketForm } from './use-new-ticket-form';

const ACTION = 'h-11 flex-1 rounded-lg text-base font-medium';

type Props = { open: boolean; locale: Locale; onClose: () => void };

/** New-ticket dialog — subject / category / priority / details → POST /support/tickets. */
export function NewTicketModal({ open, locale, onClose }: Props) {
  const { t } = useTranslation();
  const titleId = useId();
  const { form, onSubmit, isPending } = useNewTicketForm(locale, onClose);
  const rootError = form.formState.errors.root?.message;

  return (
    <Modal open={open} onClose={onClose} labelledBy={titleId} dir={conventionalDir(locale)}>
      <SupportModalHeader
        titleId={titleId}
        title={t('support.ticket.newTitle')}
        closeLabel={t('support.ticket.close')}
        onClose={onClose}
      />
      <form onSubmit={onSubmit} noValidate className="flex flex-col">
        <div className="flex flex-col gap-4 p-6">
          <NewTicketFormFields form={form} locale={locale} />
          {rootError ? (
            <p role="alert" className="text-destructive text-start text-sm">
              {rootError}
            </p>
          ) : null}
        </div>
        <ModalFooter>
          <Button type="submit" disabled={isPending} className={ACTION}>
            {isPending ? t('support.new.submitting') : t('support.ticket.submit')}
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

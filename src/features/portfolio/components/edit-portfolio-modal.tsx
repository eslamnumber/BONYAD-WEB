'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useId } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { Button, FieldHint, Modal, ModalFooter, ModalHeader } from '@/components/ui';
import { type Locale } from '@/types/locale';

import { useUpdatePortfolio } from '../api/update-portfolio';
import { localizedPortfolioError } from '../lib/portfolio-error';
import { type Portfolio } from '../schemas/portfolio';
import {
  type PortfolioFormValues,
  portfolioFormSchema,
  portfolioToForm,
  toUpdateRequest,
} from '../schemas/portfolio-form';

import { PortfolioBasicFields } from './portfolio-basic-fields';
import { usePortfolioDir } from './use-portfolio-dir';

const ACTION = 'h-11 rounded-lg text-base font-medium';

/** Save + cancel footer. */
function EditActions({ pending, onClose }: { pending: boolean; onClose: () => void }) {
  const { t } = useTranslation();
  return (
    <ModalFooter>
      <Button type="submit" disabled={pending} className={`${ACTION} flex-1`}>
        {pending ? t('portfolio.edit.saving') : t('portfolio.edit.save')}
      </Button>
      <Button
        type="button"
        variant="outline"
        disabled={pending}
        onClick={onClose}
        className={`${ACTION} border-border text-muted-foreground`}
      >
        {t('portfolio.edit.cancel')}
      </Button>
    </ModalFooter>
  );
}

/** Edit basic info (PATCH /portfolios/me). Reuses {@link PortfolioBasicFields}. */
export function EditPortfolioModal({
  open,
  portfolio,
  onClose,
}: {
  open: boolean;
  portfolio: Portfolio;
  onClose: () => void;
}) {
  const { t, i18n } = useTranslation();
  const locale: Locale = i18n.language?.startsWith('ar') ? 'ar' : 'en';
  const dir = usePortfolioDir();
  const titleId = useId();
  const update = useUpdatePortfolio();
  const form = useForm<PortfolioFormValues>({
    resolver: zodResolver(portfolioFormSchema),
    defaultValues: portfolioToForm(portfolio),
    mode: 'onTouched',
  });

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await update.mutateAsync(toUpdateRequest(values));
      onClose();
    } catch (err) {
      form.setError('root', {
        message: localizedPortfolioError(err, locale, t('portfolio.errors.updateFailed')),
      });
    }
  });

  const pending = update.isPending || form.formState.isSubmitting;

  return (
    <Modal open={open} onClose={onClose} labelledBy={titleId} dir={dir} className="max-w-[520px]">
      <ModalHeader
        titleId={titleId}
        title={t('portfolio.edit.title')}
        closeLabel={t('portfolio.edit.close')}
        onClose={onClose}
      />
      <form onSubmit={onSubmit} noValidate className="flex flex-col">
        <div className="flex flex-col gap-5 p-6">
          <PortfolioBasicFields form={form} />
          <FieldHint tone="error">
            {form.formState.errors.root?.message ? form.formState.errors.root.message : undefined}
          </FieldHint>
        </div>
        <EditActions pending={pending} onClose={onClose} />
      </form>
    </Modal>
  );
}

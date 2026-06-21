'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { type ComponentType, type SVGProps } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { DashboardProjectsIcon, FeatureVerifiedIcon, StarIcon } from '@/components/icons';
import { Button, FieldHint } from '@/components/ui';
import { ApiError } from '@/lib/api-client';
import { type Locale } from '@/types/locale';

import { useCreatePortfolio } from '../api/create-portfolio';
import { localizedPortfolioError } from '../lib/portfolio-error';
import { portfolioQueryKey } from '../lib/portfolio-normalize';
import {
  emptyPortfolioForm,
  type PortfolioFormValues,
  portfolioFormSchema,
  toCreateRequest,
} from '../schemas/portfolio-form';

import { PortfolioBasicFields } from './portfolio-basic-fields';

type IconType = ComponentType<SVGProps<SVGSVGElement>>;

/** One value-prop row — an icon chip + a static translated sentence. */
function BenefitRow({ Icon, text }: { Icon: IconType; text: string }) {
  return (
    <li className="flex items-start gap-3">
      <span className="bg-primary/10 text-primary flex size-8 shrink-0 items-center justify-center rounded-lg">
        <Icon className="size-4" aria-hidden />
      </span>
      <span className="text-foreground/90 text-start text-sm leading-7">{text}</span>
    </li>
  );
}

/** Left column: icon + heading + blurb + three value props. */
function CreateIntro() {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start gap-3">
        <span className="bg-primary/10 text-primary flex size-12 shrink-0 items-center justify-center rounded-2xl">
          <DashboardProjectsIcon className="size-6" aria-hidden />
        </span>
        <div className="min-w-0">
          <h2 className="text-foreground text-start text-xl font-semibold">
            {t('portfolio.create.title')}
          </h2>
          <p className="text-muted-foreground mt-1 text-start text-sm leading-6">
            {t('portfolio.create.subtitle')}
          </p>
        </div>
      </div>
      <ul className="flex flex-col gap-3">
        <BenefitRow Icon={DashboardProjectsIcon} text={t('portfolio.create.benefits.showcase')} />
        <BenefitRow Icon={FeatureVerifiedIcon} text={t('portfolio.create.benefits.trust')} />
        <BenefitRow Icon={StarIcon} text={t('portfolio.create.benefits.reach')} />
      </ul>
    </div>
  );
}

/**
 * Empty-state create form (POST /portfolios/create). A two-column split — the value
 * props fill the inline-start, the form the wider inline-end column — so the form
 * never stretches edge-to-edge on a wide monitor. Stacks on mobile.
 */
/** A portfolio already exists (race / stale "no portfolio" read) — refetch, don't error. */
function isAlreadyExists(err: unknown): boolean {
  if (!(err instanceof ApiError)) return false;
  const body = err.body as { error?: string; message?: string } | null;
  const reason = `${body?.error ?? ''} ${body?.message ?? ''} ${err.messageEn ?? ''}`.toLowerCase();
  return reason.includes('already exist');
}

export function CreatePortfolioPanel() {
  const { t, i18n } = useTranslation();
  const locale: Locale = i18n.language?.startsWith('ar') ? 'ar' : 'en';
  const queryClient = useQueryClient();
  const create = useCreatePortfolio();
  const form = useForm<PortfolioFormValues>({
    resolver: zodResolver(portfolioFormSchema),
    defaultValues: emptyPortfolioForm,
    mode: 'onTouched',
  });

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await create.mutateAsync(toCreateRequest(values));
    } catch (err) {
      // The portfolio already exists (the GET wrongly read "none") — refetch so the
      // screen flips to the manager instead of showing a dead-end error.
      if (isAlreadyExists(err)) {
        await queryClient.invalidateQueries({ queryKey: portfolioQueryKey() });
        return;
      }
      form.setError('root', {
        message: localizedPortfolioError(err, locale, t('portfolio.errors.createFailed')),
      });
    }
  });

  const pending = create.isPending || form.formState.isSubmitting;

  return (
    <div className="grid gap-8 lg:grid-cols-5 lg:items-start lg:gap-10">
      <div className="lg:col-span-2">
        <CreateIntro />
      </div>
      <form
        onSubmit={onSubmit}
        noValidate
        className="bg-card border-border flex flex-col gap-6 rounded-2xl border p-5 shadow-sm sm:p-6 lg:col-span-3"
      >
        <PortfolioBasicFields form={form} />
        <FieldHint tone="error">
          {form.formState.errors.root?.message ? form.formState.errors.root.message : undefined}
        </FieldHint>
        <Button type="submit" size="lg" disabled={pending} className="self-end">
          {pending ? t('portfolio.create.creating') : t('portfolio.create.submit')}
        </Button>
      </form>
    </div>
  );
}

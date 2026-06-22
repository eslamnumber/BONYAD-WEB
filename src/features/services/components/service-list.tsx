'use client';

import { Loader2, Trash2, Wrench } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui';
import { conventionalDirection, type Locale } from '@/types/locale';

import { useRemoveService } from '../api';
import { localizedName, type Service } from '../schemas/service';

import type { ShowToast } from './services-screen';
import { ServicesSkeleton } from './services-skeleton';

type Props = {
  services: Service[];
  isPending: boolean;
  isError: boolean;
  locale: Locale;
  onRetry: () => void;
  onAdd: () => void;
  onToast: ShowToast;
};

export function ServiceList({
  services,
  isPending,
  isError,
  locale,
  onRetry,
  onAdd,
  onToast,
}: Props) {
  if (isPending) return <ServicesSkeleton />;
  if (isError) return <ListError onRetry={onRetry} />;
  if (services.length === 0) return <ListEmpty onAdd={onAdd} />;

  // Icon+label content rows read in natural order: scope the locale's natural
  // reading direction on the list container (en→ltr, ar→rtl — the opposite of the
  // page's inverted map) so plain `flex` + `text-start` mirror automatically. Never
  // `flex-row-reverse` for content rows. See docs/i18n-and-rtl.md §Horizontal rows.
  return (
    <ul
      dir={conventionalDirection(locale)}
      className="bg-card border-border flex flex-col gap-2 rounded-2xl border p-3 shadow-sm"
    >
      {services.map((service) => (
        <ServiceRow key={service.id} service={service} locale={locale} onToast={onToast} />
      ))}
    </ul>
  );
}

function ServiceRow({
  service,
  locale,
  onToast,
}: {
  service: Service;
  locale: Locale;
  onToast: ShowToast;
}) {
  const { t } = useTranslation();
  const name = localizedName(service.nameAr, service.nameEn, locale);
  const remove = useRemoveService();

  const handleRemove = () =>
    remove.mutate(service.id, {
      onSuccess: () => onToast(t('services.remove.success', { name })),
      onError: () => onToast(t('services.remove.error'), 'error'),
    });

  return (
    <li className="hover:bg-muted/40 flex items-center justify-between gap-3 rounded-xl p-3 transition-colors">
      <span className="flex min-w-0 items-center gap-3">
        <Wrench className="text-primary size-5 shrink-0" aria-hidden />
        <span className="text-foreground truncate text-start text-sm font-medium">{name}</span>
      </span>
      <button
        type="button"
        onClick={handleRemove}
        disabled={remove.isPending}
        aria-label={t('services.remove.label', { name })}
        className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive focus-visible:ring-ring flex shrink-0 items-center justify-center rounded-lg p-2 transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:opacity-50"
      >
        {remove.isPending ? (
          <Loader2 className="size-4 animate-spin" aria-hidden />
        ) : (
          <Trash2 className="size-4" aria-hidden />
        )}
      </button>
    </li>
  );
}

function ListEmpty({ onAdd }: { onAdd: () => void }) {
  const { t } = useTranslation();
  return (
    <div className="bg-card border-border flex flex-col items-center gap-4 rounded-2xl border p-8 text-center shadow-sm">
      <Wrench className="text-muted-foreground size-8" aria-hidden />
      <div className="flex flex-col gap-1">
        <h2 className="text-foreground text-base font-semibold">{t('services.empty.title')}</h2>
        <p className="text-muted-foreground max-w-sm text-sm leading-6">
          {t('services.empty.subtitle')}
        </p>
      </div>
      <Button type="button" onClick={onAdd}>
        {t('services.add.cta')}
      </Button>
    </div>
  );
}

function ListError({ onRetry }: { onRetry: () => void }) {
  const { t } = useTranslation();
  return (
    <div className="bg-card border-border flex flex-col items-center gap-3 rounded-2xl border p-8 text-center shadow-sm">
      <h2 className="text-foreground text-base font-semibold">{t('services.error.title')}</h2>
      <p className="text-muted-foreground max-w-sm text-sm leading-6">
        {t('services.error.subtitle')}
      </p>
      <Button type="button" variant="outline" onClick={onRetry}>
        {t('services.error.retry')}
      </Button>
    </div>
  );
}

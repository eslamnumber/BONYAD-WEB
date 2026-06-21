'use client';

import { useTranslation } from 'react-i18next';

import { Skeleton } from '@/components/ui';
import { type Locale } from '@/types/locale';

import { localizedName } from '../lib/setup-localized-name';
import type { SetupService } from '../schemas/setup';

import { SelectionBox } from './service-selection-box';

const K = 'onboarding.setup.services';

type ListProps = {
  items?: SetupService[];
  isLoading: boolean;
  isError: boolean;
  locale: Locale;
  isSelected: (id: number) => boolean;
  onToggle: (service: SetupService) => void;
  locked: boolean;
};

/** The lazily-loaded leaf services under an expanded category. */
export function SubcategoryList({
  items,
  isLoading,
  isError,
  locale,
  isSelected,
  onToggle,
  locked,
}: ListProps) {
  const { t } = useTranslation();
  if (isLoading) {
    return (
      <div className="p-3">
        <Skeleton className="h-9 w-full rounded-xl" />
      </div>
    );
  }
  if (isError) {
    return (
      <p role="alert" className="text-destructive px-4 pb-4 text-xs">
        {t(`${K}.subError`)}
      </p>
    );
  }
  if (!items || items.length === 0) {
    return <p className="text-muted-foreground px-4 pb-4 text-xs">{t(`${K}.subEmpty`)}</p>;
  }
  return (
    <ul className="border-border flex flex-col gap-1.5 border-t p-3">
      {items.map((sub) => {
        const selected = isSelected(sub.id);
        return (
          <li key={sub.id}>
            <SubcategoryChip
              service={sub}
              locale={locale}
              selected={selected}
              disabled={locked && !selected}
              onToggle={() => onToggle(sub)}
            />
          </li>
        );
      })}
    </ul>
  );
}

function SubcategoryChip({
  service,
  locale,
  selected,
  disabled,
  onToggle,
}: {
  service: SetupService;
  locale: Locale;
  selected: boolean;
  disabled: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled}
      aria-pressed={selected}
      className={`focus-visible:outline-ring flex w-full items-center gap-2.5 rounded-xl px-3 py-3 text-start text-sm transition-colors focus-visible:outline-2 disabled:opacity-40 ${
        selected ? 'bg-primary/10 text-primary' : 'text-foreground enabled:hover:bg-field-surface'
      }`}
    >
      <SelectionBox selected={selected} />
      <span dir="auto" className="flex-1">
        {localizedName(service.nameAr, service.nameEn, locale)}
      </span>
    </button>
  );
}

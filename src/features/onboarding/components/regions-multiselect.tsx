'use client';

import { useTranslation } from 'react-i18next';

import { FieldHint, Skeleton } from '@/components/ui';
import { Label } from '@/components/ui/label';

import { type Region, useRegions } from '../api/get-regions';

const K = 'onboarding.completeProfile';
const CHIP = 'min-h-11 rounded-full border px-4 text-sm font-medium transition-colors';

type Props = { value: number[]; onChange: (value: number[]) => void; error?: string };

/** Multi-select of service regions — required (≥1). Renders its own loading / error / empty states. */
export function RegionsMultiselect({ value, onChange, error }: Props) {
  const { t } = useTranslation();
  const { data: regions = [], isLoading, isError, refetch } = useRegions();

  const toggle = (id: number) =>
    onChange(value.includes(id) ? value.filter((v) => v !== id) : [...value, id]);

  const ready = !isLoading && !isError;
  return (
    <div className="flex flex-col gap-2">
      <Label className="text-foreground text-end text-sm font-medium">
        {t(`${K}.regionsLabel`)}
      </Label>
      {isLoading ? <RegionsSkeleton /> : null}
      {isError ? <RegionsError onRetry={() => void refetch()} /> : null}
      {ready && regions.length === 0 ? (
        <p className="text-muted-foreground text-end text-sm">{t(`${K}.regionsEmpty`)}</p>
      ) : null}
      {ready && regions.length > 0 ? (
        <RegionChips
          regions={regions}
          value={value}
          onToggle={toggle}
          groupLabel={t(`${K}.regionsLabel`)}
        />
      ) : null}
      <FieldHint tone="error">{error ? t(error) : undefined}</FieldHint>
    </div>
  );
}

function RegionChips({
  regions,
  value,
  onToggle,
  groupLabel,
}: {
  regions: Region[];
  value: number[];
  onToggle: (id: number) => void;
  groupLabel: string;
}) {
  const { i18n } = useTranslation();
  const isAr = i18n.language.startsWith('ar');
  return (
    <div role="group" aria-label={groupLabel} className="flex flex-wrap gap-2">
      {regions.map((r) => {
        const selected = value.includes(r.id);
        return (
          <button
            key={r.id}
            type="button"
            aria-pressed={selected}
            onClick={() => onToggle(r.id)}
            className={`${CHIP} ${selected ? 'bg-primary text-primary-foreground border-primary' : 'bg-login-bg text-foreground border-input'}`}
          >
            {(isAr ? r.nameAr : r.nameEn) ?? String(r.id)}
          </button>
        );
      })}
    </div>
  );
}

const SKELETON_CHIPS = ['w-20', 'w-16', 'w-24', 'w-16', 'w-20', 'w-24'];

function RegionsSkeleton() {
  return (
    <div className="flex flex-wrap gap-2" aria-hidden>
      {SKELETON_CHIPS.map((w, i) => (
        <Skeleton key={i} className={`h-11 ${w} rounded-full`} />
      ))}
    </div>
  );
}

function RegionsError({ onRetry }: { onRetry: () => void }) {
  const { t } = useTranslation();
  return (
    <div className="flex items-center justify-between gap-3">
      <p role="alert" className="text-destructive text-end text-sm">
        {t('onboarding.completeProfile.regionsError')}
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="text-primary focus-visible:outline-ring shrink-0 text-sm font-semibold underline-offset-2 hover:underline focus-visible:outline-2"
      >
        {t('common.tryAgain')}
      </button>
    </div>
  );
}

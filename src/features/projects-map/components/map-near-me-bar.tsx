'use client';

import { useTranslation } from 'react-i18next';

import { type Locale } from '@/types/locale';

import { NEAR_ME_RADIOS } from '../lib/ksa-cities';

const K = 'projectsMap';

type MapNearMeBarProps = {
  enabled: boolean;
  isLocating: boolean;
  denied: boolean;
  found: boolean;
  radius: number;
  onToggle: () => void;
  onRadiusChange: (km: number) => void;
  locale: Locale;
};

/**
 * "Near Me" toggle + radius chips (5/10/20 km) + status indicators.
 * Shows "Location found" when coords resolve, "Location access denied" on error.
 */
export function MapNearMeBar({
  enabled,
  isLocating,
  denied,
  found,
  radius,
  onToggle,
  onRadiusChange,
  locale: _locale,
}: MapNearMeBarProps) {
  const { t } = useTranslation();
  return (
    <div className="bg-background/94 border-border/50 pointer-events-auto overflow-x-auto border-b backdrop-blur-sm">
      <div className="flex items-center gap-2 px-3 py-2">
        <NearMeToggle enabled={enabled} isLocating={isLocating} onToggle={onToggle} />
        {enabled &&
          NEAR_ME_RADIOS.map((km) => (
            <RadiusChip key={km} km={km} active={radius === km} onSelect={onRadiusChange} />
          ))}
        {enabled && found && (
          <span className="flex shrink-0 items-center gap-1 text-[11px] font-medium text-green-500">
            <span className="size-1.5 rounded-full bg-green-500" />
            {t(`${K}.locationFound`)}
          </span>
        )}
        {enabled && denied && (
          <span className="text-destructive shrink-0 text-[11px] font-medium">
            {t(`${K}.locationDenied`)}
          </span>
        )}
      </div>
    </div>
  );
}

function NearMeToggle({
  enabled,
  isLocating,
  onToggle,
}: {
  enabled: boolean;
  isLocating: boolean;
  onToggle: () => void;
}) {
  const { t } = useTranslation();
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors ${
        enabled ? 'bg-primary text-primary-foreground' : 'border-primary/45 bg-card text-primary'
      }`}
    >
      {isLocating ? (
        <span className="size-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : (
        <svg viewBox="0 0 24 24" fill="currentColor" className="size-3.5" aria-hidden>
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 110-5 2.5 2.5 0 010 5z" />
        </svg>
      )}
      {t(`${K}.nearMe`)}
    </button>
  );
}

function RadiusChip({
  km,
  active,
  onSelect,
}: {
  km: number;
  active: boolean;
  onSelect: (km: number) => void;
}) {
  const { t } = useTranslation();
  return (
    <button
      type="button"
      onClick={() => onSelect(km)}
      className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
        active
          ? 'bg-primary text-primary-foreground'
          : 'border-border bg-card text-foreground border'
      }`}
    >
      {t(`${K}.radius`, { km })}
    </button>
  );
}

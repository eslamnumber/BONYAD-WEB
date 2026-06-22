'use client';

import { type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { type Locale } from '@/types/locale';

import type { KsaCity } from '../lib/ksa-cities';

const K = 'projectsMap';

/**
 * Top filter bar: an optional fixed `leading` control (the screen's close button) +
 * a horizontal scroll of city chips ("All KSA" first). Selecting a city pans the
 * camera and filters markers to 60km; tapping the active city again deselects. The
 * leading slot sits outside the scroll area so it never scrolls away.
 */
export function MapCityChips({
  cities,
  selectedId,
  onSelect,
  locale,
  leading,
}: {
  cities: readonly KsaCity[];
  selectedId: string | null;
  onSelect: (city: KsaCity | null) => void;
  locale: Locale;
  leading?: ReactNode;
}) {
  const { t } = useTranslation();
  return (
    <div className="bg-card/96 pointer-events-auto flex items-center shadow-sm backdrop-blur-sm">
      {leading}
      <div className="flex min-w-0 flex-1 gap-2 overflow-x-auto px-3 py-2">
        <Chip
          active={selectedId === null}
          onClick={() => onSelect(null)}
          label={t(`${K}.allKsa`)}
        />
        {cities.map((city) => (
          <Chip
            key={city.id}
            active={selectedId === city.id}
            onClick={() => onSelect(city)}
            label={locale === 'ar' ? city.nameAr : city.nameEn}
          />
        ))}
      </div>
    </div>
  );
}

function Chip({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
        active
          ? 'bg-primary text-primary-foreground'
          : 'border-border bg-card text-foreground hover:bg-muted border'
      }`}
    >
      {label}
    </button>
  );
}

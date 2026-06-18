'use client';

import { Building2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { PersonIcon } from '@/components/icons';

export type AccountMode = 'individual' | 'company';

const OPTIONS: { mode: AccountMode; Icon: typeof PersonIcon }[] = [
  { mode: 'individual', Icon: PersonIcon },
  { mode: 'company', Icon: Building2 },
];

/**
 * Segmented Individual / Company control. Selecting the inactive segment calls
 * `onSelect` with that mode — the screen decides what happens (Company opens the
 * registration modal; Individual switches immediately). Disabled while a switch
 * is in flight. Uses `aria-pressed` for SR state.
 */
export function AccountTypeToggle({
  value,
  onSelect,
  disabled = false,
}: {
  value: AccountMode;
  onSelect: (mode: AccountMode) => void;
  disabled?: boolean;
}) {
  const { t } = useTranslation();
  return (
    <div
      className="bg-muted flex gap-1 rounded-full p-1"
      role="group"
      aria-label={t('profile.accountType.title')}
    >
      {OPTIONS.map(({ mode, Icon }) => {
        const active = value === mode;
        return (
          <button
            key={mode}
            type="button"
            disabled={disabled}
            aria-pressed={active}
            onClick={() => onSelect(mode)}
            className={`focus-visible:outline-ring flex min-h-11 flex-1 items-center justify-center gap-2 rounded-full px-4 py-3 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-60 ${
              active
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground motion-safe:hover:text-foreground'
            }`}
          >
            <Icon className="size-4" aria-hidden />
            {t(`profile.accountType.${mode}`)}
          </button>
        );
      })}
    </div>
  );
}

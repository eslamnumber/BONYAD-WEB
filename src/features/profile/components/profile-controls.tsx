'use client';

import { Globe, LogOut, Moon } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { LanguageToggle } from '@/components/layout/language-toggle';
import { LogoutConfirmModal } from '@/features/auth';
import { switchTheme } from '@/lib/theme-switch';
import type { Locale } from '@/types/locale';

import { ProfileRowShell } from './profile-section';

const ROW_BTN =
  'focus-visible:outline-ring motion-safe:hover:bg-muted/60 block w-full rounded-xl text-start transition-colors focus-visible:outline-2 focus-visible:outline-offset-2';

function Switch({
  checked,
  label,
  onToggle,
}: {
  checked: boolean;
  label: string;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onToggle}
      className={`focus-visible:outline-ring relative h-5 w-9 shrink-0 rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 ${checked ? 'bg-primary' : 'bg-muted-foreground/30'}`}
    >
      <span
        className={`absolute top-0.5 size-4 rounded-full bg-white transition-all ${checked ? 'end-0.5' : 'start-0.5'}`}
      />
    </button>
  );
}

/** Light / dark theme switch row. */
export function DarkModeRow() {
  const { t } = useTranslation();
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  return (
    <ProfileRowShell
      Icon={Moon}
      label={t('profile.rows.darkMode.title')}
      control={
        <Switch
          checked={isDark}
          label={t('profile.rows.darkMode.title')}
          onToggle={() => switchTheme(() => setTheme(isDark ? 'light' : 'dark'))}
        />
      }
    />
  );
}

/**
 * Locale row — reuses the shared {@link LanguageToggle} so it behaves exactly
 * like the home header toggle (flip ar ⇄ en, persist the `bonyad-lang` cookie,
 * `router.refresh()`). No duplicated switch logic; the toggle is the single
 * source per docs/i18n-and-rtl.md.
 */
export function LanguageRow() {
  const { t, i18n: i18nInstance } = useTranslation();
  const current: Locale = i18nInstance.language?.startsWith('ar') ? 'ar' : 'en';

  return (
    <ProfileRowShell
      Icon={Globe}
      label={t('profile.rows.language.title')}
      control={
        <LanguageToggle
          current={current}
          ariaLabel={t('language.ariaLabel')}
          switchToLabel={
            current === 'en' ? t('language.switchToArabic') : t('language.switchToEnglish')
          }
        />
      }
    />
  );
}

/** Sign-out action row (danger zone) — opens a confirmation dialog before clearing the session. */
export function LogoutRow() {
  const { t } = useTranslation();
  const [confirmOpen, setConfirmOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setConfirmOpen(true)} className={ROW_BTN}>
        <ProfileRowShell Icon={LogOut} label={t('dashboard.signOut')} />
      </button>
      <LogoutConfirmModal open={confirmOpen} onClose={() => setConfirmOpen(false)} />
    </>
  );
}

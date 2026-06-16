'use client';

import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { SidebarDarkModeIcon, SidebarLanguageIcon, SidebarLogoutIcon } from '@/components/icons';
import { LOCALE_COOKIE_NAME } from '@/config/constants';
import { useLogout } from '@/features/auth';
import { i18n } from '@/lib/i18n';
import type { Locale } from '@/types/locale';

const ROW = 'flex items-center justify-end gap-[7px] text-xs whitespace-nowrap transition-colors';

type Props = {
  /** Profile-card visuals rendered inside the trigger button. */
  children: ReactNode;
  /** Localized aria-label for the trigger. */
  triggerLabel: string;
};

/**
 * Customer sidebar account menu (Figma 1469:7475). The profile card is the
 * trigger; a floating card opens above it with dark-mode / language / logout
 * rows. Mirrors the existing ProjectsSortMenu popover (rounded-xl card, hairline
 * dividers, same shadow). Closes on outside-click + Escape.
 */
export function SidebarSettingsMenu({ children, triggerLabel }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: PointerEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={triggerLabel}
        onClick={() => setOpen((v) => !v)}
        className="focus-visible:outline-ring rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2"
      >
        {children}
      </button>
      {open ? <SettingsMenuPanel onClose={() => setOpen(false)} /> : null}
    </div>
  );
}

function MenuRow({
  label,
  icon,
  onClick,
  tone = 'default',
  disabled,
}: {
  label: string;
  icon: ReactNode;
  onClick: () => void;
  tone?: 'default' | 'danger';
  disabled?: boolean;
}) {
  const toneClass =
    tone === 'danger'
      ? 'text-destructive motion-safe:hover:text-destructive/80'
      : 'text-foreground motion-safe:hover:text-foreground/70';
  return (
    <button
      type="button"
      role="menuitem"
      disabled={disabled}
      onClick={onClick}
      className={`${ROW} ${toneClass} disabled:opacity-60`}
    >
      <span>{label}</span>
      {icon}
    </button>
  );
}

function SettingsMenuPanel({ onClose }: { onClose: () => void }) {
  const { t, i18n: i18nInstance } = useTranslation();
  const { resolvedTheme, setTheme } = useTheme();
  const router = useRouter();
  const { mutate: logout, isPending } = useLogout();

  const isDark = resolvedTheme === 'dark';
  const current: Locale = i18nInstance.language?.startsWith('ar') ? 'ar' : 'en';

  function toggleLanguage() {
    const next: Locale = current === 'en' ? 'ar' : 'en';
    void i18n.changeLanguage(next);
    document.cookie = `${LOCALE_COOKIE_NAME}=${next}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
    router.refresh();
    onClose();
  }

  return (
    <div
      role="menu"
      className="bg-popover border-border absolute start-0 bottom-full z-20 mb-2 flex min-w-[188px] flex-col items-stretch gap-2 rounded-xl border p-4 shadow-[0px_2px_20px_0px_rgba(0,0,0,0.1)]"
    >
      <MenuRow
        label={isDark ? t('dashboard.menu.lightMode') : t('dashboard.menu.darkMode')}
        icon={<SidebarDarkModeIcon className="size-4 shrink-0" aria-hidden />}
        onClick={() => setTheme(isDark ? 'light' : 'dark')}
      />
      <div className="bg-border h-px w-full" aria-hidden />
      <MenuRow
        label={current === 'en' ? t('language.switchToArabic') : t('language.switchToEnglish')}
        icon={<SidebarLanguageIcon className="size-4 shrink-0" aria-hidden />}
        onClick={toggleLanguage}
      />
      <div className="bg-border h-px w-full" aria-hidden />
      <MenuRow
        label={t('dashboard.signOut')}
        icon={<SidebarLogoutIcon className="size-4 shrink-0" aria-hidden />}
        onClick={() => logout()}
        tone="danger"
        disabled={isPending}
      />
    </div>
  );
}

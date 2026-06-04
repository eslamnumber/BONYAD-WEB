import { type TFunction } from '@/lib/get-translations';
import { type Locale } from '@/types/locale';

import { type AuthHeaderLabels } from './components/auth-header';

export function getAuthHeaderLabels(t: TFunction, locale: Locale): AuthHeaderLabels {
  return {
    brandName: t('site.name'),
    back: t('auth.backButton'),
    backAriaLabel: t('auth.backButtonAriaLabel'),
    languageToggle: {
      ariaLabel: t('language.ariaLabel'),
      switchTo: locale === 'en' ? t('language.switchToArabic') : t('language.switchToEnglish'),
    },
    themeToggle: {
      ariaLabel: t('theme.ariaLabel'),
      labels: { light: t('theme.light'), dark: t('theme.dark'), system: t('theme.system') },
    },
  };
}

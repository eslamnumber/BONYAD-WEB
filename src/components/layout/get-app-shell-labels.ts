import { ROUTES } from '@/config/routes';
import { type TFunction } from '@/lib/get-translations';
import { type Locale } from '@/types/locale';

import { type AppShell } from './app-shell';

type AppShellLabels = React.ComponentProps<typeof AppShell>['labels'];

function getHeaderLabels(t: TFunction, locale: Locale): AppShellLabels['header'] {
  return {
    siteName: t('site.name'),
    nav: {
      services: t('nav.services'),
      howItWorks: t('nav.howItWorks'),
      about: t('nav.about'),
      blog: t('nav.blog'),
      contact: t('nav.contact'),
      login: t('nav.login'),
      getStarted: t('nav.getStarted'),
    },
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

function getFooterLabels(t: TFunction): AppShellLabels['footer'] {
  return {
    siteName: t('site.name'),
    tagline: t('site.tagline'),
    copyright: t('site.copyright'),
    columns: [
      {
        title: t('footer.platform'),
        links: [
          { href: ROUTES.TECHNICIANS, label: t('footer.findPro') },
          { href: ROUTES.SERVICES, label: t('footer.howItWorks') },
          { href: ROUTES.SERVICES, label: t('footer.pricing') },
          { href: ROUTES.SERVICES, label: t('footer.browseCategories') },
        ],
      },
      {
        title: t('footer.company'),
        links: [
          { href: ROUTES.ABOUT, label: t('footer.about') },
          { href: ROUTES.CONTACT, label: t('footer.partner') },
          { href: ROUTES.CONTACT, label: t('footer.careers') },
          { href: ROUTES.CONTACT, label: t('nav.contact') },
        ],
      },
      {
        title: t('footer.services'),
        links: [
          { href: ROUTES.SERVICES, label: t('footer.projectManagement') },
          { href: ROUTES.SERVICES, label: t('footer.supervision') },
          { href: ROUTES.SERVICES, label: t('footer.propertyManagement') },
          { href: ROUTES.SERVICES, label: t('footer.materialSupply') },
          { href: ROUTES.SERVICES, label: t('footer.consultation') },
        ],
      },
    ],
    legal: {
      privacy: t('footer.privacy'),
      privacyHref: ROUTES.PRIVACY,
      terms: t('footer.terms'),
      termsHref: ROUTES.TERMS,
    },
    social: {
      xAriaLabel: t('footer.xAriaLabel'),
      linkedinAriaLabel: t('footer.linkedinAriaLabel'),
      instagramAriaLabel: t('footer.instagramAriaLabel'),
      tiktokAriaLabel: t('footer.tiktokAriaLabel'),
    },
  };
}

export function getAppShellLabels(t: TFunction, locale: Locale): AppShellLabels {
  return {
    skipToMain: t('a11y.skipToMain'),
    header: getHeaderLabels(t, locale),
    footer: getFooterLabels(t),
  };
}

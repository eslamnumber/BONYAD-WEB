import { getTranslations } from '@/lib/get-translations';
import { type Locale } from '@/types/locale';

import { AppDownloadMobileBar } from './app-download-mobile-bar';
import { StoreBadges } from './store-badges';

type HomeAppDownloadProps = { locale: Locale };

/**
 * Sticky-below-header app-download bar for small screens (md:hidden). Render this at the
 * TOP of the page so it pins under the header as the user scrolls. Pairs with
 * {@link HomeAppDownload} (the md+ in-page section).
 */
export function HomeAppDownloadBar({ locale }: HomeAppDownloadProps) {
  const { t } = getTranslations(locale);

  return (
    <AppDownloadMobileBar
      title={t('home.appDownload.barTitle')}
      appStoreAlt={t('home.appDownload.appStoreAlt')}
      googlePlayAlt={t('home.appDownload.googlePlayAlt')}
      dismissLabel={t('home.appDownload.dismiss')}
    />
  );
}

/**
 * In-page app-download card shown on md+ screens only (hidden md:block). On small screens
 * the {@link HomeAppDownloadBar} sticky bar is used instead.
 */
export function HomeAppDownload({ locale }: HomeAppDownloadProps) {
  const { t } = getTranslations(locale);

  return (
    <section className="bg-background relative hidden py-12 sm:py-16 md:block">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="border-border bg-card flex min-h-[280px] flex-col items-center justify-center gap-6 rounded-[16px] border px-6 py-12 text-center">
          <div className="flex max-w-[640px] flex-col items-center gap-4">
            <h2
              dir="auto"
              className="text-foreground text-3xl leading-tight font-medium sm:text-4xl"
            >
              {t('home.appDownload.headline')}
            </h2>
            <p
              dir="auto"
              className="text-muted-foreground max-w-[520px] text-lg leading-snug sm:text-xl"
            >
              {t('home.appDownload.body')}
            </p>
          </div>
          <StoreBadges
            appStoreAlt={t('home.appDownload.appStoreAlt')}
            googlePlayAlt={t('home.appDownload.googlePlayAlt')}
          />
        </div>
      </div>
    </section>
  );
}

import { AppShell, DemoBanner, getAppShellLabels } from '@/components/layout';
import { HomeAppDownloadBar } from '@/features/home';
import { getTranslations } from '@/lib/get-translations';
import { getServerLocale } from '@/lib/locale';
import { type Locale } from '@/types/locale';

type MainLayoutProps = { children: React.ReactNode };

export default async function MainLayout({ children }: MainLayoutProps) {
  const locale = await getServerLocale();
  const { t } = getTranslations(locale);
  const labels = getAppShellLabels(t, locale as Locale);

  return (
    <AppShell
      locale={locale as Locale}
      labels={labels}
      topBanner={
        <>
          <DemoBanner label={t('common.demoBanner')} />
          <HomeAppDownloadBar locale={locale as Locale} />
        </>
      }
    >
      {children}
    </AppShell>
  );
}

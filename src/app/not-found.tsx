import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { ROUTES } from '@/config/routes';
import { getTranslations } from '@/lib/get-translations';
import { getServerLocale } from '@/lib/locale';

export const metadata = {
  title: 'Page not found',
  robots: { index: false, follow: true },
};

export default async function NotFound() {
  const locale = await getServerLocale();
  const { t } = getTranslations(locale);

  return (
    <section className="mx-auto flex max-w-2xl flex-col items-center justify-center gap-6 px-6 py-24 text-center">
      <p className="text-muted-foreground text-sm font-medium">404</p>
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
        {t('errors.notFoundTitle')}
      </h1>
      <p className="text-muted-foreground text-balance">{t('errors.notFoundDescription')}</p>
      <Button asChild>
        <Link href={ROUTES.HOME}>{t('common.goToHome')}</Link>
      </Button>
    </section>
  );
}

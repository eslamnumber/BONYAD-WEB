import Link from 'next/link';

import { ROUTES } from '@/config/routes';
import { getTranslations } from '@/lib/get-translations';
import { getServerLocale } from '@/lib/locale';

export default async function BlogNotFound() {
  const locale = await getServerLocale();
  const { t } = getTranslations(locale);

  return (
    <section className="mx-auto flex max-w-2xl flex-col items-center gap-6 px-4 py-24 text-center">
      <h1 className="text-foreground text-3xl font-semibold">{t('blog.detail.notFoundTitle')}</h1>
      <p className="text-muted-foreground text-base">{t('blog.detail.notFoundBody')}</p>
      <Link
        href={ROUTES.BLOG}
        className="bg-primary text-primary-foreground rounded-full px-6 py-3 text-base font-semibold transition-opacity motion-safe:hover:opacity-90"
      >
        {t('blog.detail.backToBlog')}
      </Link>
    </section>
  );
}

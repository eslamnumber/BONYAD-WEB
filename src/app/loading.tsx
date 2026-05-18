import { LoadingState } from '@/components/feedback';
import { getTranslations } from '@/lib/get-translations';
import { getServerLocale } from '@/lib/locale';

export default async function Loading() {
  const locale = await getServerLocale();
  const { t } = getTranslations(locale);
  return (
    <div className="flex min-h-dvh items-center justify-center">
      <LoadingState label={t('a11y.loading')} />
    </div>
  );
}

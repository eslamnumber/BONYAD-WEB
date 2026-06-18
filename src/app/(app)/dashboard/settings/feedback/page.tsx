import type { Metadata } from 'next';

import { FeedbackScreen } from '@/features/feedback';
import { getTranslations } from '@/lib/get-translations';
import { getServerLocale } from '@/lib/locale';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const { t } = getTranslations(locale);
  return { title: t('feedback.title'), robots: { index: false, follow: false } };
}

/**
 * Feedback / الملاحظات (`/dashboard/settings/feedback`) — target of the profile hub's
 * "Feedback" row (both roles). Thin RSC shell; the interactive list + compose UI lives in
 * the {@link FeedbackScreen} client island. Private surface, so `noindex`.
 */
export default function FeedbackPage() {
  return <FeedbackScreen />;
}

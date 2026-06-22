import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { ROUTES } from '@/config/routes';
import { TechnicianDashboard } from '@/features/dashboard';
import { getTranslations } from '@/lib/get-translations';
import { getServerLocale } from '@/lib/locale';
import { getServerUser } from '@/lib/server-auth';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const { t } = getTranslations(locale);
  return { title: t('dashboard.nav.jobOffers'), robots: { index: false, follow: false } };
}

/**
 * Discover / available-projects landing for technicians — the original `/dashboard`
 * content, relocated here so `/dashboard` can host the new SP tracking dashboard.
 * The sidebar "Job offers" item points here (its label is unchanged); project
 * details live at `/dashboard/job-offers/[id]`. Customers have no job-offers feed,
 * so they are bounced back to their own `/dashboard`. `role` is a bare backend
 * string with no case guarantee — normalise before narrowing.
 */
export default async function JobOffersIndexPage() {
  const user = await getServerUser();
  if ((user?.role ?? '').toUpperCase() === 'USER') redirect(ROUTES.DASHBOARD);
  return <TechnicianDashboard />;
}

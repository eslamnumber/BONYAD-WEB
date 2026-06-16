import type { Metadata } from 'next';

import { CustomerDashboard, TechnicianDashboard } from '@/features/dashboard';
import { getTranslations } from '@/lib/get-translations';
import { getServerLocale } from '@/lib/locale';
import { getServerUser } from '@/lib/server-auth';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const { t } = getTranslations(locale);
  return { title: t('dashboard.title'), robots: { index: false, follow: false } };
}

/**
 * Dashboard landing — role-branched server-side from the validated session.
 * Customers (role `USER`) get the welcome / start-a-project landing
 * (Figma 1394:6486); technicians (and any other role) keep the job-offers +
 * projects landing. `role` is a bare string (may be ADMIN etc.), so we narrow
 * explicitly here rather than assume a union. The `getServerUser()` call is
 * deduped with the `(app)` layout's via React `cache()`.
 */
export default async function DashboardPage() {
  const user = await getServerUser();
  // Role is a bare backend string with no case guarantee (RN compares it
  // case-insensitively); normalise before narrowing or a `user` customer falls
  // through to the technician app.
  return (user?.role ?? '').toUpperCase() === 'USER' ? (
    <CustomerDashboard />
  ) : (
    <TechnicianDashboard />
  );
}

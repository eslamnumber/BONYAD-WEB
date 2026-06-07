import { redirect } from 'next/navigation';

import { ROUTES } from '@/config/routes';

/**
 * `/dashboard/job-offers` has no list of its own — the job-offers list lives on
 * the dashboard, and the sidebar's "Job offers" button points there. Project
 * details live at `/dashboard/job-offers/[id]`. Any direct hit here redirects to
 * the list.
 */
export default function JobOffersIndexPage() {
  redirect(ROUTES.DASHBOARD);
}

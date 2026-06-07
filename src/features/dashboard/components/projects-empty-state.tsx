import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { ROUTES } from '@/config/routes';
import { getTranslations } from '@/lib/get-translations';
import { type Locale } from '@/types/locale';

type Props = { locale: Locale };

/**
 * Zero-state for the service-provider Projects tab (Figma "Dashboard-SP
 * (Projects) (Empty State)"). Title + description + a primary pill that sends
 * the technician to the available-projects landing to start bidding. Server
 * Component — no interactivity beyond the link.
 */
export function ProjectsEmptyState({ locale }: Props) {
  const { t } = getTranslations(locale);

  return (
    <div className="flex w-full max-w-[482px] flex-col items-center gap-8 text-center">
      <div className="flex w-full flex-col items-center gap-6">
        <h1
          dir="auto"
          className="text-foreground w-full text-3xl font-medium sm:text-4xl md:text-[45px]"
        >
          {t('dashboard.projects.empty.title')}
        </h1>
        <p dir="auto" className="text-foreground/80 w-full text-base">
          {t('dashboard.projects.empty.description')}
        </p>
      </div>
      <Button
        asChild
        size="sm"
        // Figma button is 36px tall (lg+, matches the 1440 frame); bumped to 44px
        // at ≤768 to satisfy the mobile touch-target floor (WCAG 2.5.5).
        className="h-11 rounded-full px-6 text-base font-semibold tracking-[0.15px] lg:h-9"
      >
        <Link href={ROUTES.DASHBOARD}>{t('dashboard.projects.empty.cta')}</Link>
      </Button>
    </div>
  );
}

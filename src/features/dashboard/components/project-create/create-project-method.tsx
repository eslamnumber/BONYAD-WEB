import { AiAssistantIcon, ManualEntryIcon } from '@/components/icons';
import { SettingsBackLink } from '@/components/layout';
import { ROUTES } from '@/config/routes';
import { getTranslations } from '@/lib/get-translations';
import { getServerLocale } from '@/lib/locale';

import { CustomerLandingBackdrop } from '../customer/customer-landing-backdrop';
import { CustomerSearch } from '../customer/customer-search';

import { CreateProjectTips } from './create-project-tips';
import { CreationMethodRow } from './creation-method-row';

const K = 'dashboard.createProject.method';

/**
 * "Create a project" method picker (Figma 1579:2551) — reached from the request
 * chooser's "New project" card. Reuses the customer landing shell (glass search +
 * navy-glow/skyline backdrop), then a back link, a headline, and two creation-method
 * rows: the AI assistant ("Omda", beta → the Omdah Q&A interview) and manual entry
 * (→ the wizard). Static navigation only — no backend.
 */
export async function CreateProjectMethod() {
  const locale = await getServerLocale();
  const { t } = getTranslations(locale);

  return (
    <div className="relative isolate flex min-h-full w-full flex-col gap-10 px-4 py-8 sm:px-6">
      <CustomerLandingBackdrop />
      <CustomerSearch />

      <div className="flex w-full max-w-[599px] flex-col gap-8 self-end">
        <SettingsBackLink href={ROUTES.DASHBOARD_PROJECTS_CREATE} label={t(`${K}.back`)} />
        <header className="flex flex-col items-end gap-6 text-end">
          <h1 className="text-foreground text-[clamp(2rem,5vw,2.8125rem)] leading-[1.45] font-medium">
            {t(`${K}.heading`)}
          </h1>
          <p className="text-foreground/60 text-xl leading-normal">{t(`${K}.description`)}</p>
        </header>

        <div className="flex w-full max-w-[435px] flex-col gap-5 self-end">
          <CreationMethodRow
            variant="ai"
            Icon={AiAssistantIcon}
            title={t(`${K}.options.ai.title`)}
            subtitle={t(`${K}.options.ai.subtitle`)}
            badge={t(`${K}.options.ai.badge`)}
            href={ROUTES.DASHBOARD_PROJECTS_CREATE_AI}
          />
          <CreationMethodRow
            variant="manual"
            Icon={ManualEntryIcon}
            title={t(`${K}.options.manual.title`)}
            subtitle={t(`${K}.options.manual.subtitle`)}
            href={ROUTES.DASHBOARD_PROJECTS_NEW}
          />
          <CreateProjectTips locale={locale} />
        </div>
      </div>
    </div>
  );
}

import {
  NewProjectIcon,
  QuickTaskIcon,
  SmartDesignIcon,
  TextVoiceDesignIcon,
} from '@/components/icons';
import { SettingsBackLink } from '@/components/layout';
import { ROUTES } from '@/config/routes';
import { getTranslations } from '@/lib/get-translations';
import { getServerLocale } from '@/lib/locale';

import { CustomerLandingBackdrop } from '../customer/customer-landing-backdrop';
import { CustomerSearch } from '../customer/customer-search';

import { CreationOptionCard, type CreationOptionCardProps } from './creation-option-card';

const K = 'dashboard.createProject.chooser';

type CreationOption = Pick<CreationOptionCardProps, 'Icon' | 'accentText' | 'glowBg' | 'href'> & {
  key: string;
};

/**
 * The four creation methods. Only "New project" is wired today (→ the project
 * method picker, which branches to the manual wizard); the AI-assisted flows are
 * not built yet, so they render inert with a "coming soon" badge. Each carries its
 * accent token (icon stroke + corner glow).
 */
const OPTIONS: CreationOption[] = [
  {
    key: 'quickTask',
    Icon: QuickTaskIcon,
    accentText: 'text-create-option-amber',
    glowBg: 'bg-create-option-amber',
  },
  {
    key: 'textVoice',
    Icon: TextVoiceDesignIcon,
    accentText: 'text-create-option-green',
    glowBg: 'bg-create-option-green',
  },
  {
    key: 'smartDesign',
    Icon: SmartDesignIcon,
    accentText: 'text-create-option-purple',
    glowBg: 'bg-create-option-purple',
  },
  {
    key: 'newProject',
    Icon: NewProjectIcon,
    accentText: 'text-create-option-blue',
    glowBg: 'bg-create-option-blue',
    href: ROUTES.DASHBOARD_PROJECTS_CREATE_PROJECT,
  },
];

/**
 * Create-a-project chooser (Figma "Dashboard-Create a Project" 1574:2384) — the
 * launcher reached from the dashboard "start a project" CTA. Reuses the customer
 * landing shell (glass search + navy-glow/skyline backdrop), then a back link, a
 * headline, and the four creation-method option cards. Static navigation only —
 * no backend. The "New project" card routes on to the manual wizard.
 */
export async function CreateProjectChooser() {
  const locale = await getServerLocale();
  const { t } = getTranslations(locale);

  return (
    <div className="relative isolate flex min-h-full w-full flex-col gap-10 px-4 py-8 sm:px-6">
      <CustomerLandingBackdrop />
      <CustomerSearch />

      <div className="flex w-full flex-col gap-8">
        <SettingsBackLink href={ROUTES.DASHBOARD} label={t(`${K}.back`)} />
        <header className="flex w-full max-w-[599px] flex-col items-end gap-6 self-end text-end">
          <h1 className="text-foreground text-[clamp(2rem,5vw,2.8125rem)] leading-[1.45] font-medium">
            {t(`${K}.heading`)}
          </h1>
          <p className="text-foreground/60 text-xl leading-normal">{t(`${K}.description`)}</p>
        </header>
      </div>

      <ul className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {OPTIONS.map(({ key, Icon, accentText, glowBg, href }) => (
          <li key={key}>
            <CreationOptionCard
              Icon={Icon}
              title={t(`${K}.options.${key}.title`)}
              subtitle={t(`${K}.options.${key}.subtitle`)}
              accentText={accentText}
              glowBg={glowBg}
              href={href}
              comingSoonLabel={href ? undefined : t(`${K}.comingSoon`)}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}

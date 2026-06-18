'use client';

import { Building2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { FeatureVerifiedIcon, PersonIcon, PhaseCheckIcon } from '@/components/icons';

import { AccountTypeToggle, type AccountMode } from './account-type-toggle';

type Props = {
  isCompany: boolean;
  companyName?: string;
  crNumber?: string;
  pending: boolean;
  onSelect: (mode: AccountMode) => void;
};

/** Verified company strip — name + CR + a Wathq-verified pill (shown once verified). */
function VerifiedCompanyRow({ companyName, crNumber }: { companyName: string; crNumber?: string }) {
  const { t } = useTranslation();
  return (
    <div className="border-border flex items-center gap-3 border-t pt-4">
      <span className="min-w-0 flex-1">
        {/* Dynamic value → isolate bidi with <bdi> but keep document-relative text-end. */}
        <span className="text-foreground block text-end text-sm font-semibold">
          <bdi>{companyName}</bdi>
        </span>
        {crNumber ? (
          <span className="text-muted-foreground mt-0.5 block text-end text-xs">
            {t('profile.accountType.crLabel')} <span dir="ltr">{crNumber}</span>
          </span>
        ) : null}
      </span>
      <span className="bg-success/10 text-success inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold">
        <FeatureVerifiedIcon className="size-3.5" aria-hidden />
        {t('profile.accountType.verified')}
      </span>
    </div>
  );
}

/**
 * Current-account-type card: a snapshot row (icon + the live type), the
 * Individual/Company toggle, and — when Company — the Wathq-verified company strip.
 */
export function AccountTypeCard({ isCompany, companyName, crNumber, pending, onSelect }: Props) {
  const { t } = useTranslation();
  const Icon = isCompany ? Building2 : PersonIcon;
  return (
    <div className="bg-card border-border relative isolate flex flex-col gap-5 overflow-hidden rounded-2xl border p-5 shadow-sm">
      <div
        aria-hidden
        className={`pointer-events-none absolute -end-10 -top-12 -z-10 size-36 rounded-full opacity-20 blur-[60px] ${isCompany ? 'bg-deco-blob-green' : 'bg-deco-blob-blue-light'}`}
      />
      <div className="flex items-center gap-3">
        <span className="min-w-0 flex-1">
          <span className="text-muted-foreground block text-end text-xs">
            {t('profile.accountType.currentLabel')}
          </span>
          <span className="text-foreground mt-0.5 block text-end text-base font-semibold">
            {isCompany
              ? t('profile.accountType.companyAccount')
              : t('profile.accountType.individualAccount')}
          </span>
        </span>
        <span
          className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${isCompany ? 'bg-success/10 text-success' : 'bg-primary/10 text-primary'}`}
        >
          <Icon className="size-5" aria-hidden />
        </span>
      </div>

      <AccountTypeToggle
        value={isCompany ? 'company' : 'individual'}
        onSelect={onSelect}
        disabled={pending}
      />

      {isCompany && companyName ? (
        <VerifiedCompanyRow companyName={companyName} crNumber={crNumber} />
      ) : null}
    </div>
  );
}

/** One bullet in the About panel — leading check, then start-aligned punctuated copy. */
function AboutPoint({ children }: { children: string }) {
  return (
    <li className="flex items-start gap-2.5">
      <PhaseCheckIcon className="text-success mt-0.5 size-4 shrink-0" aria-hidden />
      <span dir="auto" className="text-muted-foreground flex-1 text-start text-sm leading-relaxed">
        {children}
      </span>
    </li>
  );
}

/**
 * Context panel beside the toggle — explains what a company account unlocks and
 * how Wathq verification works, so the page reads as a full settings screen
 * rather than a lone card. Static title (no `dir`); punctuated copy is `dir="auto"`.
 */
export function AccountTypeAbout() {
  const { t } = useTranslation();
  return (
    <aside className="bg-card border-border flex flex-col gap-4 rounded-2xl border p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <h2 className="text-foreground flex-1 text-end text-base font-semibold">
          {t('profile.accountType.about.title')}
        </h2>
        <span className="bg-primary/10 text-primary flex size-9 shrink-0 items-center justify-center rounded-lg">
          <FeatureVerifiedIcon className="size-4" aria-hidden />
        </span>
      </div>
      <p dir="auto" className="text-muted-foreground text-start text-sm leading-relaxed">
        {t('profile.accountType.about.body')}
      </p>
      <ul className="flex flex-col gap-2.5">
        <AboutPoint>{t('profile.accountType.about.point1')}</AboutPoint>
        <AboutPoint>{t('profile.accountType.about.point2')}</AboutPoint>
      </ul>
    </aside>
  );
}

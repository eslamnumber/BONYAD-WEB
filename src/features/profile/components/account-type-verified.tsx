'use client';

import { Building2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { FeatureVerifiedIcon } from '@/components/icons';
import { Button } from '@/components/ui';

type Props = {
  companyName?: string;
  crNumber?: string;
  pending: boolean;
  onSwitchToIndividual: () => void;
};

/**
 * Verified-company state of the Account-type screen (shown when the profile is
 * already a Company account). Mirrors the Figma card surface — a framed row with
 * the company name + CR and a Wathq pill — and adds the switch-back-to-individual
 * action the registration form omits.
 */
export function AccountTypeVerified({
  companyName,
  crNumber,
  pending,
  onSwitchToIndividual,
}: Props) {
  const { t } = useTranslation();
  return (
    <div className="flex w-full flex-col gap-5">
      <div className="border-input flex items-center gap-3 rounded-md border p-4">
        <span className="bg-success/10 text-success flex size-11 shrink-0 items-center justify-center rounded-xl">
          <Building2 className="size-5" aria-hidden />
        </span>
        <span className="min-w-0 flex-1">
          <span className="text-muted-foreground block text-start text-xs">
            {t('profile.accountType.verified.label')}
          </span>
          {/* Dynamic value → isolate bidi with <bdi>, keep document-relative text-start. */}
          <span className="text-foreground mt-0.5 block text-start text-base font-semibold">
            <bdi>{companyName}</bdi>
          </span>
          {crNumber ? (
            <span className="text-muted-foreground mt-0.5 block text-start text-xs">
              {t('profile.accountType.verified.crLabel')} <span dir="ltr">{crNumber}</span>
            </span>
          ) : null}
        </span>
        <span className="bg-success/10 text-success inline-flex shrink-0 items-center gap-1 self-start rounded-full px-2.5 py-1 text-xs font-semibold">
          <FeatureVerifiedIcon className="size-3.5" aria-hidden />
          {t('profile.accountType.verified.badge')}
        </span>
      </div>
      <Button
        type="button"
        variant="outline"
        disabled={pending}
        onClick={onSwitchToIndividual}
        className="h-12 w-full text-base"
      >
        {pending
          ? t('profile.accountType.verifying')
          : t('profile.accountType.verified.switchBack')}
      </Button>
    </div>
  );
}

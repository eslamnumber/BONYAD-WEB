'use client';

import { useTranslation } from 'react-i18next';

import { useTechnicianWallet } from '../api';
import type { TechnicianWallet } from '../schemas/wallet';

import { MoneyAmount } from './money-amount';

/**
 * "الأرباح والتحويلات" panel on the SP dashboard — the technician's wallet from
 * GET /technician/wallet. RTL-first (content anchors to the inline-end): a headline
 * available-balance figure plus a breakdown (escrow / total earned / paid out), all
 * via {@link MoneyAmount}. Read-only for now — requesting a payout (bank accounts +
 * `WALLET.REQUEST_PAYOUT`) lands as a follow-up mutation slice.
 */
export function TechnicianEarningsSection() {
  const { t } = useTranslation();
  const { data, isPending, isError } = useTechnicianWallet();

  return (
    <section className="bg-card border-border flex w-full flex-col items-end gap-5 rounded-2xl border p-5 shadow-sm">
      <h2 className="text-card-foreground w-full text-end text-lg font-semibold">
        {t('dashboard.home.earnings.title')}
      </h2>
      <EarningsBody isPending={isPending} isError={isError} wallet={data} />
    </section>
  );
}

function EarningsBody({
  isPending,
  isError,
  wallet,
}: {
  isPending: boolean;
  isError: boolean;
  wallet: TechnicianWallet | undefined;
}) {
  const { t } = useTranslation();
  if (isPending) return <EarningsSkeleton />;
  if (isError || !wallet) {
    return (
      <p className="text-card-foreground/60 w-full py-8 text-center text-sm">
        {t('dashboard.home.earnings.error')}
      </p>
    );
  }
  return (
    <div className="flex w-full flex-col items-end gap-5">
      <div className="flex w-full flex-col items-end gap-1">
        <p className="text-card-foreground/60 text-sm">{t('dashboard.home.earnings.available')}</p>
        <p className="text-foreground text-3xl font-semibold sm:text-4xl">
          <MoneyAmount value={wallet.availableBalance ?? 0} />
        </p>
      </div>
      <dl className="border-border flex w-full flex-col gap-2.5 border-t pt-4">
        <StatRow labelKey="inEscrow" value={wallet.inEscrow} />
        <StatRow labelKey="totalEarned" value={wallet.totalEarned} />
        <StatRow labelKey="totalPaidOut" value={wallet.totalPaidOut} />
      </dl>
    </div>
  );
}

function StatRow({ labelKey, value }: { labelKey: string; value?: number | null }) {
  const { t } = useTranslation();
  return (
    <div className="flex w-full items-center justify-between gap-2 text-sm">
      {/* Value pinned to the inline-start, label to the inline-end (under the heading)
          via order-first — the RTL-first label/value convention (cf. ActiveProjectRow). */}
      <dt className="text-card-foreground/60">{t(`dashboard.home.earnings.${labelKey}`)}</dt>
      <dd className="text-card-foreground order-first font-medium">
        <MoneyAmount value={value ?? 0} />
      </dd>
    </div>
  );
}

function EarningsSkeleton() {
  return (
    <div className="flex w-full flex-col items-end gap-4" aria-hidden>
      <div className="bg-muted h-10 w-40 animate-pulse rounded-lg" />
      <div className="bg-muted h-24 w-full animate-pulse rounded-lg" />
    </div>
  );
}

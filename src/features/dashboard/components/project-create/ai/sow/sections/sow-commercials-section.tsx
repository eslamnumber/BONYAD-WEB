import { DashboardPaymentsIcon } from '@/components/icons';

import type { SowCommercials, SowPayment } from '../../../../../api/ai/sow-types';
import type { T } from '../sow-flow-types';
import { formatRange, hasText } from '../sow-format';
import { AmountText, SowCard } from '../sow-primitives';

import { SowCostBreakdownTable } from './sow-cost-breakdown';

const K = 'dashboard.createProject.ai.sow';

/** Commercials — cost breakdown, 15% VAT, grand total, and the payment schedule. */
export function SowCommercialsSection({ commercials, t }: { commercials?: SowCommercials; t: T }) {
  if (!commercials) return null;
  const currency = commercials.currency || t(`${K}.sar`);
  const breakdown = commercials.cost_breakdown;
  const schedule = (commercials.payment_schedule ?? []).filter(
    (p) => hasText(p.milestone) || typeof p.percent === 'number',
  );
  if (!breakdown && !schedule.length) return null;

  return (
    <SowCard title={t(`${K}.commercials.title`)} icon={<DashboardPaymentsIcon aria-hidden />}>
      <div className="flex flex-col gap-5">
        {breakdown ? (
          <SowCostBreakdownTable breakdown={breakdown} currency={currency} t={t} />
        ) : null}

        {schedule.length ? (
          <div className="flex flex-col gap-2.5">
            <h3 className="text-foreground/70 text-start text-xs font-semibold tracking-wide uppercase">
              {t(`${K}.commercials.schedule`)}
            </h3>
            <ul className="flex flex-col gap-2">
              {schedule.map((p, i) => (
                <PaymentRow key={`${p.milestone}-${i}`} payment={p} currency={currency} />
              ))}
            </ul>
          </div>
        ) : null}

        {hasText(commercials.disclaimer) ? (
          <p dir="auto" className="text-muted-foreground text-start text-xs leading-relaxed">
            {commercials.disclaimer}
          </p>
        ) : null}
      </div>
    </SowCard>
  );
}

function PaymentRow({ payment, currency }: { payment: SowPayment; currency: string }) {
  const amount = formatRange(payment.amount_sar);
  return (
    <li className="border-border bg-field-surface flex flex-wrap items-center justify-between gap-2 rounded-xl border px-3.5 py-2.5">
      <div className="flex flex-col">
        <span dir="auto" className="text-foreground text-start text-sm font-medium">
          {payment.milestone}
        </span>
        {payment.trigger ? (
          <span dir="auto" className="text-muted-foreground text-start text-xs">
            {payment.trigger}
          </span>
        ) : null}
      </div>
      <div className="flex items-center gap-3">
        {typeof payment.percent === 'number' ? (
          <span dir="ltr" className="text-job-accent text-xs font-semibold tabular-nums">
            {payment.percent}%
          </span>
        ) : null}
        {amount ? <AmountText value={amount} currency={currency} /> : null}
      </div>
    </li>
  );
}

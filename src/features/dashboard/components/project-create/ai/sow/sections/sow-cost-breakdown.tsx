import type { SowCostBreakdown } from '../../../../../api/ai/sow-types';
import type { T } from '../sow-flow-types';
import { formatRange } from '../sow-format';
import { AmountText } from '../sow-primitives';

const K = 'dashboard.createProject.ai.sow';

const ROWS: { key: keyof SowCostBreakdown; label: string }[] = [
  { key: 'labor_sar', label: 'labor' },
  { key: 'materials_sar', label: 'materials' },
  { key: 'overhead_sar', label: 'overhead' },
  { key: 'total_excl_vat', label: 'exclVat' },
  { key: 'vat_15_percent', label: 'vat' },
];

/** Itemised cost rows + an emphasised grand-total band. */
export function SowCostBreakdownTable({
  breakdown,
  currency,
  t,
}: {
  breakdown: SowCostBreakdown;
  currency: string;
  t: T;
}) {
  const grand = formatRange(breakdown.grand_total);
  return (
    <div className="flex flex-col gap-3">
      <dl className="flex flex-col">
        {ROWS.map(({ key, label }) => {
          const value = formatRange(breakdown[key]);
          if (!value) return null;
          return (
            <div
              key={key}
              className="border-border flex items-center justify-between gap-4 border-b py-2 last:border-0"
            >
              <dt className="text-muted-foreground text-start text-sm">
                {t(`${K}.commercials.${label}`)}
              </dt>
              <dd className="text-foreground text-sm">
                <AmountText value={value} currency={currency} />
              </dd>
            </div>
          );
        })}
      </dl>
      {grand ? (
        <div className="border-job-accent/30 bg-job-accent/10 flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4">
          <span className="text-foreground text-start text-sm font-semibold">
            {t(`${K}.commercials.grandTotal`)}
          </span>
          <span className="text-job-accent text-lg">
            <AmountText value={grand} currency={currency} />
          </span>
        </div>
      ) : null}
    </div>
  );
}

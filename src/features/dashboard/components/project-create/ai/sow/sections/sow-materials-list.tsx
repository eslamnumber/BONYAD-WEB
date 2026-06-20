import type { Locale } from '@/types/locale';

import type { SowMaterial } from '../../../../../api/ai/sow-types';
import type { T } from '../sow-flow-types';
import { formatRange, hasText } from '../sow-format';
import { AmountText, Chip } from '../sow-primitives';

const K = 'dashboard.createProject.ai.sow';

function materialName(m: SowMaterial, locale: Locale): string {
  const localized = locale === 'ar' ? m.name_ar : m.name_en;
  return localized || m.name_ar || m.name_en || m.type || '';
}

function materialTotal(m: SowMaterial): string {
  const range =
    m.total_min_sar || m.total_max_sar
      ? { min: m.total_min_sar, max: m.total_max_sar }
      : { min: m.price_min_sar, max: m.price_max_sar };
  return formatRange(range);
}

function MaterialRow({
  m,
  locale,
  currency,
}: {
  m: SowMaterial;
  locale: Locale;
  currency: string;
}) {
  const total = materialTotal(m);
  return (
    <li className="border-border bg-field-surface flex flex-col gap-1.5 rounded-xl border p-3.5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span dir="auto" className="text-foreground text-start text-sm font-medium">
          {materialName(m, locale)}
        </span>
        {total ? <AmountText value={total} currency={currency} /> : null}
      </div>
      {hasText(m.specification) ? (
        <span dir="auto" className="text-muted-foreground text-start text-xs">
          {m.specification}
        </span>
      ) : null}
      {typeof m.quantity === 'number' ? (
        <div>
          <Chip>
            <span dir="ltr">{m.quantity}</span>
            {hasText(m.unit) ? <span className="ms-1">{m.unit}</span> : null}
          </Chip>
        </div>
      ) : null}
    </li>
  );
}

/** Materials with Bonyad price bands — the costed heart of the resources section. */
export function SowMaterialsList({
  materials,
  locale,
  t,
}: {
  materials: SowMaterial[];
  locale: Locale;
  t: T;
}) {
  const currency = t(`${K}.sar`);
  return (
    <div className="flex flex-col gap-2.5">
      <h3 className="text-foreground/70 text-start text-xs font-semibold tracking-wide uppercase">
        {t(`${K}.resources.materials`)}
      </h3>
      <ul className="flex flex-col gap-2.5">
        {materials.map((m, i) => (
          <MaterialRow
            key={`${materialName(m, locale)}-${i}`}
            m={m}
            locale={locale}
            currency={currency}
          />
        ))}
      </ul>
    </div>
  );
}

import { LockIcon } from '@/components/icons';

import type { SowCompliance } from '../../../../../api/ai/sow-types';
import type { T } from '../sow-flow-types';
import { compact, hasText } from '../sow-format';
import { BulletList, Chip, SowCard } from '../sow-primitives';

const K = 'dashboard.createProject.ai.sow';

/** Compliance — permits, SBC codes, VAT applicability, Saudization. */
export function SowComplianceSection({ compliance, t }: { compliance?: SowCompliance; t: T }) {
  if (!compliance) return null;
  const permits = compact(compliance.permits_required);
  const codes = compact(compliance.applicable_sbc_codes);
  const hasAny =
    permits.length ||
    codes.length ||
    hasText(compliance.saudization_requirement) ||
    compliance.vat_applicable;
  if (!hasAny) return null;

  return (
    <SowCard title={t(`${K}.compliance.title`)} icon={<LockIcon aria-hidden />}>
      <div className="flex flex-col gap-5">
        {permits.length ? (
          <Block title={t(`${K}.compliance.permits`)}>
            <BulletList items={permits} marker="dot" />
          </Block>
        ) : null}
        {codes.length ? (
          <Block title={t(`${K}.compliance.codes`)}>
            <div className="flex flex-wrap gap-2">
              {codes.map((c, i) => (
                <Chip key={`${c}-${i}`}>{c}</Chip>
              ))}
            </div>
          </Block>
        ) : null}
        {hasText(compliance.saudization_requirement) ? (
          <Block title={t(`${K}.compliance.saudization`)}>
            <p dir="auto" className="text-foreground/90 text-start text-sm">
              {compliance.saudization_requirement}
            </p>
          </Block>
        ) : null}
        {compliance.vat_applicable ? <Chip>{t(`${K}.compliance.vatApplicable`)}</Chip> : null}
      </div>
    </SowCard>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2.5">
      <h3 className="text-foreground/70 text-start text-xs font-semibold tracking-wide uppercase">
        {title}
      </h3>
      {children}
    </div>
  );
}

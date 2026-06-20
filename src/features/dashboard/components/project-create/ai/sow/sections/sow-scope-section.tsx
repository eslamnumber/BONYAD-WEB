import { CheckboxIcon } from '@/components/icons';

import type { SowScope } from '../../../../../api/ai/sow-types';
import type { T } from '../sow-flow-types';
import { compact } from '../sow-format';
import { BulletList, Chip, SowCard } from '../sow-primitives';

const K = 'dashboard.createProject.ai.sow';

/** Scope — in/out of scope, disciplines, assumptions. */
export function SowScopeSection({ scope, t }: { scope?: SowScope; t: T }) {
  if (!scope) return null;
  const inScope = compact(scope.in_scope);
  const outScope = compact(scope.out_of_scope);
  const disciplines = compact(scope.work_discipline);
  const assumptions = compact(scope.assumptions);
  if (!inScope.length && !outScope.length && !disciplines.length && !assumptions.length)
    return null;

  return (
    <SowCard title={t(`${K}.scope.title`)} icon={<CheckboxIcon aria-hidden />}>
      <div className="flex flex-col gap-5">
        {disciplines.length ? (
          <div className="flex flex-wrap gap-2">
            {disciplines.map((d, i) => (
              <Chip key={`${d}-${i}`}>{d}</Chip>
            ))}
          </div>
        ) : null}
        <Group title={t(`${K}.scope.inScope`)} items={inScope} marker="check" />
        <Group title={t(`${K}.scope.outScope`)} items={outScope} marker="cross" />
        <Group title={t(`${K}.scope.assumptions`)} items={assumptions} marker="dot" />
      </div>
    </SowCard>
  );
}

function Group({
  title,
  items,
  marker,
}: {
  title: string;
  items: string[];
  marker: 'check' | 'cross' | 'dot';
}) {
  if (!items.length) return null;
  return (
    <div className="flex flex-col gap-2.5">
      <h3 className="text-foreground/70 text-start text-xs font-semibold tracking-wide uppercase">
        {title}
      </h3>
      <BulletList items={items} marker={marker} />
    </div>
  );
}

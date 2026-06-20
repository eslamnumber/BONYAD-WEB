import { ServiceHireIcon } from '@/components/icons';
import type { Locale } from '@/types/locale';

import type { SowEquipment, SowLabor, SowResources } from '../../../../../api/ai/sow-types';
import type { T } from '../sow-flow-types';
import { compact, hasText } from '../sow-format';
import { Chip, SowCard } from '../sow-primitives';

import { SowMaterialsList } from './sow-materials-list';

const K = 'dashboard.createProject.ai.sow';

const hasMaterialName = (m: { name_ar?: string; name_en?: string; type?: string }) =>
  hasText(m.name_ar) || hasText(m.name_en) || hasText(m.type);

function splitResources(resources: SowResources) {
  return {
    labor: (resources.labor ?? []).filter((l) => hasText(l.role)),
    materials: (resources.materials ?? []).filter(hasMaterialName),
    equipment: (resources.equipment ?? []).filter((e) => hasText(e.type)),
  };
}

/** Resources — labor roles, costed materials, and equipment. */
export function SowResourcesSection({
  resources,
  locale,
  t,
}: {
  resources?: SowResources;
  locale: Locale;
  t: T;
}) {
  if (!resources) return null;
  const { labor, materials, equipment } = splitResources(resources);
  if (!labor.length && !materials.length && !equipment.length) return null;

  return (
    <SowCard title={t(`${K}.resources.title`)} icon={<ServiceHireIcon aria-hidden />}>
      <div className="flex flex-col gap-5">
        {labor.length ? <LaborList labor={labor} t={t} /> : null}
        {materials.length ? <SowMaterialsList materials={materials} locale={locale} t={t} /> : null}
        {equipment.length ? <EquipmentChips equipment={equipment} /> : null}
      </div>
    </SowCard>
  );
}

function LaborList({ labor, t }: { labor: SowLabor[]; t: T }) {
  return (
    <div className="flex flex-col gap-2.5">
      <h3 className="text-foreground/70 text-start text-xs font-semibold tracking-wide uppercase">
        {t(`${K}.resources.labor`)}
      </h3>
      <ul className="flex flex-col gap-2">
        {labor.map((l, i) => (
          <LaborRow key={`${l.role}-${i}`} labor={l} t={t} />
        ))}
      </ul>
    </div>
  );
}

function EquipmentChips({ equipment }: { equipment: SowEquipment[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {equipment.map((e, i) => (
        <Chip key={`${e.type}-${i}`}>
          {e.type}
          {hasText(e.usage_duration) ? (
            <span className="text-muted-foreground ms-1.5">· {e.usage_duration}</span>
          ) : null}
        </Chip>
      ))}
    </div>
  );
}

function LaborRow({ labor, t }: { labor: SowLabor; t: T }) {
  const certs = compact(labor.required_certifications);
  return (
    <li className="flex flex-col gap-1">
      <div className="flex flex-wrap items-center gap-2">
        <span dir="auto" className="text-foreground text-start text-sm font-medium">
          {labor.role}
        </span>
        {labor.saudization_applies ? <Chip>{t(`${K}.resources.saudization`)}</Chip> : null}
      </div>
      {certs.length ? (
        <span dir="auto" className="text-muted-foreground text-start text-xs">
          {certs.join('، ')}
        </span>
      ) : null}
    </li>
  );
}

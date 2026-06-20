import { type CreateProjectFormValues } from '../schemas/create-project-form';

/** Minimal `t` shape — keeps this pure mapper free of the react-i18next import. */
export type Translate = (key: string, options?: Record<string, string | number>) => string;

export type ReviewRow = {
  label?: string;
  value: string;
  /** When true, the trailing amount in `value` is followed by the Saudi Riyal glyph. */
  currency?: boolean;
};
export type ReviewSection = {
  id: string;
  title: string;
  /** Wizard step index the Edit link jumps back to. */
  editStep: number;
  rows: ReviewRow[];
};

export type ReviewContext = {
  values: CreateProjectFormValues;
  /** Resolved category name (from the services query); undefined while unresolved. */
  categoryName?: string;
  t: Translate;
};

const S = 'dashboard.createProject.review.sections';
const F = 'dashboard.createProject.review.fields';
const V = 'dashboard.createProject.review.values';

/** A trimmed string, or the localized "Not specified" placeholder. */
function orPlaceholder(value: string | undefined, t: Translate): string {
  const trimmed = value?.trim();
  return trimmed ? trimmed : t('dashboard.createProject.review.notSpecified');
}

/** `"{n} weeks"`, only when a duration is present. */
function weeks(count: string, t: Translate): string | undefined {
  const trimmed = count.trim();
  return trimmed ? t(`${V}.weeks`, { n: trimmed }) : undefined;
}

/** `yyyy-mm-dd` → `dd/mm/yyyy`; anything else passes through unchanged. */
function formatDeadline(raw: string): string {
  const parts = raw.trim().split('-');
  if (parts.length !== 3) return raw.trim();
  const [y, m, d] = parts;
  return `${d}/${m}/${y}`;
}

/** Assignment method label, naming the chosen technician on direct assignment. */
function methodValue(values: CreateProjectFormValues, t: Translate): string {
  if (values.assignmentType !== 'DIRECT_ASSIGNMENT') return t(`${V}.bidding`);
  const name = values.assignedTechnicianName.trim();
  return name ? t(`${V}.directNamed`, { name }) : t(`${V}.direct`);
}

/** Budget row: the no-budget copy, the amount + Riyal glyph, or the placeholder. */
function budgetRow(values: CreateProjectFormValues, t: Translate): ReviewRow {
  const label = t(`${F}.budget`);
  if (values.noBudget) return { label, value: t('dashboard.createProject.steps.budget.noBudget') };
  const amount = values.budget.trim();
  if (!amount) return { label, value: t('dashboard.createProject.review.notSpecified') };
  return { label, value: amount, currency: true };
}

/** One review row per phase that has any content; placeholder when none do. */
function phaseRows(values: CreateProjectFormValues, t: Translate): ReviewRow[] {
  const filled = values.phases.filter(
    (p) => p.name.trim() || p.amount.trim() || p.durationWeeks.trim(),
  );
  if (filled.length === 0) return [{ value: t('dashboard.createProject.review.notSpecified') }];
  return filled.map((p, i) => {
    const amount = p.amount.trim();
    const parts = [p.name.trim(), weeks(p.durationWeeks, t), amount || undefined].filter(Boolean);
    return {
      label: t(`${F}.phase`, { number: i + 1 }),
      value: parts.join(' — '),
      currency: Boolean(amount),
    };
  });
}

/** Build the five review cards (already localized) from the wizard form state. */
export function buildReviewSections({ values, categoryName, t }: ReviewContext): ReviewSection[] {
  return [
    {
      id: 'info',
      title: t(`${S}.info`),
      editStep: 0,
      rows: [
        { label: t(`${F}.projectName`), value: orPlaceholder(values.projectName, t) },
        { label: t(`${F}.category`), value: orPlaceholder(categoryName, t) },
        { label: t(`${F}.description`), value: orPlaceholder(values.description, t) },
      ],
    },
    {
      id: 'budget',
      title: t(`${S}.budget`),
      editStep: 1,
      rows: [
        budgetRow(values, t),
        { label: t(`${F}.timeline`), value: orPlaceholder(weeks(values.timelineWeeks, t), t) },
      ],
    },
    {
      id: 'deliverables',
      title: t(`${S}.deliverables`),
      editStep: 2,
      rows: [{ value: orPlaceholder(values.deliverables, t) }],
    },
    { id: 'phases', title: t(`${S}.phases`), editStep: 3, rows: phaseRows(values, t) },
    {
      id: 'assignment',
      title: t(`${S}.assignment`),
      editStep: 4,
      rows: [
        { label: t(`${F}.method`), value: methodValue(values, t) },
        { label: t(`${F}.deadline`), value: orPlaceholder(formatDeadline(values.bidDeadline), t) },
        { label: t(`${F}.city`), value: orPlaceholder(values.regionName, t) },
      ],
    },
  ];
}

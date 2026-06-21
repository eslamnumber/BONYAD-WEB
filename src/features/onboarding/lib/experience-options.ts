import { type SelectOption } from '@/components/ui';

type Translate = (key: string, options?: { years: number }) => string;

const K = 'onboarding.completeProfile';

/**
 * Years-of-experience picker options — 1..10 individually, then "more than 10" /
 * "more than 20" buckets (mirrors the iOS picker). The string value is submitted
 * as-is (the backend stores `yearsOfExperience` as a numeric string). We interpolate
 * `{{years}}` (not `{{count}}`) so i18next doesn't engage plural-key resolution.
 */
export function buildExperienceOptions(t: Translate): SelectOption[] {
  const single: SelectOption[] = Array.from({ length: 10 }, (_, i) => {
    const n = i + 1;
    return { value: String(n), label: t(`${K}.experienceYears`, { years: n }) };
  });
  return [
    ...single,
    { value: '11', label: t(`${K}.experienceOver`, { years: 10 }) },
    { value: '21', label: t(`${K}.experienceOver`, { years: 20 }) },
  ];
}

import type { ComplianceFlags, ComplianceIssue } from '../api/sketch-types';

/** The six compliance checks the backend reports, in display order. */
export const COMPLIANCE_CODES = [
  'sbc_201',
  'sbc_501',
  'sbc_701',
  'sbc_801',
  'balady_setbacks',
  'saudi_privacy',
] as const;

export type ComplianceCode = (typeof COMPLIANCE_CODES)[number];

export type ComplianceRow = {
  code: ComplianceCode;
  passed: boolean;
  issues: ComplianceIssue[];
};

/**
 * Normalise the backend `compliance_flags` into one row per code. Each flag is the
 * string `'ok'` (or absent) when clear, or an array of issues when there are
 * problems — so `passed` is simply "no issues array".
 */
export function readComplianceRows(flags?: ComplianceFlags): ComplianceRow[] {
  return COMPLIANCE_CODES.map((code) => {
    const value = flags?.[code];
    const issues = Array.isArray(value) ? value : [];
    return { code, passed: issues.length === 0, issues };
  });
}

export type VerdictTone = 'ok' | 'needs_fix' | 'reject';

/** Map the engineering-review verdict (backend-controlled string) to a UI tone. */
export function verdictTone(verdict?: string): VerdictTone {
  if (verdict === 'reject' || verdict === 'fail' || verdict === 'rejected') return 'reject';
  if (verdict === 'ok' || verdict === 'pass' || verdict === 'approved' || verdict === 'compliant') {
    return 'ok';
  }
  return 'needs_fix';
}

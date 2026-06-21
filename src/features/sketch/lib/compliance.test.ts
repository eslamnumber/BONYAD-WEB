import { describe, expect, it } from 'vitest';

import { readComplianceRows, verdictTone } from './compliance';

describe('readComplianceRows', () => {
  it('treats "ok" / absent flags as passed and arrays as issues', () => {
    const rows = readComplianceRows({
      sbc_201: 'ok',
      sbc_501: [{ severity: 'critical', code: 'NO_WINDOW', msg_en: 'no window' }],
      // sbc_701, sbc_801, balady_setbacks, saudi_privacy absent
    });
    const byCode = Object.fromEntries(rows.map((r) => [r.code, r]));
    expect(rows).toHaveLength(6);
    expect(byCode.sbc_201?.passed).toBe(true);
    expect(byCode.sbc_501?.passed).toBe(false);
    expect(byCode.sbc_501?.issues[0]?.code).toBe('NO_WINDOW');
    expect(byCode.saudi_privacy?.passed).toBe(true);
  });

  it('returns all-passed rows for missing flags', () => {
    expect(readComplianceRows(undefined).every((r) => r.passed)).toBe(true);
  });
});

describe('verdictTone', () => {
  it('maps backend verdict strings to a tone, defaulting to needs_fix', () => {
    expect(verdictTone('ok')).toBe('ok');
    expect(verdictTone('reject')).toBe('reject');
    expect(verdictTone('needs_fix')).toBe('needs_fix');
    expect(verdictTone('something-new')).toBe('needs_fix');
    expect(verdictTone(undefined)).toBe('needs_fix');
  });
});

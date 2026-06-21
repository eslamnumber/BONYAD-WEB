import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { server } from '@/testing/handlers/server';

import { getSketchJob } from './get-sketch-job';
import { isTerminalSketchStatus } from './sketch-types';

describe('getSketchJob', () => {
  it('returns the SPJob snapshot verbatim (status, variants, labels)', async () => {
    server.use(
      http.get('*/api/sketch/:jobId', () =>
        HttpResponse.json({
          id: 'skt_1',
          status: 'parsed',
          active_variant: 0,
          variant_labels: [{ ar: 'مفتوح', en: 'Open' }],
          variant_floor_svgs: [[{ id: 'ground', svg: '<svg/>', rooms_count: 9 }]],
        }),
      ),
    );

    const job = await getSketchJob('skt_1');

    expect(job.status).toBe('parsed');
    expect(job.active_variant).toBe(0);
    expect(job.variant_labels?.[0]).toEqual({ ar: 'مفتوح', en: 'Open' });
    expect(job.variant_floor_svgs?.[0]?.[0]?.rooms_count).toBe(9);
  });

  it('tolerates a sparse/early snapshot (only status)', async () => {
    server.use(http.get('*/api/sketch/:jobId', () => HttpResponse.json({ status: 'parsing' })));
    const job = await getSketchJob('skt_2');
    expect(job.status).toBe('parsing');
    expect(job.variant_floor_svgs).toBeUndefined();
  });
});

describe('isTerminalSketchStatus', () => {
  it('is terminal for parsed/ready/error and not for in-flight states', () => {
    expect(isTerminalSketchStatus('parsed')).toBe(true);
    expect(isTerminalSketchStatus('ready')).toBe(true);
    expect(isTerminalSketchStatus('error')).toBe(true);
    expect(isTerminalSketchStatus('parsing')).toBe(false);
    expect(isTerminalSketchStatus('uploaded')).toBe(false);
    expect(isTerminalSketchStatus(undefined)).toBe(false);
  });
});

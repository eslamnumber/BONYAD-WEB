import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { ApiError } from '@/lib/api-client';
import { server } from '@/testing/handlers/server';

import { getTechnicianStatus, isApproved, isSuspended } from './get-technician-status';

describe('getTechnicianStatus', () => {
  it('returns the pending status payload with its checklist flags', async () => {
    server.use(
      http.get('*/users/technician-status', () =>
        HttpResponse.json({
          status: 'PENDING',
          profileComplete: true,
          hasEmail: true,
          hasDescription: true,
          hasRegions: true,
          hasCertificates: false,
        }),
      ),
    );

    const s = await getTechnicianStatus();
    expect(s.status).toBe('PENDING');
    expect(s.hasRegions).toBe(true);
    expect(isApproved(s.status)).toBe(false);
    expect(isSuspended(s.status)).toBe(false);
  });

  it('classifies the approved and suspended states', async () => {
    server.use(
      http.get('*/users/technician-status', () => HttpResponse.json({ status: 'APPROVED' })),
    );
    expect(isApproved((await getTechnicianStatus()).status)).toBe(true);

    server.use(
      http.get('*/users/technician-status', () => HttpResponse.json({ status: 'SUSPENDED' })),
    );
    expect(isSuspended((await getTechnicianStatus()).status)).toBe(true);
  });

  it('throws ApiError on a 401', async () => {
    server.use(
      http.get('*/users/technician-status', () =>
        HttpResponse.json(
          { messageEn: 'Unauthorized.', messageAr: 'غير مصرح.', errorCode: 'UNAUTHORIZED' },
          { status: 401 },
        ),
      ),
    );

    const err = await getTechnicianStatus().catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect((err as ApiError).status).toBe(401);
    expect((err as ApiError).errorCode).toBe('UNAUTHORIZED');
  });
});

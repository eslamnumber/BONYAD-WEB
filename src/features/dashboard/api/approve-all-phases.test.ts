import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { ApiError } from '@/lib/api-client';
import { server } from '@/testing/handlers/server';

import { approveAllPhases, extractApprovedStatus } from './approve-all-phases';

describe('approveAllPhases', () => {
  it('POSTs /phases/project/:projectId/approve-all and returns the new status', async () => {
    let method = '';
    let capturedUrl = '';
    server.use(
      http.post('*/phases/project/:projectId/approve-all', ({ request }) => {
        method = request.method;
        capturedUrl = request.url;
        return HttpResponse.json({ projectStatus: 'CONTRACT_SIGNING' });
      }),
    );
    await expect(approveAllPhases(42)).resolves.toBe('CONTRACT_SIGNING');
    expect(method).toBe('POST');
    expect(new URL(capturedUrl).pathname).toMatch(/\/phases\/project\/42\/approve-all$/);
  });

  it('falls back to CONTRACT_SIGNING when the body carries no status', async () => {
    server.use(http.post('*/phases/project/:projectId/approve-all', () => HttpResponse.json({})));
    await expect(approveAllPhases(42)).resolves.toBe('CONTRACT_SIGNING');
  });

  it('throws ApiError with status / localized messages on 400', async () => {
    server.use(
      http.post('*/phases/project/:projectId/approve-all', () =>
        HttpResponse.json(
          {
            messageEn: 'Phases already approved.',
            messageAr: 'تمت الموافقة بالفعل.',
            errorCode: 'CONFLICT',
          },
          { status: 400 },
        ),
      ),
    );
    const err = await approveAllPhases(42).catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect((err as ApiError).status).toBe(400);
    expect((err as ApiError).errorCode).toBe('CONFLICT');
    expect((err as ApiError).localizedMessage('ar')).toBe('تمت الموافقة بالفعل.');
  });
});

describe('extractApprovedStatus', () => {
  it('reads a top-level string status', () => {
    expect(extractApprovedStatus({ status: 'contract_signing' })).toBe('CONTRACT_SIGNING');
  });
  it('reads an enum-object { name } status', () => {
    expect(extractApprovedStatus({ projectStatus: { name: 'CONTRACT_SIGNING' } })).toBe(
      'CONTRACT_SIGNING',
    );
  });
  it('returns empty string for an unrecognised shape', () => {
    expect(extractApprovedStatus(null)).toBe('');
    expect(extractApprovedStatus({})).toBe('');
  });
});

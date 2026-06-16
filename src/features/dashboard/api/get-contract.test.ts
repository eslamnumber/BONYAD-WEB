import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { ApiError } from '@/lib/api-client';
import { server } from '@/testing/handlers/server';

import { getContractByProject } from './get-contract';

describe('getContractByProject', () => {
  it('GETs /contracts/project/:projectId and returns the contract', async () => {
    let projectId: string | undefined;
    server.use(
      http.get('*/contracts/project/:projectId', ({ params }) => {
        projectId = String(params.projectId);
        return HttpResponse.json({
          id: 55,
          projectId: 102,
          technicianId: 9,
          status: 'PENDING_SIGNATURE',
          createdAt: '2026-06-16T09:00:00Z',
        });
      }),
    );
    const contract = await getContractByProject(102);
    expect(projectId).toBe('102');
    expect(contract?.id).toBe(55);
    expect(contract?.status).toBe('PENDING_SIGNATURE');
  });

  it('unwraps a { contract } envelope', async () => {
    server.use(
      http.get('*/contracts/project/:projectId', () =>
        HttpResponse.json({ contract: { id: 7, status: 'SIGNED' } }),
      ),
    );
    const contract = await getContractByProject(102);
    expect(contract?.id).toBe(7);
    expect(contract?.status).toBe('SIGNED');
  });

  it('returns null when no contract exists yet (404)', async () => {
    server.use(
      http.get('*/contracts/project/:projectId', () =>
        HttpResponse.json({ message: 'Not found' }, { status: 404 }),
      ),
    );
    await expect(getContractByProject(102)).resolves.toBeNull();
  });

  it('throws ApiError on a non-404 4xx', async () => {
    server.use(
      http.get('*/contracts/project/:projectId', () =>
        HttpResponse.json({ messageEn: 'Forbidden.' }, { status: 403 }),
      ),
    );
    const err = await getContractByProject(102).catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect((err as ApiError).status).toBe(403);
    expect((err as ApiError).messageEn).toBe('Forbidden.');
  });
});

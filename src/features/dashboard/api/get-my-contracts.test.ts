import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { ApiError } from '@/lib/api-client';
import { server } from '@/testing/handlers/server';

import { getMyContracts } from './get-my-contracts';

const CONTRACT = {
  id: 12,
  contractType: 'FIRST_CONTRACT',
  signedAt: '2026-06-21T02:23:51Z',
  signedDocumentUrl: 'https://example.com/c.pdf',
  project: { id: 222, description: 'بناء الجدران' },
  technician: { id: 444, name: 'ahmed farahat tech' },
};

describe('getMyContracts', () => {
  it('GETs /contracts/my and unwraps the { contracts } envelope', async () => {
    let capturedUrl = '';
    server.use(
      http.get('*/contracts/my', ({ request }) => {
        capturedUrl = request.url;
        return HttpResponse.json({
          userName: 'x',
          contracts: [CONTRACT],
          userId: 1,
          totalContracts: 1,
        });
      }),
    );

    const contracts = await getMyContracts();

    expect(new URL(capturedUrl).pathname.endsWith('/contracts/my')).toBe(true);
    expect(contracts).toHaveLength(1);
    expect(contracts[0]).toMatchObject({ id: 12, project: { id: 222 } });
  });

  it('returns [] for an empty / non-enveloped body', async () => {
    server.use(
      http.get('*/contracts/my', () => HttpResponse.json({ contracts: [], totalContracts: 0 })),
    );
    await expect(getMyContracts()).resolves.toEqual([]);
  });

  it('throws ApiError with the status on a 401', async () => {
    server.use(
      http.get('*/contracts/my', () =>
        HttpResponse.json({ messageEn: 'Unauthorized' }, { status: 401 }),
      ),
    );
    const err = await getMyContracts().catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect((err as ApiError).status).toBe(401);
  });
});

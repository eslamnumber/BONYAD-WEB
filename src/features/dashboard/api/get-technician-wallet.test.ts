import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { ApiError } from '@/lib/api-client';
import { server } from '@/testing/handlers/server';

import { getTechnicianWallet } from './get-technician-wallet';

const WALLET = {
  availableBalance: 171,
  inEscrow: 475,
  totalEarned: 171,
  totalPaidOut: 0,
  pendingPayouts: 0,
  currency: 'SAR',
};

describe('getTechnicianWallet', () => {
  it('GETs /technician/wallet and unwraps the { wallet } envelope', async () => {
    let capturedUrl = '';
    server.use(
      http.get('*/technician/wallet', ({ request }) => {
        capturedUrl = request.url;
        return HttpResponse.json({ success: true, wallet: WALLET });
      }),
    );

    const wallet = await getTechnicianWallet();

    expect(new URL(capturedUrl).pathname.endsWith('/technician/wallet')).toBe(true);
    expect(wallet).toMatchObject({ availableBalance: 171, inEscrow: 475, currency: 'SAR' });
  });

  it('tolerates a bare wallet object (no envelope)', async () => {
    server.use(http.get('*/technician/wallet', () => HttpResponse.json(WALLET)));
    await expect(getTechnicianWallet()).resolves.toMatchObject({ availableBalance: 171 });
  });

  it('throws ApiError with the status on a 401', async () => {
    server.use(
      http.get('*/technician/wallet', () =>
        HttpResponse.json({ messageEn: 'Unauthorized' }, { status: 401 }),
      ),
    );
    const err = await getTechnicianWallet().catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect((err as ApiError).status).toBe(401);
  });
});

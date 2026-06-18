import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { ApiError } from '@/lib/api-client';
import { server } from '@/testing/handlers/server';

import { updatePortfolio } from './update-portfolio';

describe('updatePortfolio', () => {
  it('PATCHes the partial body to /portfolios/me', async () => {
    let sent: Record<string, unknown> = {};
    let method = '';
    server.use(
      http.patch('*/portfolios/me', async ({ request }) => {
        method = request.method;
        sent = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json({ success: true });
      }),
    );
    await updatePortfolio({ bio: 'New bio', specialties: ['Finishing'], published: false });
    expect(method).toBe('PATCH');
    expect(sent).toEqual({ bio: 'New bio', specialties: ['Finishing'], published: false });
  });

  it('throws ApiError on 400', async () => {
    server.use(
      http.patch('*/portfolios/me', () =>
        HttpResponse.json({ messageEn: 'Nope', messageAr: 'لا', errorCode: 'X' }, { status: 400 }),
      ),
    );
    const err = await updatePortfolio({ bio: 'x' }).catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect((err as ApiError).localizedMessage('ar')).toBe('لا');
  });
});

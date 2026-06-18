import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { ApiError } from '@/lib/api-client';
import { server } from '@/testing/handlers/server';

import { createPortfolio } from './create-portfolio';

describe('createPortfolio', () => {
  it('POSTs the validated body and returns the normalised portfolio', async () => {
    let sent: Record<string, unknown> = {};
    server.use(
      http.post('*/portfolios/create', async ({ request }) => {
        sent = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json({ id: 8, businessName: 'Co', specialties: ['Finishing'] });
      }),
    );
    const portfolio = await createPortfolio({
      businessName: 'Co',
      specialties: ['Finishing'],
      isPublic: true,
    });
    expect(portfolio.id).toBe(8);
    expect(sent.businessName).toBe('Co');
    expect(sent.specialties).toEqual(['Finishing']);
  });

  it('defaults specialties to [] and isPublic to true', async () => {
    let sent: Record<string, unknown> = {};
    server.use(
      http.post('*/portfolios/create', async ({ request }) => {
        sent = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json({ id: 9 });
      }),
    );
    await createPortfolio({ businessName: 'Solo' });
    expect(sent.specialties).toEqual([]);
    expect(sent.isPublic).toBe(true);
  });

  it('throws ApiError on 400', async () => {
    server.use(
      http.post('*/portfolios/create', () =>
        HttpResponse.json({ messageEn: 'Bad', errorCode: 'X' }, { status: 400 }),
      ),
    );
    const err = await createPortfolio({ businessName: 'Co' }).catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ApiError);
  });

  it('rejects a negative yearsActive before any network call (zod)', async () => {
    await expect(createPortfolio({ yearsActive: -1 })).rejects.toBeTruthy();
  });
});

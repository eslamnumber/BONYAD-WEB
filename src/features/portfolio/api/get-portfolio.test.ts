import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { ApiError } from '@/lib/api-client';
import { server } from '@/testing/handlers/server';

import { getPortfolio } from './get-portfolio';

const NOT_FOUND_404 = () => HttpResponse.json({}, { status: 404 });
/** Spring's "No static resource" routing miss, wrapped as a 500 (this backend's `/my`). */
const NO_STATIC_RESOURCE = () =>
  HttpResponse.json(
    {
      success: false,
      error: 'No static resource api/portfolios/my.',
      status: 'INTERNAL_SERVER_ERROR',
    },
    { status: 500 },
  );
/**
 * A deployment that has PATCH /portfolios/me (builder-draft save) but NOT the newer
 * GET handler — the path matches, but GET isn't accepted → 405. The fetcher must
 * treat this as "not readable here" and fall back to /my, not error out.
 */
const METHOD_NOT_ALLOWED_405 = () =>
  HttpResponse.json(
    { success: false, error: 'Method not allowed', status: 'METHOD_NOT_ALLOWED' },
    { status: 405 },
  );

describe('getPortfolio', () => {
  it('returns the v2 /me portfolio, normalising specialties (string → array)', async () => {
    server.use(
      http.get('*/portfolios/me', () =>
        HttpResponse.json({ id: 5, businessName: 'Co', specialties: 'Finishing, Tiling' }),
      ),
    );
    const portfolio = await getPortfolio();
    expect(portfolio?.id).toBe(5);
    expect(portfolio?.specialties).toEqual(['Finishing', 'Tiling']);
  });

  it('unwraps a wrapped { exists, portfolio } envelope (the "already exists" bug)', async () => {
    server.use(
      http.get('*/portfolios/me', () =>
        HttpResponse.json({ exists: true, portfolio: { id: 12, businessName: 'Wrapped Co' } }),
      ),
    );
    const portfolio = await getPortfolio();
    expect(portfolio?.id).toBe(12);
    expect(portfolio?.businessName).toBe('Wrapped Co');
  });

  it('recognises a portfolio by its content even without a top-level id', async () => {
    server.use(
      http.get('*/portfolios/me', () =>
        HttpResponse.json({ businessName: 'No-Id Co', specialties: ['Finishing'] }),
      ),
    );
    const portfolio = await getPortfolio();
    expect(portfolio).not.toBeNull();
    expect(portfolio?.businessName).toBe('No-Id Co');
  });

  it('treats an explicit { exists: false } as no portfolio', async () => {
    server.use(
      http.get('*/portfolios/me', () => HttpResponse.json({ exists: false })),
      http.get('*/portfolios/my', () => HttpResponse.json({ exists: false })),
    );
    expect(await getPortfolio()).toBeNull();
  });

  it('falls back to legacy /my when /me has no portfolio (404)', async () => {
    server.use(
      http.get('*/portfolios/me', NOT_FOUND_404),
      http.get('*/portfolios/my', () => HttpResponse.json({ id: 9, businessName: 'Legacy' })),
    );
    const portfolio = await getPortfolio();
    expect(portfolio?.id).toBe(9);
  });

  it('treats a "No static resource" routing miss on /my as "no portfolio" (the reported bug)', async () => {
    server.use(
      http.get('*/portfolios/me', NOT_FOUND_404),
      http.get('*/portfolios/my', NO_STATIC_RESOURCE),
    );
    expect(await getPortfolio()).toBeNull();
  });

  it('falls back to /my when /me itself 500s with a routing miss', async () => {
    server.use(
      http.get('*/portfolios/me', NO_STATIC_RESOURCE),
      http.get('*/portfolios/my', () => HttpResponse.json({ id: 7 })),
    );
    expect((await getPortfolio())?.id).toBe(7);
  });

  it('falls back to /my when /me 405s (GET handler missing, PATCH exists)', async () => {
    // Regression: a partial backend deployment can have PATCH /portfolios/me (the
    // builder-draft save) without the newer GET handler. The path matches a controller,
    // so Spring returns 405 instead of 404. Without treating 405 as "missing route",
    // the error propagated and the portfolio screen showed a hard error instead of
    // falling through to the legacy /my endpoint.
    server.use(
      http.get('*/portfolios/me', METHOD_NOT_ALLOWED_405),
      http.get('*/portfolios/my', () => HttpResponse.json({ id: 7, businessName: 'Legacy' })),
    );
    const portfolio = await getPortfolio();
    expect(portfolio?.id).toBe(7);
    expect(portfolio?.businessName).toBe('Legacy');
  });

  it('returns null when both endpoints report no portfolio (404)', async () => {
    server.use(
      http.get('*/portfolios/me', NOT_FOUND_404),
      http.get('*/portfolios/my', NOT_FOUND_404),
    );
    expect(await getPortfolio()).toBeNull();
  });

  it('rethrows a real (non-routing) error from /me as ApiError', async () => {
    server.use(http.get('*/portfolios/me', () => HttpResponse.json({}, { status: 401 })));
    const err = await getPortfolio().catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect((err as ApiError).status).toBe(401);
  });

  it('recognises backend-updated /me builder-draft shape (the create-deadlock root cause)', async () => {
    // Regression: backend-updated returns 200 from /me with a PortfolioMeResponse
    // (`{draft, isPublic, publicHtmlUrl, pdfUrl, lastPublishedAt}`) once the user has
    // any builder state. The legacy /my then 500s ("No static resource"). Before the
    // fix, the builder-draft shape was discarded as "no portfolio" → the screen showed
    // the create panel → POST /create rejected as duplicate → user stuck.
    server.use(
      http.get('*/portfolios/me', () =>
        HttpResponse.json({
          draft: JSON.stringify({ businessName: 'Builder Co', specialties: ['Finishing'] }),
          isPublic: true,
          publicHtmlUrl: 'https://bonyad.test/p/42',
          lastPublishedAt: '2026-06-01T10:00:00',
        }),
      ),
      http.get('*/portfolios/my', NO_STATIC_RESOURCE),
    );
    const portfolio = await getPortfolio();
    expect(portfolio).not.toBeNull();
    expect(portfolio?.businessName).toBe('Builder Co');
    expect(portfolio?.isPublic).toBe(true);
    expect(portfolio?.published).toBe(true);
  });
});

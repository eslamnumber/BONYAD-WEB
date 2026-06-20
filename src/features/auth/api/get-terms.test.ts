import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { ApiError } from '@/lib/api-client';
import { server } from '@/testing/handlers/server';

import { getTerms } from './get-terms';

const USER_TERMS = {
  id: 17,
  type: 'USER',
  version: '1.2',
  isActive: true,
  contentEn: '<h1>Terms</h1><p>EN body.</p>',
  contentAr: '<h1>الشروط</h1><p>نص عربي.</p>',
};

describe('getTerms', () => {
  it('fetches and normalises the active USER terms', async () => {
    server.use(http.get('*/terms/user', () => HttpResponse.json(USER_TERMS)));
    const terms = await getTerms('USER');
    expect(terms).toMatchObject({ id: 17, type: 'USER', version: '1.2' });
    expect(terms?.contentEn).toContain('EN body');
    expect(terms?.contentAr).toContain('نص عربي');
  });

  it('targets the technician endpoint for the TECHNICIAN role', async () => {
    let hit = '';
    server.use(
      http.get('*/terms/technician', ({ request }) => {
        hit = new URL(request.url).pathname;
        return HttpResponse.json({ ...USER_TERMS, id: 18, type: 'TECHNICIAN' });
      }),
    );
    const terms = await getTerms('TECHNICIAN');
    expect(hit).toMatch(/\/terms\/technician$/);
    expect(terms?.id).toBe(18);
  });

  it('unwraps a { terms } envelope', async () => {
    server.use(http.get('*/terms/user', () => HttpResponse.json({ terms: USER_TERMS })));
    expect((await getTerms('USER'))?.id).toBe(17);
  });

  it('returns null (no active terms) on a 404', async () => {
    server.use(http.get('*/terms/user', () => HttpResponse.json(null, { status: 404 })));
    expect(await getTerms('USER')).toBeNull();
  });

  it('returns null on an empty / id-less body', async () => {
    server.use(http.get('*/terms/user', () => HttpResponse.json({})));
    expect(await getTerms('USER')).toBeNull();
  });

  it('throws ApiError on a non-404 server error', async () => {
    server.use(
      http.get('*/terms/user', () =>
        HttpResponse.json({ messageEn: 'boom', errorCode: 'SERVER_ERROR' }, { status: 500 }),
      ),
    );
    await expect(getTerms('USER')).rejects.toBeInstanceOf(ApiError);
  });
});

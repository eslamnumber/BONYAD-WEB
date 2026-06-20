import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { ApiError } from '@/lib/api-client';
import { server } from '@/testing/handlers/server';

import { createSignature } from './create-signature';

const VALID = {
  projectId: 102,
  phaseIds: [1, 2, 3],
  language: 'AR' as const,
};

describe('createSignature', () => {
  it('POSTs /signatures form-urlencoded with phaseIds as repeated fields (RN email path)', async () => {
    let contentType: string | null = null;
    let body: URLSearchParams | undefined;
    server.use(
      http.post('*/signatures', async ({ request }) => {
        contentType = request.headers.get('content-type');
        body = new URLSearchParams(await request.text());
        return HttpResponse.json({ id: 1 }, { status: 201 });
      }),
    );

    await createSignature(VALID);

    expect(contentType).toContain('application/x-www-form-urlencoded');
    expect(body?.get('projectId')).toBe('102');
    // Repeated fields, not a CSV — mirrors RN's buildFormData (phaseIds=1&phaseIds=2…).
    expect(body?.getAll('phaseIds')).toEqual(['1', '2', '3']);
    expect(body?.get('language')).toBe('AR');
    // The backend auto-fetches emails; the body must NOT carry them.
    expect(body?.has('userEmail')).toBe(false);
    expect(body?.has('technicianEmail')).toBe(false);
    expect(body?.has('technicianId')).toBe(false);
  });

  it('includes contractTerms only when provided', async () => {
    let body: URLSearchParams | undefined;
    server.use(
      http.post('*/signatures', async ({ request }) => {
        body = new URLSearchParams(await request.text());
        return HttpResponse.json({ id: 2 }, { status: 201 });
      }),
    );

    await createSignature({ ...VALID, contractTerms: 'Net 30' });
    expect(body?.get('contractTerms')).toBe('Net 30');
  });

  it('rejects an empty phase list before any request (zod)', async () => {
    let called = false;
    server.use(
      http.post('*/signatures', () => {
        called = true;
        return HttpResponse.json({}, { status: 201 });
      }),
    );
    await expect(createSignature({ ...VALID, phaseIds: [] })).rejects.toThrow();
    expect(called).toBe(false);
  });

  it('throws ApiError on a 4xx', async () => {
    server.use(
      http.post('*/signatures', () =>
        HttpResponse.json({ messageEn: 'Project not in signing stage.' }, { status: 409 }),
      ),
    );
    const err = await createSignature(VALID).catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect((err as ApiError).status).toBe(409);
  });
});

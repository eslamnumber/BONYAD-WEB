import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { ApiError } from '@/lib/api-client';
import { server } from '@/testing/handlers/server';

import { createSignature } from './create-signature';

const VALID = {
  projectId: 102,
  technicianId: 9,
  userEmail: 'owner@example.com',
  technicianEmail: 'tech@example.com',
  phaseIds: [1, 2, 3],
  language: 'AR' as const,
};

describe('createSignature', () => {
  it('POSTs /signatures form-urlencoded with the RN body shape (phaseIds as CSV)', async () => {
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
    expect(body?.get('technicianId')).toBe('9');
    expect(body?.get('userEmail')).toBe('owner@example.com');
    expect(body?.get('technicianEmail')).toBe('tech@example.com');
    expect(body?.get('phaseIds')).toBe('1,2,3');
    expect(body?.get('language')).toBe('AR');
  });

  it('rejects an invalid body before any request (zod)', async () => {
    let called = false;
    server.use(
      http.post('*/signatures', () => {
        called = true;
        return HttpResponse.json({}, { status: 201 });
      }),
    );
    await expect(createSignature({ ...VALID, userEmail: 'not-an-email' })).rejects.toThrow();
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

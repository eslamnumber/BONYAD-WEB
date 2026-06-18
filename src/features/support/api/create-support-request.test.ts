import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { ApiError } from '@/lib/api-client';
import { server } from '@/testing/handlers/server';

import { createSupportRequest } from './create-support-request';

const VALUES = {
  subject: '  Login fails  ',
  description: '  I cannot sign in with my phone number.  ',
  category: 'Account' as const,
  priority: 'HIGH' as const,
};

describe('createSupportRequest', () => {
  it('posts the trimmed body and returns the parsed response', async () => {
    let captured: Record<string, unknown> | null = null;
    server.use(
      http.post('*/support/request', async ({ request }) => {
        captured = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json({ id: 42, status: 'PENDING' });
      }),
    );

    const res = await createSupportRequest(VALUES);

    expect(captured).toEqual({
      subject: 'Login fails',
      description: 'I cannot sign in with my phone number.',
      category: 'Account',
      priority: 'HIGH',
    });
    expect(res.id).toBe(42);
    expect(res.status).toBe('PENDING');
  });

  it('throws ApiError with localized messages on 400', async () => {
    server.use(
      http.post('*/support/request', () =>
        HttpResponse.json(
          { messageEn: 'Subject required.', messageAr: 'الموضوع مطلوب.', errorCode: 'VALIDATION' },
          { status: 400 },
        ),
      ),
    );
    const err = await createSupportRequest(VALUES).catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect((err as ApiError).status).toBe(400);
    expect((err as ApiError).localizedMessage('en')).toBe('Subject required.');
    expect((err as ApiError).errorCode).toBe('VALIDATION');
  });
});

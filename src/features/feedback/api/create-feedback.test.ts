import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { ApiError } from '@/lib/api-client';
import { server } from '@/testing/handlers/server';

import { createFeedback } from './create-feedback';

const VALUES = {
  category: 'SUGGESTION' as const,
  subject: '  Dark mode please  ',
  message: '  Please add a dark theme.  ',
};

describe('createFeedback', () => {
  it('posts the trimmed body and returns the created record', async () => {
    let captured: Record<string, unknown> | null = null;
    server.use(
      http.post('*/app-feedback', async ({ request }) => {
        captured = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json({ id: 7, status: 'NEW', category: 'SUGGESTION' });
      }),
    );

    const res = await createFeedback(VALUES);

    expect(captured).toEqual({
      category: 'SUGGESTION',
      subject: 'Dark mode please',
      message: 'Please add a dark theme.',
    });
    expect(captured).not.toHaveProperty('attachments');
    expect(res.id).toBe(7);
    expect(res.status).toBe('NEW');
  });

  it('sends subject as null when blank', async () => {
    let captured: Record<string, unknown> | null = null;
    server.use(
      http.post('*/app-feedback', async ({ request }) => {
        captured = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json({ id: 8 });
      }),
    );

    await createFeedback({ ...VALUES, subject: '   ' });

    expect(captured).toMatchObject({ subject: null });
  });

  it('throws ApiError with localized messages on 400', async () => {
    server.use(
      http.post('*/app-feedback', () =>
        HttpResponse.json(
          { messageEn: 'Message required.', messageAr: 'الرسالة مطلوبة.', errorCode: 'VALIDATION' },
          { status: 400 },
        ),
      ),
    );

    const err = await createFeedback(VALUES).catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect((err as ApiError).status).toBe(400);
    expect((err as ApiError).localizedMessage('ar')).toBe('الرسالة مطلوبة.');
    expect((err as ApiError).errorCode).toBe('VALIDATION');
  });
});

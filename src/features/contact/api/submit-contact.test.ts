import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { ApiError } from '@/lib/api-client';
import { server } from '@/testing/handlers/server';

import { submitContact } from './submit-contact';

const VALID_VALUES = {
  phone: '0501234567',
  email: 'user@example.com',
  title: 'Subject line',
  description: 'A description with more than ten characters.',
};

describe('submitContact', () => {
  it('posts a normalised body and returns the parsed ticket payload on success', async () => {
    let captured: unknown = null;
    server.use(
      http.post('*/contact', async ({ request }) => {
        captured = await request.json();
        return HttpResponse.json({
          success: true,
          ticketNumber: 'TCK-001',
          email: 'user@example.com',
          message: 'Received',
          createdAt: '2026-01-01T00:00:00Z',
        });
      }),
    );

    const res = await submitContact(VALID_VALUES);

    expect(captured).toEqual({
      email: 'user@example.com',
      phoneNumber: '501234567',
      title: 'Subject line',
      description: 'A description with more than ten characters.',
    });
    expect(res.ticketNumber).toBe('TCK-001');
    expect(res.success).toBe(true);
  });

  it('throws ApiError with localised messages on a 400', async () => {
    server.use(
      http.post('*/contact', () =>
        HttpResponse.json(
          {
            messageEn: 'Invalid request.',
            messageAr: 'طلب غير صالح.',
            errorCode: 'VALIDATION_ERROR',
          },
          { status: 400 },
        ),
      ),
    );

    const err = await submitContact(VALID_VALUES).catch((e: unknown) => e);

    expect(err).toBeInstanceOf(ApiError);
    expect((err as ApiError).status).toBe(400);
    expect((err as ApiError).errorCode).toBe('VALIDATION_ERROR');
    expect((err as ApiError).localizedMessage('en')).toBe('Invalid request.');
    expect((err as ApiError).localizedMessage('ar')).toBe('طلب غير صالح.');
  });

  it('trims whitespace from text fields before sending', async () => {
    let captured: { title?: string; description?: string; email?: string } = {};
    server.use(
      http.post('*/contact', async ({ request }) => {
        captured = (await request.json()) as typeof captured;
        return HttpResponse.json({ success: true, ticketNumber: 'TCK-002' });
      }),
    );

    await submitContact({
      ...VALID_VALUES,
      email: '  user@example.com  ',
      title: '  Subject line  ',
      description: '  A description with more than ten characters.  ',
    });

    expect(captured.email).toBe('user@example.com');
    expect(captured.title).toBe('Subject line');
    expect(captured.description).toBe('A description with more than ten characters.');
  });
});

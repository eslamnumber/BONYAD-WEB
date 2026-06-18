import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { ApiError } from '@/lib/api-client';
import { server } from '@/testing/handlers/server';

import { createTicket } from './create-ticket';

const VALUES = {
  subject: '  Refund delay  ',
  description: '  My refund has not arrived after a week.  ',
  priority: 'HIGH' as const,
  categoryId: 3,
  subcategoryId: null,
};

describe('createTicket', () => {
  it('posts the trimmed body, includes categoryId and omits a null subcategoryId', async () => {
    let captured: Record<string, unknown> | null = null;
    server.use(
      http.post('*/support/tickets', async ({ request }) => {
        captured = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json({ id: 11, status: 'OPEN', subject: 'Refund delay' });
      }),
    );

    const ticket = await createTicket(VALUES);

    expect(captured).toEqual({
      subject: 'Refund delay',
      description: 'My refund has not arrived after a week.',
      priority: 'HIGH',
      categoryId: 3,
    });
    expect(ticket.id).toBe(11);
  });

  it('throws ApiError with localized messages on 400', async () => {
    server.use(
      http.post('*/support/tickets', () =>
        HttpResponse.json(
          { messageEn: 'Category required.', messageAr: 'الفئة مطلوبة.', errorCode: 'VALIDATION' },
          { status: 400 },
        ),
      ),
    );
    const err = await createTicket(VALUES).catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect((err as ApiError).localizedMessage('en')).toBe('Category required.');
  });
});

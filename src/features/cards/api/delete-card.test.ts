import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { ApiError } from '@/lib/api-client';
import { server } from '@/testing/handlers/server';

import { deleteCard } from './delete-card';

describe('deleteCard', () => {
  it('DELETEs /user/cards/:id and resolves on success', async () => {
    let hitUrl = '';
    server.use(
      http.delete('*/user/cards/:id', ({ request }) => {
        hitUrl = request.url;
        return HttpResponse.json({ success: true });
      }),
    );
    await expect(deleteCard(8)).resolves.toBeUndefined();
    expect(hitUrl).toContain('/user/cards/8');
  });

  it('throws when the backend forwards success:false over HTTP 200', async () => {
    server.use(
      http.delete('*/user/cards/:id', () =>
        HttpResponse.json({ success: false, error: 'Cannot delete default card' }),
      ),
    );
    await expect(deleteCard(8)).rejects.toThrow('Cannot delete default card');
  });

  it('throws ApiError with localized messages on 404', async () => {
    server.use(
      http.delete('*/user/cards/:id', () =>
        HttpResponse.json(
          {
            messageEn: 'Card not found.',
            messageAr: 'البطاقة غير موجودة.',
            errorCode: 'NOT_FOUND',
          },
          { status: 404 },
        ),
      ),
    );
    const err = await deleteCard(404).catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect((err as ApiError).errorCode).toBe('NOT_FOUND');
  });
});

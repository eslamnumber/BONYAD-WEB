import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { ZodError } from 'zod';

import { ApiError } from '@/lib/api-client';
import { server } from '@/testing/handlers/server';

import type { CreateBidRequest } from '../schemas/bid';

import { createBid } from './create-bid';

const VALID: CreateBidRequest = {
  projectId: 42,
  proposedBudget: 75000,
  estimatedDurationDays: 360,
  comment: 'عرض تفصيلي لتنفيذ المشروع.',
};

describe('createBid', () => {
  it('POSTs the validated body to /bids/create and returns the parsed bid', async () => {
    let capturedBody: unknown;
    server.use(
      http.post('*/bids/create', async ({ request }) => {
        capturedBody = await request.json();
        return HttpResponse.json({ id: 7, status: 'PENDING', ...VALID });
      }),
    );
    const bid = await createBid(VALID);
    expect(capturedBody).toEqual(VALID);
    expect(bid.id).toBe(7);
    expect(bid.status).toBe('PENDING');
  });

  it('rejects an invalid body before any network call (strict request schema)', async () => {
    let called = false;
    server.use(
      http.post('*/bids/create', () => {
        called = true;
        return HttpResponse.json({});
      }),
    );
    const err = await createBid({ ...VALID, proposedBudget: -1, comment: '' }).catch(
      (e: unknown) => e,
    );
    expect(err).toBeInstanceOf(ZodError);
    expect(called).toBe(false);
  });

  it('throws ApiError with fieldErrors / localized messages on 422', async () => {
    server.use(
      http.post('*/bids/create', () =>
        HttpResponse.json(
          {
            messageEn: 'Validation failed.',
            messageAr: 'فشل التحقق.',
            errorCode: 'VALIDATION_ERROR',
            fieldErrors: { proposedBudget: 'Too low' },
          },
          { status: 422 },
        ),
      ),
    );
    const err = await createBid(VALID).catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect((err as ApiError).status).toBe(422);
    expect((err as ApiError).fieldErrors?.proposedBudget).toBe('Too low');
    expect((err as ApiError).localizedMessage('ar')).toBe('فشل التحقق.');
  });
});

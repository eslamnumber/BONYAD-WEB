import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { ApiError } from '@/lib/api-client';
import { server } from '@/testing/handlers/server';

import { getFaqs } from './get-faqs';

const FAQ_A = {
  id: 1,
  questionEn: 'How do I sign up?',
  questionAr: 'كيف أسجل؟',
  answerEn: 'Click the get-started button.',
  answerAr: 'انقر على زر البدء.',
  displayOrder: 2,
};

const FAQ_B = {
  id: 2,
  questionEn: 'Is Bonyad free for customers?',
  questionAr: 'هل بنياد مجاني للعملاء؟',
  answerEn: 'Yes, browsing and posting projects is free.',
  answerAr: 'نعم، التصفح ونشر المشاريع مجاني.',
  displayOrder: 1,
};

describe('getFaqs', () => {
  it('returns the FAQs sorted by displayOrder then id on success', async () => {
    server.use(http.get('*/faqs', () => HttpResponse.json([FAQ_A, FAQ_B])));
    const faqs = await getFaqs();
    expect(faqs).toHaveLength(2);
    expect(faqs.at(0)?.id).toBe(2);
    expect(faqs.at(1)?.id).toBe(1);
  });

  it('throws ApiError with status/messages on 500', async () => {
    server.use(
      http.get('*/faqs', () =>
        HttpResponse.json(
          { messageEn: 'Server error.', messageAr: 'خطأ في الخادم.', errorCode: 'SERVER_ERROR' },
          { status: 500 },
        ),
      ),
    );
    const err = await getFaqs().catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect((err as ApiError).status).toBe(500);
    expect((err as ApiError).errorCode).toBe('SERVER_ERROR');
    expect((err as ApiError).localizedMessage('en')).toBe('Server error.');
    expect((err as ApiError).localizedMessage('ar')).toBe('خطأ في الخادم.');
  });

  it('returns an empty array when the backend responds with []', async () => {
    server.use(http.get('*/faqs', () => HttpResponse.json([])));
    const faqs = await getFaqs();
    expect(faqs).toEqual([]);
  });

  it('returns an empty array when the backend responds with a non-array body', async () => {
    server.use(http.get('*/faqs', () => HttpResponse.json({ unexpected: 'shape' })));
    const faqs = await getFaqs();
    expect(faqs).toEqual([]);
  });
});

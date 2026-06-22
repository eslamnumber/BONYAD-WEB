import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { ApiError } from '@/lib/api-client';
import { server } from '@/testing/handlers/server';

import { sendAssistantMessage } from './send-assistant-message';

describe('sendAssistantMessage', () => {
  it('posts the body, strips the wizard-stage marker, and parses id + suggestions', async () => {
    let captured: Record<string, unknown> | null = null;
    server.use(
      http.post('*/api/ai/chat', async ({ request }) => {
        captured = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json({
          response: 'أهلاً بك في بُنياد <<WIZARD_STAGE:GATHER>>',
          conversationId: 'conv-99',
          recommendations: [],
          ui: {
            suggestions: [
              { label: 'أرني مثالاً', value: 'أرني مثالاً على وصف مشروع جيد' },
              { label: '', value: '' },
              'ابدأ مشروعاً',
            ],
          },
        });
      }),
    );

    const reply = await sendAssistantMessage({
      message: 'مرحبا',
      conversationId: 'conv-1',
      lang: 'ar',
      userType: 'TECHNICIAN',
      history: [{ role: 'user', content: 'سؤال سابق' }],
    });

    expect(captured).toEqual({
      message: 'مرحبا',
      conversationId: 'conv-1',
      lang: 'ar',
      userType: 'TECHNICIAN',
      history: [{ role: 'user', content: 'سؤال سابق' }],
    });
    expect(reply.answer).toBe('أهلاً بك في بُنياد');
    expect(reply.conversationId).toBe('conv-99');
    expect(reply.suggestions).toEqual([
      { label: 'أرني مثالاً', value: 'أرني مثالاً على وصف مشروع جيد' },
      { label: 'ابدأ مشروعاً', value: 'ابدأ مشروعاً' },
    ]);
  });

  it('omits conversationId on the first turn and defaults lang/userType', async () => {
    let captured: Record<string, unknown> | null = null;
    server.use(
      http.post('*/api/ai/chat', async ({ request }) => {
        captured = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json({ response: 'مرحبا', conversationId: 'conv-new' });
      }),
    );

    const reply = await sendAssistantMessage({ message: 'مرحبا' });

    expect(captured).toEqual({ message: 'مرحبا', lang: 'ar', userType: 'USER', history: [] });
    expect(captured).not.toHaveProperty('conversationId');
    expect(reply.conversationId).toBe('conv-new');
    expect(reply.suggestions).toEqual([]);
  });

  it('returns a null conversationId and no suggestions when the reply is sparse', async () => {
    server.use(http.post('*/api/ai/chat', () => HttpResponse.json({ answer: 'ok' })));
    const reply = await sendAssistantMessage({ message: 'hi' });
    expect(reply.answer).toBe('ok');
    expect(reply.conversationId).toBeNull();
    expect(reply.suggestions).toEqual([]);
  });

  it('surfaces a 4xx as ApiError with localized messages + errorCode', async () => {
    server.use(
      http.post('*/api/ai/chat', () =>
        HttpResponse.json(
          {
            messageEn: 'Assistant unavailable',
            messageAr: 'المساعد غير متاح',
            errorCode: 'ASSISTANT_DOWN',
          },
          { status: 400 },
        ),
      ),
    );

    await expect(sendAssistantMessage({ message: 'hi' })).rejects.toMatchObject({
      status: 400,
      messageEn: 'Assistant unavailable',
      messageAr: 'المساعد غير متاح',
      errorCode: 'ASSISTANT_DOWN',
    });
    await expect(sendAssistantMessage({ message: 'hi' })).rejects.toBeInstanceOf(ApiError);
  });
});

import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { server } from '@/testing/handlers/server';

import { extractStage, sendWizardMessage } from './send-wizard-message';

describe('extractStage', () => {
  it('pulls the WIZARD_STAGE marker out and strips it from display text', () => {
    expect(extractStage('شكراً لك <<WIZARD_STAGE:GATHER>>')).toEqual({
      answer: 'شكراً لك',
      stage: 'GATHER',
    });
    expect(extractStage('no marker here')).toEqual({ answer: 'no marker here', stage: null });
  });
});

describe('sendWizardMessage', () => {
  it('posts the locked body and parses stage, suggestions, and ui.sow', async () => {
    let captured: Record<string, unknown> | null = null;
    server.use(
      http.post('*/api/ai/chat', async ({ request }) => {
        captured = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json({
          response: 'خطتك جاهزة <<WIZARD_STAGE:PLAN>>',
          conversationId: 'c-99',
          ui: {
            suggestions: [
              { label: 'انشر', value: 'نعم انشر' },
              { label: '', value: '' },
            ],
            sow: { scope: { in_scope: ['x'] } },
          },
        });
      }),
    );

    const reply = await sendWizardMessage({ message: 'مرحبا', conversationId: 'c-1' });

    expect(captured).toEqual({
      message: 'مرحبا',
      conversationId: 'c-1',
      lang: 'ar',
      userType: 'USER',
      history: [],
    });
    expect(reply.answer).toBe('خطتك جاهزة');
    expect(reply.stage).toBe('PLAN');
    expect(reply.conversationId).toBe('c-99');
    expect(reply.suggestions).toEqual([{ label: 'انشر', value: 'نعم انشر' }]);
    expect(reply.sow).toEqual({ scope: { in_scope: ['x'] } });
  });

  it('falls back to the request conversationId and empty fields when the reply is sparse', async () => {
    server.use(http.post('*/api/ai/chat', () => HttpResponse.json({ answer: 'ok' })));
    const reply = await sendWizardMessage({ message: 'hi', conversationId: 'keep-me' });
    expect(reply.conversationId).toBe('keep-me');
    expect(reply.suggestions).toEqual([]);
    expect(reply.sow).toBeNull();
    expect(reply.stage).toBeNull();
  });
});

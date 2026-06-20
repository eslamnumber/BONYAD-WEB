import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { server } from '@/testing/handlers/server';

import { PublishFailure, runPublish } from './run-publish';
import type { SowDocument } from './sow-types';

const SOW: SowDocument = {
  project_metadata: { project_type: 'تشطيب', quality_tier: 'A' },
  timeline: { duration_weeks: 8, milestones: [{ name: 'P1', week: 1, payment_percent: 100 }] },
  commercials: { cost_breakdown: { grand_total: { min: 1000, max: 2000 } } },
};
const INPUT = { sow: SOW, conversationId: 'c-1', address: 'الرياض', photos: [], locale: 'ar' };

const SERVICES = [
  { id: 87, nameAr: 'تشطيبات', nameEn: 'Finishing', isActive: true, parentService: { id: 5 } },
];

function stubTriggerAndDraft() {
  server.use(
    http.post('*/api/ai/chat', () => HttpResponse.json({ response: 'ok' })),
    http.put('*/v1/ai/draft', () => HttpResponse.json({ ok: true })),
    http.post('*/phases', () => HttpResponse.json({ id: 1 })),
  );
}

describe('runPublish', () => {
  it('throws no-service when nothing matches', async () => {
    stubTriggerAndDraft();
    server.use(http.get('*/services', () => HttpResponse.json([])));
    const err = await runPublish(INPUT).catch((e: unknown) => e);
    expect(err).toBeInstanceOf(PublishFailure);
    expect((err as PublishFailure).kind).toBe('no-service');
  });

  it('matches, creates the project, runs phases, and returns the id', async () => {
    stubTriggerAndDraft();
    server.use(
      http.get('*/services', () => HttpResponse.json(SERVICES)),
      http.post('*/v1/projects/from-ai', () => HttpResponse.json({ id: 555, status: 'PENDING' })),
    );
    const res = await runPublish(INPUT);
    expect(res.projectId).toBe(555);
    expect(res.phasesCreated).toBe(1);
  });

  it('throws create-failed when project creation errors', async () => {
    stubTriggerAndDraft();
    server.use(
      http.get('*/services', () => HttpResponse.json(SERVICES)),
      http.post('*/v1/projects/from-ai', () => new HttpResponse(null, { status: 500 })),
    );
    const err = await runPublish(INPUT).catch((e: unknown) => e);
    expect(err).toBeInstanceOf(PublishFailure);
    expect((err as PublishFailure).kind).toBe('create-failed');
  });
});

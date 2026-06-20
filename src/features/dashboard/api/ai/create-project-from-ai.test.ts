import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { ApiError } from '@/lib/api-client';
import { server } from '@/testing/handlers/server';

import { createProjectFromAi, projectIdOf } from './create-project-from-ai';
import type { SowDocument } from './sow-types';

const SOW: SowDocument = {
  project_metadata: { quality_tier: 'A+' },
  timeline: { duration_weeks: 12 },
};
const ARGS = {
  sow: SOW,
  match: { categoryId: 5, subcategoryId: 87, serviceId: 87 },
  address: '  الرياض، النرجس  ',
  latitude: 24.71,
  longitude: 46.67,
  conversationId: 'c-1',
  locale: 'ar',
};

describe('createProjectFromAi', () => {
  it('mirrors ids, derives timeRequiredDays and qualityTier, embeds the SOW twice', async () => {
    let body: Record<string, unknown> | null = null;
    server.use(
      http.post('*/v1/projects/from-ai', async ({ request }) => {
        body = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json({ id: 321, aiGenerated: true, status: 'PENDING' });
      }),
    );

    const res = await createProjectFromAi(ARGS);

    expect(body).toMatchObject({
      qualityTier: 'A+',
      locale: 'ar',
      address: 'الرياض، النرجس',
      serviceCategoryId: 5,
      serviceSubcategoryId: 87,
      serviceId: 87,
      timeRequiredDays: 84,
    });
    const sent = body as unknown as Record<string, unknown>;
    // The SOW carries the original fields PLUS the mirrored service ids (the backend
    // reads serviceId from inside the sow, not just top-level).
    expect(sent.sow).toMatchObject(SOW);
    expect(sent.sow).toMatchObject({
      serviceId: 87,
      serviceCategoryId: 5,
      serviceSubcategoryId: 87,
    });
    expect(sent.sowJsonRaw).toMatchObject({ serviceId: 87 });
    expect(projectIdOf(res)).toBe(321);
  });

  it('rejects when the service match has no positive serviceId (blocks publish)', async () => {
    const err = await createProjectFromAi({
      ...ARGS,
      match: { categoryId: null, subcategoryId: null, serviceId: 0 },
    }).catch((e: unknown) => e);
    expect(err).toBeInstanceOf(Error);
    expect(err).not.toBeInstanceOf(ApiError);
  });

  it('surfaces a backend error as ApiError', async () => {
    server.use(
      http.post('*/v1/projects/from-ai', () =>
        HttpResponse.json({ messageEn: 'bad' }, { status: 422 }),
      ),
    );
    const err = await createProjectFromAi(ARGS).catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect((err as ApiError).status).toBe(422);
  });
});

describe('projectIdOf', () => {
  it('prefers id, falls back to the legacy projectId alias', () => {
    expect(projectIdOf({ id: 1, projectId: 2 })).toBe(1);
    expect(projectIdOf({ projectId: 2 })).toBe(2);
    expect(projectIdOf({})).toBeUndefined();
  });
});

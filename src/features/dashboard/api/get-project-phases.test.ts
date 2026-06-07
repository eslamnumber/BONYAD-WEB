import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { ApiError } from '@/lib/api-client';
import { server } from '@/testing/handlers/server';

import { getProjectPhases } from './get-project-phases';

const PHASE_1 = { id: 1, phaseNumber: 1, description: 'الأساسات', timeSpentDays: 30 };
const PHASE_2 = { id: 2, phaseNumber: 2, description: 'الهيكل الخرساني', timeSpentDays: 60 };

describe('getProjectPhases', () => {
  it('fetches /phases/project/:projectId and returns the bare array', async () => {
    let capturedUrl = '';
    server.use(
      http.get('*/phases/project/:projectId', ({ request }) => {
        capturedUrl = request.url;
        return HttpResponse.json([PHASE_1, PHASE_2]);
      }),
    );
    const phases = await getProjectPhases(42);
    expect(new URL(capturedUrl).pathname).toMatch(/\/phases\/project\/42$/);
    expect(phases).toEqual([PHASE_1, PHASE_2]);
  });

  it('unwraps a paginated { content } envelope', async () => {
    server.use(
      http.get('*/phases/project/:projectId', () => HttpResponse.json({ content: [PHASE_1] })),
    );
    expect(await getProjectPhases(42)).toEqual([PHASE_1]);
  });

  it('returns [] when the body shape is unexpected', async () => {
    server.use(
      http.get('*/phases/project/:projectId', () => HttpResponse.json({ unexpected: 'shape' })),
    );
    expect(await getProjectPhases(42)).toEqual([]);
  });

  it('throws ApiError with status / localized messages on 401', async () => {
    server.use(
      http.get('*/phases/project/:projectId', () =>
        HttpResponse.json(
          { messageEn: 'Unauthorized.', messageAr: 'غير مصرح.', errorCode: 'UNAUTHORIZED' },
          { status: 401 },
        ),
      ),
    );
    const err = await getProjectPhases(42).catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect((err as ApiError).status).toBe(401);
    expect((err as ApiError).errorCode).toBe('UNAUTHORIZED');
    expect((err as ApiError).localizedMessage('ar')).toBe('غير مصرح.');
  });
});

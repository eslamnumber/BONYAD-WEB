import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { ApiError } from '@/lib/api-client';
import { server } from '@/testing/handlers/server';

import { submitSketchIdea } from './submit-idea';

describe('submitSketchIdea', () => {
  it('posts the strict snake_case body and parses { jobId, status }', async () => {
    let captured: Record<string, unknown> | null = null;
    server.use(
      http.post('*/api/sketch/idea', async ({ request }) => {
        captured = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json({ jobId: 'skt_abc', status: 'parsing' });
      }),
    );

    const reply = await submitSketchIdea({
      description: 'فيلا دورين',
      total_area_m2: 300,
      project_type: 'villa',
      stories: 2,
      style: 'modern',
    });

    expect(captured).toEqual({
      description: 'فيلا دورين',
      total_area_m2: 300,
      project_type: 'villa',
      stories: 2,
      style: 'modern',
    });
    expect(reply).toEqual({ jobId: 'skt_abc', status: 'parsing' });
  });

  it('rejects an empty description before any network call (request schema)', async () => {
    await expect(submitSketchIdea({ description: '' })).rejects.toThrowError();
  });

  it('surfaces a 4xx as ApiError carrying the chatbot host { error } body', async () => {
    server.use(
      http.post('*/api/sketch/idea', () =>
        HttpResponse.json({ error: 'description is required' }, { status: 400 }),
      ),
    );

    await expect(submitSketchIdea({ description: 'x' })).rejects.toMatchObject({
      status: 400,
      body: { error: 'description is required' },
    });
    await expect(submitSketchIdea({ description: 'x' })).rejects.toBeInstanceOf(ApiError);
  });
});

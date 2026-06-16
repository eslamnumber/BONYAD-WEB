import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { ApiError } from '@/lib/api-client';
import { server } from '@/testing/handlers/server';

import { type OwnerEditFormValues } from '../schemas/owner-edit';

import { updateProject } from './update-project';

const form: OwnerEditFormValues = {
  name: 'Villa',
  description: 'Build a villa',
  budgetUnspecified: false,
  budget: '250000',
  address: 'Riyadh',
  existingPhotos: ['keep.jpg'],
  phases: [
    {
      id: null,
      phaseNumber: '1',
      description: 'Foundations',
      durationWeeks: '3',
      amount: '100000',
    },
  ],
};

describe('updateProject', () => {
  it('PUTs /projects/:id/owner-edit with the mapped payload', async () => {
    let method: string | undefined;
    let path: string | undefined;
    let body: Record<string, unknown> | undefined;
    server.use(
      http.put('*/projects/:id/owner-edit', async ({ request, params }) => {
        method = request.method;
        path = String(params.id);
        body = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json({ ok: true });
      }),
    );
    await expect(updateProject(7, form)).resolves.toBeUndefined();
    expect(method).toBe('PUT');
    expect(path).toBe('7');
    expect(body).toMatchObject({
      description: 'Villa\n\nBuild a villa',
      budget: 250000,
      address: 'Riyadh',
      existingPhotos: ['keep.jpg'],
      phases: [
        {
          id: null,
          description: 'Foundations',
          phaseNumber: 1,
          timeSpentDays: 21,
          moneySpent: 100000,
        },
      ],
    });
  });

  it('omits budget from the body when the owner marks it unspecified', async () => {
    let body: Record<string, unknown> | undefined;
    server.use(
      http.put('*/projects/:id/owner-edit', async ({ request }) => {
        body = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json({ ok: true });
      }),
    );
    await updateProject(7, { ...form, budgetUnspecified: true, budget: '' });
    expect(body).not.toHaveProperty('budget');
  });

  it('throws ApiError when the backend rejects the save', async () => {
    server.use(
      http.put('*/projects/:id/owner-edit', () =>
        HttpResponse.json({ messageEn: 'Project can no longer be edited.' }, { status: 409 }),
      ),
    );
    const err = await updateProject(7, form).catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect((err as ApiError).status).toBe(409);
  });
});

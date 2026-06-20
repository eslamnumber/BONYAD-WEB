import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { ApiError } from '@/lib/api-client';
import { server } from '@/testing/handlers/server';

import { submitNewProject } from './submit-new-project';

const PROJECT = {
  serviceCategoryId: 2,
  title: 'مشروع',
  description: 'وصف',
  timelineWeeks: '4',
  budget: '',
  noBudget: true,
  deliverables: '',
  assignmentType: 'ALL' as const,
  assignedTechnicianId: null,
};

const PHASES = [
  { name: 'الأساسات', durationWeeks: '2', amount: '5000', description: 'حفر' },
  { name: 'التشطيب', durationWeeks: '1', amount: '', description: 'دهان' },
];

function mockCreate(id: number) {
  server.use(http.post('*/projects/create', () => HttpResponse.json({ id })));
}

function capturePhases() {
  const bodies: Record<string, unknown>[] = [];
  server.use(
    http.post('*/phases', async ({ request }) => {
      bodies.push((await request.json()) as Record<string, unknown>);
      return HttpResponse.json({ id: bodies.length });
    }),
  );
  return bodies;
}

describe('submitNewProject', () => {
  it('creates the project then posts its phases against the new id', async () => {
    mockCreate(321);
    const bodies = capturePhases();
    const id = await submitNewProject({ project: PROJECT, phases: PHASES });
    expect(id).toBe(321);
    expect(bodies).toHaveLength(2);
    expect(bodies.every((b) => b.projectId === 321)).toBe(true);
  });

  it('forwards uploaded photos to the create request as `images`', async () => {
    const ref: { fd?: FormData } = {};
    server.use(
      http.post('*/projects/create', async ({ request }) => {
        ref.fd = await request.formData();
        return HttpResponse.json({ id: 700 });
      }),
    );
    capturePhases();
    const file = new File(['x'], 'photo.jpg', { type: 'image/jpeg' });
    const id = await submitNewProject({ project: PROJECT, phases: [], photos: [file] });
    expect(id).toBe(700);
    expect((ref.fd ?? new FormData()).getAll('images')).toHaveLength(1);
  });

  it('skips the phases POST when there are no phases', async () => {
    mockCreate(322);
    const bodies = capturePhases();
    const id = await submitNewProject({ project: PROJECT, phases: [] });
    expect(id).toBe(322);
    expect(bodies).toHaveLength(0);
  });

  it('propagates a create failure and never posts phases', async () => {
    server.use(
      http.post('*/projects/create', () =>
        HttpResponse.json({ messageEn: 'no', errorCode: 'X' }, { status: 400 }),
      ),
    );
    const bodies = capturePhases();
    const err = await submitNewProject({ project: PROJECT, phases: PHASES }).catch(
      (e: unknown) => e,
    );
    expect(err).toBeInstanceOf(ApiError);
    expect(bodies).toHaveLength(0);
  });
});

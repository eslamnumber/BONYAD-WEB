import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { ApiError } from '@/lib/api-client';
import { server } from '@/testing/handlers/server';

import { createProject } from './create-project';

const BASE_INPUT = {
  serviceCategoryId: 2,
  title: 'فيلا سكنية',
  description: 'وصف تفصيلي للمشروع',
  timelineWeeks: '8',
  budget: '180,000',
  noBudget: false,
  deliverables: 'تسليم نهائي',
  assignmentType: 'ALL' as const,
  assignedTechnicianId: null,
};

/** Capture the multipart body the fetcher sends. */
function captureCreate() {
  const ref: { fd?: FormData } = {};
  server.use(
    http.post('*/projects/create', async ({ request }) => {
      ref.fd = await request.formData();
      return HttpResponse.json({ id: 555 });
    }),
  );
  return ref;
}

/** FormData → plain record so assertions avoid per-field optional chaining. */
function bodyOf(ref: { fd?: FormData }): Record<string, string> {
  return Object.fromEntries((ref.fd ?? new FormData()).entries()) as Record<string, string>;
}

describe('createProject', () => {
  it('posts the bidding ("ALL") FormData and returns the created project', async () => {
    const ref = captureCreate();
    const res = await createProject(BASE_INPUT);
    expect(res).toEqual({ id: 555 });
    expect(bodyOf(ref)).toMatchObject({
      title: 'فيلا سكنية',
      description: 'وصف تفصيلي للمشروع',
      serviceCategoryId: '2',
      budget: '180000',
      budgetUnspecified: 'false',
      timeline: '8 weeks',
      timeRequired: '56',
      deliverables: 'تسليم نهائي',
      projectType: 'ALL',
    });
    expect(bodyOf(ref).assignedTechnicianId).toBeUndefined();
  });

  it('marks the budget unspecified when "no budget" is checked', async () => {
    const ref = captureCreate();
    await createProject({ ...BASE_INPUT, noBudget: true });
    const body = bodyOf(ref);
    expect(body.budgetUnspecified).toBe('true');
    expect(body.budget).toBeUndefined();
  });

  it('defaults timeRequired to one week when no timeline is given', async () => {
    const ref = captureCreate();
    await createProject({ ...BASE_INPUT, timelineWeeks: '' });
    const body = bodyOf(ref);
    expect(body.timeRequired).toBe('7');
    expect(body.timeline).toBeUndefined();
  });

  it('appends the technician + assignmentType on direct assignment', async () => {
    const ref = captureCreate();
    await createProject({
      ...BASE_INPUT,
      assignmentType: 'DIRECT_ASSIGNMENT',
      assignedTechnicianId: 9,
    });
    expect(bodyOf(ref)).toMatchObject({
      projectType: 'DIRECT_ASSIGNMENT',
      assignedTechnicianId: '9',
      assignmentType: 'DIRECT_ASSIGNMENT',
    });
  });

  it('appends uploaded photos as repeated `images` parts', async () => {
    const ref = captureCreate();
    const a = new File(['a'], 'plan.jpg', { type: 'image/jpeg' });
    const b = new File(['b'], 'site.png', { type: 'image/png' });
    await createProject(BASE_INPUT, [a, b]);
    const images = (ref.fd ?? new FormData()).getAll('images');
    expect(images).toHaveLength(2);
    expect((images[0] as File).name).toBe('plan.jpg');
    expect((images[1] as File).name).toBe('site.png');
  });

  it('appends no `images` part when no photos are provided', async () => {
    const ref = captureCreate();
    await createProject(BASE_INPUT);
    expect((ref.fd ?? new FormData()).getAll('images')).toHaveLength(0);
  });

  it('rejects (no network) when the input is invalid — empty title', async () => {
    await expect(createProject({ ...BASE_INPUT, title: '   ' })).rejects.toThrow();
  });

  it('rejects direct assignment without a chosen technician', async () => {
    await expect(
      createProject({
        ...BASE_INPUT,
        assignmentType: 'DIRECT_ASSIGNMENT',
        assignedTechnicianId: null,
      }),
    ).rejects.toThrow();
  });

  it('throws ApiError with localized messages on 400', async () => {
    server.use(
      http.post('*/projects/create', () =>
        HttpResponse.json(
          { messageEn: 'Invalid project.', messageAr: 'مشروع غير صالح.', errorCode: 'VALIDATION' },
          { status: 400 },
        ),
      ),
    );
    const err = await createProject(BASE_INPUT).catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect((err as ApiError).status).toBe(400);
    expect((err as ApiError).localizedMessage('ar')).toBe('مشروع غير صالح.');
  });
});

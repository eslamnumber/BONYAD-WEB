import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { ApiError } from '@/lib/api-client';
import { server } from '@/testing/handlers/server';

import { getProject } from './get-project';

const SAMPLE_DETAIL = {
  id: 42,
  userName: 'أحمد الزهراني',
  serviceNameEn: 'Building renovation',
  serviceNameAr: 'تجديد المباني',
  description: 'تحديث واجهة المبنى الإداري',
  projectType: 'تجديد المباني',
  budget: 80000,
  budgetMin: 50000,
  budgetMax: 80000,
  address: 'الرياض، المملكة العربية السعودية',
  status: 'PENDING',
  assignedTechnicianId: null,
  files: ['projects/42/plan.pdf'],
  timeRequiredDays: 12,
  expectedStartDate: '2026-08-01T00:00:00Z',
  offersCount: 7,
  bidsCloseAt: '2026-06-20T00:00:00Z',
  createdAt: '2026-06-04T10:00:00Z',
  requirements: ['خرسانة', 'تشطيبات'],
};

describe('getProject', () => {
  it('fetches /projects/:id and returns the parsed detail', async () => {
    let capturedUrl = '';
    server.use(
      http.get('*/projects/:id', ({ request }) => {
        capturedUrl = request.url;
        return HttpResponse.json(SAMPLE_DETAIL);
      }),
    );
    const project = await getProject(42);
    expect(new URL(capturedUrl).pathname).toMatch(/\/projects\/42$/);
    expect(project).toEqual(SAMPLE_DETAIL);
  });

  it('throws ApiError with status / localized messages on 404', async () => {
    server.use(
      http.get('*/projects/:id', () =>
        HttpResponse.json(
          {
            messageEn: 'Project not found.',
            messageAr: 'المشروع غير موجود.',
            errorCode: 'NOT_FOUND',
          },
          { status: 404 },
        ),
      ),
    );
    const err = await getProject(999).catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect((err as ApiError).status).toBe(404);
    expect((err as ApiError).errorCode).toBe('NOT_FOUND');
    expect((err as ApiError).localizedMessage('en')).toBe('Project not found.');
    expect((err as ApiError).localizedMessage('ar')).toBe('المشروع غير موجود.');
  });

  it('unwraps the { project } envelope and flattens nested user / service', async () => {
    server.use(
      http.get('*/projects/:id', () =>
        HttpResponse.json({
          project: {
            id: 184,
            title: null,
            description: 'eslam',
            budget: 20000,
            address: 'الرياض',
            timeRequiredDays: 90,
            projectType: 'ALL',
            user: { name: 'أحمد الزهراني', profileImage: null },
            service: { nameEn: 'Construction', nameAr: 'البناء والتشطيب' },
            assignedTechnician: { id: 444, name: 'م. أحمد القحطاني' },
          },
          phases: [],
          regionId: null,
        }),
      ),
    );
    const project = await getProject(184);
    expect(project.userName).toBe('أحمد الزهراني');
    expect(project.serviceNameEn).toBe('Construction');
    expect(project.serviceNameAr).toBe('البناء والتشطيب');
    expect(project.budget).toBe(20000);
    expect(project.address).toBe('الرياض');
    // The detail endpoint nests the technician — flattened for the provider card.
    expect(project.assignedTechnicianId).toBe(444);
  });
});

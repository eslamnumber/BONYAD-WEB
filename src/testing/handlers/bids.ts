import { http, HttpResponse } from 'msw';

const BASE = 'https://bonyad-app-nyayeditqq-ww.a.run.app/api';

export const bidHandlers = [
  http.post(`${BASE}/bids/create`, async ({ request }) => {
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    return HttpResponse.json({ id: 1, status: 'PENDING', ...body }, { status: 201 });
  }),
  http.get(`${BASE}/bids/project/:projectId`, ({ params }) =>
    HttpResponse.json([
      {
        id: 1,
        projectId: Number(params.projectId),
        proposedBudget: 100000,
        estimatedDurationDays: 20,
        status: 'PENDING',
        createdAt: '2026-06-01T00:00:00Z',
      },
      {
        id: 2,
        projectId: Number(params.projectId),
        technicianName: 'فني معتمد',
        proposedBudget: 250000,
        estimatedDurationDays: 30,
        status: 'ACCEPTED',
        createdAt: '2026-06-05T00:00:00Z',
      },
    ]),
  ),
  http.delete(`${BASE}/bids/:id`, () => new HttpResponse(null, { status: 204 })),
];

import { http, HttpResponse } from 'msw';

/**
 * Change-request negotiation handlers. Defaults model a project with one active
 * PENDING request plus a COMPLETED history record (shapes mirror dev records
 * 12/13). Tests override per case via `server.use(...)`. Wildcard-prefixed path
 * matchers so the same-origin proxy calls made in happy-dom also match.
 */
const PENDING_REQUEST = {
  id: 101,
  status: 'PENDING',
  description: 'Please add a waterproofing phase before tiling.',
  newBudget: 1500,
  requestedBy: 'ahmed farahat user',
  requestedAt: '2026-06-18T09:00:00Z',
  parentRequestId: null,
  userAgreed: false,
  technicianAgreed: false,
  bothAgreed: false,
  phaseChanges: [
    {
      actionType: 'CREATE',
      phaseId: null,
      phaseNumber: 7,
      description: 'Waterproofing',
      timeSpentDays: 5,
      moneySpent: 1500,
    },
  ],
};

const COMPLETED_REQUEST = {
  id: 13,
  status: 'COMPLETED',
  description: 'Add three finishing phases.',
  newBudget: 300,
  requestedBy: { id: 9, name: 'ahmed farahat user' },
  requestedAt: '2026-06-07T19:14:46Z',
  parentRequestId: null,
  userAgreed: true,
  technicianAgreed: true,
  bothAgreed: true,
  agreedChanges: 'Agreed Changes Summary: …',
  documentUrl: 'https://files.test/cr-13.pdf',
  phaseChanges: [
    {
      actionType: 'CREATE',
      phaseId: null,
      phaseNumber: 7,
      description: 'Phase 7',
      timeSpentDays: 30,
      moneySpent: 300,
    },
  ],
};

export const changeRequestHandlers = [
  http.get('*/change-requests/project/:projectId/active', () =>
    HttpResponse.json([PENDING_REQUEST]),
  ),
  http.get('*/change-requests/project/:projectId', () =>
    HttpResponse.json([PENDING_REQUEST, COMPLETED_REQUEST]),
  ),
  http.get('*/change-requests/:id/thread', ({ params }) =>
    HttpResponse.json([{ ...PENDING_REQUEST, id: Number(params.id) }]),
  ),
  http.post('*/change-requests/project/:projectId/request', async ({ request }) => {
    const body = (await request.json().catch(() => ({}))) as { description?: string };
    return HttpResponse.json(
      {
        message: 'Change request created',
        changeRequestId: 102,
        status: 'PENDING',
        requestedBy: 'ahmed farahat user',
        requestedAt: '2026-06-18T10:00:00Z',
        description: body.description,
      },
      { status: 201 },
    );
  }),
  http.post('*/change-requests/:id/respond', ({ params }) =>
    HttpResponse.json({
      message: 'Response recorded',
      changeRequestId: Number(params.id),
      status: 'RESPONDED',
      respondedBy: 'ahmed farahat tech',
      respondedAt: '2026-06-18T11:00:00Z',
    }),
  ),
  http.post('*/change-requests/:id/agree', () =>
    HttpResponse.json({
      message: 'Agreement recorded',
      userAgreed: true,
      technicianAgreed: false,
      bothAgreed: false,
      userAgreedAt: '2026-06-18T12:00:00Z',
    }),
  ),
  http.post('*/change-requests/:id/reject', ({ params }) =>
    HttpResponse.json({
      message: 'Change request rejected',
      changeRequestId: Number(params.id),
      status: 'REJECTED',
    }),
  ),
];

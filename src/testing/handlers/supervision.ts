import { http, HttpResponse } from 'msw';

/**
 * Default MSW handlers for the project-supervision endpoints. They use leading-star
 * wildcard paths so they match BOTH server-side fetcher tests (absolute backend URL)
 * and same-origin proxy component tests in happy-dom (see project memory: MSW default
 * handlers need a wildcard path). Registered BEFORE the projects handlers in
 * `index.ts` so the literal `supervising` route wins over the catch-all `:id` route.
 */

const INVITED_PROJECT = {
  id: 213,
  description: 'مشروع تحت الإشراف',
  budget: 30000,
  status: 'PENDING',
  address: 'الرياض، حي الصحافة',
  serviceNameEn: 'Multi-party Project Management',
  serviceNameAr: 'إدارة مشروع متعدد الأطراف',
  userId: 450,
  userName: 'فرحات',
  supervisorId: 444,
  supervisorName: 'ahmed farahat tech',
  supervisorStatus: 'INVITED',
  hasActiveSupervisor: false,
  canHireSupervisor: false,
  timeRequiredDays: 4,
  phases: [],
};

const ACTIVE_PROJECT = {
  ...INVITED_PROJECT,
  supervisorStatus: 'ACTIVE',
  hasActiveSupervisor: true,
};

const SUPERVISOR_STATE = {
  projectId: 213,
  projectTitle: null,
  supervisorId: 444,
  supervisorName: 'ahmed farahat tech',
  supervisorPhone: '539909791',
  status: 'ACTIVE',
  assignedAt: '2026-06-17T15:38:02Z',
  respondedAt: '2026-06-22T13:59:56Z',
  active: true,
};

const HIREABLE = [
  {
    id: 444,
    name: 'ahmed farahat tech',
    phoneNumber: '539909791',
    profileImage: null,
    companyName: null,
  },
  {
    id: 452,
    name: 'Test Techn Ios',
    phoneNumber: '539909793',
    profileImage: null,
    companyName: 'Bonyad Co.',
  },
];

export const supervisionHandlers = [
  http.get('*/projects/hireable-technicians', () => HttpResponse.json(HIREABLE)),
  http.get('*/projects/supervising', ({ request }) => {
    const status = new URL(request.url).searchParams.get('status');
    return HttpResponse.json(status === 'active' ? [ACTIVE_PROJECT] : [INVITED_PROJECT]);
  }),
  http.get('*/projects/:id/supervisor/activity', () => HttpResponse.json([])),
  http.get('*/projects/:id/supervisor', ({ params }) =>
    HttpResponse.json({ ...SUPERVISOR_STATE, projectId: Number(params.id) }),
  ),
  http.post('*/projects/:id/supervisor/respond', async ({ request, params }) => {
    const body = (await request.json().catch(() => ({}))) as { accept?: boolean };
    return HttpResponse.json({
      ...SUPERVISOR_STATE,
      projectId: Number(params.id),
      status: body.accept ? 'ACTIVE' : 'DECLINED',
      active: Boolean(body.accept),
    });
  }),
  http.post('*/projects/:id/supervisor', async ({ request, params }) => {
    const body = (await request.json().catch(() => ({}))) as { technicianId?: number };
    return HttpResponse.json({
      ...SUPERVISOR_STATE,
      projectId: Number(params.id),
      supervisorId: body.technicianId ?? 444,
      status: 'INVITED',
      respondedAt: null,
      active: false,
    });
  }),
  http.delete('*/projects/:id/supervisor', ({ params }) =>
    HttpResponse.json({
      ...SUPERVISOR_STATE,
      projectId: Number(params.id),
      supervisorId: null,
      supervisorName: null,
      supervisorPhone: null,
      status: 'REMOVED',
      active: false,
    }),
  ),
  http.post('*/bids/:id/reject', () => HttpResponse.json({ status: 'REJECTED' })),
];

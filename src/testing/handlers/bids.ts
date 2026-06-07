import { http, HttpResponse } from 'msw';

const BASE = 'https://bonyad-app-nyayeditqq-ww.a.run.app/api';

export const bidHandlers = [
  http.post(`${BASE}/bids/create`, async ({ request }) => {
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    return HttpResponse.json({ id: 1, status: 'PENDING', ...body }, { status: 201 });
  }),
];

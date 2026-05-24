import { http, HttpResponse } from 'msw';

const BASE = 'https://bonyad-app-nyayeditqq-ww.a.run.app/api';

export const contactHandlers = [
  http.post(`${BASE}/contact`, async () =>
    HttpResponse.json({
      success: true,
      ticketNumber: 'TCK-DEFAULT',
      message: 'Received',
      createdAt: '2026-01-01T00:00:00Z',
    }),
  ),
];

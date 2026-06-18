import { http, HttpResponse } from 'msw';

/** A sample feedback record the list returns by default (wrapped envelope shape). */
const SAMPLE_FEEDBACK = {
  id: 1,
  category: 'SUGGESTION',
  subject: 'Dark mode please',
  message: 'Please add a dark theme to the app.',
  attachments: null,
  status: 'REVIEWED',
  createdAt: '2026-06-18T13:08:45.000',
  adminNote: 'Thanks — this is on our roadmap.',
  reviewedAt: '2026-06-18T15:00:00.000',
};

/**
 * In-app feedback handlers (`/app-feedback`). Defaults model a happy path: one reviewed
 * submission in the list and a create that echoes the posted body as the new record.
 * Individual tests override per case via `server.use(...)`.
 */
export const feedbackHandlers = [
  http.get('*/app-feedback/mine', () =>
    HttpResponse.json({ success: true, count: 1, feedback: [SAMPLE_FEEDBACK] }),
  ),
  http.post('*/app-feedback', async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json({
      id: 99,
      ...body,
      status: 'NEW',
      createdAt: '2026-06-18T13:10:00.000',
    });
  }),
];

import { http, HttpResponse } from 'msw';

const BASE = 'https://bonyad-app-nyayeditqq-ww.a.run.app/api';

const SAMPLE_BLOG = {
  id: 1,
  title: 'The complete guide to construction permits in Saudi Arabia',
  summary: 'Everything you need to know about permits and approvals.',
  content: 'Long content body…',
  images: ['https://placehold.co/1280x534'],
  tags: ['Legal'],
  publishedAt: '2025-09-01T10:00:00Z',
  author: { id: 1, name: 'Aziz' },
};

export const blogHandlers = [
  http.get(`${BASE}/blogs`, () =>
    HttpResponse.json({
      content: [SAMPLE_BLOG],
      totalElements: 1,
      totalPages: 1,
      currentPage: 0,
      size: 10,
    }),
  ),
  http.get(`${BASE}/blogs/:id`, ({ params }) => {
    if (params.id !== '1') return HttpResponse.json({}, { status: 404 });
    return HttpResponse.json(SAMPLE_BLOG);
  }),
];

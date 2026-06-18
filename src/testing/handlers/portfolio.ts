import { http, HttpResponse } from 'msw';

/** A past project the gallery renders by default. */
const SAMPLE_PROJECT = {
  id: 11,
  title: 'Villa finishing — Al Narjis',
  description: 'Full interior finishing for a two-storey villa.',
  startDate: '2025-01-10',
  endDate: '2025-04-20',
  photos: ['https://cdn.test/p1.jpg', 'https://cdn.test/p2.jpg'],
  clientName: 'Mr. Khalid',
  projectValue: 180000,
  location: 'Riyadh',
  isPublic: true,
};

/** A portfolio with business info + specialties the management screen renders. */
const SAMPLE_PORTFOLIO = {
  id: 3,
  userId: 42,
  businessName: 'Burj Finishing Co.',
  tagline: 'Finishing done right',
  bio: 'Ten years of turnkey villa and apartment finishing across Riyadh.',
  yearsActive: 10,
  city: 'Riyadh',
  specialties: ['Finishing', 'Interior design'],
  published: true,
  userName: 'Sara Ahmed',
  projectsCount: 1,
  pastProjects: [SAMPLE_PROJECT],
};

/**
 * Portfolio handlers (`/portfolios/*`). Defaults model a technician who already has a
 * portfolio with one project. Tests override per case via `server.use(...)` —
 * e.g. a 404 on `/portfolios/my` for the "no portfolio yet" branch.
 */
export const portfolioHandlers = [
  http.get('*/portfolios/me', () => HttpResponse.json(SAMPLE_PORTFOLIO)),
  http.get('*/portfolios/my', () => HttpResponse.json(SAMPLE_PORTFOLIO)),
  http.get('*/portfolios/projects/my', () => HttpResponse.json([SAMPLE_PROJECT])),
  http.post('*/portfolios/create', () => HttpResponse.json({ ...SAMPLE_PORTFOLIO, id: 4 })),
  http.patch('*/portfolios/me', () => HttpResponse.json({ success: true })),
  http.post('*/portfolios/projects/add', () =>
    HttpResponse.json({ ...SAMPLE_PROJECT, id: 12, title: 'New project' }),
  ),
  http.put('*/portfolios/projects/:id', ({ params }) =>
    HttpResponse.json({ ...SAMPLE_PROJECT, id: Number(params.id) }),
  ),
  http.delete('*/portfolios/projects/:id', () => HttpResponse.json({ message: 'deleted' })),
  http.post('*/portfolios/projects/upload-photo', () =>
    HttpResponse.json({ photoUrl: 'https://cdn.test/uploaded.jpg' }),
  ),
];

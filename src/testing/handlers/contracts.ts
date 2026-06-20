import { http, HttpResponse } from 'msw';

const BASE = 'https://bonyad-app-nyayeditqq-ww.a.run.app/api';

/**
 * Contract record for the customer's CONTRACT_SIGNING screen. `createdAt` drives
 * the "sent N ago" line; the e-sign email is sent to each party's registered
 * address. Shape mirrors RN `ContractRecord` (ContractService.ts).
 */
const SAMPLE_CONTRACT = {
  id: 501,
  projectId: 102,
  technicianId: 9,
  language: 'AR',
  documentUrl: 'https://placehold.co/contract.pdf',
  status: 'PENDING_SIGNATURE',
  createdAt: '2026-06-16T08:57:00Z',
};

export const contractHandlers = [
  http.get(`${BASE}/contracts/project/:projectId`, ({ params }) =>
    HttpResponse.json({ ...SAMPLE_CONTRACT, projectId: Number(params.projectId) }),
  ),
  http.post(`${BASE}/signatures`, () => HttpResponse.json({ id: 1 }, { status: 201 })),
  // Contract-PDF generation (the Download button). Wildcard so it also matches the
  // same-origin `/api/proxy/*` URL that component tests hit in happy-dom.
  http.post('*/contracts/test/generate-pdf', () =>
    HttpResponse.json({ downloadUrl: 'https://placehold.co/contract.pdf' }),
  ),
];

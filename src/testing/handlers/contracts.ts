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
  // Wildcard host so it also matches the same-origin `/api/proxy/*` URL component
  // tests hit in happy-dom (not just the full-BASE server-side call).
  http.get('*/contracts/project/:projectId', ({ params }) =>
    HttpResponse.json({ ...SAMPLE_CONTRACT, projectId: Number(params.projectId) }),
  ),
  http.post(`${BASE}/signatures`, () => HttpResponse.json({ id: 1 }, { status: 201 })),
  // Contract-PDF generation (the Download button). Wildcard so it also matches the
  // same-origin `/api/proxy/*` URL that component tests hit in happy-dom.
  http.post('*/contracts/test/generate-pdf', () =>
    HttpResponse.json({ downloadUrl: 'https://placehold.co/contract.pdf' }),
  ),
  // GET /contracts/my — the dashboard Contracts panel (both roles). Wildcard host
  // so it matches the same-origin `/api/proxy/*` URL component tests hit.
  http.get('*/contracts/my', () =>
    HttpResponse.json({
      userName: 'ahmed farahat user',
      userId: 443,
      totalContracts: 1,
      contracts: [
        {
          id: 12,
          contractType: 'FIRST_CONTRACT',
          signedAt: '2026-06-21T02:23:51Z',
          signedDocumentUrl: 'https://placehold.co/contract.pdf',
          project: { id: 222, description: 'بناء عظم فاخر — تشطيبات داخلية' },
          technician: { id: 444, name: 'ahmed farahat tech' },
        },
      ],
    }),
  ),
];

import { http, HttpResponse } from 'msw';
import { NextRequest } from 'next/server';
import { describe, expect, it } from 'vitest';

import { server } from '@/testing/handlers/server';

import { GET } from './route';

const PDF_BYTES = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d]); // "%PDF-"
const PDF_URL = 'https://cdn.example.com/c/102.pdf';

function req(search: string, token: string | undefined = 'tok') {
  const r = new NextRequest(`http://localhost/api/contract-pdf${search}`);
  if (token) r.cookies.set('bonyad-token', token);
  return r;
}

describe('contract-pdf route', () => {
  it('generates the PDF with the Bearer token and streams it as same-origin application/pdf', async () => {
    let body: URLSearchParams | undefined;
    let auth: string | null = null;
    server.use(
      http.post('*/contracts/test/generate-pdf', async ({ request }) => {
        auth = request.headers.get('authorization');
        body = new URLSearchParams(await request.text());
        return HttpResponse.json({ downloadUrl: PDF_URL });
      }),
      http.get(PDF_URL, () =>
        HttpResponse.arrayBuffer(PDF_BYTES.buffer as ArrayBuffer, {
          headers: { 'content-type': 'application/pdf' },
        }),
      ),
    );

    const res = await GET(req('?projectId=102&technicianId=9&language=EN'));

    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toBe('application/pdf');
    expect(res.headers.get('content-disposition')).toContain('inline');
    // Must allow same-origin framing (the dashboard CSP blocks cross-origin frames).
    expect(res.headers.get('content-security-policy')).toContain("frame-ancestors 'self'");
    expect(new Uint8Array(await res.arrayBuffer())).toEqual(PDF_BYTES);

    expect(auth).toBe('Bearer tok');
    expect(body?.get('projectId')).toBe('102');
    expect(body?.get('technicianId')).toBe('9');
    expect(body?.get('language')).toBe('EN');
    expect(body?.get('returnPdf')).toBe('false');
  });

  it('rejects a request missing the technician id with 400', async () => {
    const res = await GET(req('?projectId=102'));
    expect(res.status).toBe(400);
  });

  it('returns 502 when the backend produces no PDF URL', async () => {
    server.use(http.post('*/contracts/test/generate-pdf', () => HttpResponse.json({})));
    const res = await GET(req('?projectId=102&technicianId=9'));
    expect(res.status).toBe(502);
  });

  it('surfaces the backend status when generation fails', async () => {
    server.use(
      http.post('*/contracts/test/generate-pdf', () =>
        HttpResponse.json({ messageEn: 'Not in signing stage' }, { status: 409 }),
      ),
    );
    const res = await GET(req('?projectId=102&technicianId=9'));
    expect(res.status).toBe(409);
  });
});

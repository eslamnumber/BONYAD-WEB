import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { env } from '@/config/env';
import { ApiError } from '@/lib/api-client';
import { server } from '@/testing/handlers/server';

import { generateContractPdf } from './generate-contract-pdf';

const INPUT = { projectId: 102, technicianId: 9, language: 'AR' as const };

describe('generateContractPdf', () => {
  it('POSTs /contracts/test/generate-pdf urlencoded (returnPdf=false) and returns an absolute downloadUrl', async () => {
    let contentType: string | null = null;
    let body: URLSearchParams | undefined;
    server.use(
      http.post('*/contracts/test/generate-pdf', async ({ request }) => {
        contentType = request.headers.get('content-type');
        body = new URLSearchParams(await request.text());
        return HttpResponse.json({ downloadUrl: 'https://cdn.example.com/c/102.pdf' });
      }),
    );

    const url = await generateContractPdf(INPUT);

    expect(contentType).toContain('application/x-www-form-urlencoded');
    expect(body?.get('projectId')).toBe('102');
    expect(body?.get('technicianId')).toBe('9');
    expect(body?.get('language')).toBe('AR');
    expect(body?.get('returnPdf')).toBe('false');
    expect(url).toBe('https://cdn.example.com/c/102.pdf');
  });

  it('resolves a relative URL against the public site origin (RN prefix behaviour)', async () => {
    server.use(
      http.post('*/contracts/test/generate-pdf', () =>
        HttpResponse.json({ pdfUrl: '/files/contract-102.pdf' }),
      ),
    );
    const url = await generateContractPdf(INPUT);
    expect(url).toBe(new URL('/files/contract-102.pdf', env.NEXT_PUBLIC_SITE_URL).toString());
  });

  it('returns null when the response carries no URL field', async () => {
    server.use(http.post('*/contracts/test/generate-pdf', () => HttpResponse.json({ ok: true })));
    expect(await generateContractPdf(INPUT)).toBeNull();
  });

  it('throws ApiError on a 4xx (e.g. project not in signing stage)', async () => {
    server.use(
      http.post('*/contracts/test/generate-pdf', () =>
        HttpResponse.json({ messageEn: 'Project not in signing stage.' }, { status: 409 }),
      ),
    );
    const err = await generateContractPdf(INPUT).catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect((err as ApiError).status).toBe(409);
  });
});

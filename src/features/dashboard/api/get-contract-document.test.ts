import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { env } from '@/config/env';
import { ApiError } from '@/lib/api-client';
import { server } from '@/testing/handlers/server';

import { resolveContractDocumentUrl } from './get-contract-document';

const INPUT = { projectId: 42, technicianId: 9, language: 'AR' as const };

const contractGet = (body: Record<string, unknown> | null, status = 200) =>
  http.get('*/contracts/project/:projectId', () =>
    status === 200 ? HttpResponse.json(body) : new HttpResponse(null, { status }),
  );

describe('resolveContractDocumentUrl', () => {
  it('returns the existing contract documentUrl (no generation) when the project has one', async () => {
    let generated = false;
    server.use(
      contractGet({ id: 1, documentUrl: 'https://cdn.example.com/c/42.pdf' }),
      http.post('*/contracts/test/generate-pdf', () => {
        generated = true;
        return HttpResponse.json({ downloadUrl: 'https://cdn.example.com/generated.pdf' });
      }),
    );

    const url = await resolveContractDocumentUrl(INPUT);

    expect(url).toBe('https://cdn.example.com/c/42.pdf');
    expect(generated).toBe(false);
  });

  it('prefers originalDocumentUrl over the other contract URL fields (iOS priority)', async () => {
    server.use(
      contractGet({
        id: 1,
        documentUrl: 'https://cdn.example.com/legacy.pdf',
        contractPdfUrl: 'https://cdn.example.com/pdf.pdf',
        originalDocumentUrl: 'https://cdn.example.com/original.pdf',
      }),
    );

    expect(await resolveContractDocumentUrl(INPUT)).toBe('https://cdn.example.com/original.pdf');
  });

  it('reads the URL from a { contracts: [...] } envelope', async () => {
    server.use(
      contractGet({
        totalContracts: 1,
        contracts: [{ id: 7, contractPdfUrl: 'https://cdn.example.com/from-list.pdf' }],
      }),
    );

    expect(await resolveContractDocumentUrl(INPUT)).toBe('https://cdn.example.com/from-list.pdf');
  });

  it('reads the envelope-level projectContractPdfUrl when there is no per-contract URL', async () => {
    server.use(contractGet({ contracts: [], projectContractPdfUrl: '/files/project-42.pdf' }));

    expect(await resolveContractDocumentUrl(INPUT)).toBe(
      new URL('/files/project-42.pdf', env.NEXT_PUBLIC_SITE_URL).toString(),
    );
  });

  it('falls back to generating the PDF when no contract exists yet (404)', async () => {
    server.use(
      contractGet(null, 404),
      http.post('*/contracts/test/generate-pdf', () =>
        HttpResponse.json({ downloadUrl: 'https://cdn.example.com/generated.pdf' }),
      ),
    );

    expect(await resolveContractDocumentUrl(INPUT)).toBe('https://cdn.example.com/generated.pdf');
  });

  it('returns null without generating when no contract exists and no technicianId is known', async () => {
    let generated = false;
    server.use(
      contractGet(null, 404),
      http.post('*/contracts/test/generate-pdf', () => {
        generated = true;
        return HttpResponse.json({ downloadUrl: 'https://cdn.example.com/generated.pdf' });
      }),
    );

    const url = await resolveContractDocumentUrl({
      projectId: 42,
      technicianId: null,
      language: 'EN',
    });

    expect(url).toBeNull();
    expect(generated).toBe(false);
  });

  it('propagates the backend error when generation fails (so the UI can surface it)', async () => {
    server.use(
      contractGet(null, 404),
      http.post('*/contracts/test/generate-pdf', () =>
        HttpResponse.json({ messageEn: 'Contract not in signing stage' }, { status: 400 }),
      ),
    );

    await expect(resolveContractDocumentUrl(INPUT)).rejects.toBeInstanceOf(ApiError);
  });
});

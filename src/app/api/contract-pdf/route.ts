import { type NextRequest } from 'next/server';

import { API_ENV_COOKIE_NAME, AUTH_COOKIE_NAME } from '@/config/constants';
import { API_ENDPOINTS } from '@/config/endpoints';
import { ApiError, apiClient } from '@/lib/api-client';
import { resolveBackendBaseUrl } from '@/lib/backend';
import { resolvePdfUrl } from '@/lib/contract-pdf';

/**
 * Same-origin contract-PDF stream. The CONTRACT_SIGNING screen embeds the contract in
 * an `<iframe>`, but the dashboard CSP only allows framing `'self'` (and the backend /
 * CDN PDF host varies per environment and may set X-Frame-Options). So this route
 * generates the PDF via {@link API_ENDPOINTS.CONTRACTS.GENERATE_PDF} with the httpOnly
 * session token attached server-side (mirrors `/api/proxy`), fetches the resulting URL,
 * and streams the bytes back as a same-origin `application/pdf` response the iframe can
 * render. Used by `ContractPdfViewer`.
 *
 * Excluded from the middleware matcher so the global `frame-ancestors 'none'` CSP does
 * not land here — this response sets its own tight `frame-ancestors 'self'`.
 */

type PdfParams = { projectId: number; technicianId: number; language: 'EN' | 'AR' };

export async function GET(req: NextRequest): Promise<Response> {
  const params = readParams(req.nextUrl.searchParams);
  if (!params) return new Response('Invalid contract parameters', { status: 400 });

  const token = req.cookies.get(AUTH_COOKIE_NAME)?.value;
  const baseUrl = resolveBackendBaseUrl(req.cookies.get(API_ENV_COOKIE_NAME)?.value);

  try {
    const url = await generatePdfUrl(params, token, baseUrl);
    if (!url) return new Response('Contract PDF is not available yet', { status: 502 });
    const upstream = await apiClient.getRaw(url);
    if (!upstream.body) return new Response('Failed to load the contract PDF', { status: 502 });
    return streamPdf(upstream, params.projectId);
  } catch (err) {
    if (err instanceof ApiError) {
      return new Response('Could not generate the contract PDF', { status: err.status });
    }
    throw err;
  }
}

/** Validate + coerce the query params; null when projectId / technicianId are missing. */
function readParams(search: URLSearchParams): PdfParams | null {
  const projectId = Number(search.get('projectId'));
  const technicianId = Number(search.get('technicianId'));
  if (!isPositiveInt(projectId) || !isPositiveInt(technicianId)) return null;
  return { projectId, technicianId, language: search.get('language') === 'AR' ? 'AR' : 'EN' };
}

function isPositiveInt(value: number): boolean {
  return Number.isInteger(value) && value > 0;
}

/** POST the form-urlencoded body to CONTRACTS.GENERATE_PDF and resolve the PDF URL. */
async function generatePdfUrl(
  { projectId, technicianId, language }: PdfParams,
  token: string | undefined,
  baseUrl: string,
): Promise<string | null> {
  const form = new URLSearchParams();
  form.set('projectId', String(projectId));
  form.set('technicianId', String(technicianId));
  form.set('language', language);
  form.set('returnPdf', 'false');
  const data = await apiClient.post<unknown>(API_ENDPOINTS.CONTRACTS.GENERATE_PDF, {
    token,
    baseUrl,
    body: form,
  });
  return resolvePdfUrl(data);
}

/** Wrap the upstream PDF stream with headers that allow same-origin framing only. */
function streamPdf(upstream: Response, projectId: number): Response {
  const headers = new Headers({
    'Content-Type': 'application/pdf',
    'Content-Disposition': `inline; filename="contract-${projectId}.pdf"`,
    // Tight CSP: this document may be framed by our own origin and nothing else.
    'Content-Security-Policy': "default-src 'none'; frame-ancestors 'self'",
    'X-Content-Type-Options': 'nosniff',
    // Auth-gated, per-user document — keep it out of shared / proxy caches.
    'Cache-Control': 'private, no-store',
  });
  const length = upstream.headers.get('content-length');
  if (length) headers.set('Content-Length', length);
  return new Response(upstream.body, { status: 200, headers });
}

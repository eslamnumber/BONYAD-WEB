import { useQuery } from '@tanstack/react-query';

import { API_ENDPOINTS } from '@/config/endpoints';
import { env } from '@/config/env';
import { apiClient } from '@/lib/api-client';

type GeneratePdfInput = { projectId: number; technicianId: number; language: 'EN' | 'AR' };

export const contractPdfQueryKey = (projectId: number, language: string) =>
  ['projects', 'contract-pdf', projectId, language] as const;

/**
 * Generate / refresh the contract PDF and return an absolute, openable URL — mirrors
 * RN's ContractPDFViewer (POST /contracts/test/generate-pdf, **form-urlencoded**,
 * `returnPdf=false` → `{ downloadUrl | pdfUrl }`). Relative URLs resolve against the
 * public site origin (RN prefixes the same way). Returns `null` when the backend
 * produced no URL. Browser calls go through `/api/proxy/*` (the urlencoded body is now
 * forwarded by the proxy).
 */
export async function generateContractPdf(input: GeneratePdfInput): Promise<string | null> {
  const form = new URLSearchParams();
  form.set('projectId', String(input.projectId));
  form.set('technicianId', String(input.technicianId));
  form.set('language', input.language);
  form.set('returnPdf', 'false');
  const data = await apiClient.post<unknown>(API_ENDPOINTS.CONTRACTS.GENERATE_PDF, { body: form });
  return resolvePdfUrl(data);
}

/** Read `downloadUrl` / `pdfUrl` / `documentUrl` and make it absolute (site origin). */
function resolvePdfUrl(data: unknown): string | null {
  if (!data || typeof data !== 'object') return null;
  const o = data as Record<string, unknown>;
  const raw = firstString(o.downloadUrl, o.pdfUrl, o.documentUrl);
  if (!raw) return null;
  if (/^https?:\/\//i.test(raw)) return raw;
  return new URL(raw, env.NEXT_PUBLIC_SITE_URL).toString();
}

function firstString(...values: unknown[]): string {
  for (const v of values) {
    if (typeof v === 'string' && v.trim()) return v.trim();
  }
  return '';
}

/**
 * Pre-generate the contract PDF URL so the Download button can open it synchronously
 * on click (an async open is popup-blocked). Disabled until a technicianId is known;
 * no retry storm on failure (the button re-fetches on click). Fresh for 5 min.
 */
export function useContractPdfUrl(
  projectId: number,
  technicianId: number | null | undefined,
  language: 'EN' | 'AR',
) {
  return useQuery({
    queryKey: contractPdfQueryKey(projectId, language),
    queryFn: () =>
      generateContractPdf({ projectId, technicianId: technicianId as number, language }),
    enabled: typeof technicianId === 'number' && technicianId > 0,
    staleTime: 1000 * 60 * 5,
    retry: false,
  });
}

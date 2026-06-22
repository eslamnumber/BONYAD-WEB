import { env } from '@/config/env';

/**
 * Read `downloadUrl` / `pdfUrl` / `documentUrl` from the GENERATE_PDF response and make
 * it absolute against the public site origin (RN prefixes the same way). Shared by the
 * browser fetcher (`generateContractPdf`) and the same-origin `/api/contract-pdf` stream
 * route so both resolve the backend URL identically. Returns null when no URL is present.
 */
export function resolvePdfUrl(data: unknown): string | null {
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

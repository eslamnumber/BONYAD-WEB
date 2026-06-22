import { useQuery } from '@tanstack/react-query';

import { env } from '@/config/env';

import { generateContractPdf } from './generate-contract-pdf';
import { getContractByProject } from './get-contract';

type ResolveInput = {
  projectId: number;
  technicianId?: number | null;
  language: 'EN' | 'AR';
};

export const contractDocumentQueryKey = (
  projectId: number,
  technicianId: number,
  language: string,
) => ['projects', 'contract-document', projectId, technicianId, language] as const;

/**
 * Resolve an openable contract PDF URL for the technician's APPROVED screen — mirrors iOS
 * `ContractServiceAPI` (`BackendContract.resolvedPDFURL` + `ProjectContractsResponse`):
 * read an existing contract first (GET /contracts/project/:id, 404 ⇒ none yet), trying
 * every URL field the backend actually uses (`originalDocumentUrl ?? signedDocumentUrl ??
 * contractPdfUrl ?? documentUrl`, plus the envelope-level `projectContractPdfUrl` /
 * `allContractUrls`). Only when there is no existing URL does it generate one on demand
 * (POST /contracts/test/generate-pdf, which needs the technicianId). A generation error
 * PROPAGATES so the button can surface the backend reason; a missing URL with no
 * technician returns `null` ("not ready yet"). Relative URLs resolve against the site origin.
 */
export async function resolveContractDocumentUrl(input: ResolveInput): Promise<string | null> {
  let existing = '';
  try {
    existing = pickContractUrl(await getContractByProject(input.projectId));
  } catch {
    // A failed read shouldn't block generation — fall through.
  }
  const absolute = toAbsoluteUrl(existing);
  if (absolute) return absolute;

  const { technicianId } = input;
  if (typeof technicianId === 'number' && technicianId > 0) {
    return generateContractPdf({
      projectId: input.projectId,
      technicianId,
      language: input.language,
    });
  }
  return null;
}

/**
 * Pull the contract PDF URL out of whatever shape GET /contracts/project/:id returns — a
 * bare contract, `{ contract }`, `{ data }`, or the enhanced `{ contracts: [...],
 * projectContractPdfUrl, allContractUrls }` envelope — using the iOS field priority.
 */
function pickContractUrl(raw: unknown): string {
  if (!isObject(raw)) return '';
  const list = Array.isArray(raw.contracts) ? raw.contracts : [];
  const records = [list[0], raw.contract, raw.data, raw].filter(isObject);
  for (const record of records) {
    const url = firstString(
      record.originalDocumentUrl,
      record.signedDocumentUrl,
      record.contractPdfUrl,
      record.documentUrl,
    );
    if (url) return url;
  }
  const envelopeUrl = firstString(
    raw.projectContractPdfUrl,
    raw.contractPdfUrl,
    raw.pdfUrl,
    raw.contractUrl,
    raw.contractDocumentUrl,
  );
  if (envelopeUrl) return envelopeUrl;
  const all = Array.isArray(raw.allContractUrls) ? raw.allContractUrls : [];
  return firstString(...all);
}

function isObject(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object';
}

function firstString(...values: unknown[]): string {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return '';
}

/** Make a (possibly relative) backend URL absolute against the public site origin. */
function toAbsoluteUrl(raw: string): string | null {
  const value = raw.trim();
  if (!value) return null;
  if (/^https?:\/\//i.test(value)) return value;
  return new URL(value, env.NEXT_PUBLIC_SITE_URL).toString();
}

/**
 * Pre-resolve the contract PDF URL so the "Review contract" button can open it
 * synchronously on click (an async open is popup-blocked). Keyed by technicianId too, so
 * it refetches once the assigned technician is known. No retry storm on failure — the
 * button re-fetches on click. Fresh for 5 min.
 */
export function useContractDocumentUrl(
  projectId: number,
  technicianId: number | null | undefined,
  language: 'EN' | 'AR',
) {
  return useQuery({
    queryKey: contractDocumentQueryKey(projectId, technicianId ?? 0, language),
    queryFn: () => resolveContractDocumentUrl({ projectId, technicianId, language }),
    staleTime: 1000 * 60 * 5,
    retry: false,
  });
}

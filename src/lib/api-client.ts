import type { ZodType } from 'zod';

import { BACKEND_BASE_URL, PROXY_PREFIX } from './backend';

export class ApiError extends Error {
  public readonly messageEn?: string;
  public readonly messageAr?: string;
  public readonly errorCode?: string;
  public readonly fieldErrors?: Record<string, string>;

  constructor(
    public readonly status: number,
    public readonly body: unknown,
  ) {
    super(`API error ${status}`);
    this.name = 'ApiError';
    if (body && typeof body === 'object') {
      const b = body as Record<string, unknown>;
      if (typeof b.messageEn === 'string') this.messageEn = b.messageEn;
      if (typeof b.messageAr === 'string') this.messageAr = b.messageAr;
      if (typeof b.errorCode === 'string') this.errorCode = b.errorCode;
      if (b.fieldErrors && typeof b.fieldErrors === 'object') {
        this.fieldErrors = b.fieldErrors as Record<string, string>;
      }
    }
  }

  localizedMessage(locale: string): string | undefined {
    return locale.startsWith('ar')
      ? (this.messageAr ?? this.messageEn)
      : (this.messageEn ?? this.messageAr);
  }
}

type RequestOptions<T> = {
  body?: unknown;
  params?: Record<string, string | number | boolean | undefined>;
  schema?: ZodType<T>;
  /** Server-side Bearer token. Browser calls leave this unset — the proxy attaches it. */
  token?: string;
  /** Target a same-origin Next route handler (e.g. `/api/auth/login`) instead of the backend. */
  internal?: boolean;
  /**
   * Server-only backend host override for the runtime dev/prod switch. Ignored
   * in the browser (which always goes same-origin through the proxy). Resolve it
   * from the `bonyad-api-env` cookie via `resolveBackendBaseUrl`.
   */
  baseUrl?: string;
};

/**
 * Resolve the absolute request URL for the current runtime:
 *   - Server (RSC / route handler): call the backend directly.
 *   - Browser, internal route: same-origin, used as-is.
 *   - Browser, backend call: same-origin `/api/proxy/*`, which forwards server-side
 *     (CSP `connect-src 'self'` forbids the browser hitting the backend directly).
 */
function resolveUrl(path: string, internal: boolean, baseUrl?: string): URL {
  if (typeof window === 'undefined') return new URL(`${baseUrl ?? BACKEND_BASE_URL}${path}`);
  const prefix = internal ? '' : PROXY_PREFIX;
  return new URL(`${prefix}${path}`, window.location.origin);
}

/**
 * Encode a request body. FormData (file uploads) is passed through untouched and
 * carries no hand-set Content-Type — fetch/undici writes the
 * `multipart/form-data` boundary header itself. Everything else is JSON.
 */
function serializeBody(body: unknown): { body: BodyInit | undefined; contentType?: string } {
  if (typeof FormData !== 'undefined' && body instanceof FormData) return { body };
  if (body === undefined) return { body: undefined, contentType: 'application/json' };
  return { body: JSON.stringify(body), contentType: 'application/json' };
}

async function request<T>(
  method: string,
  path: string,
  { body, params, schema, token, internal = false, baseUrl }: RequestOptions<T> = {},
): Promise<T> {
  const url = resolveUrl(path, internal, baseUrl);

  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined) url.searchParams.set(k, String(v));
    });
  }

  const payload = serializeBody(body);
  const headers: HeadersInit = { Accept: 'application/json' };
  if (payload.contentType) headers['Content-Type'] = payload.contentType;
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(url.toString(), { method, headers, body: payload.body });

  const json = await res.json().catch(() => null);

  if (!res.ok) throw new ApiError(res.status, json);

  if (schema) return schema.parse(json);
  return json as T;
}

export const apiClient = {
  get: <T>(path: string, opts?: Omit<RequestOptions<T>, 'body'>) => request<T>('GET', path, opts),
  post: <T>(path: string, opts?: RequestOptions<T>) => request<T>('POST', path, opts),
  put: <T>(path: string, opts?: RequestOptions<T>) => request<T>('PUT', path, opts),
  patch: <T>(path: string, opts?: RequestOptions<T>) => request<T>('PATCH', path, opts),
  delete: <T>(path: string, opts?: Omit<RequestOptions<T>, 'body'>) =>
    request<T>('DELETE', path, opts),
};

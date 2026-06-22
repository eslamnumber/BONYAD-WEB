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
  // URLSearchParams → application/x-www-form-urlencoded (e.g. POST /signatures).
  // fetch/undici writes the urlencoded Content-Type (with charset) itself, so we
  // pass it through without a hand-set header, exactly like FormData above.
  if (typeof URLSearchParams !== 'undefined' && body instanceof URLSearchParams) return { body };
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

type StreamOptions = {
  body?: unknown;
  token?: string;
  internal?: boolean;
  baseUrl?: string;
  signal?: AbortSignal;
  /** Extra request headers (e.g. `Accept: text/event-stream`). */
  headers?: Record<string, string>;
};

/**
 * POST that returns the raw streaming {@link Response} instead of parsed JSON —
 * the only way to consume a server-sent-events body. The SSE/line parsing lives
 * in the caller (it is not a `fetch`, so it may live outside this file). Used by
 * the Omdah SOW generation stream both server-side (route → Cloud Run) and
 * client-side (hook → same-origin `/api/ai/chat/stream`). Throws {@link ApiError}
 * on a non-2xx response so callers can fall back to the REST path.
 */
async function streamRequest(path: string, opts: StreamOptions = {}): Promise<Response> {
  const { body, token, internal = false, baseUrl, signal, headers: extra } = opts;
  const url = resolveUrl(path, internal, baseUrl);
  const payload = serializeBody(body);
  const headers: HeadersInit = { Accept: 'text/event-stream', ...extra };
  if (payload.contentType) headers['Content-Type'] = payload.contentType;
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(url.toString(), { method: 'POST', headers, body: payload.body, signal });
  if (!res.ok) throw new ApiError(res.status, await res.json().catch(() => null));
  return res;
}

/**
 * GET that returns the raw {@link Response} without parsing — for binary / streamed
 * bodies (e.g. the contract PDF piped through `/api/contract-pdf`). `url` is used as-is,
 * so the caller passes an already-absolute URL. Throws {@link ApiError} on a non-2xx.
 */
async function getRaw(url: string, opts: { signal?: AbortSignal } = {}): Promise<Response> {
  const res = await fetch(url, { signal: opts.signal });
  if (!res.ok) throw new ApiError(res.status, null);
  return res;
}

export const apiClient = {
  stream: streamRequest,
  getRaw,
  get: <T>(path: string, opts?: Omit<RequestOptions<T>, 'body'>) => request<T>('GET', path, opts),
  post: <T>(path: string, opts?: RequestOptions<T>) => request<T>('POST', path, opts),
  put: <T>(path: string, opts?: RequestOptions<T>) => request<T>('PUT', path, opts),
  patch: <T>(path: string, opts?: RequestOptions<T>) => request<T>('PATCH', path, opts),
  delete: <T>(path: string, opts?: Omit<RequestOptions<T>, 'body'>) =>
    request<T>('DELETE', path, opts),
};

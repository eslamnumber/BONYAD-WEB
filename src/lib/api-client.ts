import type { ZodType } from 'zod';

import { env } from '@/config/env';

const BASE_URL =
  (env as { NEXT_PUBLIC_API_BASE_URL?: string }).NEXT_PUBLIC_API_BASE_URL ??
  'https://bonyad-app-nyayeditqq-ww.a.run.app/api';

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
  token?: string;
};

async function request<T>(
  method: string,
  path: string,
  { body, params, schema, token }: RequestOptions<T> = {},
): Promise<T> {
  const url = new URL(`${BASE_URL}${path}`);

  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined) url.searchParams.set(k, String(v));
    });
  }

  const headers: HeadersInit = { 'Content-Type': 'application/json', Accept: 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(url.toString(), {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

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

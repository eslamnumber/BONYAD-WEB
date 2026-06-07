import { http, HttpResponse } from 'msw';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { server } from '@/testing/handlers/server';

const { cookieStore } = vi.hoisted(() => ({
  cookieStore: { value: undefined as string | undefined },
}));

vi.mock('next/headers', () => ({
  cookies: async () => ({
    get: (name: string) => (cookieStore.value ? { name, value: cookieStore.value } : undefined),
  }),
}));

import { getServerToken, getServerUser } from './server-auth';

afterEach(() => {
  cookieStore.value = undefined;
});

describe('getServerToken', () => {
  it('returns undefined when no cookie is set', async () => {
    expect(await getServerToken()).toBeUndefined();
  });

  it('returns the cookie value when present', async () => {
    cookieStore.value = 'tok-123';
    expect(await getServerToken()).toBe('tok-123');
  });
});

describe('getServerUser', () => {
  it('returns null when there is no session cookie (no backend call)', async () => {
    expect(await getServerUser()).toBeNull();
  });

  it('returns the normalised user for a valid token', async () => {
    cookieStore.value = 'tok-123';
    server.use(
      http.post('*/auth/validate-token', () =>
        HttpResponse.json({ token: 'tok-123', user: { id: 7, name: 'Eslam', role: 'TECHNICIAN' } }),
      ),
    );
    expect(await getServerUser()).toMatchObject({ id: 7, name: 'Eslam', role: 'TECHNICIAN' });
  });

  it('returns null when validate-token rejects the token', async () => {
    cookieStore.value = 'bad';
    server.use(
      http.post('*/auth/validate-token', () =>
        HttpResponse.json({ message: 'invalid' }, { status: 401 }),
      ),
    );
    expect(await getServerUser()).toBeNull();
  });
});

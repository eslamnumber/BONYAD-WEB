import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { ApiError } from '@/lib/api-client';
import { server } from '@/testing/handlers/server';

import { toProfileUpdateBody } from '../schemas/edit-profile.schema';

import { updateProfile } from './update-profile';

const FORM = {
  name: 'Ahmed',
  email: 'a@b.com',
  nationalId: '1122334455',
  bio: 'Plumber',
  address: 'Riyadh',
  regionId: '3',
  yearsOfExperience: '5',
};

describe('toProfileUpdateBody', () => {
  it('sends technician fields (coerced to numbers) for a technician', () => {
    expect(toProfileUpdateBody(FORM, true)).toEqual({
      name: 'Ahmed',
      email: 'a@b.com',
      nationalId: '1122334455',
      description: 'Plumber',
      address: 'Riyadh',
      yearsOfExperience: 5,
      regionId: 3,
    });
  });

  it('drops technician-only fields for a customer and omits empty values', () => {
    expect(toProfileUpdateBody({ ...FORM, email: '', bio: '' }, false)).toEqual({
      name: 'Ahmed',
      nationalId: '1122334455',
    });
  });
});

describe('updateProfile', () => {
  it('PUTs the body to /users/profile', async () => {
    let method = '';
    let pathname = '';
    let body: unknown;
    server.use(
      http.put('*/users/profile', async ({ request }) => {
        method = request.method;
        pathname = new URL(request.url).pathname;
        body = await request.json();
        return HttpResponse.json({ ok: true });
      }),
    );

    await updateProfile({ name: 'Ahmed', yearsOfExperience: 5 });

    expect(method).toBe('PUT');
    expect(pathname).toMatch(/\/users\/profile$/);
    expect(body).toEqual({ name: 'Ahmed', yearsOfExperience: 5 });
  });

  it('throws ApiError on a 4xx', async () => {
    server.use(
      http.put('*/users/profile', () =>
        HttpResponse.json(
          { messageEn: 'Invalid national ID.', errorCode: 'BAD_NID' },
          { status: 400 },
        ),
      ),
    );
    const err = await updateProfile({ nationalId: '0000000000' }).catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect((err as ApiError).errorCode).toBe('BAD_NID');
  });
});

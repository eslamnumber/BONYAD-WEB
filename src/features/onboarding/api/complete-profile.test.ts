import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { ApiError } from '@/lib/api-client';
import { server } from '@/testing/handlers/server';

import { type CompleteProfileValues } from '../schemas/complete-profile.schema';

import { completeProfile, type CompleteProfileInput } from './complete-profile';

const VALUES: CompleteProfileValues = {
  email: 'tech@example.com',
  bio: 'Experienced electrician serving Riyadh for residential and commercial work.',
  address: 'Riyadh, Al Olaya',
  yearsOfExperience: '5',
  regionIds: [1, 3],
};

function input(overrides?: Partial<CompleteProfileInput>): CompleteProfileInput {
  return { values: VALUES, certificates: [], ...overrides };
}

describe('completeProfile', () => {
  it('sends the multipart body the RN/iOS call site expects and returns the result', async () => {
    let received: FormData | null = null;
    server.use(
      http.post('*/users/complete-profile', async ({ request }) => {
        received = await request.formData();
        return HttpResponse.json({ profileComplete: true });
      }),
    );

    const cert = new File(['x'], 'license.pdf', { type: 'application/pdf' });
    const res = await completeProfile(input({ certificates: [cert] }));

    const fd = received as FormData | null;
    expect(res).toEqual({ profileComplete: true });
    expect(fd?.get('email')).toBe('tech@example.com');
    // The form's `bio` is submitted as the backend's `description` field.
    expect(fd?.get('description')).toBe(VALUES.bio);
    expect(fd?.get('address')).toBe('Riyadh, Al Olaya');
    expect(fd?.get('yearsOfExperience')).toBe('5');
    // regionIds is a repeated multipart field, stringified.
    expect(fd?.getAll('regionIds')).toEqual(['1', '3']);
    expect(fd?.getAll('certificates')).toHaveLength(1);
  });

  it('throws ApiError with localized messages + errorCode on a 409 email conflict', async () => {
    server.use(
      http.post('*/users/complete-profile', () =>
        HttpResponse.json(
          {
            messageEn: 'Email already in use.',
            messageAr: 'البريد الإلكتروني مستخدم بالفعل.',
            errorCode: 'EMAIL_ALREADY_EXISTS',
          },
          { status: 409 },
        ),
      ),
    );

    const err = await completeProfile(input()).catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect((err as ApiError).status).toBe(409);
    expect((err as ApiError).errorCode).toBe('EMAIL_ALREADY_EXISTS');
    expect((err as ApiError).localizedMessage('ar')).toBe('البريد الإلكتروني مستخدم بالفعل.');
  });

  it('omits the certificates field entirely when none are attached', async () => {
    let received: FormData | null = null;
    server.use(
      http.post('*/users/complete-profile', async ({ request }) => {
        received = await request.formData();
        return HttpResponse.json({ profileComplete: true });
      }),
    );

    await completeProfile(input());
    const fd = received as FormData | null;
    expect(fd?.getAll('certificates')).toHaveLength(0);
  });
});

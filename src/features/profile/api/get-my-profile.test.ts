import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { ApiError } from '@/lib/api-client';
import { server } from '@/testing/handlers/server';

import type { UserProfile } from '../schemas/profile';

import { getMyProfile } from './get-my-profile';

/** A customer profile — the minimal identity-card fields. */
const USER_PROFILE: UserProfile = {
  id: 443,
  name: 'أحمد فرحات',
  email: 'ahmed@example.com',
  phoneNumber: '0551234567',
  role: 'USER',
};

/** A Wathq-verified company technician — carries the rating + company trio. */
const COMPANY_TECHNICIAN: UserProfile = {
  id: 444,
  name: 'أحمد العتيبي',
  role: 'TECHNICIAN',
  type_label: 'سبّاك',
  averageRating: 4.8,
  totalReviews: 124,
  isCompany: true,
  companyName: 'مؤسسة العتيبي للمقاولات',
  crNumber: '1010101010',
};

describe('getMyProfile', () => {
  it('returns the parsed customer profile from GET /users/profile', async () => {
    server.use(http.get('*/users/profile', () => HttpResponse.json(USER_PROFILE)));
    expect(await getMyProfile()).toEqual(USER_PROFILE);
  });

  it('passes through the technician rating + Wathq company fields', async () => {
    server.use(http.get('*/users/profile', () => HttpResponse.json(COMPANY_TECHNICIAN)));
    const profile = await getMyProfile();
    expect(profile.isCompany).toBe(true);
    expect(profile.crNumber).toBe('1010101010');
    expect(profile.averageRating).toBe(4.8);
  });

  it('throws ApiError with status / errorCode / localized messages on 401', async () => {
    server.use(
      http.get('*/users/profile', () =>
        HttpResponse.json(
          { messageEn: 'Unauthorized.', messageAr: 'غير مصرح.', errorCode: 'UNAUTHORIZED' },
          { status: 401 },
        ),
      ),
    );
    const err = await getMyProfile().catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect((err as ApiError).status).toBe(401);
    expect((err as ApiError).errorCode).toBe('UNAUTHORIZED');
    expect((err as ApiError).localizedMessage('ar')).toBe('غير مصرح.');
  });
});

import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { ApiError } from '@/lib/api-client';
import { server } from '@/testing/handlers/server';

import {
  getUserProfile,
  profileAvatar,
  profileRating,
  profileReviewCount,
} from './get-user-profile';

const PROFILE = {
  id: 445,
  name: 'سعد الحربي',
  averageRating: 4.9,
  totalReviews: 12,
  profileImage: 'https://cdn.example.com/445.jpg',
};

describe('getUserProfile', () => {
  it('fetches /users/:id/profile and returns the parsed profile', async () => {
    let capturedUrl = '';
    server.use(
      http.get('*/users/:id/profile', ({ request }) => {
        capturedUrl = request.url;
        return HttpResponse.json(PROFILE);
      }),
    );
    const profile = await getUserProfile(445);
    expect(new URL(capturedUrl).pathname).toMatch(/\/users\/445\/profile$/);
    expect(profile).toEqual(PROFILE);
  });

  it('throws ApiError with status / localized messages on 404', async () => {
    server.use(
      http.get('*/users/:id/profile', () =>
        HttpResponse.json(
          { messageEn: 'Not found.', messageAr: 'غير موجود.', errorCode: 'NOT_FOUND' },
          { status: 404 },
        ),
      ),
    );
    const err = await getUserProfile(1).catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect((err as ApiError).status).toBe(404);
    expect((err as ApiError).errorCode).toBe('NOT_FOUND');
    expect((err as ApiError).localizedMessage('ar')).toBe('غير موجود.');
  });
});

describe('profile field selectors', () => {
  it('prefers averageRating, falling back to rating', () => {
    expect(profileRating({ averageRating: 4.7 })).toBe(4.7);
    expect(profileRating({ rating: 3.5 })).toBe(3.5);
    expect(profileRating(null)).toBeUndefined();
  });

  it('uses completedProjects, then totalReviews, then reviewCount for the count', () => {
    expect(profileReviewCount({ completedProjects: 8, totalReviews: 99 })).toBe(8);
    expect(profileReviewCount({ totalReviews: 12 })).toBe(12);
    expect(profileReviewCount({ reviewCount: 4 })).toBe(4);
    expect(profileReviewCount(undefined)).toBeUndefined();
  });

  it('prefers profileImage, falling back to profilePic', () => {
    expect(profileAvatar({ profileImage: 'a.jpg' })).toBe('a.jpg');
    expect(profileAvatar({ profilePic: 'b.jpg' })).toBe('b.jpg');
    expect(profileAvatar({})).toBeUndefined();
  });
});

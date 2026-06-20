import { http, HttpResponse } from 'msw';

const BASE = 'https://bonyad-app-nyayeditqq-ww.a.run.app/api';

/** The signed-in user's own profile (Wathq-verified company technician sample). */
const SAMPLE_PROFILE = {
  id: 444,
  name: 'أحمد العتيبي',
  email: 'ahmed@example.com',
  phoneNumber: '0551234567',
  nationalId: '1122334455',
  role: 'TECHNICIAN',
  type_label: 'سبّاك',
  averageRating: 4.8,
  totalReviews: 124,
  isCompany: true,
  companyName: 'مؤسسة العتيبي للمقاولات',
  crNumber: '1010101010',
};

export const profileHandlers = [
  http.get(`${BASE}/users/profile`, () => HttpResponse.json(SAMPLE_PROFILE)),
  // Account-type screen: Wathq check + profile-by-id update (default happy path).
  http.post(`${BASE}/wathq/verify`, () =>
    HttpResponse.json({ authorized: true, isCrFound: true, isNidFound: true }),
  ),
  http.put(`${BASE}/users/:userId/profile`, () => HttpResponse.json({ ok: true })),
  // Change-photo control: avatar upload (default happy path).
  http.post('*/users/update-profile-image', () =>
    HttpResponse.json({ profileImage: 'https://cdn.example/new-avatar.jpg' }),
  ),
];

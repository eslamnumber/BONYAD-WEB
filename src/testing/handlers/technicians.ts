import { http, HttpResponse } from 'msw';

const BASE = 'https://bonyad-app-nyayeditqq-ww.a.run.app/api';

/** Approved technicians for the direct-assignment picker (includes averageRating). */
const SAMPLE_TECHNICIANS = [
  { id: 1, name: 'خالد اليوسف', phoneNumber: '0501234567', averageRating: 4.9, totalReviews: 32 },
  { id: 2, name: 'محمد العتيبي', phoneNumber: '0507654321', averageRating: 4.9, totalReviews: 18 },
  { id: 3, name: 'أحمد السعيد', phoneNumber: '0509876543', averageRating: 4.7, totalReviews: 9 },
  { id: 4, name: 'ليلى الجابر', phoneNumber: '0502223344', averageRating: 4.8, totalReviews: 21 },
];

export const technicianHandlers = [
  http.get(`${BASE}/users/technicians`, () => HttpResponse.json(SAMPLE_TECHNICIANS)),
];

import { http, HttpResponse } from 'msw';

const BASE = 'https://bonyad-app-nyayeditqq-ww.a.run.app/api';

/** Approved technicians for the direct-assignment picker (includes averageRating). */
const SAMPLE_TECHNICIANS = [
  { id: 1, name: 'خالد اليوسف', phoneNumber: '0501234567', averageRating: 4.9, totalReviews: 32 },
  { id: 2, name: 'محمد العتيبي', phoneNumber: '0507654321', averageRating: 4.9, totalReviews: 18 },
  { id: 3, name: 'أحمد السعيد', phoneNumber: '0509876543', averageRating: 4.7, totalReviews: 9 },
  { id: 4, name: 'ليلى الجابر', phoneNumber: '0502223344', averageRating: 4.8, totalReviews: 21 },
];

/** SP home-dashboard snapshot (GET /technicians/me/dashboard). Wildcard host so it
 *  matches the same-origin `/api/proxy/*` URL component tests produce in happy-dom. */
const SAMPLE_DASHBOARD = {
  technician: { id: 444, name: 'ahmed farahat tech', phone: '539909791' },
  summary: {
    active_projects: 2,
    completed_projects: 1,
    total_projects: 9,
    pending_phase_payments: 1,
    total_earned_sar: 520,
    total_pending_sar: 175943.56,
    open_bids: 1,
    won_bids: 9,
    submitted_bids: 10,
    win_rate: 0.9,
    subscription_days_left: 15,
  },
  active_projects: [
    {
      id: 183,
      title: 'بناء عظم فاخر',
      status: 'IN_PROGRESS',
      owner: { id: 443, name: 'ahmed farahat user', phone: '539909791' },
      phases_total: 8,
      phases_completed: 6,
      progress_pct: 0.75,
      value_sar: 700,
      paid_sar: 520,
      outstanding_sar: 180,
    },
  ],
  next_payments: [
    { id: 334, project_id: 226, phase_number: 1, remaining: 200, status: 'AWAITING_APPROVAL' },
  ],
  recent_bids: [
    {
      id: 139,
      project_id: 226,
      amount_sar: 300,
      status: 'ACCEPTED',
      submitted_at: '2026-06-22T03:50:59Z',
    },
  ],
  earnings_chart: { monthly: [{ month: '2026-06', earned: 520 }] },
};

export const technicianHandlers = [
  http.get(`${BASE}/users/technicians`, () => HttpResponse.json(SAMPLE_TECHNICIANS)),
  http.get('*/technicians/me/dashboard', () => HttpResponse.json(SAMPLE_DASHBOARD)),
  http.get('*/ads/mine', () =>
    HttpResponse.json({
      ads: [
        {
          id: 14,
          title: 'تركيب وصيانة السباكة',
          status: 'ACTIVE',
          impressions: 233,
          clicks: 5,
          ctr: 2.15,
          serviceNameEn: 'Design',
          serviceNameAr: 'التصميم',
        },
      ],
    }),
  ),
  http.get('*/ads/feed', () =>
    HttpResponse.json({
      ads: [
        {
          id: 21,
          title: 'تشطيبات داخلية احترافية',
          body: 'خدمات تشطيب فاخرة بأسعار تنافسية',
          status: 'ACTIVE',
          technicianId: 1,
          technicianName: 'خالد اليوسف',
          serviceNameEn: 'Finishing',
          serviceNameAr: 'التشطيبات',
        },
      ],
    }),
  ),
  http.get('*/technician/wallet', () =>
    HttpResponse.json({
      success: true,
      wallet: {
        availableBalance: 171,
        inEscrow: 475,
        totalEarned: 171,
        earnedFromPhases: 171,
        totalPaidOut: 0,
        pendingPayouts: 0,
        currency: 'SAR',
      },
    }),
  ),
  http.get('*/technicians/external-projects', () =>
    HttpResponse.json({
      projects: [
        {
          id: 4,
          title: 'فيلا الياسمين',
          location: 'الرياض',
          clientName: 'عميل تجريبي',
          status: 'IN_PROGRESS',
          progress: 35,
        },
      ],
      count: 1,
      success: true,
    }),
  ),
];

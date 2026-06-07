import { http, HttpResponse } from 'msw';

const BASE = 'https://bonyad-app-nyayeditqq-ww.a.run.app/api';

const SAMPLE_NOTIFICATIONS = [
  {
    id: 1,
    type: 'BID_ACCEPTED',
    read: false,
    titleEn: 'Your offer was accepted',
    titleAr: 'تم قبول عرضك',
    messageEn: 'A new project is available in your area: managing a multi-party project.',
    messageAr: 'مشروع جديد متاح في منطقتك: إدارة مشروع متعدد الأطراف',
    createdAt: '2026-10-15T13:00:00Z',
  },
  {
    id: 2,
    type: 'BID_REJECTED',
    read: false,
    titleEn: 'Your offer was rejected',
    titleAr: 'تم رفض عرضك',
    messageEn: 'A project was cancelled: mobile app development.',
    messageAr: 'مشروع تم إلغاؤه: تطوير تطبيق موبايل',
    createdAt: '2026-10-20T10:00:00Z',
  },
  {
    id: 3,
    type: 'BID_UPDATED',
    read: true,
    titleEn: 'Your offer was updated',
    titleAr: 'تم تحديث عرضك',
    messageEn: 'New opportunity: UI design for a website.',
    messageAr: 'فرصة عمل جديدة: تصميم واجهة مستخدم لموقع ويب',
    createdAt: '2026-10-25T09:30:00Z',
  },
  {
    id: 4,
    type: 'BID_CLOSED',
    read: true,
    titleEn: 'The offer was closed',
    titleAr: 'تم إغلاق العرض',
    messageEn: 'Job available: data analysis for a marketing project.',
    messageAr: 'وظيفة متاحة: تحليل بيانات لمشروع تسويقي',
    createdAt: '2026-10-30T15:45:00Z',
  },
];

export const notificationHandlers = [
  http.get(`${BASE}/notifications/my-notifications`, () => HttpResponse.json(SAMPLE_NOTIFICATIONS)),
  http.get(`${BASE}/notifications/unread-count`, () => HttpResponse.json({ count: 2 })),
  http.post(`${BASE}/notifications/:id/read`, () => HttpResponse.json({ success: true })),
  http.post(`${BASE}/notifications/mark-all-read`, () => HttpResponse.json({ success: true })),
];

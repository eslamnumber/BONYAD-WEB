import { http, HttpResponse } from 'msw';

const BASE = 'https://bonyad-app-nyayeditqq-ww.a.run.app/api';

const SAMPLE_ROOM = {
  roomId: 'room-1',
  id: 1,
  otherUserId: 42,
  otherUserName: 'أحمد العتيبي',
  otherUserRole: 'USER',
  otherUserProfileImage: null,
  lastMessage: 'مرحباً، هل يمكننا مناقشة تفاصيل المشروع الجديد؟',
  lastMessageAt: '2026-06-07T10:00:00Z',
  unreadCount: 2,
  createdAt: '2026-06-01T09:00:00Z',
};

const SAMPLE_MESSAGES = [
  {
    id: 1,
    roomId: 'room-1',
    senderId: 42,
    receiverId: 7,
    content: 'مرحباً، هل يمكننا مناقشة تفاصيل المشروع الجديد؟',
    createdAt: '2026-06-07T10:00:00Z',
    isRead: true,
  },
  {
    id: 2,
    roomId: 'room-1',
    senderId: 7,
    receiverId: 42,
    content: 'بالطبع، أنا جاهز للاستماع. ما هي الخطوة الأولى؟',
    createdAt: '2026-06-07T10:02:00Z',
    isRead: true,
  },
];

export const chatHandlers = [
  http.get(`${BASE}/chat/my-chats`, () => HttpResponse.json([SAMPLE_ROOM])),
  http.get(`${BASE}/chat/room/:roomId/messages`, () => HttpResponse.json(SAMPLE_MESSAGES)),
  http.post(`${BASE}/chat/send`, async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json({ id: Date.now(), createdAt: new Date().toISOString(), ...body });
  }),
  http.post(`${BASE}/chat/messages/:messageId/mark-read`, () => HttpResponse.json({ ok: true })),
  http.post(`${BASE}/chat/rooms/:roomId/mark-all-read`, () => HttpResponse.json({ ok: true })),
];

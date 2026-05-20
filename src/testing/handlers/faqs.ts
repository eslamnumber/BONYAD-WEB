import { http, HttpResponse } from 'msw';

const BASE = 'https://bonyad-app-nyayeditqq-ww.a.run.app/api';

export const faqHandlers = [
  http.get(`${BASE}/faqs`, () =>
    HttpResponse.json([
      {
        id: 1,
        questionEn: 'How do I sign up?',
        questionAr: 'كيف أسجل؟',
        answerEn: 'Click the get-started button.',
        answerAr: 'انقر على زر البدء.',
        displayOrder: 1,
      },
    ]),
  ),
];

import { http, HttpResponse } from 'msw';

/**
 * Default Terms & Conditions handlers. Wildcard suffixes match whether the call
 * goes direct (server-side) or through the same-origin proxy (browser). Both
 * language bodies ship in every GET, like the real backend.
 */
const sampleTerms = (type: 'USER' | 'TECHNICIAN') => ({
  id: type === 'TECHNICIAN' ? 18 : 17,
  type,
  version: '1.2',
  isActive: true,
  contentEn: '<h1>Terms &amp; Conditions</h1><p>Sample English terms body.</p>',
  contentAr: '<h1>الشروط والأحكام</h1><p>نص الشروط بالعربية.</p>',
});

export const termsHandlers = [
  http.get('*/terms/user', () => HttpResponse.json(sampleTerms('USER'))),
  http.get('*/terms/technician', () => HttpResponse.json(sampleTerms('TECHNICIAN'))),
  http.post('*/users/terms/approve', () => HttpResponse.json({ success: true })),
];

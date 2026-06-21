import { http, HttpResponse } from 'msw';

const BASE = 'https://bonyad-app-nyayeditqq-ww.a.run.app/api';

/** Top-level categories for the create-project category picker (isCategory=true). */
const SAMPLE_CATEGORIES = [
  { id: 1, nameEn: 'Construction', nameAr: 'البناء', isCategory: true, displayOrder: 1 },
  {
    id: 2,
    nameEn: 'Interior design',
    nameAr: 'التصميم الداخلي',
    isCategory: true,
    displayOrder: 2,
  },
  { id: 3, nameEn: 'Maintenance', nameAr: 'الصيانة', isCategory: true, displayOrder: 3 },
  { id: 4, nameEn: 'Finishing', nameAr: 'التشطيبات', isCategory: true, displayOrder: 4 },
];

/** All services — categories + subcategories — for the dashboard search typeahead. */
const SAMPLE_ALL_SERVICES = [
  ...SAMPLE_CATEGORIES,
  {
    id: 11,
    nameEn: 'Finishing contractor',
    nameAr: 'مقاول تشطيبات',
    isCategory: false,
    parentService: { id: 4, nameEn: 'Finishing', nameAr: 'التشطيبات' },
  },
  {
    id: 12,
    nameEn: 'Architect',
    nameAr: 'مهندس معماري',
    isCategory: false,
    parentService: { id: 1, nameEn: 'Construction', nameAr: 'البناء' },
  },
  {
    id: 13,
    nameEn: 'Demolition contractor',
    nameAr: 'مقاول هدم',
    isCategory: false,
    parentService: { id: 1, nameEn: 'Construction', nameAr: 'البناء' },
  },
];

/**
 * The signed-in technician's own offered services — backs the Available-Projects
 * service filter. Ids cover the sample projects' `serviceId` so the default
 * dashboard render shows them. Wildcard path: component renders reach the proxy
 * URL (`/api/proxy/...`), which a full-BASE handler would miss.
 */
const SAMPLE_MY_SERVICES = [
  { id: 1, nameEn: 'Construction', nameAr: 'البناء' },
  { id: 2, nameEn: 'Interior design', nameAr: 'التصميم الداخلي' },
];

export const serviceHandlers = [
  http.get(`${BASE}/services/categories`, () => HttpResponse.json(SAMPLE_CATEGORIES)),
  http.get(`${BASE}/services`, () => HttpResponse.json(SAMPLE_ALL_SERVICES)),
  http.get('*/technician/services/my-services', () =>
    HttpResponse.json({ services: SAMPLE_MY_SERVICES }),
  ),
];

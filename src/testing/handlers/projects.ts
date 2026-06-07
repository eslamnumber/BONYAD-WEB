import { http, HttpResponse } from 'msw';

const BASE = 'https://bonyad-app-nyayeditqq-ww.a.run.app/api';

const SAMPLE_PROJECT = {
  id: 1,
  userName: 'صاحب العمل',
  serviceNameEn: 'Building renovation',
  serviceNameAr: 'تجديد المباني',
  description:
    'مطلوب مقاول لتجديد وتحسين الواجهة الخارجية لمبنى إداري قديم مع إضافة أنظمة عزل حراري.',
  budget: 200000,
  address: 'جدة',
  status: 'PENDING',
  assignedTechnicianId: null,
  files: ['https://placehold.co/379x230'],
  timeRequiredDays: 84,
  bidsCloseAt: '2026-06-20T00:00:00Z',
  createdAt: '2026-06-01T10:00:00Z',
};

const SAMPLE_PROJECT_DETAIL = {
  ...SAMPLE_PROJECT,
  projectType: 'تجديد المباني',
  budgetMin: 50000,
  budgetMax: 80000,
  expectedStartDate: '2026-08-01T00:00:00Z',
  offersCount: 7,
  requirements: ['خرسانة', 'تشطيبات', 'كهرباء', 'سباكة', 'إدارة مشاريع'],
};

const SAMPLE_PHASES = [
  {
    id: 1,
    projectId: 1,
    phaseNumber: 1,
    description: 'المرحلة الأولى: الأساسات والأعمال الترابية',
    timeSpentDays: 30,
    expectedDate: '2026-09-01T00:00:00Z',
  },
  {
    id: 2,
    projectId: 1,
    phaseNumber: 2,
    description: 'المرحلة الثانية: الهيكل الخرساني',
    timeSpentDays: 90,
    expectedDate: '2026-12-01T00:00:00Z',
  },
  {
    id: 3,
    projectId: 1,
    phaseNumber: 3,
    description: 'المرحلة الثالثة: التشطيبات الداخلية',
    timeSpentDays: 90,
    expectedDate: '2027-03-01T00:00:00Z',
  },
  {
    id: 4,
    projectId: 1,
    phaseNumber: 4,
    description: 'المرحلة الرابعة: التسليم النهائي',
    timeSpentDays: 30,
    expectedDate: '2027-08-01T00:00:00Z',
  },
];

/** Assigned-projects rows — one per status so the table shows every badge variant. */
const SAMPLE_ASSIGNED = [
  {
    id: 11,
    title: 'فيلا سكنية بالرياض',
    userName: 'أحمد العتيبي',
    projectType: 'البناء',
    budget: 180000,
    status: 'APPROVED',
  },
  {
    id: 12,
    title: 'شركة تصميم في جدة',
    userName: 'سارة الحمادي',
    projectType: 'التصميم الداخلي',
    budget: 250000,
    status: 'OFFER_SENT',
  },
  {
    id: 13,
    title: 'مشروع تجاري في الدمام',
    userName: 'محمد السعيد',
    projectType: 'البناء',
    budget: 2700,
    status: 'IN_PROGRESS',
  },
  {
    id: 14,
    title: 'شقة سكنية في الخبر',
    userName: 'ليلى القحطاني',
    projectType: 'الديكور',
    budget: 300000,
    status: 'REJECTED',
  },
  {
    id: 15,
    title: 'مركز تجاري في جدة',
    userName: 'سارة العتيبي',
    projectType: 'التصميمات',
    budget: 850000,
    status: 'PENDING',
  },
  {
    id: 16,
    title: 'طريق سريع في الدمام',
    userName: 'منصور القحطاني',
    projectType: 'البنية التحتية',
    budget: 300000,
    status: 'COMPLETED',
  },
];

export const projectHandlers = [
  http.get(`${BASE}/projects/my-assigned`, () => HttpResponse.json(SAMPLE_ASSIGNED)),
  http.get(`${BASE}/projects`, () => HttpResponse.json([SAMPLE_PROJECT])),
  http.get(`${BASE}/projects/:id`, ({ params }) =>
    HttpResponse.json({
      project: { ...SAMPLE_PROJECT_DETAIL, id: Number(params.id) },
      phases: SAMPLE_PHASES,
      regionId: null,
      regionNameEn: null,
      regionNameAr: null,
    }),
  ),
  http.get(`${BASE}/phases/project/:projectId`, () => HttpResponse.json(SAMPLE_PHASES)),
];

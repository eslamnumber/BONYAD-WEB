import { http, HttpResponse } from 'msw';

const BASE = 'https://bonyad-app-nyayeditqq-ww.a.run.app/api';

const SAMPLE_PROJECT = {
  id: 1,
  userName: 'صاحب العمل',
  serviceId: 1,
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

/**
 * Assigned-projects rows — at least one per toolbar filter so every filter is
 * demonstrable. `projectType` is the backend assignment enum (BIDDING /
 * DIRECT_ASSIGNMENT), NOT a service category; the localized service name comes
 * from serviceNameEn/serviceNameAr.
 */
const SAMPLE_ASSIGNED = [
  {
    id: 11,
    title: 'فيلا سكنية بالرياض',
    userName: 'أحمد العتيبي',
    serviceNameEn: 'Construction',
    serviceNameAr: 'البناء',
    projectType: 'BIDDING',
    budget: 180000,
    status: 'APPROVED',
  },
  {
    id: 12,
    title: 'مجمع سكني في جدة',
    userName: 'سارة الحمادي',
    serviceNameEn: 'Interior design',
    serviceNameAr: 'التصميم الداخلي',
    projectType: 'BIDDING',
    budget: 250000,
    status: 'PHASE_PLANNING',
  },
  {
    id: 13,
    title: 'مشروع تجاري في الدمام',
    userName: 'محمد السعيد',
    serviceNameEn: 'Construction',
    serviceNameAr: 'البناء',
    projectType: 'BIDDING',
    budget: 2700,
    status: 'IN_PROGRESS',
  },
  {
    id: 14,
    title: 'توقيع عقد فيلا في الخبر',
    userName: 'ليلى القحطاني',
    serviceNameEn: 'Decor',
    serviceNameAr: 'الديكور',
    projectType: 'BIDDING',
    budget: 300000,
    status: 'CONTRACT_SIGNING',
  },
  {
    id: 15,
    title: 'مركز تجاري في جدة',
    userName: 'سارة العتيبي',
    serviceNameEn: 'Designs',
    serviceNameAr: 'التصميمات',
    projectType: 'BIDDING',
    budget: 850000,
    status: 'BIDDING',
  },
  {
    id: 16,
    title: 'طريق سريع في الدمام',
    userName: 'منصور القحطاني',
    serviceNameEn: 'Infrastructure',
    serviceNameAr: 'البنية التحتية',
    projectType: 'BIDDING',
    budget: 300000,
    status: 'COMPLETED',
  },
  {
    id: 17,
    title: 'صيانة مبنى إداري',
    userName: 'نورة الزهراني',
    serviceNameEn: 'Maintenance',
    serviceNameAr: 'الصيانة',
    projectType: 'DIRECT_ASSIGNMENT',
    budget: 120000,
    status: 'PENDING',
  },
  {
    id: 18,
    title: 'تشطيب شقة في الرياض',
    userName: 'خالد المطيري',
    serviceNameEn: 'Finishing',
    serviceNameAr: 'التشطيبات',
    projectType: 'BIDDING',
    budget: 90000,
    status: 'PENDING',
  },
];

/**
 * The signed-in customer's own projects (GET /projects/my) — one row per status
 * the Figma table demonstrates (in-progress / contract / pending / rejected /
 * completed). `serviceNameAr` doubles as the "current phase" label and
 * `createdAt` feeds the creation-date column + the stat-card "this month" delta.
 */
const SAMPLE_MY_PROJECTS = [
  {
    id: 101,
    title: 'فيلا سكنية بالرياض',
    serviceNameEn: 'Construction',
    serviceNameAr: 'البناء',
    budget: 180000,
    status: 'IN_PROGRESS',
    createdAt: '2025-09-10T00:00:00Z',
    assignedTechnicianName: 'م. أحمد العتيبي',
    phases: SAMPLE_PHASES,
  },
  {
    id: 102,
    title: 'شركة تصميم في جدة',
    serviceNameEn: 'Interior design',
    serviceNameAr: 'التصميم الداخلي',
    budget: 250000,
    status: 'CONTRACT_SIGNING',
    createdAt: '2025-10-15T00:00:00Z',
  },
  {
    id: 103,
    title: 'مشروع تجاري في الدمام',
    serviceNameEn: 'Construction',
    serviceNameAr: 'البناء',
    budget: 2700,
    status: 'PENDING',
    createdAt: '2025-11-03T00:00:00Z',
  },
  {
    id: 104,
    title: 'شقة سكنية في الخبر',
    serviceNameEn: 'Decor',
    serviceNameAr: 'الديكور',
    budget: 300000,
    status: 'REJECTED',
    createdAt: '2025-08-22T00:00:00Z',
  },
  {
    id: 105,
    title: 'طريق سريع في الدمام',
    serviceNameEn: 'Infrastructure',
    serviceNameAr: 'البنية التحتية',
    budget: 300000,
    status: 'COMPLETED',
    createdAt: '2025-02-09T00:00:00Z',
  },
];

export const projectHandlers = [
  http.get(`${BASE}/projects/my-assigned`, () => HttpResponse.json(SAMPLE_ASSIGNED)),
  http.get(`${BASE}/projects/my`, () => HttpResponse.json(SAMPLE_MY_PROJECTS)),
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
  http.post(`${BASE}/projects/create`, () => HttpResponse.json({ id: 999 }, { status: 201 })),
  http.post(`${BASE}/phases`, () => HttpResponse.json({ id: 1 }, { status: 201 })),
];

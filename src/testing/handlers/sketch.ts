import { http, HttpResponse } from 'msw';

/** A minimal parsed variant — enough for the variant picker + compliance sheet. */
const SAMPLE_PARSE = {
  style_label_en: 'Open Plan',
  style_label_ar: 'مفتوح عصري',
  rooms: [
    {
      id: 'g_r1',
      name_en: 'Majlis',
      name_ar: 'مجلس',
      polygon: [
        [0, 0],
        [5, 0],
        [5, 5],
        [0, 5],
      ],
      area_m2: 25,
    },
  ],
  openings: [
    {
      id: 'g_d1',
      type: 'door',
      room: 'g_r1',
      wall: 'north',
      offset_m: 2,
      width_m: 1.2,
      external: true,
    },
  ],
  compliance_flags: { sbc_201: 'ok', sbc_501: 'ok', summary: { total_issues: 0, passed_codes: 6 } },
  engineering_review: { verdict: 'ok', score: 90, summary_en: 'Looks good.', summary_ar: 'جيد.' },
};

/** The default parsed SPJob the poll returns (2D variants ready). */
const SAMPLE_JOB = {
  id: 'skt_test',
  status: 'parsed',
  description: 'Test villa',
  active_variant: 0,
  parse: { ...SAMPLE_PARSE, floors: [] },
  variant_parses: [SAMPLE_PARSE, SAMPLE_PARSE],
  variant_labels: [
    { ar: 'مفتوح عصري', en: 'Open Plan' },
    { ar: 'كلاسيكي', en: 'Classic' },
  ],
  variant_floor_svgs: [
    [
      {
        id: 'ground',
        level: 0,
        name_en: 'Ground Floor',
        name_ar: 'الدور الأرضي',
        svg: '<svg/>',
        rooms_count: 9,
        stairs_count: 1,
      },
    ],
    [
      {
        id: 'ground',
        level: 0,
        name_en: 'Ground Floor',
        name_ar: 'الدور الأرضي',
        svg: '<svg/>',
        rooms_count: 8,
        stairs_count: 1,
      },
    ],
  ],
  scene: null,
};

const SAMPLE_SCENE = {
  rooms: SAMPLE_PARSE.rooms,
  openings: SAMPLE_PARSE.openings,
  placements: [
    {
      room_id: 'g_r1',
      template: 'living',
      placements: [
        { asset: 'sofa', x: 2.5, y: 4, z: 0, w: 2, d: 0.9, h: 0.8, rot: 0, color: '#0ea5e9' },
      ],
    },
  ],
  wall_height_m: 3,
  wall_thickness_m: 0.2,
};

/**
 * Sketch-planner handlers. Defaults model the happy path: idea → a parsing job,
 * the poll → a parsed job with 2 variants, select → active_variant pinned, confirm
 * → a ready job with a scene. Individual tests override per case via `server.use`.
 * Same-origin `/api/sketch/...` is hit in happy-dom, so matchers use the
 * leading-wildcard string form (see reference_msw_wildcard_handlers).
 */
export const sketchHandlers = [
  http.post('*/api/sketch/idea', () => HttpResponse.json({ jobId: 'skt_test', status: 'parsing' })),
  http.post('*/api/sketch/:jobId/select-variant', async ({ request }) => {
    const body = (await request.json().catch(() => ({}))) as { variant_index?: number };
    return HttpResponse.json({ ...SAMPLE_JOB, active_variant: body.variant_index ?? 0 });
  }),
  http.post('*/api/sketch/:jobId/confirm', () =>
    HttpResponse.json({ ...SAMPLE_JOB, status: 'ready', scene: SAMPLE_SCENE }),
  ),
  http.get('*/api/sketch/:jobId', () => HttpResponse.json(SAMPLE_JOB)),
];

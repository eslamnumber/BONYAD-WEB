/**
 * Permissive response types for the 2D → 3D sketch planner (hard rule 1: validate
 * what we SEND, trust-but-narrow what we RECEIVE — no `z.enum` on backend strings).
 * Field names mirror the Cloud Run SPJob verbatim (snake_case). Every field is
 * optional: the job is ONE shape that gains fields as it advances
 * (uploaded → parsing → parsed → furnishing → ready). Verified live against
 * `POST /api/sketch/idea` → poll → `select-variant` → `confirm`.
 */

/** A polygon vertex, `[x, y]` in metres (floor plane). */
export type Point = [number, number];

export type SketchRoom = {
  id?: string;
  name_en?: string;
  name_ar?: string;
  polygon?: Point[];
  area_m2?: number;
  tags?: string[];
};

export type SketchOpening = {
  id?: string;
  /** 'door' | 'window'. */
  type?: string;
  /** Owning room id. */
  room?: string;
  /** 'north' | 'south' | 'east' | 'west' — which room wall it sits on. */
  wall?: string;
  /** Distance along the wall from its start, in metres. */
  offset_m?: number;
  width_m?: number;
  external?: boolean;
};

export type SketchStair = {
  id?: string;
  from_floor?: string;
  to_floor?: string;
  x?: number;
  y?: number;
  direction?: string;
  width_m?: number;
  treads?: number;
  shape?: string;
};

export type SketchFloor = {
  id?: string;
  level?: number;
  name_ar?: string;
  name_en?: string;
  elevation_m?: number;
  ceiling_height_m?: number;
  rooms?: SketchRoom[];
  openings?: SketchOpening[];
  stairs?: SketchStair[];
};

export type ComplianceIssue = {
  severity?: string;
  code?: string;
  floor_id?: string;
  room_id?: string;
  room_name?: string;
  msg_ar?: string;
  msg_en?: string;
};

/** Each compliance code is the string `'ok'` OR an array of issues. */
export type ComplianceFlag = string | ComplianceIssue[];

export type ComplianceSummary = {
  total_issues?: number;
  critical?: number;
  warnings?: number;
  minor?: number;
  passed_codes?: number;
};

export type ComplianceFlags = {
  sbc_201?: ComplianceFlag;
  sbc_501?: ComplianceFlag;
  sbc_701?: ComplianceFlag;
  sbc_801?: ComplianceFlag;
  balady_setbacks?: ComplianceFlag;
  saudi_privacy?: ComplianceFlag;
  summary?: ComplianceSummary;
};

export type EngineeringIssue = {
  severity?: string;
  category?: string;
  problem_ar?: string;
  problem_en?: string;
  suggested_fix?: string;
};

export type EngineeringReview = {
  /** 'ok' | 'needs_fix' | 'reject' | … */
  verdict?: string;
  /** 0–100. */
  score?: number;
  summary_ar?: string;
  summary_en?: string;
  issues?: EngineeringIssue[];
};

export type SketchParse = {
  style_label_ar?: string;
  style_label_en?: string;
  floors?: SketchFloor[];
  qibla_direction?: string;
  confidence?: number;
  notes?: string;
  rooms?: SketchRoom[];
  openings?: SketchOpening[];
  compliance_flags?: ComplianceFlags;
  engineering_review?: EngineeringReview;
};

export type SketchFloorSvg = {
  id?: string;
  level?: number;
  name_ar?: string;
  name_en?: string;
  elevation_m?: number;
  svg?: string;
  url?: string;
  rooms_count?: number;
  stairs_count?: number;
};

export type SketchVariantLabel = { ar?: string; en?: string };

/** One furniture box. `x`/`y` = floor-plane metres, `z` = height offset, `rot` deg. */
export type FurnitureItem = {
  asset?: string;
  x?: number;
  y?: number;
  z?: number;
  w?: number;
  d?: number;
  h?: number;
  rot?: number;
  /** Backend-provided hex (rendered as a mesh colour — scene data, not a token). */
  color?: string;
};

export type RoomPlacement = {
  room_id?: string;
  template?: string;
  placements?: FurnitureItem[];
};

export type SketchScene = {
  rooms?: SketchRoom[];
  openings?: SketchOpening[];
  placements?: RoomPlacement[];
  wall_height_m?: number;
  wall_thickness_m?: number;
};

export type SketchJob = {
  id?: string;
  status?: string;
  source?: string;
  description?: string;
  total_area_m2?: number;
  parse?: SketchParse;
  scene?: SketchScene | null;
  variant_parses?: SketchParse[];
  variant_labels?: SketchVariantLabel[];
  active_variant?: number;
  variant_floor_svgs?: SketchFloorSvg[][];
  plan_url?: string;
};

export type CreateSketchJobReply = { jobId: string; status?: string };

/** Poll terminal statuses: 2D variants ready (`parsed`/`ready`) or the job failed. */
export const TERMINAL_SKETCH_STATUSES = ['parsed', 'ready', 'error'] as const;

export const isTerminalSketchStatus = (status?: string): boolean =>
  !!status && (TERMINAL_SKETCH_STATUSES as readonly string[]).includes(status);

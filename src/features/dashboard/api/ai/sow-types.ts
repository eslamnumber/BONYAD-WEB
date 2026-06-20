/**
 * The Scope-of-Work document returned by the Omdah chatbot inside `ui.sow` and
 * refined by the AWS service. Read PERMISSIVELY (rule 1): a plain TS type, every
 * field optional, so a partial streaming payload or a future backend addition never
 * throws. Wire shape is snake_case (mirrors iOS `SOWModels.swift`, encoded snake_case).
 * The UI renders whatever is present and hides empty sections.
 */

export type QualityTier = 'B' | 'B+' | 'A' | 'A+';

/** Money is a min–max band, not a point estimate. */
export type SowCostRange = { min?: number; max?: number };

export type SowLocation = {
  city?: string;
  district?: string;
  floor?: string;
  site_conditions?: string;
};

export type SowMetadata = {
  project_name?: string;
  project_type?: string;
  sector?: string;
  property_type?: string;
  location?: SowLocation;
  complexity_level?: string;
  quality_tier?: string;
};

export type SowObjectives = {
  business_objective?: string;
  functional_objective?: string;
  success_metrics?: { time?: string; cost?: string; quality?: string };
};

export type SowScope = {
  in_scope?: string[];
  out_of_scope?: string[];
  work_discipline?: string[];
  assumptions?: string[];
};

export type SowDeliverable = {
  id?: string;
  name?: string;
  description?: string;
  category?: string;
  quantity?: number;
  unit?: string;
  acceptance_criteria?: string;
};

export type SowMilestone = {
  name?: string;
  description?: string;
  week?: number;
  payment_trigger?: string;
  payment_percent?: number;
};

export type SowTimeline = {
  start_date?: string;
  end_date?: string;
  duration_weeks?: number;
  milestones?: SowMilestone[];
};

export type SowLabor = {
  role?: string;
  required_certifications?: string[];
  saudization_applies?: boolean;
};

export type SowMaterial = {
  type?: string;
  name_ar?: string;
  name_en?: string;
  specification?: string;
  quantity?: number;
  unit?: string;
  category?: string;
  local_or_imported?: string;
  price_min_sar?: number;
  price_max_sar?: number;
  total_min_sar?: number;
  total_max_sar?: number;
  supplier_hint?: string;
};

export type SowEquipment = { type?: string; usage_duration?: string };

export type SowResources = {
  labor?: SowLabor[];
  materials?: SowMaterial[];
  equipment?: SowEquipment[];
};

export type SowCostBreakdown = {
  labor_sar?: SowCostRange;
  materials_sar?: SowCostRange;
  overhead_sar?: SowCostRange;
  total_excl_vat?: SowCostRange;
  vat_15_percent?: SowCostRange;
  grand_total?: SowCostRange;
};

export type SowPayment = {
  milestone?: string;
  percent?: number;
  trigger?: string;
  amount_sar?: SowCostRange;
};

export type SowCommercials = {
  pricing_model?: string;
  currency?: string;
  cost_breakdown?: SowCostBreakdown;
  payment_schedule?: SowPayment[];
  disclaimer?: string;
};

export type SowCompliance = {
  permits_required?: string[];
  applicable_sbc_codes?: string[];
  vat_applicable?: boolean;
  saudization_requirement?: string;
};

export type SowRisk = {
  description?: string;
  probability?: string;
  impact?: string;
  mitigation?: string;
};

export type SowKpi = { metric?: string; target?: string; tolerance?: string };

export type SowDocument = {
  project_metadata?: SowMetadata;
  objectives?: SowObjectives;
  scope?: SowScope;
  deliverables?: SowDeliverable[];
  timeline?: SowTimeline;
  resources?: SowResources;
  commercials?: SowCommercials;
  compliance?: SowCompliance;
  risks?: SowRisk[];
  kpis?: SowKpi[];
};

/** Answers gathered by the (separate) interview, keyed by question key. */
export type InterviewAnswers = Record<string, string>;

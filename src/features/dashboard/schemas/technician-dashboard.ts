/**
 * Technician home-dashboard shapes — GET /technicians/me/dashboard. Powers the SP
 * tracking dashboard (KPI row + active projects + next payments + recent bids +
 * earnings chart). Mirrors the iOS `TechnicianDashboardModels.swift` (backend-
 * integration reference only), but the field names below are the ones VERIFIED live
 * on the dev backend (technician 444) — the payload is snake_case end to end.
 *
 * Permissive by hard rule 1: every field optional + nullable, status modelled as a
 * widening union (never a `z.enum`), so a backend tweak never surfaces as a
 * misleading "Something went wrong". No request body → no zod schema here.
 */

/** A bid/phase/project status from the backend. Widening union, not a `z.enum`. */
export type DashboardStatus = string & {};

/** The signed-in technician identity echoed back by the dashboard. */
export type DashboardTechnician = {
  id?: number | null;
  name?: string | null;
  phone?: string | null;
  email?: string | null;
};

/** Headline KPI counters. `*_sar` are money totals; `win_rate` is 0–1. */
export type TechnicianDashboardSummary = {
  active_projects?: number | null;
  completed_projects?: number | null;
  total_projects?: number | null;
  pending_phase_payments?: number | null;
  total_earned_sar?: number | null;
  total_pending_sar?: number | null;
  open_bids?: number | null;
  won_bids?: number | null;
  submitted_bids?: number | null;
  win_rate?: number | null;
  subscription_days_left?: number | null;
};

/** The customer who owns an active project. */
export type DashboardProjectOwner = {
  id?: number | null;
  name?: string | null;
  phone?: string | null;
};

/** One row of `active_projects[]` — a project the technician is executing. */
export type TechnicianDashboardProject = {
  id: number;
  title?: string | null;
  status?: DashboardStatus | null;
  owner?: DashboardProjectOwner | null;
  phases_total?: number | null;
  phases_completed?: number | null;
  /** 0–1 fraction; render as `progress_pct * 100`. */
  progress_pct?: number | null;
  next_phase_due?: string | null;
  value_sar?: number | null;
  paid_sar?: number | null;
  outstanding_sar?: number | null;
};

/** Lifecycle timestamps on a next-payment phase; all optional + nullable. */
export type DashboardPaymentTimestamps = {
  created_at?: string | null;
  updated_at?: string | null;
  technician_finished_at?: string | null;
  user_confirmed_completion_at?: string | null;
  payment_requested_at?: string | null;
  paid_at?: string | null;
  paused_at?: string | null;
  stopped_at?: string | null;
  interrupted_at?: string | null;
};

/** One row of `next_payments[]` — a phase awaiting/owed payment. */
export type TechnicianDashboardNextPayment = {
  id: number;
  project_id?: number | null;
  project_title?: string | null;
  phase_number?: number | null;
  description?: string | null;
  money_spent?: number | null;
  amount_paid?: number | null;
  remaining?: number | null;
  requested_payment_amount?: number | null;
  payment_request_reason?: string | null;
  payment_status_raw?: DashboardStatus | null;
  status?: DashboardStatus | null;
  approved?: boolean | null;
  completed?: boolean | null;
  time_spent_days?: number | null;
  status_reason?: string | null;
  user_confirmed_completion?: boolean | null;
  timestamps?: DashboardPaymentTimestamps | null;
};

/** One row of `recent_bids[]` — a bid the technician submitted. */
export type TechnicianDashboardBid = {
  id: number;
  project_id?: number | null;
  project_title?: string | null;
  project_status?: DashboardStatus | null;
  amount_sar?: number | null;
  comment?: string | null;
  estimated_duration_days?: number | null;
  status?: DashboardStatus | null;
  submitted_at?: string | null;
};

/** One `earnings_chart.monthly[]` point: `month` is `YYYY-MM`. */
export type DashboardEarningsPoint = { month?: string | null; earned?: number | null };

/** The earnings sparkline series. */
export type TechnicianEarningsChart = { monthly?: DashboardEarningsPoint[] | null };

/**
 * GET /technicians/me/dashboard. The arrays are guaranteed present (defaulted to
 * `[]`) by {@link normalizeTechnicianDashboard} so the UI never guards for `null`.
 */
export type TechnicianDashboard = {
  technician: DashboardTechnician | null;
  summary: TechnicianDashboardSummary;
  active_projects: TechnicianDashboardProject[];
  next_payments: TechnicianDashboardNextPayment[];
  recent_bids: TechnicianDashboardBid[];
  earnings_chart: TechnicianEarningsChart;
};

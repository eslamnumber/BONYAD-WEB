import type { MyProject } from '../schemas/project';
import type { ProjectPhase } from '../schemas/project-phase';

import { phaseRemaining } from './phase-payment';
import { paidSoFar, paymentState, progressPercent } from './project-finance';
import { statusVariant } from './project-status';

/**
 * Customer dashboard view-model, derived entirely from the one `/projects/my` list —
 * there is NO customer dashboard endpoint (only `/technicians/me/dashboard`). The KPI
 * counters and the four section buckets reuse the same finance helpers the in-progress
 * detail screens use ({@link paymentState} / {@link phaseRemaining} / {@link paidSoFar}
 * / {@link progressPercent}), so the dashboard and the detail screens can never disagree.
 * The two money figures fall back to 0 when the list omits per-phase payment fields —
 * honest, never fabricated.
 */
export type CustomerKpis = {
  /** Outstanding payment requested across in-progress phases (SAR). */
  dueNow: number;
  /** Settled phase amounts across every project (SAR). */
  paidSoFar: number;
  activeProjects: number;
  openRequests: number;
};

export type CustomerPaymentState = 'due' | 'upcoming' | 'paid';

/** One phase surfaced in the dashboard payments section. */
export type CustomerPaymentItem = {
  projectId: number;
  phaseId: number;
  title?: string;
  serviceNameEn?: string;
  serviceNameAr?: string;
  phaseNumber?: number;
  amount: number;
  state: CustomerPaymentState;
};

/** An in-progress project with derived phase progress for the active-projects section. */
export type CustomerActiveProject = {
  project: MyProject;
  done: number;
  total: number;
  pct: number;
};

export type CustomerDashboardData = {
  kpis: CustomerKpis;
  payments: CustomerPaymentItem[];
  requests: MyProject[];
  contracts: MyProject[];
  activeProjects: CustomerActiveProject[];
};

/** Due first, then upcoming, then settled — the section's render order. */
const STATE_ORDER: Record<CustomerPaymentState, number> = { due: 0, upcoming: 1, paid: 2 };

/** Collapse the finance lib's state onto the dashboard's pill vocabulary. */
function toCustomerState(phase: ProjectPhase): CustomerPaymentState {
  const state = paymentState(phase.paymentStatus);
  if (state === 'paid') return 'paid';
  if (state === 'awaiting') return 'due';
  return 'upcoming';
}

function toPaymentItem(project: MyProject, phase: ProjectPhase): CustomerPaymentItem {
  const state = toCustomerState(phase);
  return {
    projectId: project.id,
    phaseId: phase.id,
    title: project.title,
    serviceNameEn: project.serviceNameEn,
    serviceNameAr: project.serviceNameAr,
    phaseNumber: phase.phaseNumber,
    amount: state === 'paid' ? (phase.moneySpent ?? 0) : phaseRemaining(phase),
    state,
  };
}

/** Active projects' phases as dashboard payment rows, due first. */
function buildPayments(active: MyProject[]): CustomerPaymentItem[] {
  return active
    .flatMap((project) => (project.phases ?? []).map((phase) => toPaymentItem(project, phase)))
    .sort((a, b) => STATE_ORDER[a.state] - STATE_ORDER[b.state]);
}

function toActiveProject(project: MyProject): CustomerActiveProject {
  const phases = project.phases ?? [];
  const done = phases.filter((p) => paymentState(p.paymentStatus) === 'paid').length;
  return { project, done, total: phases.length, pct: progressPercent(phases) };
}

/** A pending/bidding project — a still-open price-quote request. */
function isRequest(project: MyProject): boolean {
  const variant = statusVariant(project.status);
  return variant === 'pending' || variant === 'bidReceived';
}

export function buildCustomerDashboard(projects: MyProject[]): CustomerDashboardData {
  const active = projects.filter((p) => statusVariant(p.status) === 'inProgress');
  const requests = projects.filter(isRequest);
  const contracts = projects.filter((p) => statusVariant(p.status) === 'contractSigning');
  const payments = buildPayments(active);

  const dueNow = payments.reduce((sum, p) => (p.state === 'due' ? sum + p.amount : sum), 0);
  const totalPaid = projects.reduce((sum, p) => sum + paidSoFar(p.phases ?? []), 0);

  return {
    kpis: {
      dueNow,
      paidSoFar: totalPaid,
      activeProjects: active.length,
      openRequests: requests.length,
    },
    payments,
    requests,
    contracts,
    activeProjects: active.map(toActiveProject),
  };
}

import { describe, expect, it } from 'vitest';

import type { MyProject } from '../schemas/project';
import type { ProjectPhase } from '../schemas/project-phase';

import { buildCustomerDashboard } from './customer-dashboard';

const phase = (over: Partial<ProjectPhase> = {}): ProjectPhase => ({ id: 1, ...over });
const project = (over: Partial<MyProject> = {}): MyProject => ({ id: 1, ...over });

const PROJECTS: MyProject[] = [
  project({
    id: 10,
    status: 'IN_PROGRESS',
    title: 'Villa',
    serviceNameEn: 'Build',
    phases: [
      phase({ id: 101, phaseNumber: 1, paymentStatus: 'PAID', moneySpent: 1000 }),
      phase({ id: 102, phaseNumber: 2, paymentStatus: 'REQUESTED_PAYMENT', remainingAmount: 500 }),
      phase({ id: 103, phaseNumber: 3, paymentStatus: 'PENDING', remainingAmount: 700 }),
    ],
  }),
  project({ id: 11, status: 'PENDING', title: 'Kitchen' }),
  project({ id: 12, status: 'BID_RECEIVED', title: 'Bath' }),
  project({ id: 13, status: 'CONTRACT_SIGNING', title: 'Roof' }),
  project({
    id: 14,
    status: 'COMPLETED',
    phases: [phase({ id: 141, paymentStatus: 'PAID', moneySpent: 2000 })],
  }),
];

describe('buildCustomerDashboard', () => {
  const data = buildCustomerDashboard(PROJECTS);

  it('buckets projects by status', () => {
    expect(data.activeProjects.map((a) => a.project.id)).toEqual([10]);
    expect(data.requests.map((p) => p.id)).toEqual([11, 12]);
    expect(data.contracts.map((p) => p.id)).toEqual([13]);
  });

  it('derives the four KPI counters', () => {
    expect(data.kpis).toEqual({
      activeProjects: 1,
      openRequests: 2,
      paidSoFar: 3000, // 1000 (phase 101) + 2000 (phase 141)
      dueNow: 500, // only the REQUESTED_PAYMENT phase counts
    });
  });

  it('builds payment rows from active phases, due first then upcoming then paid', () => {
    expect(data.payments.map((p) => [p.phaseId, p.state, p.amount])).toEqual([
      [102, 'due', 500],
      [103, 'upcoming', 700],
      [101, 'paid', 1000],
    ]);
  });

  it('derives per-active-project phase progress', () => {
    expect(data.activeProjects[0]).toMatchObject({ done: 1, total: 3, pct: 33 });
  });
});

describe('buildCustomerDashboard edge cases', () => {
  it('returns zeroed KPIs and empty buckets for no projects', () => {
    const data = buildCustomerDashboard([]);
    expect(data.kpis).toEqual({ dueNow: 0, paidSoFar: 0, activeProjects: 0, openRequests: 0 });
    expect(data.payments).toEqual([]);
    expect(data.activeProjects).toEqual([]);
  });

  it('falls back to moneySpent − amountPaid when remainingAmount is absent', () => {
    const data = buildCustomerDashboard([
      project({
        id: 20,
        status: 'IN_PROGRESS',
        phases: [
          phase({ id: 201, paymentStatus: 'PARTIALLY_PAID', moneySpent: 1000, amountPaid: 300 }),
        ],
      }),
    ]);
    expect(data.payments[0]).toMatchObject({ state: 'due', amount: 700 });
    expect(data.kpis.dueNow).toBe(700);
  });

  it('treats a project with no phases as zero progress', () => {
    const data = buildCustomerDashboard([project({ id: 30, status: 'IN_PROGRESS' })]);
    expect(data.activeProjects[0]).toMatchObject({ done: 0, total: 0, pct: 0 });
    expect(data.payments).toEqual([]);
  });
});

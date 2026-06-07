import { beforeAll, describe, expect, it } from 'vitest';
import { axe } from 'vitest-axe';

import { i18n } from '@/lib/i18n';
import { renderWithProviders, screen } from '@/testing/render';

import type { ProjectDetail } from '../../schemas/project';

import { ProjectSummaryCard } from './project-summary-card';

beforeAll(async () => {
  await i18n.changeLanguage('en');
});

const FULL: ProjectDetail = {
  id: 1,
  userName: 'Ahmed',
  serviceNameEn: 'Construction',
  serviceNameAr: 'البناء',
  address: 'Riyadh',
  budget: 80000,
  budgetMin: 50000,
  budgetMax: 80000,
  timeRequiredDays: 360,
  expectedStartDate: '2026-08-01T00:00:00Z',
  offersCount: 7,
  createdAt: new Date().toISOString(),
};

describe('ProjectSummaryCard', () => {
  it('renders the client, service badge + title, and formatted stats', () => {
    renderWithProviders(<ProjectSummaryCard project={FULL} />);
    expect(screen.getByText('Ahmed')).toBeInTheDocument();
    expect(screen.getAllByText('Construction').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('7 offers')).toBeInTheDocument();
    expect(screen.getByText('12 months')).toBeInTheDocument();
    expect(screen.getByText('50,000 - 80,000')).toBeInTheDocument();
  });

  it('falls back to "—" for stats with no backing field', () => {
    renderWithProviders(<ProjectSummaryCard project={{ id: 2, userName: 'X' }} />);
    expect(screen.getAllByText('—').length).toBeGreaterThanOrEqual(3);
  });

  it('has no a11y violations', async () => {
    const { container } = renderWithProviders(<ProjectSummaryCard project={FULL} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});

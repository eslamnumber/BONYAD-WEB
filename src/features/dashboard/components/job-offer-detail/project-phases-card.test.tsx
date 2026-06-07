import { http, HttpResponse } from 'msw';
import { beforeAll, describe, expect, it } from 'vitest';
import { axe } from 'vitest-axe';

import { i18n } from '@/lib/i18n';
import { server } from '@/testing/handlers/server';
import { renderWithProviders, screen } from '@/testing/render';

import { ProjectPhasesCard } from './project-phases-card';

beforeAll(async () => {
  await i18n.changeLanguage('en');
});

describe('ProjectPhasesCard', () => {
  it('renders the phases timeline from PHASES.LIST', async () => {
    server.use(
      http.get('*/phases/project/:projectId', () =>
        HttpResponse.json([
          {
            id: 1,
            phaseNumber: 1,
            description: 'Foundations',
            expectedDate: '2026-09-01T00:00:00Z',
          },
          { id: 2, phaseNumber: 2, description: 'Structure' },
        ]),
      ),
    );
    renderWithProviders(<ProjectPhasesCard projectId={1} />);
    expect(await screen.findByText('Foundations')).toBeInTheDocument();
    expect(screen.getByText('Structure')).toBeInTheDocument();
    expect(screen.getByText('Expected date: September 2026')).toBeInTheDocument();
  });

  it('shows the empty state when there are no phases', async () => {
    server.use(http.get('*/phases/project/:projectId', () => HttpResponse.json([])));
    renderWithProviders(<ProjectPhasesCard projectId={1} />);
    expect(await screen.findByText('No phases defined yet.')).toBeInTheDocument();
  });

  it('shows the error state on failure', async () => {
    server.use(
      http.get('*/phases/project/:projectId', () => HttpResponse.json({}, { status: 500 })),
    );
    renderWithProviders(<ProjectPhasesCard projectId={1} />);
    expect(await screen.findByText("Couldn't load phases.")).toBeInTheDocument();
  });

  it('has no a11y violations', async () => {
    server.use(
      http.get('*/phases/project/:projectId', () =>
        HttpResponse.json([{ id: 1, phaseNumber: 1, description: 'Foundations' }]),
      ),
    );
    const { container } = renderWithProviders(<ProjectPhasesCard projectId={1} />);
    await screen.findByText('Foundations');
    expect(await axe(container)).toHaveNoViolations();
  });
});

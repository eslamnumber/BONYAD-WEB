import { beforeAll, describe, expect, it } from 'vitest';
import { axe } from 'vitest-axe';

import { i18n } from '@/lib/i18n';
import { renderWithProviders, screen } from '@/testing/render';

import { ProjectDescriptionCard } from './project-description-card';

beforeAll(async () => {
  await i18n.changeLanguage('en');
});

describe('ProjectDescriptionCard', () => {
  it('renders the description text and category chips', () => {
    renderWithProviders(
      <ProjectDescriptionCard
        project={{ id: 1, description: 'A two-line\nbrief.', requirements: ['Concrete', 'Wiring'] }}
      />,
    );
    expect(screen.getByText(/A two-line/)).toBeInTheDocument();
    expect(screen.getByText('Concrete')).toBeInTheDocument();
    expect(screen.getByText('Wiring')).toBeInTheDocument();
  });

  it('shows the empty fallback and no chips when both are absent', () => {
    renderWithProviders(<ProjectDescriptionCard project={{ id: 2 }} />);
    expect(screen.getByText('No description provided.')).toBeInTheDocument();
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });

  it('has no a11y violations', async () => {
    const { container } = renderWithProviders(
      <ProjectDescriptionCard project={{ id: 1, description: 'Brief.', requirements: ['A'] }} />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});

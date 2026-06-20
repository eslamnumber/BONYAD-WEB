import type { SVGProps } from 'react';
import { describe, expect, it } from 'vitest';
import { axe } from 'vitest-axe';

import { renderWithProviders, screen } from '@/testing/render';

import { CreationOptionCard } from './creation-option-card';

function TestIcon(props: SVGProps<SVGSVGElement>) {
  return <svg data-testid="icon" {...props} />;
}

const BASE = {
  Icon: TestIcon,
  title: 'New project',
  subtitle: 'Manual or AI-assisted',
  accentText: 'text-create-option-blue',
  glowBg: 'bg-create-option-blue',
};

describe('CreationOptionCard', () => {
  it('renders an active option as a link to its href, with no coming-soon badge', () => {
    renderWithProviders(<CreationOptionCard {...BASE} href="/dashboard/projects/new" />);

    const link = screen.getByRole('link', { name: /new project/i });
    expect(link).toHaveAttribute('href', '/dashboard/projects/new');
    expect(screen.getByText('Manual or AI-assisted')).toBeInTheDocument();
    expect(screen.queryByText('Coming soon')).not.toBeInTheDocument();
  });

  it('renders an inert option (no href) as a non-link carrying the coming-soon badge', () => {
    renderWithProviders(
      <CreationOptionCard
        {...BASE}
        title="Quick task"
        subtitle="A fast service request"
        comingSoonLabel="Coming soon"
      />,
    );

    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    expect(screen.getByText('Quick task')).toBeInTheDocument();
    expect(screen.getByText('Coming soon')).toBeInTheDocument();
  });

  it('marks the icon decorative (aria-hidden)', () => {
    renderWithProviders(<CreationOptionCard {...BASE} href="/dashboard/projects/new" />);
    expect(screen.getByTestId('icon')).toHaveAttribute('aria-hidden');
  });

  it('has no axe violations for both the active and inert states', async () => {
    const { container } = renderWithProviders(
      <ul>
        <li>
          <CreationOptionCard {...BASE} href="/dashboard/projects/new" />
        </li>
        <li>
          <CreationOptionCard
            {...BASE}
            title="Quick task"
            subtitle="A fast service request"
            comingSoonLabel="Coming soon"
          />
        </li>
      </ul>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});

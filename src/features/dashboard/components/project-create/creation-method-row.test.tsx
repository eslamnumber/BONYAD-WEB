import type { SVGProps } from 'react';
import { describe, expect, it } from 'vitest';
import { axe } from 'vitest-axe';

import { renderWithProviders, screen } from '@/testing/render';

import { CreationMethodRow } from './creation-method-row';

function TestIcon(props: SVGProps<SVGSVGElement>) {
  return <svg data-testid="icon" {...props} />;
}

describe('CreationMethodRow', () => {
  it('renders the active (manual) row as a link to its href', () => {
    renderWithProviders(
      <CreationMethodRow
        variant="manual"
        Icon={TestIcon}
        title="Fill in manually"
        subtitle="Fill in all the project details yourself"
        href="/dashboard/projects/new"
      />,
    );

    expect(screen.getByRole('link', { name: /fill in manually/i })).toHaveAttribute(
      'href',
      '/dashboard/projects/new',
    );
    expect(screen.getByText('Fill in all the project details yourself')).toBeInTheDocument();
  });

  it('renders the inert (AI) row as a non-link carrying its beta badge', () => {
    renderWithProviders(
      <CreationMethodRow
        variant="ai"
        Icon={TestIcon}
        title="Let Omda build your project"
        subtitle="Your smart project assistant"
        badge="Beta · First release"
      />,
    );

    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    expect(screen.getByText('Beta · First release')).toBeInTheDocument();
    expect(screen.getByText('Let Omda build your project')).toBeInTheDocument();
  });

  it('marks the option icon decorative (aria-hidden)', () => {
    renderWithProviders(
      <CreationMethodRow variant="manual" Icon={TestIcon} title="t" subtitle="s" href="/x" />,
    );
    expect(screen.getByTestId('icon')).toHaveAttribute('aria-hidden');
  });

  it('has no axe violations for both the active and inert rows', async () => {
    const { container } = renderWithProviders(
      <div>
        <CreationMethodRow variant="ai" Icon={TestIcon} title="AI" subtitle="s" badge="Beta" />
        <CreationMethodRow variant="manual" Icon={TestIcon} title="Manual" subtitle="s" href="/x" />
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});

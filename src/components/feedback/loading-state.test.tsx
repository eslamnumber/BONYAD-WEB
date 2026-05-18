import { describe, expect, it } from 'vitest';
import { axe } from 'vitest-axe';

import { renderWithProviders } from '@/testing/render';

import { LoadingState } from './loading-state';

describe('LoadingState', () => {
  it('renders a polite live region announcing the loading state', () => {
    const { getByRole, getByText } = renderWithProviders(<LoadingState label="Loading…" />);

    const status = getByRole('status');
    expect(status).toBeInTheDocument();
    expect(status.getAttribute('aria-live')).toBe('polite');
    expect(getByText('Loading…')).toBeInTheDocument();
  });

  it('has no axe-core accessibility violations', async () => {
    const { container } = renderWithProviders(<LoadingState label="Loading…" />);
    expect(await axe(container)).toHaveNoViolations();
  });
});

import { beforeAll, describe, expect, it } from 'vitest';
import { axe } from 'vitest-axe';

import { i18n } from '@/lib/i18n';
import { renderWithProviders, screen } from '@/testing/render';

import { AttachmentsCard } from './attachments-card';

beforeAll(async () => {
  await i18n.changeLanguage('en');
});

describe('AttachmentsCard', () => {
  it('renders a download link per file with the derived name', () => {
    renderWithProviders(
      <AttachmentsCard
        project={{ id: 1, files: ['projects/1/blueprint.pdf', 'https://x.test/spec.pdf'] }}
      />,
    );
    const blueprint = screen.getByRole('link', { name: /blueprint\.pdf/ });
    expect(blueprint).toHaveAttribute('href', expect.stringContaining('blueprint.pdf'));
    expect(screen.getByRole('link', { name: /spec\.pdf/ })).toHaveAttribute(
      'href',
      'https://x.test/spec.pdf',
    );
  });

  it('shows the empty state when there are no files', () => {
    renderWithProviders(<AttachmentsCard project={{ id: 2, files: [] }} />);
    expect(screen.getByText('No attachments.')).toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('has no a11y violations', async () => {
    const { container } = renderWithProviders(
      <AttachmentsCard project={{ id: 1, files: ['projects/1/blueprint.pdf'] }} />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});

import { beforeAll, describe, expect, it } from 'vitest';
import { axe } from 'vitest-axe';

import { i18n } from '@/lib/i18n';
import { renderWithProviders, screen } from '@/testing/render';

import { ProjectImagesCard } from './project-images-card';

beforeAll(async () => {
  await i18n.changeLanguage('en');
});

describe('ProjectImagesCard', () => {
  it('renders a thumbnail link per image with a numbered alt label', () => {
    renderWithProviders(
      <ProjectImagesCard images={['projects/1/site.jpg', 'https://x.test/after.png']} />,
    );
    expect(screen.getByRole('link', { name: 'Project image 1' })).toHaveAttribute(
      'href',
      expect.stringContaining('site.jpg'),
    );
    expect(screen.getByRole('link', { name: 'Project image 2' })).toHaveAttribute(
      'href',
      'https://x.test/after.png',
    );
  });

  it('shows the empty state when there are no images', () => {
    renderWithProviders(<ProjectImagesCard images={[]} />);
    expect(screen.getByText('No images yet.')).toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('has no a11y violations', async () => {
    const { container } = renderWithProviders(
      <ProjectImagesCard images={['projects/1/site.jpg']} />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});

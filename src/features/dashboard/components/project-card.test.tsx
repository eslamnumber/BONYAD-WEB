import { beforeAll, describe, expect, it } from 'vitest';
import { axe } from 'vitest-axe';

import { i18n } from '@/lib/i18n';
import { renderWithProviders, screen } from '@/testing/render';

import type { Project } from '../schemas/project';

import { ProjectCard } from './project-card';

beforeAll(async () => {
  await i18n.changeLanguage('en');
});

const PROJECT: Project = {
  id: 1,
  serviceNameEn: 'Renovation',
  title: 'Public garden redesign',
  description: 'Looking for a designer and contractor.',
  budget: 800000,
  address: 'Riyadh',
  timeRequiredDays: 84,
  files: [],
  status: 'PENDING',
};

describe('ProjectCard', () => {
  it('renders the title, compact budget, duration and location', () => {
    renderWithProviders(<ProjectCard project={PROJECT} />);
    expect(screen.getByText('Public garden redesign')).toBeInTheDocument();
    expect(screen.getByText('800K')).toBeInTheDocument();
    expect(screen.getByText('12 weeks')).toBeInTheDocument();
    expect(screen.getByText('Riyadh')).toBeInTheDocument();
  });

  it('falls back to a generic title when none is provided', () => {
    renderWithProviders(<ProjectCard project={{ id: 2, files: [] }} />);
    expect(screen.getByText('Project')).toBeInTheDocument();
  });

  it('has no a11y violations', async () => {
    const { container } = renderWithProviders(<ProjectCard project={PROJECT} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});

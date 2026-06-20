import { describe, expect, it } from 'vitest';
import { axe } from 'vitest-axe';

import { fireEvent, renderWithProviders, screen } from '@/testing/render';

import { CreateProjectTips } from './create-project-tips';

const TRIGGER = /learn how to create a good project/i;

describe('CreateProjectTips', () => {
  it('opens the tips dialog from the help link and lists the tips', () => {
    renderWithProviders(<CreateProjectTips locale="en" />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: TRIGGER }));

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Tips for a great project' })).toBeInTheDocument();
    expect(screen.getByText(/set a realistic budget and timeline/i)).toBeInTheDocument();
  });

  it('closes the dialog via the "Got it" button', () => {
    renderWithProviders(<CreateProjectTips locale="en" />);
    fireEvent.click(screen.getByRole('button', { name: TRIGGER }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Got it' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('has no axe violations while the dialog is open', async () => {
    const { baseElement } = renderWithProviders(<CreateProjectTips locale="en" />);
    fireEvent.click(screen.getByRole('button', { name: TRIGGER }));
    // `region` disabled: the help-link wrapper's landmark is supplied by the page, not this leaf.
    expect(await axe(baseElement, { rules: { region: { enabled: false } } })).toHaveNoViolations();
  });
});

import { describe, expect, it } from 'vitest';

import { i18n } from '@/lib/i18n';
import { renderWithProviders, screen } from '@/testing/render';

import type { ProjectPhase } from '../../schemas/project-phase';

import { ChangeRequestForm } from './change-request-form';

const PHASES: ProjectPhase[] = [
  {
    id: 1,
    phaseNumber: 1,
    title: 'Foundations',
    description: 'Footings',
    timeSpentDays: 10,
    moneySpent: 25000,
  },
];

const noop = () => undefined;

function renderForm() {
  renderWithProviders(
    <ChangeRequestForm
      projectId={5}
      isTechnician={false}
      viewer={{}}
      phases={PHASES}
      onClose={noop}
    />,
  );
}

/**
 * The "what you'd like to change" field is single-language free text, so it uses
 * the locale's writing direction — `dir="auto"` would default the empty field to
 * LTR under the inverted map, anchoring the Arabic placeholder/caret to the left.
 */
describe('ChangeRequestForm — description field direction', () => {
  it('writes rtl in ar so the empty field anchors to the right', async () => {
    await i18n.changeLanguage('ar');
    renderForm();
    expect(screen.getByLabelText('ما ترغب في تغييره')).toHaveAttribute('dir', 'rtl');
  });

  it('writes ltr in en', async () => {
    await i18n.changeLanguage('en');
    renderForm();
    expect(screen.getByLabelText("What you'd like to change")).toHaveAttribute('dir', 'ltr');
  });
});

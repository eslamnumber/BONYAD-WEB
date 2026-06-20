import { describe, expect, it } from 'vitest';
import { axe } from 'vitest-axe';

import { fireEvent, renderWithProviders, screen } from '@/testing/render';

import { OmdahInterview } from './omdah-interview';

function start() {
  fireEvent.click(screen.getByRole('button', { name: /let's start/i }));
}

describe('OmdahInterview', () => {
  it('opens on the intro screen, then reveals the chat after "Let\'s start"', () => {
    renderWithProviders(<OmdahInterview />);

    expect(screen.getByRole('heading', { name: /your smart assistant/i })).toBeInTheDocument();
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();

    start();

    expect(screen.getByText(/your bonyad assistant/i)).toBeInTheDocument();
    expect(screen.getByText(/what would you like to build or fix/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Send' })).toBeDisabled();
  });

  it('sends an answer as a user message and shows the next question', () => {
    renderWithProviders(<OmdahInterview />);
    start();

    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Bathroom reno' } });
    fireEvent.click(screen.getByRole('button', { name: 'Send' }));

    expect(screen.getByText('Bathroom reno')).toBeInTheDocument();
    expect(screen.getByText(/tell me a bit more/i)).toBeInTheDocument();
  });

  it('has no axe violations on the intro screen', async () => {
    const { container } = renderWithProviders(<OmdahInterview />);
    // `region` disabled: the landmark wrapper is supplied by the page, not this leaf.
    expect(await axe(container, { rules: { region: { enabled: false } } })).toHaveNoViolations();
  });
});

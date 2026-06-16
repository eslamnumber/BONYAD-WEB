import { zodResolver } from '@hookform/resolvers/zod';
import { http, HttpResponse } from 'msw';
import { useForm } from 'react-hook-form';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { i18n } from '@/lib/i18n';
import { server } from '@/testing/handlers/server';
import { fireEvent, renderWithProviders, screen, waitFor } from '@/testing/render';

import {
  createProjectFormSchema,
  defaultCreateProjectValues,
  type CreateProjectFormValues,
} from '../../schemas/create-project-form';

import { CreateProjectWizard } from './create-project-wizard';
import { StepAssignment } from './step-assignment';
import { StepBudget } from './step-budget';
import { StepLocation } from './step-location';
import { StepPhases } from './step-phases';
import { WizardProgressBar } from './wizard-progress-bar';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn() }),
  usePathname: () => '/dashboard/projects/new',
  useSearchParams: () => new URLSearchParams(),
}));

/** A throwaway RHF instance so each step can be exercised in isolation. */
function useTestForm() {
  return useForm<CreateProjectFormValues>({
    resolver: zodResolver(createProjectFormSchema),
    defaultValues: defaultCreateProjectValues(),
  });
}

function BudgetHarness() {
  return <StepBudget form={useTestForm()} />;
}
function PhasesHarness() {
  return <StepPhases form={useTestForm()} />;
}
function AssignmentHarness() {
  return <StepAssignment form={useTestForm()} />;
}
function LocationHarness() {
  return <StepLocation form={useTestForm()} />;
}

beforeAll(async () => {
  await i18n.changeLanguage('en');
});

// Component code runs in jsdom and fetches through the same-origin proxy
// (`/api/proxy/*`), so the picker + category lookups need wildcard handlers
// (the default handlers are bound to the absolute backend URL).
beforeEach(() => {
  server.use(
    http.get('*/services/categories', () =>
      HttpResponse.json([{ id: 1, nameEn: 'Construction', nameAr: 'البناء' }]),
    ),
    http.get('*/users/technicians', () =>
      HttpResponse.json([{ id: 1, name: 'خالد اليوسف', averageRating: 4.9 }]),
    ),
    http.get('*/regions', () => HttpResponse.json([{ id: 1, nameEn: 'Riyadh', nameAr: 'الرياض' }])),
  );
});

describe('WizardProgressBar', () => {
  it('renders six segments and fills from the inline-end (flex-row-reverse)', () => {
    const { container } = renderWithProviders(<WizardProgressBar currentStep={1} />);
    const bar = screen.getByRole('progressbar');
    expect(bar).toHaveAttribute('aria-valuenow', '2');
    expect(bar).toHaveAttribute('aria-valuemax', '6');
    expect(bar.className).toContain('flex-row-reverse');
    expect(container.querySelectorAll('span')).toHaveLength(6);
  });
});

describe('StepBudget', () => {
  it('shows timeline + budget + the no-budget toggle, which disables the budget field', () => {
    renderWithProviders(<BudgetHarness />);
    expect(screen.getByLabelText('Timeline')).toBeInTheDocument();
    const budget = screen.getByLabelText('Expected budget');
    expect(budget).not.toBeDisabled();
    fireEvent.click(screen.getByLabelText('No specified budget'));
    expect(budget).toBeDisabled();
  });
});

describe('StepPhases', () => {
  it('appends and removes phase rows', () => {
    renderWithProviders(<PhasesHarness />);
    expect(screen.getByText('Phase 1')).toBeInTheDocument();
    expect(screen.queryByText('Phase 2')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Add phase' }));
    expect(screen.getByText('Phase 2')).toBeInTheDocument();
    // With more than one phase every row is removable; drop the last.
    const removeButtons = screen.getAllByRole('button', { name: 'Remove phase' });
    fireEvent.click(removeButtons[removeButtons.length - 1] as HTMLElement);
    expect(screen.queryByText('Phase 2')).not.toBeInTheDocument();
  });
});

describe('StepAssignment', () => {
  it('opens the technician picker on direct assignment and records the choice', async () => {
    renderWithProviders(<AssignmentHarness />);
    fireEvent.click(screen.getByRole('radio', { name: /Direct assignment/i }));

    expect(await screen.findByText('Choose a technician')).toBeInTheDocument();
    const chooseButtons = await screen.findAllByRole('button', { name: 'Choose' });
    expect(chooseButtons.length).toBeGreaterThan(0);
    fireEvent.click(chooseButtons[0] as HTMLElement);

    expect(await screen.findByText(/Selected:/)).toBeInTheDocument();
    expect(screen.queryByText('Choose a technician')).not.toBeInTheDocument();
  });
});

describe('StepLocation', () => {
  it('lists regions from /regions and records the picked city', async () => {
    renderWithProviders(<LocationHarness />);
    const cityTrigger = screen.getByText('Choose the city').closest('button');
    await waitFor(() => expect(cityTrigger).toBeEnabled());
    fireEvent.click(cityTrigger as HTMLElement);
    fireEvent.click(await screen.findByRole('option', { name: 'Riyadh' }));
    expect(screen.getByText('Riyadh')).toBeInTheDocument();
  });
});

describe('CreateProjectWizard', () => {
  it('gates Next until project info is complete, then advances to budget (progress 2/6)', async () => {
    renderWithProviders(<CreateProjectWizard />);
    // Next is disabled until the step-0 required fields are filled.
    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled();

    const categoryTrigger = screen.getByText('Choose a category').closest('button');
    await waitFor(() => expect(categoryTrigger).toBeEnabled());
    fireEvent.click(categoryTrigger as HTMLElement);
    fireEvent.click(await screen.findByRole('option', { name: 'Construction' }));
    fireEvent.change(screen.getByLabelText('Project name'), { target: { value: 'Villa' } });

    // No field uses dir="auto" — trailing dots are handled by leading-punctuation copy.
    const description = screen.getByLabelText('Description');
    expect(description).not.toHaveAttribute('dir', 'auto');
    fireEvent.change(description, {
      target: { value: 'A detailed description of the villa project.' },
    });

    await waitFor(() => expect(screen.getByRole('button', { name: 'Next' })).toBeEnabled());
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));

    expect(await screen.findByText('Budget & timeline')).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '2');
  });
});

import { beforeAll, describe, expect, it } from 'vitest';

import { i18n } from '@/lib/i18n';
import { fireEvent, renderWithProviders, screen, waitFor } from '@/testing/render';

import type { MyProject } from '../../schemas/project';

import { CustomerSupervisorCell } from './customer-supervisor-cell';

beforeAll(async () => {
  await i18n.changeLanguage('en');
});

const project = (extra: Partial<MyProject>): MyProject => ({ id: 223, ...extra });

describe('CustomerSupervisorCell', () => {
  it('hireable → opens the picker and hires a technician, then closes', async () => {
    renderWithProviders(<CustomerSupervisorCell project={project({ canHireSupervisor: true })} />);

    fireEvent.click(screen.getByRole('button', { name: 'Hire supervisor' }));
    expect(await screen.findByText('Hire a supervisor')).toBeInTheDocument();

    const hireButtons = await screen.findAllByRole('button', { name: 'Hire' });
    const [firstHire] = hireButtons;
    if (!firstHire) throw new Error('expected at least one Hire button');
    fireEvent.click(firstHire);

    await waitFor(() => expect(screen.queryByText('Hire a supervisor')).not.toBeInTheDocument());
  });

  it('pending → shows the pending pill + supervisor name + cancel', () => {
    renderWithProviders(
      <CustomerSupervisorCell
        project={project({ supervisorStatus: 'INVITED', supervisorName: 'Ahmed' })}
      />,
    );
    expect(screen.getByText('Pending')).toBeInTheDocument();
    expect(screen.getByText('Ahmed')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
  });

  it('active → shows the supervising pill + remove (which opens the confirm dialog)', async () => {
    renderWithProviders(
      <CustomerSupervisorCell
        project={project({ supervisorStatus: 'ACTIVE', supervisorName: 'Sara' })}
      />,
    );
    expect(screen.getByText('Supervising')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Remove' }));
    expect(await screen.findByText('Remove supervisor?')).toBeInTheDocument();
  });

  it('none → renders a dash', () => {
    const { container } = renderWithProviders(
      <CustomerSupervisorCell project={project({ canHireSupervisor: false })} />,
    );
    expect(container.textContent).toContain('—');
  });
});

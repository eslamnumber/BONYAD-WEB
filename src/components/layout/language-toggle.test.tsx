import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { LOCALE_COOKIE_NAME } from '@/config/constants';
import { i18n } from '@/lib/i18n';
import { fireEvent, renderWithProviders, screen } from '@/testing/render';

import { LanguageToggle } from './language-toggle';

const { mockRefresh } = vi.hoisted(() => ({ mockRefresh: vi.fn() }));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: mockRefresh }),
}));

describe('LanguageToggle', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(i18n, 'changeLanguage').mockImplementation(async () => i18n.t);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders a button with the switchToLabel as visible text when no icon', () => {
    renderWithProviders(
      <LanguageToggle current="en" ariaLabel="Switch language" switchToLabel="العربية" />,
    );
    expect(screen.getByRole('button', { name: 'Switch language' })).toHaveTextContent('العربية');
  });

  it('switches locale from en to ar on click', () => {
    renderWithProviders(
      <LanguageToggle current="en" ariaLabel="Switch language" switchToLabel="العربية" />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Switch language' }));
    expect(i18n.changeLanguage).toHaveBeenCalledWith('ar');
  });

  it('switches locale from ar to en on click', () => {
    renderWithProviders(
      <LanguageToggle current="ar" ariaLabel="تغيير اللغة" switchToLabel="English" />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'تغيير اللغة' }));
    expect(i18n.changeLanguage).toHaveBeenCalledWith('en');
  });

  it('calls router.refresh() after toggling', () => {
    renderWithProviders(
      <LanguageToggle current="en" ariaLabel="Switch language" switchToLabel="العربية" />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Switch language' }));
    expect(mockRefresh).toHaveBeenCalledOnce();
  });

  it('sets the locale cookie on toggle', () => {
    renderWithProviders(
      <LanguageToggle current="en" ariaLabel="Switch language" switchToLabel="العربية" />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Switch language' }));
    expect(document.cookie).toContain(`${LOCALE_COOKIE_NAME}=ar`);
  });
});

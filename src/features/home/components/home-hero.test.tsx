import { createElement, forwardRef, type ComponentPropsWithRef, type ElementType } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { axe } from 'vitest-axe';

import { renderWithProviders, screen } from '@/testing/render';

import { HomeHero } from './home-hero';

// next/navigation's useRouter throws "invariant expected app router to be mounted"
// in the Vitest environment — mock it out so HeroToggle can render.
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn() }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
  useParams: () => ({}),
}));

// framer-motion injects SVG data-URIs as inline cursor styles which cause
// axe-core to crash on happy-dom (tries to use the URI as a CSS selector).
vi.mock('framer-motion', () => {
  function makeEl(tag: ElementType) {
    const Component = forwardRef(
      ({ animate: _a, initial: _i, exit: _e, transition: _t, ...rest }: ComponentPropsWithRef<ElementType>, ref) =>
        createElement(tag as string, { ...rest, ref }),
    );
    Component.displayName = `motion.${String(tag)}`;
    return Component;
  }
  function AnimatePresence({ children }: { children: React.ReactNode }) { return <>{children}</>; }
  function MotionConfig({ children }: { children: React.ReactNode }) { return <>{children}</>; }
  return {
    motion: new Proxy({} as Record<string, ReturnType<typeof makeEl>>, { get: (_, tag: string) => makeEl(tag as ElementType) }),
    AnimatePresence,
    MotionConfig,
  };
});

describe('HomeHero', () => {
  it('renders the main heading with translated text', () => {
    renderWithProviders(<HomeHero locale="en" />);
    expect(
      screen.getByRole('heading', { level: 1, name: /Find the right professional for your project/i }),
    ).toBeInTheDocument();
  });

  it('renders the tab toggle and search form', () => {
    renderWithProviders(<HomeHero locale="en" />);
    expect(screen.getByRole('tab', { name: 'Post a project' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Join as a pro' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Search' })).toBeInTheDocument();
  });

  it('renders Arabic heading when locale is ar', () => {
    renderWithProviders(<HomeHero locale="ar" />);
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading.textContent).toBeTruthy();
    expect(heading.textContent).not.toBe('home.hero.headline');
  });

  it('has no axe accessibility violations', async () => {
    const { container } = renderWithProviders(<HomeHero locale="en" />);
    expect(await axe(container)).toHaveNoViolations();
  });
});

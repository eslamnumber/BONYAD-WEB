import { describe, expect, it } from 'vitest';

import { ROUTES } from '@/config/routes';

import { CUSTOMER_NAV, SIDEBAR_NAV, TECHNICIAN_NAV, isNavActive } from './sidebar-nav-config';

describe('isNavActive', () => {
  it('activates the /dashboard item on the exact route', () => {
    expect(isNavActive('/dashboard', ROUTES.DASHBOARD)).toBe(true);
  });

  it('keeps the /dashboard item active on job-offer detail subpaths', () => {
    expect(isNavActive('/dashboard/job-offers/42', ROUTES.DASHBOARD)).toBe(true);
  });

  it('does not activate /dashboard for an unrelated sibling route', () => {
    expect(isNavActive('/dashboard/projects', ROUTES.DASHBOARD)).toBe(false);
  });

  it('matches a non-dashboard item on its exact route and nested subpaths', () => {
    expect(isNavActive('/dashboard/projects', ROUTES.DASHBOARD_PROJECTS)).toBe(true);
    expect(isNavActive('/dashboard/projects/7', ROUTES.DASHBOARD_PROJECTS)).toBe(true);
  });

  it('does not match a route that merely shares a prefix segment', () => {
    expect(isNavActive('/dashboard/projectsX', ROUTES.DASHBOARD_PROJECTS)).toBe(false);
  });
});

describe('sidebar nav config', () => {
  it('customer nav leads with Home and includes a badged Offers item', () => {
    expect(CUSTOMER_NAV[0]).toMatchObject({ key: 'home', href: ROUTES.DASHBOARD });
    expect(CUSTOMER_NAV.find((i) => i.key === 'offers')).toMatchObject({
      href: ROUTES.DASHBOARD_OFFERS,
      badge: true,
    });
  });

  it('technician nav leads with Job offers + Payments and has no Home/Offers items', () => {
    expect(TECHNICIAN_NAV[0]).toMatchObject({ key: 'jobOffers', href: ROUTES.DASHBOARD });
    expect(TECHNICIAN_NAV.some((i) => i.key === 'payments')).toBe(true);
    expect(TECHNICIAN_NAV.some((i) => i.key === 'home' || i.key === 'offers')).toBe(false);
  });

  it('exposes notifications as a drawer button (null href) in both variants', () => {
    for (const nav of [CUSTOMER_NAV, TECHNICIAN_NAV]) {
      expect(nav.find((i) => i.key === 'notifications')?.href).toBeNull();
    }
    expect(SIDEBAR_NAV.customer).toBe(CUSTOMER_NAV);
    expect(SIDEBAR_NAV.technician).toBe(TECHNICIAN_NAV);
  });
});

import { describe, expect, it } from 'vitest';

import { ROUTES } from '@/config/routes';

import { hasNavLink, parseAssistantNav } from './parse-assistant-nav';

describe('parseAssistantNav', () => {
  it('returns a single text segment when there are no markers', () => {
    expect(parseAssistantNav('مرحباً بك')).toEqual([{ type: 'text', value: 'مرحباً بك' }]);
  });

  it('turns a recognised token into a nav link and keeps the surrounding text', () => {
    const segments = parseAssistantNav('افتح [NAV:projects] الآن');
    expect(segments).toEqual([
      { type: 'text', value: 'افتح ' },
      { type: 'nav', href: ROUTES.DASHBOARD_PROJECTS, labelKey: 'assistant.nav.projects' },
      { type: 'text', value: ' الآن' },
    ]);
    expect(hasNavLink(segments)).toBe(true);
  });

  it('normalises case, dots and hyphens before resolving', () => {
    expect(parseAssistantNav('[NAV:how-it-works]')[0]).toMatchObject({
      type: 'nav',
      href: ROUTES.HOW_IT_WORKS,
    });
    expect(parseAssistantNav('[NAV:projects.map]')[0]).toMatchObject({
      type: 'nav',
      href: ROUTES.DASHBOARD_PROJECTS_MAP,
    });
    expect(parseAssistantNav('[NAV:changePhone]')[0]).toMatchObject({
      type: 'nav',
      href: ROUTES.DASHBOARD_SETTINGS_CHANGE_PHONE,
    });
  });

  it('captures an optional param', () => {
    const seg = parseAssistantNav('[NAV:projectsdetail:183]')[0];
    expect(seg).toMatchObject({ type: 'nav', href: ROUTES.DASHBOARD_PROJECTS, param: '183' });
  });

  it('strips an unrecognised marker to nothing (no broken link, text preserved)', () => {
    const segments = parseAssistantNav('جرّب [NAV:roomDesigner] القادم');
    expect(segments).toEqual([
      { type: 'text', value: 'جرّب ' },
      { type: 'text', value: ' القادم' },
    ]);
    expect(hasNavLink(segments)).toBe(false);
  });

  it('handles multiple tokens in one reply', () => {
    const segments = parseAssistantNav('[NAV:newProject] أو [NAV:support]');
    expect(segments.filter((s) => s.type === 'nav')).toEqual([
      {
        type: 'nav',
        href: ROUTES.DASHBOARD_PROJECTS_CREATE,
        labelKey: 'assistant.nav.createProject',
      },
      { type: 'nav', href: ROUTES.DASHBOARD_SETTINGS_SUPPORT, labelKey: 'assistant.nav.support' },
    ]);
  });
});

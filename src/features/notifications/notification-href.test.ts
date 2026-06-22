import { describe, expect, it } from 'vitest';

import { ROUTES } from '@/config/routes';

import { notificationHref } from './notification-href';
import { type Notification } from './schemas/notification';

const make = (overrides: Partial<Notification>): Notification => ({ id: 1, ...overrides });

describe('notificationHref', () => {
  it('routes any notification carrying a relatedProjectId to the project detail (customer)', () => {
    expect(notificationHref(make({ type: 'BID_RECEIVED', relatedProjectId: 42 }), 'USER')).toBe(
      ROUTES.DASHBOARD_PROJECT('42'),
    );
  });

  it('opens the job-offer detail for a technician opportunity notification', () => {
    expect(
      notificationHref(make({ type: 'PROJECT_CREATED', relatedProjectId: 7 }), 'TECHNICIAN'),
    ).toBe(ROUTES.DASHBOARD_JOB_OFFER('7'));
  });

  it('keeps a technician on the project detail for non-opportunity project notifications', () => {
    expect(
      notificationHref(make({ type: 'BID_ACCEPTED', relatedProjectId: 7 }), 'TECHNICIAN'),
    ).toBe(ROUTES.DASHBOARD_PROJECT('7'));
  });

  it('normalises backend role + type casing', () => {
    expect(
      notificationHref(make({ type: 'project_created', relatedProjectId: 7 }), 'technician'),
    ).toBe(ROUTES.DASHBOARD_JOB_OFFER('7'));
  });

  it('prefers the project detail over a payment fallback when a project id is present', () => {
    expect(
      notificationHref(make({ type: 'PHASE_PAYMENT_RECEIVED', relatedProjectId: 9 }), 'USER'),
    ).toBe(ROUTES.DASHBOARD_PROJECT('9'));
  });

  it.each([
    ['MESSAGE', ROUTES.DASHBOARD_MESSAGES],
    ['CHAT_MESSAGE', ROUTES.DASHBOARD_MESSAGES],
    ['SUBSCRIPTION_RENEWED', ROUTES.DASHBOARD_SETTINGS_SUBSCRIPTIONS],
    ['TICKET_UPDATED', ROUTES.DASHBOARD_SETTINGS_SUPPORT],
    ['SUPPORT_REQUEST_ASSIGNED', ROUTES.DASHBOARD_SETTINGS_SUPPORT],
    ['SLA_BREACH', ROUTES.DASHBOARD_SETTINGS_SUPPORT],
    ['REVIEW_RECEIVED', ROUTES.DASHBOARD_SETTINGS_PORTFOLIO],
    ['SUGGESTION_APPROVED', ROUTES.DASHBOARD_SETTINGS_SERVICES],
    ['PAYMENT_RECEIVED', ROUTES.DASHBOARD_PAYMENTS],
    ['REFUND_PROCESSED', ROUTES.DASHBOARD_PAYMENTS],
    ['ACCOUNT_VERIFIED', ROUTES.DASHBOARD_SETTINGS],
    ['PASSWORD_RESET_SUCCESS', ROUTES.DASHBOARD_SETTINGS],
    ['PROMOTION', ROUTES.DASHBOARD],
    ['REMINDER', ROUTES.DASHBOARD],
  ])('routes %s (no project id) to its matching hub', (type, expected) => {
    expect(notificationHref(make({ type }), 'USER')).toBe(expected);
  });

  it.each([['ADMIN_NOTIFICATION'], ['SYSTEM_ANNOUNCEMENT'], ['WARNING'], ['SOMETHING_UNKNOWN']])(
    'returns null for the informational/unknown type %s',
    (type) => {
      expect(notificationHref(make({ type }), 'USER')).toBeNull();
    },
  );

  it('returns null when there is neither a project id nor a recognised type', () => {
    expect(notificationHref(make({}), undefined)).toBeNull();
  });
});

import { describe, expect, it } from 'vitest';

import { type Notification } from './schemas/notification';
import { formatNotificationTime, notificationMessage, notificationTitle } from './utils';

const N: Notification = {
  id: 1,
  titleEn: 'Offer accepted',
  titleAr: 'تم قبول عرضك',
  messageEn: 'A new project is available.',
  messageAr: 'مشروع جديد متاح.',
};

describe('localized notification text', () => {
  it('picks the English fields for the en locale (rtl)', () => {
    expect(notificationTitle(N, 'en')).toBe('Offer accepted');
    expect(notificationMessage(N, 'en')).toBe('A new project is available.');
  });

  it('picks the Arabic fields for the ar locale (ltr, inverted mapping)', () => {
    expect(notificationTitle(N, 'ar')).toBe('تم قبول عرضك');
    expect(notificationMessage(N, 'ar')).toBe('مشروع جديد متاح.');
  });

  it('falls back to the single `title`/`message` when no localized pair exists', () => {
    const single: Notification = { id: 2, title: 'Plain title', message: 'Plain body' };
    expect(notificationTitle(single, 'en')).toBe('Plain title');
    expect(notificationMessage(single, 'ar')).toBe('Plain body');
  });

  it('returns an empty string when nothing is present', () => {
    expect(notificationTitle({ id: 3 }, 'en')).toBe('');
  });
});

describe('formatNotificationTime', () => {
  it('formats an ISO date with the Gregorian month + 24h time', () => {
    const out = formatNotificationTime('2026-10-15T13:00:00Z', 'en');
    expect(out).toMatch(/October/);
    expect(out).toMatch(/\d/);
  });

  it('returns an empty string for missing or invalid input', () => {
    expect(formatNotificationTime(undefined, 'en')).toBe('');
    expect(formatNotificationTime('not-a-date', 'en')).toBe('');
  });
});

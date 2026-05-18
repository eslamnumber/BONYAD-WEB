import '@testing-library/jest-dom/vitest';

import { cleanup } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, expect } from 'vitest';
import * as matchers from 'vitest-axe/matchers';

import { initI18n } from '@/lib/i18n';

import { server } from './handlers/server';

// vitest-axe matchers — `expect(...).toHaveNoViolations()`.
expect.extend(matchers);

// Boot i18n once with the default locale so `useTranslation()` works in tests.
initI18n('en');

// MSW lifecycle. `onUnhandledRequest: 'error'` makes tests fail loud on any
// network call we forgot to mock — far better than a silent hang.
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => {
  cleanup();
  server.resetHandlers();
});
afterAll(() => server.close());

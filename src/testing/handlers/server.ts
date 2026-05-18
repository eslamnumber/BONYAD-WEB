import { setupServer } from 'msw/node';

import { handlers } from './index';

/**
 * MSW Node server used by Vitest. Browser-mode MSW (for Playwright in-browser
 * mocking) is wired separately when needed.
 *
 * Lifecycle is owned by `src/testing/setup.ts`:
 *   - `beforeAll`: server.listen({ onUnhandledRequest: 'error' })
 *   - `afterEach`: server.resetHandlers()
 *   - `afterAll`:  server.close()
 */
export const server = setupServer(...handlers);

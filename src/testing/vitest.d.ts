/**
 * Type augmentations for custom Vitest matchers.
 *
 * `expect.extend(matchers)` in `setup.ts` adds the matchers at runtime, but
 * TypeScript needs explicit declarations for IDE + typecheck support.
 *
 * Currently registers:
 *   - `toHaveNoViolations()` from `vitest-axe/matchers`
 */

import 'vitest';

interface CustomMatchers<R = unknown> {
  toHaveNoViolations: () => R;
}

declare module 'vitest' {
  interface Assertion<T = unknown> extends CustomMatchers<T> {}
  interface AsymmetricMatchersContaining extends CustomMatchers {}
}

// File needs at least one top-level statement to be treated as a module.
export {};

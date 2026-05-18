# File size and complexity limits

## Why limits exist

Large files become god-files: hard to read, hard to test, hard to refactor. Hard limits force you to split _early_, before the design rots. Limits are enforced by ESLint and the CI pipeline — they can't be skipped.

## Hard limits

| Metric                               | Limit                                     | ESLint rule                        |
| ------------------------------------ | ----------------------------------------- | ---------------------------------- |
| Source file (`.ts`, `.tsx` non-test) | **200 lines** (excluding blank + comment) | `max-lines`                        |
| Test file (`.test.ts`, `.test.tsx`)  | **400 lines**                             | `max-lines` (override)             |
| Function / method                    | **50 lines**                              | `max-lines-per-function`           |
| Cyclomatic complexity                | **10**                                    | `complexity`                       |
| Function parameters                  | **4**                                     | `max-params` (use object for more) |
| Statement nesting depth              | **4**                                     | `max-depth`                        |
| Callback nesting                     | **3**                                     | `max-nested-callbacks`             |
| JSX nesting depth                    | **5**                                     | `react/jsx-max-depth`              |

Files that get a free pass (no `max-lines`):

- `src/styles/tokens.css` — the design-token file is allowed to be long; one variable per line.
- `src/locales/*.json` — translation files grow naturally with features.
- `src/config/endpoints.ts` — mirrors the RN endpoint list; not splittable without breaking the mirror.
- Generated files (if any from OpenAPI later).

## What to do when you hit a limit

### File too long

Find the secondary responsibility and extract:

- Multiple components in one file → one file each.
- Component + its hook → put the hook in `hooks/`.
- Component + its types → put types in `types/` or in a sibling schema file.
- Component + helper functions → put helpers in `utils/`.
- A big list/table component → extract `<Row />`, `<Header />`, `<EmptyState />`.

### Function too long

- Extract sub-functions with descriptive names.
- Replace conditional chains with a lookup table.
- Use early returns instead of nesting.

### Complexity too high

- Early returns instead of nested `if/else`.
- Lookup tables instead of `switch`.
- Extract a sub-function for each branch.

### Too many parameters

Bundle into a single options object **and type it**:

```ts
// ❌ Too many positional args
function createProject(
  title: string,
  description: string,
  regionId: string,
  serviceId: string,
  ownerId: string,
) {}

// ✅ Typed options object
type CreateProjectInput = {
  title: string;
  description: string;
  regionId: string;
  serviceId: string;
  ownerId: string;
};
function createProject(input: CreateProjectInput) {}
```

### Nesting too deep

Invert the condition and return early:

```ts
// ❌ Deep nesting
function handle(user) {
  if (user) {
    if (user.isActive) {
      if (user.hasPermission) {
        doThing();
      }
    }
  }
}

// ✅ Guard clauses
function handle(user) {
  if (!user) return;
  if (!user.isActive) return;
  if (!user.hasPermission) return;
  doThing();
}
```

## Don't game the limits

Don't split into meaningless `helpers-1.ts`, `helpers-2.ts`, `part-a.ts`, `part-b.ts` just to satisfy the linter. The point is **genuine cohesion**, not raw line count. Each split should have a clear name and a single responsibility.

If a file legitimately needs more lines (rare; usually the design is wrong), disable the rule on that one file with a comment explaining why, and expect pushback in review.

## ESLint config snippet

```js
// eslint.config.mjs
import sonarjs from 'eslint-plugin-sonarjs';

export default [
  {
    plugins: { sonarjs },
    rules: {
      'max-lines': ['error', { max: 200, skipBlankLines: true, skipComments: true }],
      'max-lines-per-function': ['error', { max: 50, skipBlankLines: true, skipComments: true }],
      complexity: ['error', 10],
      'max-params': ['error', 4],
      'max-depth': ['error', 4],
      'max-nested-callbacks': ['error', 3],
      'react/jsx-max-depth': ['error', { max: 5 }],
      'sonarjs/cognitive-complexity': ['error', 15],
    },
  },
  {
    files: ['**/*.test.ts', '**/*.test.tsx', 'e2e/**'],
    rules: { 'max-lines': ['error', { max: 400 }] },
  },
  {
    files: ['src/styles/tokens.css', 'src/locales/**', 'src/config/endpoints.ts'],
    rules: { 'max-lines': 'off' },
  },
];
```

## A simple way to think about it

If your file is approaching 200 lines, **the design is telling you something**. Take 5 minutes to find the extraction; don't just keep adding.

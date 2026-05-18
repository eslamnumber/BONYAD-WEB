# Components

## Three tiers

| Tier                 | Location                                     | What it is                                        | Allowed to know about                |
| -------------------- | -------------------------------------------- | ------------------------------------------------- | ------------------------------------ |
| **Primitive**        | `components/ui/`                             | shadcn/ui base components (Button, Input, Dialog) | Nothing app-specific — pure UI       |
| **Shared composite** | `components/{layout,feedback,data-display}/` | Reusable across features (AppShell, ErrorState)   | Primitives, design tokens            |
| **Feature**          | `features/X/components/`                     | Specific to one feature (ProjectCard, BidList)    | Everything the feature owns + shared |

## Hard rules

1. **One component per file.** Filename = kebab-case of the component (`project-card.tsx` exports `ProjectCard`).
2. **Props interface above the component, named `<Name>Props`.**
   ```tsx
   type ProjectCardProps = {
     project: Project;
     onEdit?: (id: string) => void;
   };
   export function ProjectCard({ project, onEdit }: ProjectCardProps) { … }
   ```
3. **Max 6 props.** More → split, use composition (children/slots), or pass an object.
4. **No `default` exports** except in `app/` route files. Everywhere else: named exports.
5. **No nested render functions.** If you wrote `const renderHeader = () => (…)`, extract `<ProjectCardHeader />`.
6. **No business logic in JSX.** Compute in a hook, pass result as a prop. JSX is presentation only.
7. **Default to Server Components.** Add `'use client'` only when the component uses hooks, state, browser APIs, or event handlers. Mark the boundary as close to the leaf as possible.
8. **No hardcoded text in JSX** — every user-facing string goes through `t('namespace.key')` (see [i18n-and-rtl.md](i18n-and-rtl.md)).
9. **No hardcoded colors / sizes / fonts in JSX.** Use Tailwind utilities backed by tokens (see [theming.md](theming.md)). `className="text-foreground bg-primary"` ✅. `style={{ color: '#000' }}` ❌.
10. **Loading and error states are required.** Every component that calls a query renders pending, error, empty, and success. Use `<LoadingState />`, `<ErrorState />`, `<EmptyState />` from `components/feedback/`.
11. **Wrap third-party components.** Never use `react-hot-toast` directly in features — import `toast` from `@/lib/toast`. Same for `lucide-react`, `next/link`, `next/image`.
12. **No "smart container" + "dumb presentational" split.** Colocate data fetching inside the component or its parent. The page or top feature component is the data orchestrator.

## SOLID applied to components

- **S — Single responsibility.** A component either _fetches_, _displays_, or _coordinates_. Not all three.
- **O — Open/closed.** Compose via `children` and slot props; don't add boolean flags that change rendering (`isCompact`, `isMobile`, `variant`-explosion). Two boolean flags = consider splitting.
- **L — Liskov.** Any component that takes a slot prop must accept any valid React node; don't narrow beyond `ReactNode` unless there's a real invariant.
- **I — Interface segregation.** Don't pass the whole `project` object if the component needs only `project.title`. Pass `title`. (Exception: when the parent already has the full object and the child is feature-local.)
- **D — Dependency inversion.** Components depend on hooks and props, never on global singletons or direct module-level `apiClient` calls. Calling `apiClient.get(...)` inside a component is a bug — call a query hook.

## When to extract a component

Extract when **any** of these is true:

- The piece is used in ≥2 places.
- The parent file is approaching 200 lines (see [file-size-limits.md](file-size-limits.md)).
- The piece has its own state, effect, or query.
- The piece would have a clear name on its own ("this is the `ProjectCardHeader`").

Do **not** extract just to make a file shorter when the resulting child has no meaningful identity.

# State management

## The hard split

| Kind of state                                                       | Tool                           | Lives in                                                |
| ------------------------------------------------------------------- | ------------------------------ | ------------------------------------------------------- |
| Data from the backend                                               | **TanStack Query**             | `features/X/api/*.ts` hooks                             |
| Cross-feature UI state (current user, theme, language, modal stack) | **Zustand** (global stores)    | `src/stores/`                                           |
| Feature-local UI state shared by ≥2 components                      | **Zustand** (feature store)    | `features/X/stores/`                                    |
| Single-component UI state                                           | **`useState` / `useReducer`**  | inline                                                  |
| URL state (filters, tabs, pagination, sort)                         | **`useSearchParams` + `nuqs`** | inline in the page/component                            |
| Form state                                                          | **react-hook-form**            | inline (see [forms-validation.md](forms-validation.md)) |
| Server Components data                                              | **fetch directly in the RSC**  | the page                                                |

## Rules

1. **Never store server data in Zustand.** If it came from an API, it lives in TanStack Query's cache.
2. **Never call `fetch` or `apiClient` inside a component.** Always go through a TanStack Query hook (`useProjects`, `useCreateProject`) defined in `features/X/api/`.
3. **One query, one file.** Naming: `get-projects.ts` exports the fetcher _and_ the hook.
4. **Mutation hooks invalidate, never manually update.** Default: `onSuccess: () => queryClient.invalidateQueries({ queryKey: [...] })`. Optimistic updates require an `onError` rollback.
5. **Query keys are factories, not inline arrays.** Each `api/` file exports an `xxxQueryKey()` function. Other files must use that factory — never re-write `['projects', filters]` by hand.
6. **`useState` is the default for UI state.** Only promote to Zustand when ≥2 sibling components need the same state and prop-drilling is awkward.
7. **URL is the source of truth for shareable state.** Filters, pagination, current tab → `useSearchParams`. Not Zustand.
8. **One global Zustand store per concern**, not one mega-store. Expected: `useAuthStore`, `useUiStore` (modal stack, toasts), `useLocaleStore`. Theme is owned by `next-themes`.
9. **Zustand stores expose actions, never raw setters.** ✅ `login(token, user)`. ❌ `setToken`, `setUser` as separate calls.
10. **No `useEffect` to sync server data to local state.** That's a query.

## Query hook template

```ts
// features/projects/api/get-projects.ts
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/config/endpoints';
import { projectListSchema, type Project } from '../schemas/project.schema';

export const projectsQueryKey = (filters?: ProjectFilters) => ['projects', filters] as const;

export async function getProjects(filters?: ProjectFilters): Promise<Project[]> {
  return apiClient.get(API_ENDPOINTS.PROJECTS.LIST, {
    params: filters,
    schema: projectListSchema,
  });
}

export function useProjects(filters?: ProjectFilters) {
  return useQuery({
    queryKey: projectsQueryKey(filters),
    queryFn: () => getProjects(filters),
  });
}
```

## Mutation hook template

```ts
// features/projects/api/create-project.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/config/endpoints';
import {
  createProjectRequestSchema,
  projectSchema,
  type CreateProjectRequest,
  type Project,
} from '../schemas/project.schema';

export async function createProject(input: CreateProjectRequest): Promise<Project> {
  const body = createProjectRequestSchema.parse(input);
  return apiClient.post(API_ENDPOINTS.PROJECTS.CREATE, { body, schema: projectSchema });
}

export function useCreateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createProject,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['projects'] }),
  });
}
```

## Loading + error rendering

Every data-driven component renders all four states (`pending`, `error`, `empty`, `success`). Use the `<DataState>` helper in `components/feedback/` to standardize:

```tsx
const query = useProjects();
return (
  <DataState query={query} empty={<EmptyState />}>
    {(projects) => projects.map((p) => <ProjectCard key={p.id} project={p} />)}
  </DataState>
);
```

Prefer this over `<Suspense>` boundaries unless you have a clear streaming/RSC reason.

# Naming conventions

## Reference table

| Thing               | Convention                                      | Example                            |
| ------------------- | ----------------------------------------------- | ---------------------------------- |
| Folder              | `kebab-case`                                    | `create-project-form/`             |
| File                | `kebab-case.tsx/.ts`                            | `project-card.tsx`                 |
| React component     | `PascalCase`                                    | `ProjectCard`                      |
| Hook                | `useCamelCase`                                  | `useDebounce`, `useProjects`       |
| Zustand store hook  | `useXxxStore`                                   | `useAuthStore`                     |
| Query hook (list)   | `useXxx` plural                                 | `useProjects`                      |
| Query hook (single) | `useXxx` singular                               | `useProject`                       |
| Mutation hook       | `useVerbXxx`                                    | `useCreateProject`, `useDeleteBid` |
| Fetcher function    | `verbXxx` (no `use`)                            | `getProjects`, `createProject`     |
| Query key factory   | `xxxQueryKey`                                   | `projectsQueryKey`                 |
| Zod schema          | `xxxSchema`                                     | `loginSchema`                      |
| Inferred form type  | `XxxFormValues`                                 | `LoginFormValues`                  |
| API request type    | `XxxRequest`                                    | `CreateProjectRequest`             |
| API response type   | `XxxResponse`                                   | `LoginResponse`                    |
| Route constant      | `SCREAMING_SNAKE`                               | `ROUTES.PROJECTS_LIST`             |
| Env var             | `NEXT_PUBLIC_*` (client) or `SERVER_*` (server) | `NEXT_PUBLIC_API_BASE_URL`         |
| CSS variable        | `--kebab-case`                                  | `--color-primary`, `--font-sans`   |
| Tailwind theme key  | `kebab-case`                                    | `colors.primary`, `font.sans`      |
| Boolean prop        | `isXxx` / `hasXxx` / `canXxx`                   | `isLoading`, `hasError`, `canEdit` |
| Event handler prop  | `onXxx`                                         | `onSubmit`, `onSelectProject`      |
| Event handler impl  | `handleXxx`                                     | `const handleSubmit = …`           |
| Translation key     | `feature.section.key`                           | `auth.login.submitButton`          |
| Test file           | `xxx.test.ts(x)` next to source                 | `project-card.test.tsx`            |
| E2E test            | `xxx.spec.ts` in `e2e/`                         | `login.spec.ts`                    |
| Type for props      | `<Name>Props`                                   | `ProjectCardProps`                 |

## Additional rules

- **No abbreviations** except universally known ones (`url`, `id`, `api`, `ui`, `db`, `jwt`).
- **No `data`, `info`, `manager`, `helper` in file or symbol names.** Name the thing what it is.
  - ✅ `formatCurrency`, `useProjects`
  - ❌ `currencyHelper`, `projectsManager`
- **Acronyms in PascalCase identifiers are PascalCase, not UPPERCASE.** `UserId`, not `UserID`. `ApiClient`, not `APIClient`.
- **Singular collection names for stores, plural for query results.** `useAuthStore` (one concept) vs `useProjects` (a list).
- **Translation key namespaces match feature folder names.** If the folder is `features/projects/`, the namespace is `projects.*`. Don't invent `project.*` or `projectsList.*`.

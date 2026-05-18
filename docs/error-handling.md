# Error handling

## The four layers

| Layer                        | Responsibility                                                                                           |
| ---------------------------- | -------------------------------------------------------------------------------------------------------- |
| `apiClient` (lib)            | Normalize HTTP errors into typed `ApiError` instances; refresh expired tokens once                       |
| Query hooks                  | Surface errors via `query.error` / `mutation.error` — no try/catch                                       |
| Components                   | Render `<ErrorState />` for query errors; map mutation field errors to forms; toast for generic failures |
| `error.tsx` (route boundary) | Last-resort UI for unhandled render errors                                                               |
| `global-error.tsx`           | Crash screen for root layout errors                                                                      |

## Rules

1. **One `ApiError` type for the whole app.** Defined in `src/types/api.ts`:
   ```ts
   export class ApiError extends Error {
     constructor(
       public status: number,
       public code: string | null,
       public fieldErrors: Record<string, string> | null,
       message: string,
     ) {
       super(message);
     }
   }
   ```
2. **The `apiClient` is the only place that throws `ApiError`.** Features never construct it.
3. **Auth errors are special.** A 401 triggers `apiClient` to attempt one `/auth/refresh-token` call; on failure, it dispatches `useAuthStore.logout()` and redirects to `/login?reason=expired`.
4. **Component code uses `query.error` for display.** Never `try/catch` around a `useQuery` call.
5. **Mutation errors map to forms or toasts**:
   ```ts
   const mutation = useCreateProject({
     onError: (error) => {
       if (error.fieldErrors) {
         Object.entries(error.fieldErrors).forEach(([field, msg]) =>
           form.setError(field as any, { message: msg }),
         );
         return;
       }
       toast.error(t('errors.generic'));
     },
   });
   ```
6. **`<ErrorState />` accepts `error` + `onRetry`.** Renders the localized error message + a retry button that calls `query.refetch()`.
7. **Never `alert()` or `console.error` for user-facing errors.** Use `toast` or `<ErrorState />`.
8. **`error.tsx` route boundaries are mandatory** for every route segment under `app/(app)/`. They render `<RouteErrorBoundary />` from `components/feedback/`.
9. **Errors are reported to Sentry from `error.tsx` and from `apiClient`.** Not from every catch site. Use `Sentry.captureException(error, { tags: { feature: 'projects' } })`.
10. **Field error keys from the backend** must map 1:1 to form field names. If the backend returns `{ email: '…' }`, the form must have a field literally named `email`. Coordinate with backend if shapes drift.

## Sentry setup

`@sentry/nextjs` is initialized in `src/lib/sentry.ts` from day 1 of the project, even before features exist. Wire it before the first feature ships. Configure:

- DSN from `env.NEXT_PUBLIC_SENTRY_DSN` (validated at boot).
- `environment` tag = `process.env.NODE_ENV` + the Vercel/Cloud Run env.
- Filter out expected `ApiError`s with `status: 401` (auth flow) so the dashboard isn't noisy.
- Set `release` to the git commit SHA.

## What NOT to do

- Don't catch errors and re-throw a generic one — you lose stack and code.
- Don't log errors to `console.error` in production code paths. The browser console is not a logging system.
- Don't show raw error messages from the backend to the user — always go through i18n with a known code, or show `t('errors.generic')`.
- Don't have multiple `try/catch` blocks doing different things in the same function. Errors should bubble up to the layer that knows how to handle them.

# API and auth — mirroring the RN backend

## The `apiClient`

Lives in `src/lib/api-client.ts`. **Single instance.** Wraps `fetch`. Responsibilities:

- Resolve base URL from `env.NEXT_PUBLIC_API_BASE_URL` (validated at boot via `config/env.ts`).
- Attach `Authorization: Bearer <token>` from `auth-storage` on every request.
- Attach `ngrok-skip-browser-warning: true` when the base URL is an ngrok host (parity with RN app).
- Attach `Accept-Language: <currentLocale>` from `useLocaleStore`.
- Throw `ApiError` on non-2xx with parsed body (`message`, `code`, `fieldErrors`).
- Handle 401 by calling `/auth/refresh-token` once, retrying the original request, then logging out on second failure.
- Optionally validate the response body with a zod schema when callers pass one.

## Endpoints and types

- `src/config/endpoints.ts` re-creates the RN app's `API_ENDPOINTS` constant from `website-bonyad/src/config/api.ts` **exactly**. Keep in sync — never drift.
- Per-endpoint zod schemas + types live in `features/X/schemas/`.
- Fetchers in `features/X/api/` use `apiClient.get/post/put/delete` + the endpoint constant + the zod schema.

```ts
// features/projects/api/get-projects.ts
import { apiClient } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/config/endpoints';
import { projectListSchema } from '../schemas/project.schema';

export async function getProjects(): Promise<Project[]> {
  return apiClient.get(API_ENDPOINTS.PROJECTS.LIST, { schema: projectListSchema });
}
```

## Auth flow (mirrors RN)

1. **Login** — `POST /auth/login` → `{ message, token, user }`. Persist token in an `httpOnly` cookie via a Next.js route handler `app/api/auth/login/route.ts` so SSR can read it.
2. **Token validation on boot** — `POST /auth/validate-token` with the cookie token. On success, hydrate `useAuthStore` with the user.
3. **Refresh** — `apiClient` calls `POST /auth/refresh-token` once on 401, retries original request.
4. **Logout** — clear cookie + `useAuthStore.logout()` + `queryClient.clear()` + redirect to `/login`.
5. **Protected routes** — a middleware in `middleware.ts` checks the auth cookie for any path under `(app)/`. Unauthenticated requests redirect to `/login?next=<path>`.
6. **Role gating at the component level** — use `<RoleGate roles={['TECHNICIAN']}>` from `features/auth/`. Don't sprinkle role checks inside random child components.

## Token storage

- The token lives in an `httpOnly` cookie set by the Next.js route handler. **Not in localStorage, not in JS-readable storage.**
- The cookie is `Secure`, `SameSite=Lax`, path `/`.
- On same-origin API calls, the cookie is sent automatically; the `apiClient` does not need to read it.
- For cross-origin API calls (the backend at `bonyad-app-…run.app`), the `apiClient` proxies through a Next route handler `app/api/proxy/[...path]/route.ts` that attaches the token server-side.

## Rules

1. **No `fetch` call lives outside `apiClient`.** Grep for `fetch(` — must only match `lib/api-client.ts`.
2. **No endpoint string literal lives outside `config/endpoints.ts`.** Grep for `'/auth/'`, `'/projects'` — must only match that file.
3. **Every response is typed.** Either via zod-validated parsing (preferred) or a hand-written TS type that matches.
4. **Pagination and filters are typed.** A `ProjectFilters` type lives next to the fetcher.
5. **Mutations return the updated entity** when the backend does — don't refetch by default if the response already has the data; just call `queryClient.setQueryData` in `onSuccess`.
6. **Idempotency keys** for any mutation that writes money (payments, payouts) — generate a UUID client-side and pass as `Idempotency-Key` header.

## Backend coupling

The backend is **shared with the RN app** and shouldn't change for the web app's sake unless absolutely necessary. Before adding a new endpoint:

1. Confirm it doesn't already exist by searching `website-bonyad/src/config/api.ts`.
2. Discuss with the backend team.
3. Add it to **both** `src/config/endpoints.ts` and `website-bonyad/src/config/api.ts` so the RN app inherits it.

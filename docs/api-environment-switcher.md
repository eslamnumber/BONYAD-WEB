# Runtime Dev/Production API switcher (web)

How to add the same in-app **Production ⇄ Development backend switcher** that the
Kotlin Android app ships, adapted to this Next.js codebase.

The feature lets a single deployed build be flipped between the prod and dev
backends at runtime, behind a **hidden gesture** (triple-tap the login logo, or
tap the settings version footer 7× within 1s). Switching **logs the user out**
(a JWT minted by one backend is meaningless to the other) and persists the
choice across reloads.

---

## 1. Why the web version is different from Android

On Android the client talks to the backend **directly**, so the switch is a
single OkHttp interceptor that rewrites the request host per call.

On web the browser **never** reaches the backend directly — CSP
`connect-src 'self'` forbids it. Every browser → backend call goes through the
same-origin proxy `src/app/api/proxy/[...path]/route.ts`, which forwards
server-side to `BACKEND_BASE_URL` (`src/lib/backend.ts`). Server components and
route handlers (e.g. `src/lib/server-auth.ts`) call the backend directly through
the same `apiClient`.

**Consequence:** the chosen environment must live somewhere both the proxy and
RSC can read on every request → a **cookie**, resolved **server-side**. There is
no client interceptor. A nice side effect: because the host swap happens
server-side, **no CSP/`connect-src` change is needed** — `security-headers.md`
stays as-is.

### Android → web mapping

| Android piece                                           | Web equivalent                                                                 |
| ------------------------------------------------------- | ------------------------------------------------------------------------------ |
| `ApiEnvironment` enum (URLs, `fromKey`, default = prod) | `src/config/api-environments.ts` registry                                      |
| `SettingsDataStore.apiEnvironment` (DataStore)          | `bonyad-api-env` cookie (not httpOnly, so the badge renders client-side)       |
| `EnvironmentManager` (cache + persist + clear token)    | `getActiveEnvironment()` server helper + `POST /api/dev/api-environment` route |
| `EnvironmentInterceptor` (rewrite host per request)     | proxy + server callers resolve base URL from the cookie                        |
| `RetrofitFactory` fixed `BASE_URL`                      | `resolveBackendBaseUrl(key)` in `src/lib/backend.ts`                           |
| `switchTo()` clears `tokenDataStore`                    | switch route deletes the `bonyad-token` cookie                                 |
| Triple-tap logo / 7-tap footer                          | React click counters within a 1s window                                        |
| `ApiEnvironmentPicker` (Compose)                        | `ApiEnvironmentPicker` React component + badge                                 |
| `strings.xml` + `values-ar`                             | i18next `en` + `ar` resources                                                  |

---

## 2. Backend URLs

Use the **canonical hosts from the Android app** (the web currently points at an
older prod host — fix it as part of this work):

```
PRODUCTION  https://bonyad-app-1026710889441.me-central1.run.app
DEVELOPMENT https://bonyad-app-dev-1026710889441.me-central1.run.app
API base    = `${baseUrl}/api`
```

> ⚠️ `src/lib/backend.ts` / `.env.example` still use
> `https://bonyad-app-nyayeditqq-ww.a.run.app/api`. Point production at the
> `me-central1` host above so prod parity matches Android, then let the registry
> below own both URLs.

---

## 3. The environment registry — `src/config/api-environments.ts`

Mirrors `ApiEnvironment.kt`. Hardcodes both URLs (so it does **not** read
`process.env` — keeps the `no-restricted-globals: process` ESLint rule happy).
Default is always production; an unknown key resolves to production so a corrupt
cookie can never strand someone on dev.

```ts
export type ApiEnvironmentKey = 'production' | 'dev';

export type ApiEnvironment = {
  key: ApiEnvironmentKey;
  baseUrl: string;
  /** Including the shared `/api` suffix — pass this to apiClient/proxy. */
  apiBaseUrl: string;
  displayNameKey: string; // i18n key, resolved in the UI layer
  badgeColor: string; // hex, used by the badge pill
};

export const API_ENVIRONMENTS: Record<ApiEnvironmentKey, ApiEnvironment> = {
  production: {
    key: 'production',
    baseUrl: 'https://bonyad-app-1026710889441.me-central1.run.app',
    apiBaseUrl: 'https://bonyad-app-1026710889441.me-central1.run.app/api',
    displayNameKey: 'env.production',
    badgeColor: '#2980E8',
  },
  dev: {
    key: 'dev',
    baseUrl: 'https://bonyad-app-dev-1026710889441.me-central1.run.app',
    apiBaseUrl: 'https://bonyad-app-dev-1026710889441.me-central1.run.app/api',
    displayNameKey: 'env.development',
    badgeColor: '#F29E12',
  },
};

export const DEFAULT_API_ENVIRONMENT: ApiEnvironmentKey = 'production';

/** Corrupt/unknown value → production. Mirrors `ApiEnvironment.fromKey`. */
export function apiEnvironmentFromKey(key: string | undefined): ApiEnvironment {
  return key && key in API_ENVIRONMENTS
    ? API_ENVIRONMENTS[key as ApiEnvironmentKey]
    : API_ENVIRONMENTS[DEFAULT_API_ENVIRONMENT];
}
```

Add the cookie name to `src/config/constants.ts`:

```ts
/** Persists the selected backend (production/dev). NOT httpOnly: the client
 *  reads it to render the env badge. The proxy + RSC read it to pick the host. */
export const API_ENV_COOKIE_NAME = 'bonyad-api-env';
```

---

## 4. Resolve the base URL from the cookie (the "interceptor")

### 4a. `src/lib/backend.ts` — add a resolver

```ts
import { apiEnvironmentFromKey } from '@/config/api-environments';

export function resolveBackendBaseUrl(envKey: string | undefined): string {
  return apiEnvironmentFromKey(envKey).apiBaseUrl;
}
```

### 4b. `apiClient` — accept a per-call `baseUrl` override

`src/lib/api-client.ts` currently hardcodes `BACKEND_BASE_URL` in `resolveUrl`.
Add an optional override used **only on the server path** (the browser path is
unchanged — it always goes same-origin to the proxy):

```ts
type RequestOptions<T> = {
  // ...existing fields...
  /** Server-only: override the backend host (dev/prod switch). Ignored in the browser. */
  baseUrl?: string;
};

function resolveUrl(path: string, internal: boolean, baseUrl?: string): URL {
  if (typeof window === 'undefined') {
    return new URL(`${baseUrl ?? BACKEND_BASE_URL}${path}`);
  }
  const prefix = internal ? '' : PROXY_PREFIX;
  return new URL(`${prefix}${path}`, window.location.origin);
}
```

Thread `baseUrl` through `request()` into `resolveUrl`.

### 4c. Server helper — read the cookie once per request

`src/lib/api-environment.server.ts` (the `EnvironmentManager` analogue):

```ts
import { cookies } from 'next/headers';

import { apiEnvironmentFromKey, type ApiEnvironment } from '@/config/api-environments';
import { API_ENV_COOKIE_NAME } from '@/config/constants';
import { resolveBackendBaseUrl } from '@/lib/backend';

export async function getActiveEnvironment(): Promise<ApiEnvironment> {
  const store = await cookies();
  return apiEnvironmentFromKey(store.get(API_ENV_COOKIE_NAME)?.value);
}

export async function getActiveBackendBaseUrl(): Promise<string> {
  const store = await cookies();
  return resolveBackendBaseUrl(store.get(API_ENV_COOKIE_NAME)?.value);
}
```

### 4d. Honor it in the proxy and in RSC

Proxy — `src/app/api/proxy/[...path]/route.ts`, in `forward()`:

```ts
const baseUrl = resolveBackendBaseUrl(req.cookies.get(API_ENV_COOKIE_NAME)?.value);
const data = await callBackend(method, endpoint, token, body, baseUrl);
// ...pass `baseUrl` into each apiClient.* call as { ..., baseUrl }
```

RSC direct callers — e.g. `src/lib/server-auth.ts` `getServerUser()`:

```ts
const baseUrl = await getActiveBackendBaseUrl();
const data = await apiClient.post<ValidateTokenResponse>(API_ENDPOINTS.AUTH.VALIDATE_TOKEN, {
  body,
  baseUrl,
});
```

Audit every server-side `apiClient.*` call site and pass `baseUrl`. The
`login` route should resolve it too, so login validates against the selected
backend.

---

## 5. The switch route — `src/app/api/dev/api-environment/route.ts`

The cookie is set server-side (and the session cleared) just like `logout`:

```ts
import { cookies } from 'next/headers';
import { NextResponse, type NextRequest } from 'next/server';

import { apiEnvironmentFromKey } from '@/config/api-environments';
import { API_ENV_COOKIE_NAME, AUTH_COOKIE_NAME } from '@/config/constants';
import { isDevelopment } from '@/config/env';

const ENV_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

export async function POST(req: NextRequest): Promise<NextResponse> {
  const { key } = await req.json().catch(() => ({ key: undefined }));
  const env = apiEnvironmentFromKey(key);

  const store = await cookies();
  store.set(API_ENV_COOKIE_NAME, env.key, {
    httpOnly: false, // client reads it to render the badge
    secure: !isDevelopment,
    sameSite: 'lax',
    path: '/',
    maxAge: ENV_MAX_AGE,
  });
  store.delete(AUTH_COOKIE_NAME); // switching invalidates the session

  return NextResponse.json({ ok: true, env: env.key });
}
```

The client calls this, then hard-navigates to `/login` (so all RSC re-render
against the new backend):

```ts
await fetch('/api/dev/api-environment', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ key }),
});
window.location.assign('/login'); // full reload, not router.push
```

> Optional guard: gate the route + gestures behind
> `NEXT_PUBLIC_ENABLE_ENV_SWITCHER` (add to `src/config/env.ts`) if you don't
> want it live in production. Android ships it in prod behind the hidden gesture,
> so parity = leave it always on.

---

## 6. UI — badge, picker, hidden gestures

A client component group under `src/components/dev/` (or `features/dev/`):

- **`ApiEnvironmentBadge`** — small pill, hidden when env is production. Reads
  the `bonyad-api-env` cookie client-side (`document.cookie`) or receives the
  key as a prop from a server component. Uses `badgeColor`.
- **`ApiEnvironmentPicker`** — a dialog (reuse the existing dialog primitive)
  listing both environments with the warning copy and a **confirm** step before
  switching, then POSTs to the route in §5.
- **Hidden triggers** — replicate the Compose counters:

```ts
const lastTap = useRef(0);
const count = useRef(0);
function onHiddenTap(threshold: number, open: () => void) {
  const now = Date.now();
  if (now - lastTap.current > 1000) count.current = 0;
  count.current += 1;
  lastTap.current = now;
  if (count.current >= threshold) {
    count.current = 0;
    open();
  }
}
```

Wire `threshold = 3` to the login-page logo's `onClick`, and `threshold = 7` to
the settings version footer. Show `<ApiEnvironmentBadge />` next to each when the
active env ≠ production.

---

## 7. i18n strings

Add to the `en` and `ar` resource bundles under `src/locales/` (mirrors the
`strings.xml` / `values-ar` additions). Keys used above:

| key                  | en                                                                                      | ar                                                              |
| -------------------- | --------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| `env.production`     | Production                                                                              | الإنتاج                                                         |
| `env.development`    | Development                                                                             | التطوير                                                         |
| `env.pickerTitle`    | API Environment                                                                         | بيئة الـ API                                                    |
| `env.pickerWarning`  | Beta-tester tool. Switching logs you out and clears cached data.                        | أداة للمختبرين. التبديل يسجّل خروجك ويمسح البيانات المخزّنة.    |
| `env.current`        | CURRENT                                                                                 | الحالية                                                         |
| `env.switch`         | Switch                                                                                  | تبديل                                                           |
| `env.cancel`         | Cancel                                                                                  | إلغاء                                                           |
| `env.confirmTitle`   | Switch to {{name}}?                                                                     | التبديل إلى {{name}}؟                                           |
| `env.confirmMessage` | You'll be logged out. Log in again with credentials that exist on the {{name}} backend. | سيتم تسجيل خروجك. سجّل الدخول ببيانات موجودة على خادم {{name}}. |

(Arabic above is a starting draft — have it reviewed.)

---

## 8. Checklist

- [ ] `src/config/api-environments.ts` registry (prod/dev URLs, `fromKey`, default prod)
- [ ] `API_ENV_COOKIE_NAME` in `src/config/constants.ts`
- [ ] `resolveBackendBaseUrl()` in `src/lib/backend.ts`; fix prod host to `me-central1`
- [ ] `apiClient` accepts a server-only `baseUrl` override
- [ ] `src/lib/api-environment.server.ts` (`getActiveEnvironment` / `getActiveBackendBaseUrl`)
- [ ] Proxy passes the resolved `baseUrl`; **every** server-side `apiClient` call site updated
- [ ] `POST /api/dev/api-environment` (set env cookie + delete auth cookie)
- [ ] Badge + picker + confirm + hidden triggers (logo ×3, footer ×7)
- [ ] i18n `en`/`ar` strings
- [ ] Verify: switch to dev → badge shows, you land on login, calls hit the dev host (Network tab on the proxy, or backend logs); switch back → badge gone
- [ ] Confirm CSP unchanged (no new `connect-src` entries needed)

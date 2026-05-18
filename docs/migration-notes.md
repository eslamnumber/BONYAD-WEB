# Migration notes — RN app is backend-integration reference only

The legacy app at `website-bonyad/src/` is **reference only — used to understand how the backend integrates and how the user flows work, never as a source of UI patterns, components, or design.** The new web app is its own architecture. UI comes from Figma (see [figma-to-code.md](figma-to-code.md)), not from RN.

## What "reference only" means in practice

| Use the RN app to learn…                                  | Don't use the RN app for…                                 |
| --------------------------------------------------------- | --------------------------------------------------------- |
| Which endpoints exist and what they return                | UI structure, JSX, styling                                |
| The auth flow shape (login → validate → refresh → logout) | Component hierarchy or naming                             |
| Which roles call which endpoints                          | Visual design decisions                                   |
| Field names on requests/responses                         | Animation, motion, microinteractions                      |
| Edge cases the backend handles (validation, error codes)  | Translation key shapes (rewrite into feature namespaces)  |
| The shape of `API_ENDPOINTS`                              | The actual fetch implementation (rewrite via `apiClient`) |

**Designs in the new app come from Figma, not RN.** When implementing a screen, the visual contract is the Figma frame. The RN equivalent is only consulted to confirm what API calls the screen makes and what data shape it expects.

## Port these (clean rewrite)

| Legacy path                                                        | New path                                               | Notes                                                                          |
| ------------------------------------------------------------------ | ------------------------------------------------------ | ------------------------------------------------------------------------------ |
| `website-bonyad/src/config/api.ts` (the `API_ENDPOINTS` constant)  | `src/config/endpoints.ts`                              | Endpoints only. The fetch interceptor stays in the new `apiClient`.            |
| `website-bonyad/src/localization/i18n.ts` (the init pattern)       | `src/lib/i18n.ts`                                      | Same "init once" idea, but reads from cookie instead of AsyncStorage.          |
| `website-bonyad/src/localization/translations/en.json` + `ar.json` | `src/locales/en.json` + `ar.json`                      | Copy keys, restructure into feature namespaces (`auth.*`, `projects.*`, etc.). |
| `website-bonyad/src/utils/authGuard.ts`                            | Split into `src/lib/auth-storage.ts` + `middleware.ts` | The boot-time validate-token check moves to the root layout's auth provider.   |
| Figma designs referenced from legacy screens                       | Used as visual reference only                          | Do not copy the JSX.                                                           |

## Do NOT copy

- Any **React Native** component or import (`View`, `Text`, `Pressable`, `StyleSheet`).
- Any **NativeWind** class string.
- Any **Expo** module (`expo-image`, `expo-av`, `expo-print`, etc.).
- Any **`react-navigation`** route definition.
- The **global `fetch` monkey-patch** in `website-bonyad/src/config/api.ts` (lines 32–81). The new `apiClient` handles ngrok headers internally without patching the global.
- The console-log-heavy debug style. Use `Sentry.captureMessage` for structured signals, not `console.log`.

## Coexistence with the frozen legacy folder

The folder `website-bonyad/` lives alongside this app's code as a frozen reference. It is in `.gitignore` and is **never modified**. No `package.json`, no build, no shared `node_modules` with this app — it's a black box documenting the existing product.

- Run this app: `pnpm dev` → `localhost:3000`.
- If you ever need to inspect the legacy app locally, do it in `website-bonyad/` on a separate checkout; do not run it from this tree.

No imports cross the boundary. The legacy folder is for _reading only_ — endpoint shapes, auth flow, request/response types.

## Rollout (TBD with stakeholders)

The migration strategy (subdomain split? path prefix? feature flag? full cutover?) hasn't been decided yet. Lock it in **before** building the first feature, because the answer affects:

- Auth (cookie domain — single domain vs subdomain).
- Routing (do old links still work?).
- Analytics (separate Mixpanel project or merged?).

Open a separate document `docs/rollout-plan.md` when the decision is made and link it from `README.md`.

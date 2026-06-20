# Components

## Three tiers

| Tier                 | Location                                     | What it is                                                      | Allowed to know about                |
| -------------------- | -------------------------------------------- | --------------------------------------------------------------- | ------------------------------------ |
| **Primitive**        | `components/ui/`                             | shadcn/ui base components (Button, Input, Dialog, FieldHint, …) | Nothing app-specific — pure UI       |
| **Shared composite** | `components/{layout,feedback,data-display}/` | Reusable across features (AppShell, ErrorState)                 | Primitives, design tokens            |
| **Feature**          | `features/X/components/`                     | Specific to one feature (ProjectCard, BidList)                  | Everything the feature owns + shared |

**`FieldHint` is the canonical helper-text / inline-error primitive.** Use it wherever a form field carries a static format hint (`"9 digits, starts with 5"`) or an inline validation error. Toggle the `tone` prop between `"neutral"` and `"error"`. Do not roll a one-off `<p className="text-destructive text-sm" role="alert">…</p>` inside a feature file — that pattern is now a defect; it bypasses the shared error-text style and the `role="alert"` wiring. See [forms-validation.md](forms-validation.md) §Field validation rules.

**`Modal` (+ `ModalHeader` / `ModalFooter`) is the canonical centered-dialog shell** (`components/ui/modal.tsx`). It portals a scrim + 440px card and owns the dialog a11y (focus trap, `Esc`, body-scroll lock, focus restore, `role="dialog"` + `aria-labelledby`). Compose content between the header and footer; pass a stable `labelledBy` id matching the `ModalHeader` title. Do not hand-roll `role="dialog"` + scrim markup in a feature file. Used by the SP edit-offer / withdraw-offer modals.

**`Toast` is the canonical top-of-screen status pop** (`components/feedback/toast.tsx`). A portalled (`z-[60]`, above modals) pill pinned to the viewport top-center that announces politely (`role="status"` + `aria-live`), pops down under `motion-safe`, auto-dismisses (default 3.5 s) and carries a manual dismiss (WCAG 2.2.1). Controlled by `open` / `onClose`, with a `tone` (`success` | `error`) backed by `--success` / `--destructive` tokens; the message is dynamic copy so it sets `dir="auto"`. The app has **no third-party toast library** — do not add `react-hot-toast`/`sonner` or hand-roll fixed-position notification markup in a feature file; render `<Toast>` and own its `open` state (e.g. `features/profile`'s `useAvatarUpload` flips it after a successful photo upload).

**`Select` is the canonical single-select dropdown — the app has NO native `<select>`** (`components/ui/select.tsx`). Controlled (`value` / `onChange(value)` — wrap with an RHF `Controller` in a form). Built from logical utilities so the value + options right-align under the inverted RTL map (`text-end`, no `dir`), dark-safe (`bg-popover` / `bg-field-surface` tokens), `role="listbox"` / `option` a11y, and closes on outside-click / `Esc` / scroll. The listbox is **portalled to `<body>`** (so an `overflow-hidden` ancestor can't crop it) and flips above the trigger with a capped height when there's no room below. Do not add a raw `<select>` or a second dropdown pattern. (`features/dashboard`'s older `wizard-select` predates this and is a candidate to fold into it.)

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
11. **Status toasts go through the shared `<Toast>`** (`components/feedback/toast.tsx`) — never add a third-party toast library or hand-roll fixed-position notification markup in a feature. See the canonical-`Toast` note above.
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

## Profile / account hub — design authored without Figma

The `/dashboard/settings` screen (`features/profile/`) was designed in-house (no Figma node), so the Figma-MCP layer-walk / leaf-ledger steps don't apply — instead every CSS value traces to a token + the agreed mockup. Notes:

- **Row icons are on-brand reuse, not redraws.** `profile-sections.ts` maps each row to the closest-semantic real Bonyad export (rule 21 — no invented icons): completed work → `DashboardProjectsIcon`, transactions/contracts → `SaudiRiyalIcon` (the Saudi-Riyal mark, a deliberate Saudi identity cue), Refer & earn → `SendIcon`, Delete account → `CloseIcon`. The earlier `TrustBadgeIcon`/`SearchClearIcon`/`BookmarkIcon` stand-ins were replaced. Swap to a dedicated glyph if one is ever exported.
- **Identity banner carries the Bonyad skyline.** `profile-identity-card.tsx` anchors `bg/customer-dashboard-skyline.png` as a faint inverted silhouette along the banner base (desktop-gated, `rtl:-scale-x-100`, top-fade mask), mirroring the `CustomerLandingBackdrop` motif — the brand-specific "construction" cue for the hub header.
- **Placeholder sub-screen routes.** The hub's account rows link to `ROUTES.DASHBOARD_SETTINGS_*` detail screens that 404 until built (the hub ships first) — the same placeholder convention as `DASHBOARD_SAVED` / `DASHBOARD_OFFERS`.
- **Personal-info screen IS Figma-sourced** (`/dashboard/settings/profile`, Figma `1674:7946`) — the one screen in this feature with a Figma node. `my-info-screen.tsx` is a single centred `max-w-2xl` column: `personal-info-card.tsx` (drill-in chevron at the inline-start that opens the Edit form below; name · role · a `PhotoEditLink` accent text-link for change-photo replacing the camera badge; 64 px avatar at the inline-end) over the **controlled** `manage-accordion.tsx`. The accordion's Edit / Phone / Password rows still expand their injected form inline via the shared `manage-row.tsx` body (rotating `ChevronDown` = expand affordance); "My transactions" stays a customer-only drill-in `Link` (`ChevronLeft`). The `open` state is **lifted to `my-info-screen.tsx`** so the identity-card chevron and the Edit row drive the same panel. The old centred-avatar `my-info-summary.tsx` (status / email / phone list) was removed — the Figma shows identity + actions only.

## Omdah SOW — shared display components (reused across create-flow + status screens)

The Omdah AI Scope-of-Work renderer is built once and reused in two places (see [api-and-auth.md](api-and-auth.md) §Omdah AI). Both are **within the `dashboard` feature** (relative imports — never cross-feature):

- **`SowSections` + `sow/sections/*`** (`features/dashboard/components/project-create/ai/sow/`) — the document renderer: 10 self-hiding section components (overview, objectives, scope, deliverables, timeline, resources, commercials, compliance, risks, KPIs) over shared primitives (`sow-primitives.tsx`: `SowCard`, `KeyValueRow`, `BulletList`, `Chip`, `AmountText`). Each section returns `null` when its slice is empty, so the same renderer works for a streaming partial SOW, a refined SOW, and a stored one.
- **`SowCard` chrome is variant-driven** (`sow-primitives.tsx`): the `'review'` default is the create-flow / collapsible-panel look (accent icon chip + underlined header); `'plain'` drops the icon chip and uses the status-screen sibling chrome (heading + full-width divider, `p-6`) so inline AI cards match the description / phases / images cards. Choose per-tree by wrapping in `<SowCardVariantProvider variant="plain">` — the section components themselves stay variant-agnostic.
- **`ProjectSowPanel`** (`features/dashboard/components/project-sow/`) — a collapsible read-only wrapper that parses the SOW off a `Project` (`parseProjectSow`) and renders `SowSections`, shown on the assigned / in-progress status screens **only when a SOW is found**. It self-hides for manual projects, so it can be dropped into any detail screen unconditionally.
- **`ProjectSowColumn`** (`features/dashboard/components/job-offer-detail/`) — the bid-phase detail's non-collapsible alternative to `ProjectSowPanel`: the SOW renders inline as `'plain'`-variant cards split across the two columns via a `group` prop — `'primary'` (objectives + KPIs) under the bids / offer column, `'secondary'` (scope, deliverables, resources, compliance, risks) under the images column, each card the full width of its column. Self-hides for manual projects (`parseProjectSow` → null) and per-group when its own sections have no data (`empty:hidden`); rendered in the conventional direction so the AI copy reads correctly.
- **Section-header icons are app-native, not lucide** (rule 15/21): each `'review'`-variant `SowCard` icon is a real `@/components/icons` export rendered monochrome in a tinted `bg-job-accent/10` rounded tile (the same icon-tile pattern as the settings/detail rows); the "By Omdah" mark is `AiAssistantIcon`. lucide is kept only for system glyphs (spinner / chevron / info / retry / offline) with no Bonyad equivalent.
- **Currency renders as the Saudi-Riyal mark** — `AmountText` shows the `SaudiRiyalIcon` SVG (scaled with the text, currency name as `aria-label`), never a "SAR"/"ريال" string.

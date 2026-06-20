# Payment Cards — web spec

This is the blueprint for bringing the **iOS card-management feature** (stored cards: list / add /
set-default / delete) to the new Next.js web app, using the **same HyperPay integration mechanism
the RN web app uses** (COPYandPAY script-injected widget — _not_ the native `OPPWAMobile` SDK).

It has two halves:

- **Part A — The integration.** How HyperPay + backend talk to each other on web (lifted verbatim
  from the RN app's COPYandPAY approach).
- **Part B — The flow.** The iOS card-management user flow, adapted to run on that web integration.

---

# Part A — The Integration (COPYandPAY, same as RN)

The web never ships a card form and never installs an SDK. Instead it loads a HyperPay-hosted
script at runtime that injects a secure iframe for card entry.

## A.1 — The two backend endpoints

| Step    | Method | URL                                 | Purpose                                                        |
| ------- | ------ | ----------------------------------- | -------------------------------------------------------------- |
| Prepare | POST   | `/api/payments/create-checkout`     | Ask backend to open a HyperPay checkout → returns `checkoutId` |
| Verify  | GET    | `/api/payments/status/{checkoutId}` | Ask backend to query HyperPay for the result                   |

Both live behind `BaseURLManager` / `buildApiUrl(...)`. The HyperPay **widget host** is separate
and hard-coded per env (see A.3).

Common headers:

```
Authorization: Bearer <token>
Content-Type: application/json
Accept: application/json
Accept-Language: <locale>
```

### Prepare request (`POST /api/payments/create-checkout`)

```jsonc
{
  "amount": 1.0, // 1 SAR preauth for card registration (see Part B)
  "currency": "SAR",
  "paymentType": "PA", // "PA" = Pre-Auth (reversible), "DB" = Debit
  "paymentBrand": "MADA", // MADA | VISA | "MASTER" | APPLEPAY
  "merchantTransactionId": "CARD-REG-<userId>-<ts>",
  "customer": { "email": "…", "givenName": "…", "surname": "…" },
  "billing": {
    "street1": "…",
    "city": "Riyadh",
    "state": "Riyadh",
    "country": "SA",
    "postcode": "12345",
  },
  "shopperResultUrl": "https://<origin>/cards/callback?intent=card-registration",
}
```

- **`shopperResultUrl` is required** — HyperPay redirects here after the user pays.
- **Response is parsed defensively from 3 shapes** (the backend sometimes forwards HyperPay raw):
  1. `{ success, checkoutId, redirectUrl, environment }`
  2. `{ id, result: { code, description }, ndc }` — use `id` or `ndc` as `checkoutId`
  3. `{ result: { code }, ndc }` — use `ndc`
  - Read: `checkoutId = data.checkoutId || data.id || data.ndc`.
  - If `result.code` exists and doesn't start with `000.` → it's a HyperPay error even on HTTP 200.

### Verify response (`GET /api/payments/status/{checkoutId}`)

```ts
{
  success: boolean,
  paymentResult?: boolean,        // backend's pre-classified verdict — prefer this
  code?: string,                  // raw HyperPay result code
  description?: string,
  amount?: string,
  currency?: string,
  paymentBrand?: string,
  transactionId?: string,
  status?: "COMPLETED" | "PENDING" | "FAILED",
  isPending?: boolean,
  error?: string
}
```

### Success-code classification (client-side)

| Code          | Meaning                      |
| ------------- | ---------------------------- |
| `000.000.000` | live success                 |
| `000.100.1xx` | test-mode success            |
| `000.3xx`     | 3DS redirect → final success |
| `000.200.xxx` | pending                      |
| anything else | failed                       |

`isSuccess = data.paymentResult === true || isSuccessCode(code)`.

## A.2 — The widget mechanics (no SDK, no installed library)

The card UI is delivered by a HyperPay-hosted script:

```ts
// 1. wpwlOptions MUST be set before the script loads
window.wpwlOptions = {
  style: 'card',                  // 'card' | 'plain'
  locale: 'en',                   // 'en' | 'ar'
  paymentTarget: '_top',
  brandDetection: true,
  onReady: () => setProcessing(false),
  onError:  (e) => setWidgetError(...),
};

// 2. Pick the host by sniffing the checkoutId
const host = checkoutId.includes('prod')
  ? 'https://eu-prod.oppwa.com'
  : 'https://eu-test.oppwa.com';

// 3. Inject the script — it auto-renders into the first <form> on the page
const script = document.createElement('script');
script.src = `${host}/v1/paymentWidgets.js?checkoutId=${checkoutId}`;
document.body.appendChild(script);
```

The script finds the page's `<form>` and replaces it with HyperPay's branded card UI inside an
**iframe**. The PAN/CVV live only inside that iframe — the page's JS **cannot read them**. This is
what keeps the web app out of heavy PCI scope (PCI-DSS SAQ-A, same as the RN app).

Before injecting, remove any prior widget scripts:

```ts
document.querySelectorAll('script[src*="paymentWidgets.js"]').forEach((s) => s.remove());
```

## A.3 — The redirect + verify (callback is a full page navigation)

HyperPay submits the form and **redirects the browser** to `shopperResultUrl`, appending:

```
?resourcePath=...&id=<checkoutId>&resultCode=<code>
```

The host page is unmounted by this navigation, so **all recovery state must live in the URL +
`sessionStorage`**, never in component state. Persist the pending checkout id before redirect:

```ts
sessionStorage.setItem(
  'pending_card_checkout',
  JSON.stringify({ checkoutId, intent: 'card-registration' }),
);
```

The callback route then reads `id` / `checkoutId` from the URL, calls
`GET /api/payments/status/{checkoutId}`, and proceeds based on the result.

## A.4 — Mimic mode (dev shortcut)

If `checkoutId` starts with `MIMIC_` (or `environment === 'mimic'`), the backend simulated the
payment — **skip the widget entirely**, call `/status` directly, then proceed to the success path.
This is how tests run without a real HyperPay session.

## A.5 — Design control note

COPYandPAY's iframe **cannot** be fully restyled — the inner inputs belong to HyperPay. To brand
the surrounding chrome (header, order summary, trust badges, accepted-card pills, layout), wrap the
`<form>` in your own shell component and inject a custom CSS string once per document (guarded by
an id) — exactly what the RN app does via `CheckoutShell` + `hyperpayStyles.ts`. For truly bespoke
inputs you'd need HyperPay's hosted-fields/Custom-UI product (if offered) or accept SAQ-D — that's
a separate decision, out of scope here.

---

# Part B — The iOS flow, adapted to web

The iOS app manages **stored cards** via four operations on `/api/user/cards/*`. The web port keeps
the exact same endpoints and the exact same 3-step add-card shape — **only step 2 changes**: where
iOS shows the native `OPPWAMobile` SwiftUI view, the web shows the COPYandPAY iframe.

## B.1 — Endpoint surface (identical to iOS, both roles)

All four operations go through `/api/user/cards/*` for **both USER and TECHNICIAN** roles.

| Operation             | Method | URL                                | Body             |
| --------------------- | ------ | ---------------------------------- | ---------------- |
| List cards            | GET    | `/api/user/cards`                  | —                |
| Prepare registration  | POST   | `/api/user/cards/prepare`          | —                |
| Complete registration | POST   | `/api/user/cards/complete`         | `{ checkoutId }` |
| Set default           | PUT    | `/api/user/cards/{cardId}/default` | —                |
| Delete                | DELETE | `/api/user/cards/{cardId}`         | —                |

Common response envelope:

```json
// success
{ "success": true, ...payload }
// error (non-200 OR success:false)
{ "success": false, "error": "<message>" }
```

The client treats HTTP 200 + `success: false` as an error using the `error` string — the envelope,
not the HTTP status, is authoritative.

## B.2 — Card model

```ts
interface PaymentCard {
  id: number;
  paymentBrand: 'VISA' | 'MASTERCARD' | 'MADA' | 'AMEX';
  cardBin: string;
  lastFourDigits: string;
  cardHolder: string;
  expiryMonth: string; // ⚠️ string, e.g. "08"
  expiryYear: string; // ⚠️ string, e.g. "2027"
  isDefault: boolean;
  isValidated: boolean; // false → show "pending validation" badge
  createdAt: string; // ISO 8601
}

interface CardListResponse {
  success: boolean;
  cards: PaymentCard[];
}
interface PrepareCardResponse {
  success: boolean;
  checkoutId: string;
  message?: string;
}
interface CompleteCardResponse {
  success: boolean;
  card: PaymentCard;
}
interface CardResponse {
  success: boolean;
  card?: PaymentCard;
  message?: string;
}
```

## B.3 — List cards

`GET /api/user/cards` → `CardListResponse`. Render each `PaymentCard` with brand icon, `**** lastFourDigits`,
expiry, a "default" pill if `isDefault`, and an orange "pending validation" pill if `!isValidated`.
Called on mount and after every add / set-default / delete.

## B.4 — Add card (the 3-step flow, iOS shape with COPYandPAY at step 2)

This is the only flow that differs mechanically from iOS. iOS does prepare → **native SDK UI** →
complete-in-memory. Web does prepare → **COPYandPAY iframe** → redirect → complete-via-callback.

```
Step 1  POST /api/user/cards/prepare                     → { checkoutId }   (1 SAR preauth)
Step 2  inject paymentWidgets.js?checkoutId=<id>          → iframe renders   (NO backend call)
Step 3  redirect → /cards/callback → POST /user/cards/complete { checkoutId } → { card }
```

### Step 1 — Prepare (backend creates a 1 SAR preauth checkout)

`POST /api/user/cards/prepare` (no body) → `PrepareCardResponse { success, checkoutId }`.

- The backend opens a HyperPay preauth (`paymentType: PA`) for 1 SAR.
- This `checkoutId` is then fed to the COPYandPAY widget.

### Step 2 — Show the COPYandPAY widget (uses Part A.2)

- Persist `{ checkoutId, intent: 'card-registration' }` in `sessionStorage` (recovery for the redirect).
- Set `window.wpwlOptions` (see A.2).
- Inject `paymentWidgets.js?checkoutId=<id>` (see A.2).
- The `<form>`'s `action` should be the card-registration callback URL:
  ```html
  <form action="https://<origin>/cards/callback?intent=card-registration"></form>
  ```
- The user types their card into HyperPay's iframe. HyperPay submits + redirects to that action URL.

> **Web build note (as implemented).** The web app did **not** build the COPYandPAY
> widget. Like the phase-payment flow, it takes the **hosted-redirect** path: `prepare`
> is expected to return a `redirectUrl` / `shopperUrl`, and the browser is sent there to
> enter the card, returning to `/dashboard/settings/cards?registration=return`.
> **Consequence — the backend's `POST /user/cards/prepare` MUST return a hosted-page
> `redirectUrl` (or `shopperUrl`)** for web. If it returns only `{ success, checkoutId }`
> (the iOS/native shape), there is no on-page card-entry UI, so `resolveCardRedirectTarget`
> returns `null` and the UI shows `cards.add.unavailable` instead of bouncing into
> `complete` on an unpaid checkout. Bouncing to `complete` without capturing the card is
> what makes the backend crash with `Error getting checkout payment result: Cannot invoke
JsonNode.asText() … get(String) is null` — a missing payment result on an unpaid
> checkout. Mimic mode (`MIMIC_…`) is the one exception: it has no `redirectUrl` by design
> and is allowed to skip straight to `complete`. (Alternative if on-site entry is later
> required: build the COPYandPAY widget per A.2 — not done.)

### Step 3 — Complete (reverses the 1 SAR + tokenizes the card)

The callback route (`/cards/callback`) reads `checkoutId` from the URL (`?id=` or `?checkoutId=`),
optionally verifies via `GET /api/payments/status/{checkoutId}` for nicer error UX, then calls:

`POST /api/user/cards/complete` body `{ checkoutId }` → `CompleteCardResponse { success, card }`.

- The backend uses the `checkoutId` to query HyperPay, validate the card, **reverse the 1 SAR
  preauth**, persist the tokenized card, and return it.
- On success: toast `"card_registered_success"` (formatted with brand + last4), refresh the list.
- On failure: surface `error` from the envelope.

### Card-registration callback route (new — doesn't exist in iOS)

Because the web flow ends in a redirect, you need a dedicated callback route (iOS doesn't — its SDK
returns in-memory). Suggested path: `/cards/callback`.

Responsibilities:

1. Read `checkoutId` (and `resourcePath`) from the URL query.
2. Optional: `GET /api/payments/status/{checkoutId}` to detect failure early.
3. `POST /api/user/cards/complete` `{ checkoutId }`.
4. Redirect back to the cards management page with a success/error flag in the URL.
5. Clear `sessionStorage['pending_card_checkout']`.

The 1 SAR preauth is reversed by `/complete`; the user is never actually charged for adding a card.
If the user abandons after Step 2, the hold falls off per HyperPay's normal timeout.

## B.5 — Set default

`PUT /api/user/cards/{cardId}/default` → `CardResponse`. Only show the "Set as default" control on
cards where `!isDefault`.

## B.6 — Delete

Confirm via a destructive dialog first, then `DELETE /api/user/cards/{cardId}` → `CardResponse`.

---

# Hybrid call sequence (full add-card on web)

```
User clicks "Add card"
   │
   ▼
POST /api/user/cards/prepare                 → { checkoutId: "CDE…" }          ← iOS endpoint
   │
   ▼
sessionStorage.set('pending_card_checkout', { checkoutId, intent })           ← RN pattern
set window.wpwlOptions { style:'card', brandDetection:true, onReady, onError }
inject <script src="…oppwa.com/v1/paymentWidgets.js?checkoutId=CDE…">          ← RN mechanism
   │
   ▼  (iframe renders, user types card, HyperPay submits)
   │
   ▼
BROWSER REDIRECT → /cards/callback?intent=card-registration&id=CDE…&resourcePath=…   ← RN pattern
   │
   ▼
GET /api/payments/status/CDE…                → { paymentResult:true, code:"000.000.000" }  ← RN endpoint (optional)
   │
   ▼
POST /api/user/cards/complete  { checkoutId: "CDE…" }  → { card }              ← iOS endpoint
   │
   ▼
Redirect to /cards?added=success → list refreshes
```

---

# Quick reference

| Concern                     | Source | Detail                                                  |
| --------------------------- | ------ | ------------------------------------------------------- |
| Card CRUD endpoints         | iOS    | `/api/user/cards{,prepare,complete,/default}`           |
| Checkout + status endpoints | RN     | `/api/payments/{create-checkout,status/:id}`            |
| Card-capture UI             | RN     | COPYandPAY `paymentWidgets.js` iframe                   |
| Add-card shape              | iOS    | 3-step: prepare → capture → complete                    |
| 1 SAR preauth reversal      | iOS    | `/complete` reverses it server-side                     |
| Redirect recovery           | RN     | URL + `sessionStorage` (host unmounts on redirect)      |
| Success codes               | RN     | classified client-side (`000.000.000` etc.)             |
| Mimic mode                  | RN     | `MIMIC_` checkoutId → skip widget, call status directly |
| Same endpoints both roles   | iOS    | USER and TECHNICIAN both use `/user/cards`              |

# Gotchas

- **Step 2 is the only mechanical difference from iOS.** iOS step 2 is the native SDK returning an
  `OPPTransaction` in-memory; web step 2 is the COPYandPAY iframe ending in a redirect. Steps 1 and
  3 are byte-identical.
- **Web needs a `/cards/callback` route that iOS doesn't.** iOS calls `/complete` synchronously
  right after the SDK callback; web must wait for the redirect, recover state from URL +
  `sessionStorage`, then call `/complete`.
- **`paymentType: PA` (preauth) for card registration**, not `DB` (debit). The 1 SAR is reversed on
  `/complete`. Using `DB` would actually charge the user 1 SAR.
- **HTTP 200 with `success: false` is an error** on every `/user/cards` response — read the
  envelope, not the status code.
- **`expiryMonth`/`expiryYear` are strings** on `PaymentCard`. Don't type them as `number`.
- **Remove prior widget scripts before injecting** — a stale `paymentWidgets.js` binds to the wrong
  checkout.
- **`shopperResultUrl` (RN) and `<form action>` are the same idea** — both tell HyperPay where to
  redirect. For card registration point them at `/cards/callback`.
- **The iframe is not restyle-able** — brand the surrounding shell, not the inputs. See A.5.
- **Confirm HyperPay env from the checkoutId** (`prod` substring → production host), don't rely on
  a build flag — same rule as RN.

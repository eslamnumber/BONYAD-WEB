# Forms and validation

## The stack

- **react-hook-form** for form state.
- **zod** for schemas — one schema per form, in `features/X/schemas/`.
- **shadcn/ui `<Form>` components** wire RHF + zod together.

## Rules

1. **Every form has a zod schema.** No exceptions, including "tiny" forms.
2. **The form schema is the source of truth for the payload type.** Derive with `z.infer<typeof schema>`. Don't write the type by hand.
3. **Reuse the schema for API validation when possible.** If the form payload matches the API request body, the same zod schema validates both. If they differ, write a `formSchema` and an `apiSchema` and a pure `toApiPayload(formValues)` transformer.
4. **Validation messages go through i18n.** Schemas use translation keys; the form layer translates at render time.
   ```ts
   const schema = z.object({
     email: z.string().email({ message: 'errors.email_invalid' }),
   });
   ```
5. **Forms submit through a mutation hook.** Submit handler calls `mutate(values)`. Never call `fetch` from a submit handler.
6. **Server errors map to form fields.** On 4xx with field errors, call `form.setError(fieldName, { message })`. On generic errors, show a toast.
7. **Disable the submit button while `isSubmitting || mutation.isPending`.**
8. **All inputs use shadcn `<FormField>`.** No raw `<input>` outside `components/ui/`.
9. **No uncontrolled form state.** Every input is registered with RHF.
10. **Multi-step forms** use one big schema with `.partial()` per step + a parent `useForm` instance lifted to the page.
11. **`type="tel" | email | number | url | search` inputs need `text-end` plus the primitive's `[direction:inherit]` override — `dir="auto"` is _not_ enough.** Browser UA stylesheets force `direction: ltr` on these input types, which silently overrides ancestor inheritance and any `dir="auto"` heuristic. Result: typed content anchors to the opposite side of the parent's leading icon, breaking the mirror in either `en` or `ar`. The shared `Input` primitive ([src/components/ui/input.tsx](../src/components/ui/input.tsx)) ships with a `[direction:inherit]` class that re-enables inheritance from `<html dir>`; _don't strip it_. On the consumer side, add `text-end` to the input so typed digits align with the parent's `end-*` icon. Do not pass `dir="auto"` for digit-only fields — it does nothing (digits are bidi-weak, falls back to parent, then UA overrides). Reserve `dir="auto"` for genuinely mixed-language free-text fields (names, addresses, descriptions, multilingual comments). See [i18n-and-rtl.md](i18n-and-rtl.md) §RTL rules rule 5.
12. **Digit-only fields filter input at the `onChange` event AND validate at submit.** Filtering with the schema alone is not enough — the user must literally not be able to type non-digits. Spread `register('phone')`, then provide a custom `onChange` that mutates `e.target.value` through a normaliser before calling the RHF-provided onChange. Same pattern for name fields that reject digits. The submit-time zod schema still asserts the format (so paste, autofill, and programmatic changes are caught too).
13. **Show the rules to the user, not just on submit.** Phone, name, confirm-password fields render a static helper line via `<FieldHint>` (from `components/ui/`). Password creation renders a live `<PasswordRulesList>` (from `features/auth/components/`) below the input — each rule turns green the moment it's satisfied. Helpers come from `auth.hints.*` / `auth.passwordRules.*` i18n keys. The pattern generalises beyond auth: every required, format-constrained, or pattern-driven field should ship with a visible hint.
14. **Required vs optional is explicit, schema-derived, and announced.** A field is required unless its zod schema is `.optional()` / `.nullish()` or carries a `.default()` — never decide required-ness per-label by hand. House style is **asterisk-for-required**: render a colored `*` after the `<FormLabel>` text for required fields, mark that `*` decorative (`aria-hidden`), set `aria-required` on the control (this is what a screen reader announces — not the glyph), and show a one-line `* {t('forms.requiredLegend')}` legend once per form. Optional fields are unmarked. **Color is never the only signal** — the `*` glyph + `aria-required` carry it for colorblind/non-sighted users. `<FormLabel>` takes a `required` prop fed from the schema (`isRequired(schema.shape.field)`) so the marker can never drift from the validation. Marker text/legend come from `forms.*` i18n keys (rule 4).
15. **Validation timing: `mode: 'onTouched'`, `reValidateMode: 'onChange'`.** Pass these to `useForm` so a field does not error before the user has touched it, but once it has errored the message clears live as they fix it. Erroring on the first keystroke (`mode: 'onChange'` globally) is hostile; waiting until submit (`onSubmit`) hides fixable mistakes too long. Exception: the live `<PasswordRulesList>` (rule 13) evaluates from the first keystroke by design.
16. **On a failed submit, point the user at the problem.** Errored controls get `aria-invalid` (shadcn sets this from `fieldState.error` — don't strip it), focus moves to the first invalid field (`form.setFocus(firstErrorName)` in RHF's `onInvalid` handler), and forms longer than ~6 fields render an error summary (`role="alert"`, anchor links to each invalid field) above the form. Full pattern + WCAG 2.2 §3.3.1 mapping in [accessibility.md](accessibility.md) §Form errors.
17. **Confirm success explicitly.** A successful mutation ends in visible feedback — `toast.success(t('…'))`, a redirect, or a success view — never a silent reset that leaves the user unsure it worked. With rule 7 (submit disabled while pending) the whole idle → pending → success/error lifecycle stays visible.

## Field validation rules (auth)

Shared validators live in [`src/features/auth/utils/`](../src/features/auth/utils/) and are re-exported from the barrel. Mirror these in any new auth-adjacent screen (reset-password, change-phone, …) so the policy can't drift. Saudi-phone primitives (`normalizePhoneInput`, `normalizePhoneForApi`, `saudiPhoneSchema`) are also exported from [`src/lib/saudi-phone.ts`](../src/lib/saudi-phone.ts) so non-auth features (e.g. `features/contact`) can reuse the same validator without violating the cross-feature import rule.

| Field                         | Validator                                         | Rule                                                                                                                                                                                                             | i18n key on failure                                     |
| ----------------------------- | ------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| **Phone (input)**             | `normalizePhoneInput(raw)`                        | Saudi-only live filter — Arabic→English digits, peels a leading `00`/`966`/`0` prefix, then keeps the body ONLY if it starts with `5`, hard-capped at 9 digits (`5XXXXXXXX`). A non-Saudi number can't be typed. | n/a — filter is silent                                  |
| **Phone (submit)**            | `saudiPhoneSchema`                                | Exactly 9 digits starting with `5` after normalisation (Saudi mobile)                                                                                                                                            | `auth.errors.phoneMust9DigitsStarting5`                 |
| **Phone (to API)**            | `normalizePhoneForApi(raw)`                       | Same `5XXXXXXXX` national body as the input filter, used at the `features/auth/api/*` boundary                                                                                                                   | n/a                                                     |
| **Password (create)**         | `strongPasswordSchema`                            | ≥ 8 chars, ≥ 1 uppercase, ≥ 1 digit, ≥ 1 special (non-alphanumeric), no whitespace, no ascending-digit run > 3                                                                                                   | `auth.errors.password_<rule>` (one per failing rule)    |
| **Password (live indicator)** | `evaluatePassword(value)` → `<PasswordRulesList>` | Returns per-rule flags; the list turns each rule green as it's satisfied                                                                                                                                         | `auth.passwordRules.<rule>`                             |
| **Password (login)**          | `z.string().min(1)`                               | Existing accounts may predate the policy — only require non-empty on login                                                                                                                                       | `auth.errors.passwordRequired`                          |
| **Name**                      | `personNameSchema`                                | Length > 0, no digits anywhere                                                                                                                                                                                   | `auth.errors.nameNoDigits` / `auth.errors.nameRequired` |
| **OTP**                       | `verifyOtpFormSchema.otp`                         | Exactly 4 digits                                                                                                                                                                                                 | `auth.errors.otpInvalid`                                |

The policy is ported verbatim from `website-bonyad/src/validation/passwordPolicy.ts`, including the subtle "ascending digit run > 3" rule (rejects `1234` but allows `1313` and `1111`). Do not tighten or loosen the rules client-side without coordinating with the RN app — both clients must agree.

## Cross-field and range validation

Dependent rules — date ranges (start < end), budget min ≤ max, password confirmation, "at least one of", conditionally-required fields — live in the **schema** via `.refine` / `.superRefine`, never as ad-hoc `if` checks in the component. Attach the message to the field the user must fix with `path`:

```ts
export const phaseDatesSchema = z
  .object({ startDate: z.coerce.date(), endDate: z.coerce.date() })
  .refine((v) => v.startDate < v.endDate, {
    message: 'projects.errors.endBeforeStart', // i18n key (rule 4)
    path: ['endDate'], // renders under endDate's <FormMessage>, not as a form-level error
  });
```

- **Always set `path`** so the error lands on the offending field (and its `aria-describedby`), not as an orphaned form-level message the screen reader can't associate with an input.
- **Date pickers also constrain `min`/`max`** (e.g. `endDate` min = the selected `startDate`) so an invalid range is hard to enter in the first place — belt-and-suspenders with the submit-time `.refine`, mirroring the digit-filter rule (rule 12).
- Keep cross-field rules on the form / `apiSchema` so they fire **before** the request — the user must never need a server round-trip to learn `end < start`. The backend re-checks, but that's a backstop, not the UX.

## File layout

```
features/projects/
├── schemas/project.schema.ts          # zod schemas + inferred types
├── components/create-project-form.tsx # the form component
└── api/create-project.ts              # mutation hook
```

## Schema template

```ts
// features/projects/schemas/project.schema.ts
import { z } from 'zod';

export const projectSchema = z.object({
  id: z.string(),
  title: z.string(),
  status: z.enum(['DRAFT', 'OPEN', 'IN_PROGRESS', 'COMPLETED']),
  createdAt: z.coerce.date(),
});
export type Project = z.infer<typeof projectSchema>;

export const createProjectRequestSchema = z.object({
  title: z.string().min(3, { message: 'errors.title_too_short' }),
  description: z.string().min(10, { message: 'errors.description_too_short' }),
  regionId: z.string(),
  serviceId: z.string(),
});
export type CreateProjectRequest = z.infer<typeof createProjectRequestSchema>;
```

## Form component template

The template below shows rules 6, 14, 15, 16 and 17 wired together:

```tsx
// features/projects/components/create-project-form.tsx — 'use client'
// imports: useForm, zodResolver, useTranslation, toast, shadcn Form*/Input/Button,
// the mutation hook, and the schema + inferred type.
export function CreateProjectForm() {
  const { t } = useTranslation();
  const mutation = useCreateProject();
  const form = useForm<CreateProjectRequest>({
    resolver: zodResolver(createProjectRequestSchema),
    mode: 'onTouched', // rule 15: don't error before first blur…
    reValidateMode: 'onChange', // …but clear errors live once shown
    defaultValues: { title: '', description: '', regionId: '', serviceId: '' },
  });

  const onSubmit = form.handleSubmit(
    (values) =>
      mutation.mutate(values, {
        onSuccess: () => toast.success(t('projects.create.success')), // rule 17
        onError: (error) =>
          Object.entries(error.fieldErrors ?? {}).forEach(([f, m]) =>
            form.setError(f as keyof CreateProjectRequest, { message: m }),
          ), // rule 6
      }),
    () => form.setFocus(Object.keys(form.formState.errors)[0] as keyof CreateProjectRequest), // rule 16
  );

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <FormField
          control={form.control}
          name="title"
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel required>{t('projects.create.titleLabel')}</FormLabel> {/* rule 14 */}
              <FormControl>
                <Input aria-invalid={!!fieldState.error} {...field} />
              </FormControl>
              <FormMessage>{fieldState.error && t(fieldState.error.message!)}</FormMessage>
            </FormItem>
          )}
        />
        {/* …other fields */}
        <Button type="submit" disabled={mutation.isPending}>
          {t('projects.create.submit')}
        </Button>
      </form>
    </Form>
  );
}
```

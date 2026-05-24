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

## Field validation rules (auth)

Shared validators live in [`src/features/auth/utils/`](../src/features/auth/utils/) and are re-exported from the barrel. Mirror these in any new auth-adjacent screen (reset-password, change-phone, …) so the policy can't drift. Saudi-phone primitives (`normalizePhoneInput`, `normalizePhoneForApi`, `saudiPhoneSchema`) are also exported from [`src/lib/saudi-phone.ts`](../src/lib/saudi-phone.ts) so non-auth features (e.g. `features/contact`) can reuse the same validator without violating the cross-feature import rule.

| Field                         | Validator                                         | Rule                                                                                                           | i18n key on failure                                     |
| ----------------------------- | ------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| **Phone (input)**             | `normalizePhoneInput(raw)`                        | Digit-only filter, Arabic→English digit normalisation, capped at 10 chars (leading 0 + 9-digit body)           | n/a — filter is silent                                  |
| **Phone (submit)**            | `saudiPhoneSchema`                                | Exactly 9 digits after stripping the leading `0`, must start with `5` (Saudi mobile)                           | `auth.errors.phoneMust9DigitsStarting5`                 |
| **Phone (to API)**            | `normalizePhoneForApi(raw)`                       | Strips leading `0`, used at the `features/auth/api/*` boundary                                                 | n/a                                                     |
| **Password (create)**         | `strongPasswordSchema`                            | ≥ 8 chars, ≥ 1 uppercase, ≥ 1 digit, ≥ 1 special (non-alphanumeric), no whitespace, no ascending-digit run > 3 | `auth.errors.password_<rule>` (one per failing rule)    |
| **Password (live indicator)** | `evaluatePassword(value)` → `<PasswordRulesList>` | Returns per-rule flags; the list turns each rule green as it's satisfied                                       | `auth.passwordRules.<rule>`                             |
| **Password (login)**          | `z.string().min(1)`                               | Existing accounts may predate the policy — only require non-empty on login                                     | `auth.errors.passwordRequired`                          |
| **Name**                      | `personNameSchema`                                | Length > 0, no digits anywhere                                                                                 | `auth.errors.nameNoDigits` / `auth.errors.nameRequired` |
| **OTP**                       | `verifyOtpFormSchema.otp`                         | Exactly 4 digits                                                                                               | `auth.errors.otpInvalid`                                |

The policy is ported verbatim from `website-bonyad/src/validation/passwordPolicy.ts`, including the subtle "ascending digit run > 3" rule (rejects `1234` but allows `1313` and `1111`). Do not tighten or loosen the rules client-side without coordinating with the RN app — both clients must agree.

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

```tsx
// features/projects/components/create-project-form.tsx
'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useCreateProject } from '../api/create-project';
import { createProjectRequestSchema, type CreateProjectRequest } from '../schemas/project.schema';

export function CreateProjectForm() {
  const { t } = useTranslation();
  const mutation = useCreateProject();
  const form = useForm<CreateProjectRequest>({
    resolver: zodResolver(createProjectRequestSchema),
    defaultValues: { title: '', description: '', regionId: '', serviceId: '' },
  });

  const onSubmit = form.handleSubmit((values) =>
    mutation.mutate(values, {
      onError: (error) => {
        if (error.fieldErrors) {
          Object.entries(error.fieldErrors).forEach(([field, msg]) =>
            form.setError(field as keyof CreateProjectRequest, { message: msg }),
          );
        }
      },
    }),
  );

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel>{t('projects.create.titleLabel')}</FormLabel>
              <FormControl>
                <Input {...field} />
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

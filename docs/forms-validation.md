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

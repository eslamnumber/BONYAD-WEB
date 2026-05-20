import { FieldHint } from '@/components/ui';

export function FieldFooter({ errorText, hint }: { errorText?: string; hint?: string }) {
  const content = errorText ?? hint;
  if (!content) return null;
  return <FieldHint tone={errorText ? 'error' : 'neutral'}>{content}</FieldHint>;
}

export function resolveError(err: { message?: string } | undefined, t: (k: string) => string) {
  return err?.message ? t(err.message) : undefined;
}

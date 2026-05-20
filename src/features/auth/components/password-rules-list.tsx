'use client';

import { useTranslation } from 'react-i18next';

import { cn } from '@/lib/utils';

import { PASSWORD_RULE_ORDER, evaluatePassword } from '../utils';

function CheckGlyph({ ok }: { ok: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'inline-flex size-4 items-center justify-center rounded-full text-[10px] font-bold',
        ok
          ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
          : 'bg-muted text-muted-foreground',
      )}
    >
      {ok ? '✓' : '•'}
    </span>
  );
}

export function PasswordRulesList({ value }: { value: string }) {
  const { t } = useTranslation();
  const { rules } = evaluatePassword(value);
  return (
    <div className="flex flex-col gap-1.5 rounded-md border border-dashed border-slate-300 p-3 dark:border-slate-700">
      <p className="text-foreground/80 text-xs font-medium">{t('auth.passwordRules.heading')}</p>
      <ul className="flex flex-col gap-1">
        {PASSWORD_RULE_ORDER.map(({ key, i18nKey }) => {
          const ok = rules[key];
          return (
            <li
              key={key}
              className={cn(
                'flex items-center gap-2 text-xs',
                ok ? 'text-foreground' : 'text-muted-foreground',
              )}
            >
              <CheckGlyph ok={ok} />
              <span>{t(i18nKey)}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

'use client';

import { useTranslation } from 'react-i18next';

import {
  API_ENVIRONMENT_LIST,
  type ApiEnvironment,
  type ApiEnvironmentKey,
} from '@/config/api-environments';
import { cn } from '@/lib/utils';

function EnvironmentRow({
  env,
  isCurrent,
  disabled,
  currentLabel,
  onSelect,
}: {
  env: ApiEnvironment;
  isCurrent: boolean;
  disabled: boolean;
  currentLabel: string;
  onSelect: () => void;
}) {
  const { t } = useTranslation();
  return (
    <button
      type="button"
      disabled={isCurrent || disabled}
      onClick={onSelect}
      className={cn(
        'flex items-center gap-3 rounded-xl border p-3.5 text-start transition-colors',
        isCurrent ? 'cursor-default' : 'hover:bg-accent focus-visible:outline-ring',
      )}
      style={{
        borderColor: isCurrent ? env.badgeColor : undefined,
        borderWidth: isCurrent ? 2 : undefined,
      }}
    >
      <span
        className="size-9 shrink-0 rounded-full"
        style={{ backgroundColor: `${env.badgeColor}29` }}
        aria-hidden
      />
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="text-foreground text-[15px] font-bold">
          {t(env.displayNameKey)}
          {isCurrent && (
            <span
              className="ms-2 rounded-full px-1.5 py-0.5 text-[9px] font-black text-white uppercase"
              style={{ backgroundColor: env.badgeColor }}
            >
              {currentLabel}
            </span>
          )}
        </span>
        <span className="text-muted-foreground truncate font-mono text-[11px]">{env.baseUrl}</span>
      </span>
    </button>
  );
}

export function EnvironmentList({
  currentKey,
  disabled,
  onSelect,
}: {
  currentKey: ApiEnvironmentKey;
  disabled: boolean;
  onSelect: (env: ApiEnvironment) => void;
}) {
  const { t } = useTranslation();
  return (
    <div className="mt-5 flex flex-col gap-3">
      {API_ENVIRONMENT_LIST.map((env) => (
        <EnvironmentRow
          key={env.key}
          env={env}
          isCurrent={env.key === currentKey}
          disabled={disabled}
          currentLabel={t('env.current')}
          onSelect={() => onSelect(env)}
        />
      ))}
    </div>
  );
}

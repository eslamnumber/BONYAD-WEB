'use client';

import { useEffect, useRef, useState } from 'react';

import { ChevronDownIcon } from '@/components/icons';
import { cn } from '@/lib/utils';

import { WizardFieldShell } from './wizard-fields';

type Option = { value: string; label: string };

const TRIGGER =
  'bg-background border-slate-300 flex h-12 w-full items-center justify-between gap-2 rounded-md border px-3 text-base disabled:opacity-50';
const OPTION =
  'text-foreground hover:bg-accent flex w-full justify-end px-3 py-2 text-end text-base';

function Trigger(props: {
  id: string;
  open: boolean;
  disabled?: boolean;
  label?: string;
  placeholder: string;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      id={props.id}
      disabled={props.disabled}
      aria-haspopup="listbox"
      aria-expanded={props.open}
      onClick={props.onToggle}
      className={TRIGGER}
    >
      <ChevronDownIcon aria-hidden className="text-foreground size-6 shrink-0" />
      <span
        className={cn(
          'flex-1 truncate text-end',
          props.label ? 'text-foreground' : 'text-input-placeholder',
        )}
      >
        {props.label ?? props.placeholder}
      </span>
    </button>
  );
}

function Listbox({
  options,
  value,
  onSelect,
}: {
  options: Option[];
  value: string;
  onSelect: (value: string) => void;
}) {
  return (
    <ul
      role="listbox"
      className="bg-popover border-border absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-md border py-1 shadow-md"
    >
      {options.map((o) => (
        <li key={o.value}>
          <button
            type="button"
            role="option"
            aria-selected={o.value === value}
            onClick={() => onSelect(o.value)}
            className={OPTION}
          >
            {o.label}
          </button>
        </li>
      ))}
    </ul>
  );
}

type Props = {
  id: string;
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  error?: string;
  disabled?: boolean;
};

/**
 * Custom single-select (the app has no native `<select>`) — a trigger + floating
 * listbox built from logical utilities so the value right-aligns under the
 * inverted RTL mapping (`text-end`, no `dir="auto"`). The chevron sits at the
 * inline-start, the value/placeholder at the inline-end, mirroring with locale.
 */
export function WizardSelectField({
  id,
  label,
  placeholder,
  value,
  onChange,
  options,
  error,
  disabled,
}: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  return (
    <WizardFieldShell id={id} label={label} error={error}>
      <div ref={ref} className="relative w-full">
        <Trigger
          id={id}
          open={open}
          disabled={disabled}
          label={selected?.label}
          placeholder={placeholder}
          onToggle={() => setOpen((o) => !o)}
        />
        {open ? (
          <Listbox
            options={options}
            value={value}
            onSelect={(v) => {
              onChange(v);
              setOpen(false);
            }}
          />
        ) : null}
      </div>
    </WizardFieldShell>
  );
}

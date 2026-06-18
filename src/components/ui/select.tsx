'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { type RefObject, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import { ChevronDownIcon } from '@/components/icons';
import { cn } from '@/lib/utils';

export type SelectOption = { value: string; label: string };

/** Fixed-position box for the portalled listbox. `top` OR `bottom` is set (flips up when needed). */
type Pos = { left: number; width: number; maxHeight: number; top?: number; bottom?: number };

type TriggerProps = {
  id?: string;
  open: boolean;
  disabled?: boolean;
  label?: string;
  placeholder: string;
  onToggle: () => void;
  buttonRef: RefObject<HTMLButtonElement | null>;
};

/** Trigger: chevron at the inline-start, value/placeholder at the inline-end (text-end). */
function Trigger({ id, open, disabled, label, placeholder, onToggle, buttonRef }: TriggerProps) {
  return (
    <button
      ref={buttonRef}
      type="button"
      id={id}
      disabled={disabled}
      aria-haspopup="listbox"
      aria-expanded={open}
      onClick={onToggle}
      className="border-input bg-field-surface focus-visible:ring-ring flex h-11 w-full items-center justify-between gap-2 rounded-md border px-3 text-[15px] focus-visible:ring-2 focus-visible:outline-none disabled:opacity-50"
    >
      <ChevronDownIcon
        aria-hidden
        className={cn(
          'text-muted-foreground size-5 shrink-0 transition-transform',
          open && 'rotate-180',
        )}
      />
      <span
        className={cn(
          'flex-1 truncate text-end',
          label ? 'text-foreground' : 'text-muted-foreground',
        )}
      >
        {label ?? placeholder}
      </span>
    </button>
  );
}

type ListboxProps = {
  pos: Pos;
  options: SelectOption[];
  value: string;
  onSelect: (value: string) => void;
  listRef: RefObject<HTMLUListElement | null>;
};

/**
 * Floating listbox, **portalled to `<body>`** so no `overflow-hidden` ancestor
 * (the animated panel/card) can crop it. Positioned `fixed` under the trigger —
 * or flipped above it with a capped height when there isn't room below (mobile),
 * so it's never cut off by the viewport. Fades + slides on open/close.
 */
function Listbox({ pos, options, value, onSelect, listRef }: ListboxProps) {
  return createPortal(
    <motion.ul
      ref={listRef}
      role="listbox"
      style={{
        position: 'fixed',
        left: pos.left,
        width: pos.width,
        maxHeight: pos.maxHeight,
        top: pos.top,
        bottom: pos.bottom,
      }}
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="bg-popover border-border z-50 overflow-auto rounded-md border py-1 shadow-md"
    >
      {options.map((o) => (
        <li key={o.value}>
          <button
            type="button"
            role="option"
            aria-selected={o.value === value}
            onClick={() => onSelect(o.value)}
            className={cn(
              'text-foreground hover:bg-accent flex w-full justify-end px-3 py-2 text-end text-[15px]',
              o.value === value && 'bg-accent/60 font-medium',
            )}
          >
            {o.label}
          </button>
        </li>
      ))}
    </motion.ul>,
    document.body,
  );
}

type Props = {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder: string;
  disabled?: boolean;
};

const MAX_LIST_HEIGHT = 240;
const GAP = 6;

/** Place the listbox below the trigger, or flip above with a capped height when room below is short. */
function computePos(trigger: HTMLButtonElement): Pos {
  const r = trigger.getBoundingClientRect();
  const below = window.innerHeight - r.bottom - GAP;
  const above = r.top - GAP;
  const openUp = below < 200 && above > below;
  const space = openUp ? above : below;
  const base = {
    left: r.left,
    width: r.width,
    maxHeight: Math.min(MAX_LIST_HEIGHT, Math.max(120, space)),
  };
  return openUp
    ? { ...base, bottom: window.innerHeight - r.top + GAP }
    : { ...base, top: r.bottom + GAP };
}

/** Measure the trigger when open, and close on outside-click / Escape / scroll / resize. */
function useDropdownAnchor(
  open: boolean,
  setOpen: (open: boolean) => void,
  triggerRef: RefObject<HTMLButtonElement | null>,
  listRef: RefObject<HTMLUListElement | null>,
): Pos | null {
  const [pos, setPos] = useState<Pos | null>(null);
  useEffect(() => {
    if (!open) return;
    if (triggerRef.current) setPos(computePos(triggerRef.current));
    const close = () => setOpen(false);
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (!triggerRef.current?.contains(t) && !listRef.current?.contains(t)) close();
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close();
    // Page/container scroll re-positions the fixed listbox, so close it — but NOT
    // when the scroll happens inside the listbox itself (the user is scrolling options).
    const onScroll = (e: Event) => {
      if (!listRef.current?.contains(e.target as Node)) close();
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', close);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', close);
    };
  }, [open, setOpen, triggerRef, listRef]);
  return pos;
}

/**
 * Custom single-select — the app has no native `<select>`. Logical utilities so the
 * value + options right-align under the inverted RTL mapping (`text-end`, no `dir`),
 * dark-safe tokens, and the portalled listbox animates open/close and is never
 * cropped by an `overflow-hidden` parent. Closes on outside-click / Escape / scroll.
 */
export function Select({ id, value, onChange, options, placeholder, disabled }: Props) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const selected = options.find((o) => o.value === value);
  const pos = useDropdownAnchor(open, setOpen, triggerRef, listRef);

  return (
    <div className="relative w-full">
      <Trigger
        id={id}
        open={open}
        disabled={disabled}
        label={selected?.label}
        placeholder={placeholder}
        onToggle={() => setOpen((o) => !o)}
        buttonRef={triggerRef}
      />
      <AnimatePresence>
        {open && pos ? (
          <Listbox
            pos={pos}
            options={options}
            value={value}
            listRef={listRef}
            onSelect={(v) => {
              onChange(v);
              setOpen(false);
            }}
          />
        ) : null}
      </AnimatePresence>
    </div>
  );
}

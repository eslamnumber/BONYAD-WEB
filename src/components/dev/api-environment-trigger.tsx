'use client';

import { useRef, useState, type ReactNode } from 'react';

import { type ApiEnvironmentKey } from '@/config/api-environments';

import { ApiEnvironmentBadge } from './api-environment-badge';
import { ApiEnvironmentPicker } from './api-environment-picker';

/**
 * Hidden trigger for the backend picker. Wraps any element; tapping it
 * `threshold` times within 1s opens the picker (default 3, matching the Android
 * triple-tap-the-logo gesture). Shows the env badge when off production.
 *
 * `currentKey` is resolved server-side and passed in to avoid a hydration
 * mismatch on first render. The tap target is a `tabIndex={-1}` button so the
 * gesture stays hidden from keyboard/AT while remaining lint-clean.
 */
export function ApiEnvironmentTrigger({
  currentKey,
  threshold = 3,
  children,
}: {
  currentKey: ApiEnvironmentKey;
  threshold?: number;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const count = useRef(0);
  const lastTap = useRef(0);

  function onTap() {
    const now = Date.now();
    if (now - lastTap.current > 1000) count.current = 0;
    count.current += 1;
    lastTap.current = now;
    if (count.current >= threshold) {
      count.current = 0;
      setOpen(true);
    }
  }

  return (
    <span className="relative inline-block">
      <button
        type="button"
        tabIndex={-1}
        onClick={onTap}
        className="cursor-default appearance-none bg-transparent p-0 align-baseline font-[inherit] text-[inherit]"
      >
        {children}
      </button>
      {currentKey !== 'production' && (
        <ApiEnvironmentBadge envKey={currentKey} className="absolute -end-2 -top-1" />
      )}
      {open && <ApiEnvironmentPicker currentKey={currentKey} onClose={() => setOpen(false)} />}
    </span>
  );
}

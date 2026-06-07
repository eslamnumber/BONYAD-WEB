'use client';

import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ApiEnvironmentBadge, ApiEnvironmentPicker } from '@/components/dev';
import { type ApiEnvironmentKey } from '@/config/api-environments';

const TRIPLE_TAP_WINDOW_MS = 1000;
const TRIPLE_TAP_COUNT = 3;

/**
 * Login heading with a hidden dev gesture. The heading text is rendered
 * untouched — so Arabic keeps its natural RTL word order ("… بونياد" with the
 * brand at the end) — and an invisible overlay button captures the triple-tap
 * that opens the backend picker. Wrapping the brand word in an inline-block
 * box (an earlier approach) reorders the bidi run, so we never do that.
 */
export function LoginEnvHeading({
  heading,
  brand,
  envKey,
}: {
  heading: string;
  brand: string;
  envKey: ApiEnvironmentKey;
}) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const count = useRef(0);
  const last = useRef(0);

  function onTap() {
    const now = Date.now();
    if (now - last.current > TRIPLE_TAP_WINDOW_MS) count.current = 0;
    count.current += 1;
    last.current = now;
    if (count.current >= TRIPLE_TAP_COUNT) {
      count.current = 0;
      setOpen(true);
    }
  }

  return (
    <div className="relative">
      <h1 className="text-foreground text-end text-[32px] leading-normal font-medium">
        {heading} <span className="text-brand-dark-navy">{brand}</span>
      </h1>
      <button
        type="button"
        tabIndex={-1}
        aria-label={t('env.pickerTitle')}
        onClick={onTap}
        className="absolute inset-0 cursor-default"
      />
      {envKey !== 'production' && (
        <ApiEnvironmentBadge envKey={envKey} className="absolute end-0 -top-2" />
      )}
      {open && <ApiEnvironmentPicker currentKey={envKey} onClose={() => setOpen(false)} />}
    </div>
  );
}

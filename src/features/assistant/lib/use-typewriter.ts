'use client';

import { useEffect, useState } from 'react';

const STEP = 2; // characters revealed per tick
const TICK = 16; // ms between ticks

// Ids already fully typed — module-level so reopening the panel never re-types old replies.
const typedIds = new Set<string>();

function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true
  );
}

/** Hide a trailing half-open `**bold` or `[NAV:…` token so it never flashes mid-reveal. */
function sanitize(v: string): string {
  let out = v;
  if ((out.match(/\*\*/g)?.length ?? 0) % 2 === 1) out = out.slice(0, out.lastIndexOf('**'));
  const open = out.lastIndexOf('[');
  if (open > out.lastIndexOf(']')) out = out.slice(0, open);
  return out;
}

/**
 * Reveals `text` progressively (Claude-style) for the latest assistant reply, so the
 * formatted markdown "builds up" like the AI project-creation flow. Types each id only
 * once; reduced-motion users and already-typed messages get the full text immediately.
 */
export function useTypewriter(text: string, animate: boolean, id: string) {
  const [reduced] = useState(prefersReducedMotion);
  const skip = !animate || reduced || typedIds.has(id);
  const [len, setLen] = useState(0);

  useEffect(() => {
    if (skip) return;
    let n = 0;
    const timer = window.setInterval(() => {
      n += STEP;
      setLen(n);
      if (n >= text.length) {
        typedIds.add(id);
        window.clearInterval(timer);
      }
    }, TICK);
    return () => window.clearInterval(timer);
  }, [text, skip, id]);

  if (skip || len >= text.length) return { visible: text, done: true };
  return { visible: sanitize(text.slice(0, len)), done: false };
}

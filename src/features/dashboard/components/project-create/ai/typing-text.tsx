'use client';

import { useEffect, useState } from 'react';

const STEP = 2; // characters revealed per tick
const TICK = 18; // ms between ticks

function prefersReducedMotion() {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true
  );
}

/**
 * Reveals `text` character-by-character (Claude-style streaming) when `animate` is set
 * — used for the latest assistant question. A blinking caret trails the typed text; the
 * full text is always present in an `sr-only` node so screen readers get it at once.
 * Reduced-motion users (and non-animated rows) get the full text immediately. This only
 * mounts client-side (after "Let's start"), so reading matchMedia on mount is safe.
 */
export function TypingText({ text, animate }: { text: string; animate: boolean }) {
  const [reduced] = useState(prefersReducedMotion);
  const [typedLen, setTypedLen] = useState(0);

  useEffect(() => {
    if (!animate || reduced) return;
    let count = 0;
    const id = window.setInterval(() => {
      count += STEP;
      setTypedLen(count);
      if (count >= text.length) window.clearInterval(id);
    }, TICK);
    return () => window.clearInterval(id);
  }, [text, animate, reduced]);

  if (!animate || reduced || typedLen >= text.length) {
    return <span>{text}</span>;
  }
  return (
    <>
      <span aria-hidden>
        {text.slice(0, typedLen)}
        <span className="ms-px inline-block h-[1.1em] w-[2px] translate-y-[0.15em] bg-current motion-safe:animate-pulse" />
      </span>
      <span className="sr-only">{text}</span>
    </>
  );
}

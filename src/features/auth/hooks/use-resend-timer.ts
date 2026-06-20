'use client';

import { useEffect, useState } from 'react';

export const RESEND_SECONDS = 54;

/** Countdown gating the "resend code" button on the OTP / reset screens. */
export function useResendTimer(seconds: number = RESEND_SECONDS) {
  const [secondsLeft, setSecondsLeft] = useState(seconds);
  useEffect(() => {
    if (secondsLeft <= 0) return;
    const id = setInterval(() => {
      setSecondsLeft((s) => s - 1);
    }, 1000);
    return () => clearInterval(id);
  }, [secondsLeft]);
  return { secondsLeft, reset: () => setSecondsLeft(seconds) };
}

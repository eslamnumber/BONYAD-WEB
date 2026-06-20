'use client';

import { useState } from 'react';

import { useTerms } from '../api/get-terms';

type Role = 'USER' | 'TECHNICIAN';

/**
 * Owns the active-terms fetch for the selected signup role plus the "read the
 * document" modal state. `termsId` (the version the user is agreeing to) is threaded
 * into the signup → OTP navigation, mirroring how iOS passes it to the OTP screen.
 */
export function useRegisterTerms(role: Role) {
  const query = useTerms(role);
  const [isOpen, setIsOpen] = useState(false);

  return {
    query,
    termsId: query.data?.id,
    isOpen,
    openTerms: () => setIsOpen(true),
    closeTerms: () => setIsOpen(false),
  };
}

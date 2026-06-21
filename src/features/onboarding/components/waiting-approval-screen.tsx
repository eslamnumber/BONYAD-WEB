'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { ROUTES } from '@/config/routes';

import {
  isApproved,
  isSuspended,
  type TechnicianStatus,
  useTechnicianStatus,
} from '../api/get-technician-status';

import { ApprovalStatusCard } from './approval-status-card';
import { OnboardingProgress } from './onboarding-progress';
import {
  ApprovedCard,
  StatusError,
  SuspendedCard,
  WaitingSkeleton,
} from './waiting-approval-states';

/** Onboarding step 3 — polls approval status every 15s and advances on approval. */
export function WaitingApprovalScreen() {
  const router = useRouter();
  const { data, isLoading, isError, refetch } = useTechnicianStatus({ refetchInterval: 15_000 });
  const approved = isApproved(data?.status);

  useEffect(() => {
    if (!approved) return;
    // Approval done → run the post-approval setup wizard first; only an already-
    // onboarded technician skips straight to the dashboard.
    router.replace(data?.onboarded ? ROUTES.DASHBOARD : ROUTES.ONBOARDING_SETUP);
  }, [approved, data?.onboarded, router]);

  return (
    <div className="flex w-full max-w-[420px] flex-col gap-8">
      <OnboardingProgress step={3} total={3} />
      <WaitingApprovalBody
        data={data}
        isLoading={isLoading}
        isError={isError}
        approved={approved}
        onRetry={() => void refetch()}
      />
    </div>
  );
}

type BodyProps = {
  data?: TechnicianStatus;
  isLoading: boolean;
  isError: boolean;
  approved: boolean;
  onRetry: () => void;
};

function WaitingApprovalBody({ data, isLoading, isError, approved, onRetry }: BodyProps) {
  if (isLoading) return <WaitingSkeleton />;
  if (isError) return <StatusError onRetry={onRetry} />;
  if (approved) return <ApprovedCard />;
  if (isSuspended(data?.status)) return <SuspendedCard />;
  return <ApprovalStatusCard data={data} />;
}

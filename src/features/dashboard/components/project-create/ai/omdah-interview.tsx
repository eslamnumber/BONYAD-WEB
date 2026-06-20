'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { SettingsBackLink } from '@/components/layout';
import { ROUTES } from '@/config/routes';

import type { InterviewAnswers } from '../../../api/ai/sow-types';

import { ChatView } from './chat-view';
import { InterviewIntro } from './interview-intro';
import { OmdahSowFlow } from './sow/omdah-sow-flow';

const K = 'dashboard.createProject.ai';

/**
 * Omdah AI flow (Figma 1583:2747 intro → 1597:3378 chat). Opens on the intro screen
 * (animated orb + "Let's start"); clicking it reveals the chat interview, where the
 * assistant asks the 7 local questions and the user answers. When the user hits Generate,
 * the gathered answers hand over to the {@link OmdahSowFlow} (generation → review → publish).
 * Reached from the method picker's AI row.
 */
export function OmdahInterview() {
  const { t } = useTranslation();
  const [started, setStarted] = useState(false);
  const [sowAnswers, setSowAnswers] = useState<InterviewAnswers | null>(null);

  if (sowAnswers) return <OmdahSowFlow answers={sowAnswers} onExit={() => setSowAnswers(null)} />;

  return (
    <div className="relative isolate flex h-full min-h-0 w-full flex-col px-4 py-8 sm:px-6">
      <InterviewBackdrop />
      <SettingsBackLink href={ROUTES.DASHBOARD_PROJECTS_CREATE_PROJECT} label={t(`${K}.back`)} />
      {started ? (
        <ChatView onGenerate={setSowAnswers} />
      ) : (
        <InterviewIntro onStart={() => setStarted(true)} />
      )}
    </div>
  );
}

function InterviewBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div className="bg-deco-blob-blue-light absolute inset-x-0 -bottom-40 mx-auto h-[28rem] w-[120%] rounded-[50%] opacity-20 blur-[90px]" />
    </div>
  );
}

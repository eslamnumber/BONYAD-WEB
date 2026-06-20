'use client';

import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import { useAuthStore } from '@/stores/auth-store';

import type { InterviewAnswers } from '../../../api/ai/sow-types';

import { ChatBubble } from './chat-bubble';
import { InterviewComposer } from './interview-composer';
import { InterviewDone } from './interview-done';
import { buildTranscript, useOmdahInterview, type TranscriptRow } from './use-omdah-interview';

const K = 'dashboard.createProject.ai';
type Translate = ReturnType<typeof useTranslation>['t'];

function rowText(row: TranscriptRow, t: Translate, name?: string): string {
  if (row.role === 'user') return row.text;
  if (row.tkey === 'greeting') return name ? t(`${K}.greetingNamed`, { name }) : t(`${K}.greeting`);
  return t(`${K}.${row.tkey}`);
}

/**
 * The chat interview itself (Figma 1597:3378) — the transcript of assistant questions +
 * user answers, then the composer (or the done panel). The latest assistant bubble types
 * out; the view auto-scrolls to the newest message.
 */
export function ChatView({ onGenerate }: { onGenerate: (answers: InterviewAnswers) => void }) {
  const { t } = useTranslation();
  const firstName = useAuthStore((s) => s.user?.name)
    ?.trim()
    .split(/\s+/)[0];
  const interview = useOmdahInterview();
  const scrollRef = useRef<HTMLDivElement>(null);
  const rows = buildTranscript(interview.step, interview.answers, interview.done);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [interview.step, interview.done]);

  return (
    <div className="mx-auto flex min-h-0 w-full max-w-[662px] flex-1 flex-col gap-4 pt-6">
      <div ref={scrollRef} className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto pb-2">
        {rows.map((row, index) => (
          <ChatBubble
            key={index}
            role={row.role}
            text={rowText(row, t, firstName)}
            animate={index === rows.length - 1}
          />
        ))}
      </div>
      <div className="shrink-0">
        {interview.done ? (
          <InterviewDone
            onEdit={interview.restart}
            onGenerate={() => onGenerate(interview.answers)}
          />
        ) : (
          <InterviewComposer
            value={interview.input}
            onChange={interview.setInput}
            onSubmit={interview.send}
            type={interview.currentType}
            placeholder={t(`${K}.placeholder`)}
            label={t(`${K}.inputLabel`)}
            sendLabel={t(`${K}.send`)}
            canSend={interview.canSend}
          />
        )}
      </div>
    </div>
  );
}

import { describe, expect, it } from 'vitest';

import { renderWithProviders, screen } from '@/testing/render';

import { AssistantMessageContent } from './assistant-message-content';

// A reply mirroring the bot's project-plan shape: emoji headings, a pipe table with a
// currency column, and a blockquote note.
const REPLY = [
  '## 🏗 خطة المشروع — تشطيب 340 م²',
  '### 📋 ملخص المشروع',
  'انتقل إلى قسم "مشاريعي".',
  '| البند | التفاصيل |',
  '|-------|----------|',
  '| نوع المشروع | تشطيب |',
  '| الميزانية | SAR 40000 |',
  '',
  '> 💡 هذه تقديرات استرشادية — احصل على 2-3 عروض رسمية',
].join('\n');

describe('AssistantMessageContent', () => {
  it('renders headings, a table, and a note — emoji stripped — without throwing', () => {
    renderWithProviders(<AssistantMessageContent text={REPLY} id="m-render-1" animate={false} />);

    // Table rendered (not raw pipes), with header + data cells.
    expect(screen.getByRole('table')).toBeTruthy();
    expect(screen.getByText('البند')).toBeTruthy();
    expect(screen.getByText('نوع المشروع')).toBeTruthy();

    // Heading text present with the emoji stripped.
    expect(screen.getByText(/ملخص المشروع/)).toBeTruthy();
    expect(screen.queryByText(/📋/)).toBeNull();
    expect(screen.queryByText(/🏗/)).toBeNull();

    // Blockquote rendered as a note, emoji stripped, currency amount preserved.
    expect(screen.getByText(/هذه تقديرات استرشادية/)).toBeTruthy();
    expect(screen.queryByText(/💡/)).toBeNull();
    expect(screen.getByText(/40000/)).toBeTruthy();

    // Quoted section name renders bold with the quote marks removed.
    expect(screen.getByText('مشاريعي').tagName).toBe('STRONG');
    expect(screen.queryByText(/[“”"]/)).toBeNull();
  });
});

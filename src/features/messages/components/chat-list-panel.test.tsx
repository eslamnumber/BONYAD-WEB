import { describe, expect, it, vi } from 'vitest';
import { axe } from 'vitest-axe';

import { fireEvent, renderWithProviders, screen } from '@/testing/render';

import type { ChatRoom } from '../schemas/chat';

import { ChatListPanel } from './chat-list-panel';

const ROOMS: ChatRoom[] = [
  {
    roomId: 'r1',
    otherUserName: 'Ahmed',
    unreadCount: 2,
    lastMessage: 'Hi there',
    lastMessageAt: '2026-06-07T10:00:00Z',
  },
  {
    roomId: 'r2',
    otherUserName: 'Sara',
    unreadCount: 0,
    lastMessage: 'See you',
    lastMessageAt: '2026-06-06T10:00:00Z',
  },
];

function setup(onSelect = vi.fn()) {
  renderWithProviders(<ChatListPanel rooms={ROOMS} selectedRoomId={null} onSelect={onSelect} />);
  return onSelect;
}

describe('ChatListPanel', () => {
  it('renders every conversation by default', () => {
    setup();
    expect(screen.getByRole('button', { name: /conversation with Ahmed/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /conversation with Sara/i })).toBeInTheDocument();
  });

  it('filters to unread conversations only', () => {
    setup();
    fireEvent.click(screen.getByRole('button', { name: /^unread$/i }));
    expect(screen.getByRole('button', { name: /conversation with Ahmed/i })).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /conversation with Sara/i }),
    ).not.toBeInTheDocument();
  });

  it('filters to read conversations only', () => {
    setup();
    fireEvent.click(screen.getByRole('button', { name: /^read$/i }));
    expect(screen.getByRole('button', { name: /conversation with Sara/i })).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /conversation with Ahmed/i }),
    ).not.toBeInTheDocument();
  });

  it('filters by the participant name as you search', () => {
    setup();
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'sar' } });
    expect(screen.getByRole('button', { name: /conversation with Sara/i })).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /conversation with Ahmed/i }),
    ).not.toBeInTheDocument();
  });

  it('shows the empty-results message when nothing matches', () => {
    setup();
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'zzz' } });
    expect(screen.getByText(/no matching conversations/i)).toBeInTheDocument();
  });

  it('calls onSelect with the room id when a conversation is clicked', () => {
    const onSelect = setup();
    fireEvent.click(screen.getByRole('button', { name: /conversation with Ahmed/i }));
    expect(onSelect).toHaveBeenCalledWith('r1');
  });

  it('has no accessibility violations', async () => {
    const { container } = renderWithProviders(
      <ChatListPanel rooms={ROOMS} selectedRoomId="r1" onSelect={vi.fn()} />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});

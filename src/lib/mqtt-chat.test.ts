import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { getMock, connectMock } = vi.hoisted(() => ({
  getMock: vi.fn(),
  connectMock: vi.fn(),
}));

vi.mock('@/lib/api-client', () => ({ apiClient: { get: getMock } }));
vi.mock('mqtt', () => ({ connect: connectMock }));

import { mqttChat } from './mqtt-chat';

type Listener = (...args: unknown[]) => void;

/** Minimal stand-in for an mqtt.js client — records calls + drives events. */
class FakeClient {
  connected = false;
  private readonly listeners = new Map<string, Listener[]>();
  subscribe = vi.fn();
  unsubscribe = vi.fn();
  publish = vi.fn();
  end = vi.fn(() => {
    this.connected = false;
  });

  on(event: string, cb: Listener): this {
    const set = this.listeners.get(event) ?? [];
    set.push(cb);
    this.listeners.set(event, set);
    // Auto-fire `connect` on a microtask so `connect()` resolves like the broker.
    if (event === 'connect') queueMicrotask(() => this.emit('connect'));
    return this;
  }

  emit(event: string, ...args: unknown[]): void {
    if (event === 'connect') this.connected = true;
    (this.listeners.get(event) ?? []).forEach((cb) => cb(...args));
  }
}

let fake: FakeClient;

beforeEach(() => {
  fake = new FakeClient();
  connectMock.mockReturnValue(fake);
  getMock.mockResolvedValue({ token: 'jwt-1' });
});

afterEach(() => {
  mqttChat.disconnect();
  vi.clearAllMocks();
});

describe('mqttChat', () => {
  it('mints a credential and connects with the token as broker username', async () => {
    const ok = await mqttChat.connect();
    expect(ok).toBe(true);
    expect(getMock).toHaveBeenCalledWith('/api/chat/mqtt-credentials', { internal: true });
    expect(connectMock).toHaveBeenCalledWith(
      'wss://admin.bonyad-hub.com/mqtt',
      expect.objectContaining({ username: 'jwt-1', protocol: 'wss', clean: true }),
    );
    expect(mqttChat.isConnected()).toBe(true);
  });

  it('delivers parsed JSON payloads to the topic handler', async () => {
    await mqttChat.connect();
    const handler = vi.fn();
    mqttChat.subscribe('chat/room/42', handler);
    expect(fake.subscribe).toHaveBeenCalledWith('chat/room/42', { qos: 1 });

    const payload = new TextEncoder().encode(JSON.stringify({ id: 9, content: 'hi' }));
    fake.emit('message', 'chat/room/42', payload);
    expect(handler).toHaveBeenCalledWith({ id: 9, content: 'hi' }, 'chat/room/42');
  });

  it('unsubscribes on the broker once a topic loses its last handler', async () => {
    await mqttChat.connect();
    const off = mqttChat.subscribe('chat/room/42', vi.fn());
    off();
    expect(fake.unsubscribe).toHaveBeenCalledWith('chat/room/42');
  });

  it('re-subscribes existing topics after an auto-reconnect', async () => {
    await mqttChat.connect();
    mqttChat.subscribe('chat/user/7', vi.fn());
    fake.subscribe.mockClear();
    fake.emit('connect'); // broker dropped + reconnected
    expect(fake.subscribe).toHaveBeenCalledWith('chat/user/7', { qos: 1 });
  });

  it('publishes typing payloads as JSON at qos 0', async () => {
    await mqttChat.connect();
    mqttChat.publish('chat/room/42/typing', { isTyping: true });
    expect(fake.publish).toHaveBeenCalledWith(
      'chat/room/42/typing',
      JSON.stringify({ isTyping: true }),
      { qos: 0 },
    );
  });

  it('degrades to not-connected when the credential cannot be minted', async () => {
    getMock.mockRejectedValueOnce(new Error('401'));
    const ok = await mqttChat.connect();
    expect(ok).toBe(false);
    expect(mqttChat.isConnected()).toBe(false);
  });
});

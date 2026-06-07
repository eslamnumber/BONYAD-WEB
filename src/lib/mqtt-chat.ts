import type { IClientOptions, MqttClient } from 'mqtt';

import { env } from '@/config/env';
import { INTERNAL_API } from '@/config/routes';
import { apiClient } from '@/lib/api-client';

/**
 * Browser MQTT-over-WebSocket transport for realtime chat. Generic by design:
 * it connects to the broker, (re)subscribes to topics, and dispatches parsed
 * JSON payloads to per-topic handlers. The messages feature owns the payload
 * shapes (`ChatMessage`, read receipts, typing) and the topic strings
 * (`chat/user/{id}`, `chat/room/{roomId}`…).
 *
 * Credentials come from the same-origin mint endpoint (the broker authenticates
 * with the session JWT as its username, which is httpOnly and unreadable here).
 * Every failure path resolves to "not connected" so the chat degrades to its
 * REST source of truth rather than throwing. Lazy-imports `mqtt` so the broker
 * client only ships to clients that actually open the chat.
 */

type TopicHandler = (data: unknown, topic: string) => void;

const QOS = 1;

class MqttChatClient {
  private client: MqttClient | null = null;
  private connecting: Promise<boolean> | null = null;
  private readonly handlers = new Map<string, Set<TopicHandler>>();

  isConnected(): boolean {
    return Boolean(this.client?.connected);
  }

  /** Idempotent: concurrent callers share one in-flight connection attempt. */
  async connect(): Promise<boolean> {
    if (this.isConnected()) return true;
    this.connecting ??= this.open();
    const ok = await this.connecting;
    this.connecting = null;
    return ok;
  }

  private async open(): Promise<boolean> {
    if (typeof window === 'undefined') return false;
    try {
      const { token } = await apiClient.get<{ token: string }>(INTERNAL_API.CHAT_MQTT_CREDENTIALS, {
        internal: true,
      });
      const mqtt = await import('mqtt');
      const options: IClientOptions = {
        username: token,
        protocol: 'wss',
        keepalive: 60,
        reconnectPeriod: 2000,
        connectTimeout: 30_000,
        clean: true,
      };
      const client = mqtt.connect(env.NEXT_PUBLIC_MQTT_BROKER_URL, options);
      this.client = client;
      client.on('message', (topic, payload) => this.dispatch(topic, payload));
      return await this.awaitConnect(client);
    } catch {
      this.client = null;
      return false;
    }
  }

  private awaitConnect(client: MqttClient): Promise<boolean> {
    return new Promise((resolve) => {
      let settled = false;
      const settle = (ok: boolean) => {
        if (!settled) {
          settled = true;
          resolve(ok);
        }
      };
      // Fires on first connect AND every auto-reconnect — resubscribe each time.
      client.on('connect', () => {
        this.resubscribeAll();
        settle(true);
      });
      client.on('error', () => settle(false));
      client.on('close', () => settle(false));
    });
  }

  /**
   * Register a handler for a topic. Subscribes on the broker when the topic gains
   * its first handler. Returns an unsubscribe fn — call it on cleanup.
   */
  subscribe(topic: string, handler: TopicHandler): () => void {
    const existing = this.handlers.get(topic);
    if (existing) {
      existing.add(handler);
    } else {
      this.handlers.set(topic, new Set([handler]));
      this.client?.subscribe(topic, { qos: QOS });
    }
    return () => this.unsubscribe(topic, handler);
  }

  private unsubscribe(topic: string, handler: TopicHandler): void {
    const set = this.handlers.get(topic);
    if (!set) return;
    set.delete(handler);
    if (set.size === 0) {
      this.handlers.delete(topic);
      this.client?.unsubscribe(topic);
    }
  }

  /** Publish a JSON payload (typing indicators are fire-and-forget at QoS 0). */
  publish(topic: string, payload: unknown): void {
    if (!this.isConnected()) return;
    this.client?.publish(topic, JSON.stringify(payload), { qos: 0 });
  }

  disconnect(): void {
    this.client?.end(true);
    this.client = null;
    this.handlers.clear();
  }

  private resubscribeAll(): void {
    for (const topic of this.handlers.keys()) {
      this.client?.subscribe(topic, { qos: QOS });
    }
  }

  private dispatch(topic: string, payload: Uint8Array): void {
    const set = this.handlers.get(topic);
    if (!set) return;
    let data: unknown;
    try {
      data = JSON.parse(new TextDecoder().decode(payload));
    } catch {
      return;
    }
    for (const handler of set) handler(data, topic);
  }
}

/** Process-wide singleton — one broker connection per browser tab. */
export const mqttChat = new MqttChatClient();

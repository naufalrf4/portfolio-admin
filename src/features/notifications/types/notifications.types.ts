export type LogMinLevel = 'debug' | 'info' | 'warn' | 'error';

export type OutboxStatus = 'pending' | 'sent' | 'failed' | 'dead';

export type DeliveryChannel = 'telegram' | 'webpush';

export type PreferenceChannel = 'telegram';

export type NotificationLevel = 'info' | 'warn' | 'error';

export interface Channel {
  readonly id: string;
  readonly name: string;
  readonly chatId: string;
  readonly messageThreadId: number | null;
  readonly enabled: boolean;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface AppNotification {
  readonly id: string;
  readonly eventType: string;
  readonly title: string;
  readonly body: string;
  readonly link: string | null;
  readonly level: NotificationLevel;
  readonly readAt: string | null;
  readonly createdAt: string;
}

export interface InboxPage {
  readonly notifications: readonly AppNotification[];
  readonly nextCursor: string | null;
  readonly unreadCount: number;
}

export interface NotificationPreference {
  readonly eventType: string;
  readonly channel: PreferenceChannel;
  readonly enabled: boolean;
}

export interface PushDevice {
  readonly id: string;
  readonly endpoint: string;
  readonly label: string | null;
  readonly userAgent: string | null;
  readonly createdAt: string;
  readonly lastSeenAt: string;
}

export type PushPermission = 'default' | 'granted' | 'denied';

export type PushSupportState =
  | 'unsupported'
  | 'unconfigured'
  | 'idle'
  | 'subscribed'
  | 'blocked';

export interface OutboxRow {
  readonly id: string;
  readonly eventType: string;
  readonly channel: DeliveryChannel;
  readonly channelId: string | null;
  readonly channelName: string | null;
  readonly target: string | null;
  readonly status: OutboxStatus;
  readonly attempts: number;
  readonly lastError: string | null;
  readonly telegramMessageId: number | null;
  readonly createdAt: string;
  readonly sentAt: string | null;
  readonly nextAttemptAt: string;
}

export interface ChannelFormData {
  readonly name: string;
  readonly chatId: string;
  readonly messageThreadId?: number;
  readonly enabled: boolean;
}

export type DiscoveredChatType = 'private' | 'group' | 'supergroup' | 'channel';

export interface DiscoveredChat {
  readonly chatId: string;
  readonly title: string;
  readonly type: DiscoveredChatType;
  readonly messageThreadId: number | null;
  readonly threadName: string | null;
}

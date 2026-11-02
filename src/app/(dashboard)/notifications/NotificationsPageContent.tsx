'use client';

import { useState } from 'react';
import { BellRing, Inbox, Radio, Send, Settings2, Smartphone } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  useNotificationChannels,
  useNotificationInbox,
  useNotificationOutbox,
  useNotificationPreferences,
  usePushNotifications,
  ChannelsTab,
  DevicesTab,
  InboxTab,
  OutboxTab,
  PreferencesTab,
} from '@/features/notifications';

const notificationTabs = ['inbox', 'devices', 'channels', 'preferences', 'outbox'] as const;
type NotificationTab = (typeof notificationTabs)[number];

function isNotificationTab(value: string): value is NotificationTab {
  return notificationTabs.some((tab) => tab === value);
}

export function NotificationsPageContent() {
  const [activeTab, setActiveTab] = useState<NotificationTab>('inbox');

  const {
    channels,
    loading: channelsLoading,
    testingId,
    createChannel,
    updateChannel,
    toggleChannel,
    deleteChannel,
    sendTestMessage,
  } = useNotificationChannels();

  const inbox = useNotificationInbox();
  const push = usePushNotifications();
  const preferences = useNotificationPreferences();

  const {
    rows: outboxRows,
    loading: outboxLoading,
    statusFilter,
    setStatusFilter,
    channelFilter,
    setChannelFilter,
    limit,
    setLimit,
    retryingId,
    retryRow,
    refresh: refreshOutbox,
  } = useNotificationOutbox();

  const pendingOutboxCount = outboxRows.filter((r) => r.status === 'pending').length;
  const failedOutboxCount = outboxRows.filter((r) => r.status === 'failed' || r.status === 'dead').length;

  return (
    <PageWrapper>
      <PageHeader
        title="Notifications"
        description="Review the in-app inbox, mirror delivery to registered devices, and configure Telegram extras."
        icon={<BellRing />}
        stats={[
          { label: 'Unread', value: inbox.unreadCount },
          { label: 'Registered Devices', value: push.devices.length },
          { label: 'Telegram Channels', value: channels.length },
          {
            label: 'Failed in Outbox',
            value: failedOutboxCount,
            variant: failedOutboxCount > 0 ? 'warning' : 'default',
          },
        ]}
      />

      <Tabs value={activeTab} onValueChange={(value) => isNotificationTab(value) && setActiveTab(value)}>
        <TabsList className="mb-4">
          <TabsTrigger value="inbox" className="gap-2">
            <Inbox className="h-4 w-4" />
            Inbox
            {inbox.unreadCount > 0 ? <span className="ml-1 rounded-full bg-[var(--teal)]/20 px-1.5 py-0.5 text-[10px] font-mono text-[var(--teal)]">{inbox.unreadCount}</span> : null}
          </TabsTrigger>
          <TabsTrigger value="devices" className="gap-2">
            <Smartphone className="h-4 w-4" />
            Devices ({push.devices.length})
          </TabsTrigger>
          <TabsTrigger value="channels" className="gap-2">
            <Radio className="h-4 w-4" />
            Telegram ({channels.length})
          </TabsTrigger>
          <TabsTrigger value="preferences" className="gap-2">
            <Settings2 className="h-4 w-4" />
            Events
          </TabsTrigger>
          <TabsTrigger value="outbox" className="gap-2">
            <Send className="h-4 w-4" />
            Outbox Queue
            {pendingOutboxCount > 0 ? (
              <span className="ml-1 rounded-full bg-[var(--teal)]/20 px-1.5 py-0.2 text-[10px] text-[var(--teal)] font-mono">
                {pendingOutboxCount}
              </span>
            ) : null}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="inbox">
          <InboxTab {...inbox} />
        </TabsContent>

        <TabsContent value="devices">
          <DevicesTab {...push} />
        </TabsContent>

        <TabsContent value="channels">
          <ChannelsTab
            channels={channels}
            loading={channelsLoading}
            testingId={testingId}
            onCreateChannel={createChannel}
            onUpdateChannel={updateChannel}
            onToggleChannel={toggleChannel}
            onDeleteChannel={deleteChannel}
            onSendTestMessage={sendTestMessage}
          />
        </TabsContent>

        <TabsContent value="preferences">
          <PreferencesTab {...preferences} />
        </TabsContent>

        <TabsContent value="outbox">
          <OutboxTab
            rows={outboxRows}
            loading={outboxLoading}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            channelFilter={channelFilter}
            setChannelFilter={setChannelFilter}
            limit={limit}
            setLimit={setLimit}
            retryingId={retryingId}
            onRetry={retryRow}
            onRefresh={refreshOutbox}
          />
        </TabsContent>
      </Tabs>
    </PageWrapper>
  );
}

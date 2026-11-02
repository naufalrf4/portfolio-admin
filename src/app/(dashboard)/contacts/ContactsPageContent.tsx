'use client';

import { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  Send,
  Mail,
  Calendar,
  Clock,
  MessageSquare,
  MessagesSquare,
  Settings2,
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/layout/PageHeader';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { ContactsTab, SettingsTab } from '@/features/contacts/components';
import { useContacts } from '@/features/contacts/hooks';
import { BookingsTab, AvailabilityTab } from '@/features/bookings';
import { MessagesPanel } from '../messages/components/MessagesPageContent';
import { GuestbookPanel } from '../guestbook/GuestbookPageContent';

const TAB_VALUES = [
  'submissions',
  'bookings',
  'availability',
  'messages',
  'guestbook',
  'settings',
] as const;
type ContactTab = (typeof TAB_VALUES)[number];

function getContactTab(value: string | null): ContactTab {
  return TAB_VALUES.includes(value as ContactTab) ? (value as ContactTab) : 'submissions';
}

export function ContactsPageContent() {
  const { pagination, unreadCount } = useContacts();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<ContactTab>(() =>
    getContactTab(searchParams.get('tab'))
  );
  const [pendingCount, setPendingCount] = useState(0);
  const [messageUnreadCount, setMessageUnreadCount] = useState(0);
  const [guestbookCount, setGuestbookCount] = useState(0);

  useEffect(() => {
    setActiveTab(getContactTab(searchParams.get('tab')));
  }, [searchParams]);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchCounts() {
      try {
        const [bookingsResponse, messagesResponse, guestbookResponse] = await Promise.all([
          fetch('/api/v1/admin/bookings?limit=100', { signal: controller.signal }),
          fetch('/api/v1/admin/messages', { signal: controller.signal }),
          fetch('/api/v1/admin/guestbook', { signal: controller.signal }),
        ]);

        const [bookingsData, messagesData, guestbookData] = await Promise.all([
          bookingsResponse.json(),
          messagesResponse.json(),
          guestbookResponse.json(),
        ]);

        if (bookingsData.success && Array.isArray(bookingsData.data)) {
          setPendingCount(
            bookingsData.data.filter((booking: { status: string }) => booking.status === 'PENDING')
              .length
          );
        }

        if (messagesData.success) {
          setMessageUnreadCount(messagesData.data.unreadCount ?? 0);
        }

        if (guestbookData.success && Array.isArray(guestbookData.data.entries)) {
          setGuestbookCount(guestbookData.data.entries.length);
        }
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          void error;
        }
      }
    }

    void fetchCounts();
    const interval = window.setInterval(fetchCounts, 30000);

    return () => {
      controller.abort();
      window.clearInterval(interval);
    };
  }, []);

  const totalInboundCount = useMemo(
    () => pagination.total + pendingCount + messageUnreadCount + guestbookCount,
    [guestbookCount, messageUnreadCount, pagination.total, pendingCount]
  );

  function handleTabChange(value: string) {
    const nextTab = getContactTab(value);
    setActiveTab(nextTab);

    const params = new URLSearchParams(searchParams.toString());
    if (nextTab === 'submissions') {
      params.delete('tab');
    } else {
      params.set('tab', nextTab);
    }

    router.replace(params.toString() ? `${pathname}?${params}` : pathname, { scroll: false });
  }

  return (
    <PageWrapper>
      <PageHeader
        title="Contact"
        description="Manage every inbound conversation from one shared workspace: contact forms, bookings, anonymous messages, guestbook entries, and contact settings."
        icon={<Send />}
        stats={[
          { label: 'Inbound', value: totalInboundCount },
          { label: 'Unread', value: unreadCount + messageUnreadCount, variant: 'warning' },
          { label: 'Pending', value: pendingCount, variant: 'warning' },
        ]}
      />

      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
        <TabsList className="mb-6 flex-wrap">
          <TabsTrigger value="submissions" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            <span>Forms</span>
            {unreadCount > 0 && (
              <Badge variant="warning" className="ml-1 px-1.5 py-0.5 text-xs">
                {unreadCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="bookings" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>Bookings</span>
            {pendingCount > 0 && (
              <Badge variant="warning" className="ml-1 px-1.5 py-0.5 text-xs">
                {pendingCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="availability" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>Availability</span>
          </TabsTrigger>
          <TabsTrigger value="messages" className="flex items-center gap-2">
            <MessagesSquare className="h-4 w-4" />
            <span>NGL</span>
            {messageUnreadCount > 0 && (
              <Badge variant="warning" className="ml-1 px-1.5 py-0.5 text-xs">
                {messageUnreadCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="guestbook" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            <span>Guestbook</span>
            {guestbookCount > 0 && (
              <Badge className="ml-1 px-1.5 py-0.5 text-xs">{guestbookCount}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings2 className="h-4 w-4" />
            <span>Settings</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="submissions">
          <ContactsTab />
        </TabsContent>

        <TabsContent value="bookings">
          <BookingsTab onPendingCountChange={setPendingCount} />
        </TabsContent>

        <TabsContent value="availability">
          <AvailabilityTab />
        </TabsContent>

        <TabsContent value="messages">
          <MessagesPanel />
        </TabsContent>

        <TabsContent value="guestbook">
          <GuestbookPanel />
        </TabsContent>

        <TabsContent value="settings">
          <SettingsTab />
        </TabsContent>
      </Tabs>
    </PageWrapper>
  );
}

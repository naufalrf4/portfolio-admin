import type { Metadata } from 'next';
import { NotificationsPageContent } from './NotificationsPageContent';

export const metadata: Metadata = {
  title: 'Notifications',
  description: 'Manage Telegram channels, routing rules, and asynchronous notification outbox',
};

export default function NotificationsPage() {
  return <NotificationsPageContent />;
}

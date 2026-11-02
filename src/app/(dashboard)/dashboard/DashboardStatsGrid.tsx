import { MessageSquare, Mail, Send, Calendar } from 'lucide-react';
import { StatCard } from '@/features/dashboard';
import type { Stats } from '@/features/dashboard/types';

interface DashboardStatsGridProps {
  stats: Stats;
}

export async function DashboardStatsGrid({ stats }: DashboardStatsGridProps) {
  return (
    <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        icon={<MessageSquare className="w-6 h-6" />}
        iconColor="text-blue-500"
        tone="blue"
        title="Guestbook"
        total={stats.guestbook.total}
        primaryStat={{
          label: 'visible',
          value: stats.guestbook.visible,
          variant: 'success',
        }}
        secondaryStat={{
          label: 'hidden',
          value: stats.guestbook.hidden,
          variant: 'muted',
        }}
        delay={200}
      />

      <StatCard
        icon={<Mail className="w-6 h-6" />}
        iconColor="text-purple-500"
        tone="purple"
        title="Messages (NGL)"
        total={stats.messages.total}
        primaryStat={{
          label: 'unread',
          value: stats.messages.unread,
          variant: 'warning',
        }}
        secondaryStat={{
          label: 'read',
          value: stats.messages.read,
          variant: 'muted',
        }}
        delay={300}
      />

      <StatCard
        icon={<Send className="w-6 h-6" />}
        iconColor="text-emerald-500"
        tone="emerald"
        title="Contact Forms"
        total={stats.contacts.total}
        primaryStat={{
          label: 'unread',
          value: stats.contacts.unread,
          variant: 'warning',
        }}
        secondaryStat={{
          label: 'read',
          value: stats.contacts.read,
          variant: 'muted',
        }}
        delay={400}
      />

      <StatCard
        icon={<Calendar className="w-6 h-6" />}
        iconColor="text-amber-500"
        tone="amber"
        title="Book a Call"
        total={stats.bookings.total}
        primaryStat={{
          label: 'pending',
          value: stats.bookings.pending,
          variant: 'warning',
        }}
        secondaryStat={{
          label: 'confirmed',
          value: stats.bookings.confirmed,
          variant: 'success',
        }}
        delay={500}
      />
    </div>
  );
}

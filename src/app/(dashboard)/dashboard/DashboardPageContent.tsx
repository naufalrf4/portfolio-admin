'use client';

import { Suspense } from 'react';
import { useSession } from 'next-auth/react';
import { MessageSquare, Mail, Send, Calendar } from 'lucide-react';
import {
  StatCard,
  QuickActionButton,
  WelcomeCard,
  EmptyState,
  AnalyticsSummaryCard,
  useDashboardStats,
  QUICK_ACTIONS,
} from '@/features/dashboard';
import { StatCardsSuspense, AnalyticsSuspense } from '@/components/suspense';

function DashboardStatsContent() {
  const { stats, loading } = useDashboardStats();

  if (loading) {
    return null;
  }

  const hasNoData = stats && stats.guestbook.total === 0 && stats.messages.total === 0;

  if (hasNoData) {
    return <EmptyState />;
  }

  return (
    <>
      <div className="grid gap-4 grid-cols-2 lg:gap-6 lg:grid-cols-4">
        <StatCard
          icon={<Send className="w-5 h-5 lg:w-6 lg:h-6" />}
          iconColor="text-emerald-500"
          tone="emerald"
          title="Contact Center"
          total={(stats?.contacts.total ?? 0) + (stats?.bookings.total ?? 0)}
          primaryStat={{
            label: 'forms',
            value: stats?.contacts.unread ?? 0,
            variant: 'warning',
          }}
          secondaryStat={{
            label: 'pending calls',
            value: stats?.bookings.pending ?? 0,
            variant: 'warning',
          }}
          delay={200}
        />

        <StatCard
          icon={<Mail className="w-5 h-5 lg:w-6 lg:h-6" />}
          iconColor="text-purple-500"
          tone="purple"
          title="NGL Inbox"
          total={stats?.messages.total ?? 0}
          primaryStat={{
            label: 'unread',
            value: stats?.messages.unread ?? 0,
            variant: 'warning',
          }}
          secondaryStat={{
            label: 'read',
            value: stats?.messages.read ?? 0,
            variant: 'muted',
          }}
          delay={300}
        />

        <StatCard
          icon={<MessageSquare className="w-5 h-5 lg:w-6 lg:h-6" />}
          iconColor="text-blue-500"
          tone="blue"
          title="Guestbook"
          total={stats?.guestbook.total ?? 0}
          primaryStat={{
            label: 'visible',
            value: stats?.guestbook.visible ?? 0,
            variant: 'success',
          }}
          secondaryStat={{
            label: 'hidden',
            value: stats?.guestbook.hidden ?? 0,
            variant: 'muted',
          }}
          delay={400}
        />

        <StatCard
          icon={<Calendar className="w-5 h-5 lg:w-6 lg:h-6" />}
          iconColor="text-amber-500"
          tone="amber"
          title="Bookings"
          total={stats?.bookings.total ?? 0}
          primaryStat={{
            label: 'pending',
            value: stats?.bookings.pending ?? 0,
            variant: 'warning',
          }}
          secondaryStat={{
            label: 'confirmed',
            value: stats?.bookings.confirmed ?? 0,
            variant: 'success',
          }}
          delay={500}
        />
      </div>

      <Suspense fallback={<AnalyticsSuspense children={null} />}>
        <AnalyticsSummaryCard />
      </Suspense>
    </>
  );
}

export function DashboardPageContent() {
  const { data: session } = useSession();

  return (
    <div className="space-y-8">
      <WelcomeCard delay={100} userName={session?.user?.name} />

      <StatCardsSuspense>
        <DashboardStatsContent />
      </StatCardsSuspense>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-[var(--text-primary)] font-[family-name:var(--font-plus-jakarta)]">
          Quick Actions
        </h2>
        <div className="flex flex-wrap gap-4">
          {QUICK_ACTIONS.map((action) => (
            <QuickActionButton key={action.href} {...action} />
          ))}
        </div>
      </div>
    </div>
  );
}

import type { ReactNode } from 'react';
import { safeAuth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { BottomNav } from '@/components/layout/BottomNav';
import { ThemeToggler } from '@/components/layout/ThemeToggler';
import { NotificationBell } from '@/components/layout/NotificationBell';
import { WibClock } from '@/components/layout/WibClock';
import { ServiceWorkerRegistrar } from '@/components/providers/ServiceWorkerRegistrar';
import { NotificationSummaryProvider } from '@/features/notifications/context/NotificationSummaryContext';
import { isEmailAllowed } from '@/lib/auth-security';

// Every route under this group requires a live session (safeAuth() below) and
// renders SessionProvider/AppSidebar with per-user data, so it can never be
// statically prerendered. Forcing dynamic here (cascades to all child pages)
// also sidesteps a Next.js 16 static-worker regression where SessionProvider's
// hooks crash with "useState of null" when a page under this layout gets
// swept into a static-generation pass (vercel/next.js#95741, #86178).
export const dynamic = 'force-dynamic';

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const session = await safeAuth();

  if (!session?.user) {
    redirect('/auth/signin');
  }

  if (session.user.role !== 'ADMIN') {
    redirect('/unauthorized');
  }

  if (!isEmailAllowed(session.user.email)) {
    redirect('/unauthorized');
  }

  return (
    <div className="min-h-screen bg-background">
      <SidebarProvider>
        <NotificationSummaryProvider>
          <div className="hidden md:block">
            <AppSidebar session={session} />
          </div>

          <SidebarInset className="w-full bg-background">
            <header className="sticky top-3 z-40 mx-4 mt-3 hidden md:flex h-16 shrink-0 items-center gap-4 glass-bar shape-container border border-line-strong surface-raised-lg px-4 md:mx-6 md:px-6 lg:mx-8">
              <SidebarTrigger className="icon-btn h-10 w-10 text-foreground/70 hover:text-foreground" />

              <div className="flex-1" />

              <div className="flex items-center gap-3">
                <WibClock />
                <NotificationBell />
                <ThemeToggler />
              </div>
            </header>

            <main className="flex-1 p-4 pb-24 md:p-6 md:pb-8 lg:p-8">
              <div className="mx-auto max-w-7xl">{children}</div>
            </main>
          </SidebarInset>

          <BottomNav />
          <ServiceWorkerRegistrar />
        </NotificationSummaryProvider>
      </SidebarProvider>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FolderKanban,
  Link as LinkIcon,
  Send,
  User,
  BarChart3,
  LogOut,
  FileText,
  BookOpen,
  ScrollText,
} from 'lucide-react';
import { signOut } from 'next-auth/react';
import type { Session } from 'next-auth';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface AppSidebarProps {
  session: Session | null;
}

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'About Me', href: '/about', icon: User },
  { name: 'Projects', href: '/projects', icon: FolderKanban },
  { name: 'Publications', href: '/publications', icon: BookOpen },
  { name: 'Contact', href: '/contacts', icon: Send },
  { name: 'Links', href: '/links', icon: LinkIcon },
  { name: 'AI Service', href: '/knowledge', icon: FileText },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Logs', href: '/logs', icon: ScrollText },
];

function CountBadge({ count }: { count: number }) {
  return (
    <span
      className={cn(
        'ml-auto flex h-5 min-w-5 items-center justify-center',
        'rounded-full px-1.5 text-xs font-bold text-accent-foreground',
        'bg-accent',
        'shadow-surface-raised',
        'animate-pulse'
      )}
    >
      {count > 99 ? '99+' : count}
    </span>
  );
}

function UserAvatar({
  image,
  name,
  initial,
  size = 'md',
}: {
  image?: string | null;
  name: string;
  initial: string;
  size?: 'sm' | 'md';
}) {
  const sizeClasses = size === 'sm' ? 'h-8 w-8' : 'h-10 w-10';
  const textSize = size === 'sm' ? 'text-xs' : 'text-sm';

  const insetShadow = cn(
    'rounded-full',
    'shadow-surface-raised',
    'bg-[var(--bg-elevated)]'
  );

  if (image) {
    return (
      <div className={cn(insetShadow, sizeClasses, 'p-0.5')}>
        <img src={image} alt={name} className="h-full w-full rounded-full object-cover" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        insetShadow,
        sizeClasses,
        'flex items-center justify-center',
        'bg-accent',
        'text-accent-foreground font-semibold',
        textSize
      )}
    >
      {initial}
    </div>
  );
}

export function AppSidebar({ session }: AppSidebarProps) {
  const pathname = usePathname();
  const { state } = useSidebar();
  const [contactUpdatesCount, setContactUpdatesCount] = useState(0);

  const isCollapsed = state === 'collapsed';

  useEffect(() => {
    const controller = new AbortController();

    async function fetchContactUpdates() {
      try {
        const [contactsResponse, messagesResponse, bookingsResponse] = await Promise.all([
          fetch('/api/v1/admin/contacts', { signal: controller.signal }),
          fetch('/api/v1/admin/messages', { signal: controller.signal }),
          fetch('/api/v1/admin/bookings?limit=100', { signal: controller.signal }),
        ]);

        const [contactsData, messagesData, bookingsData] = await Promise.all([
          contactsResponse.json(),
          messagesResponse.json(),
          bookingsResponse.json(),
        ]);

        const unreadContacts = contactsData.success ? (contactsData.data.unreadCount ?? 0) : 0;
        const unreadMessages = messagesData.success ? (messagesData.data.unreadCount ?? 0) : 0;
        const pendingBookings =
          bookingsData.success && Array.isArray(bookingsData.data)
            ? bookingsData.data.filter(
                (booking: { status: string }) => booking.status === 'PENDING'
              ).length
            : 0;

        setContactUpdatesCount(unreadContacts + unreadMessages + pendingBookings);
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          void error;
        }
      }
    }

    fetchContactUpdates();

    const interval = setInterval(fetchContactUpdates, 30000);

    return () => {
      controller.abort();
      clearInterval(interval);
    };
  }, []);

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/auth/signin' });
  };

  const user = session?.user;
  const userName = user?.name || 'Admin User';
  const userEmail = user?.email || '';
  const userImage = user?.image;
  const userInitial = userName.charAt(0).toUpperCase();

  return (
    <TooltipProvider delayDuration={0}>
      <Sidebar
        collapsible="icon"
        className={cn(
          'bg-[var(--bg-elevated)] border-none',
          'surface-raised-lg',
          'transition-all duration-300 ease-out',
          'overflow-hidden'
        )}
      >
        <SidebarHeader className={cn('p-4 pb-6', isCollapsed && 'p-2 pb-4')}>
          <div className={cn('flex items-center gap-3', isCollapsed && 'justify-center')}>
            <div
              className={cn(
                'relative flex shrink-0 items-center justify-center rounded-full',
                'bg-[var(--bg-elevated)]',
                'surface-raised',
                isCollapsed ? 'h-8 w-8' : 'h-10 w-10'
              )}
            >
              <img
                src="/favicon.ico"
                alt="NaufalRF Portfolio"
                className="h-full w-full rounded-full object-cover"
              />
              {isCollapsed && (
                <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-success ring-2 ring-[var(--bg-elevated)] animate-pulse" />
              )}
            </div>

            {!isCollapsed && (
              <div className="flex flex-col">
                <h1 className="font-[family-name:var(--font-plus-jakarta)] text-lg font-bold text-[var(--text-primary)] tracking-tight">
                  NaufalRF Portfolio
                </h1>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
                  <span className="text-xs text-[var(--text-secondary)] font-medium">System Online</span>
                </div>
              </div>
            )}
          </div>
        </SidebarHeader>

        <SidebarContent className={cn('overflow-hidden', isCollapsed ? 'px-0' : 'px-3')}>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu className="space-y-1.5">
                {navigation.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                  const Icon = item.icon;
                  const showBadge = item.href === '/contacts' && contactUpdatesCount > 0;

                  const buttonContent = (
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={isCollapsed ? item.name : undefined}
                      className={cn(
                        'rounded-2xl min-h-[44px] px-3',
                        'transition-all duration-300 ease-out',
                        'border-none outline-none',
                        'overflow-hidden',
                        isActive
                          ? cn(
                              'bg-[var(--bg-elevated)]',
                              'surface-raised',
                              'text-[var(--teal)] font-medium'
                            )
                          : cn(
                              'bg-transparent text-[var(--text-secondary)]',
                              'hover:bg-[var(--bg-elevated)]',
                              'hover:surface-raised-sm',
                              'hover:text-[var(--text-primary)]',
                              'hover:scale-[1.02]',
                              'active:surface-raised',
                              'active:scale-[0.98]'
                            )
                      )}
                    >
                      <Link
                        href={item.href}
                        className={cn('flex w-full items-center', isCollapsed ? 'justify-center' : 'justify-between')}
                      >
                        <div
                          className={cn(
                            'flex items-center gap-3',
                            isCollapsed && 'justify-center w-full'
                          )}
                        >
                          <span className="relative inline-flex shrink-0">
                            <Icon
                              className={cn(
                                'h-5 w-5 shrink-0 transition-colors duration-300',
                                isActive ? 'text-[var(--teal)]' : 'text-[var(--text-secondary)]'
                              )}
                            />
                            {isCollapsed && showBadge && (
                              <span
                                className={cn(
                                  'absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center',
                                  'rounded-full text-[10px] font-bold text-accent-foreground',
                                  'bg-accent',
                                  'surface-raised',
                                  'animate-pulse'
                                )}
                              >
                                {contactUpdatesCount > 9 ? '9+' : contactUpdatesCount}
                              </span>
                            )}
                          </span>
                          {!isCollapsed && <span>{item.name}</span>}
                        </div>
                        {showBadge && !isCollapsed && <CountBadge count={contactUpdatesCount} />}
                      </Link>
                    </SidebarMenuButton>
                  );

                  return (
                    <SidebarMenuItem key={item.name}>{buttonContent}</SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className={cn('p-4 pt-6', isCollapsed && 'p-1 pt-4')}>
          <div
            className={cn(
              'rounded-2xl',
              isCollapsed ? 'p-1' : 'p-3',
              'bg-[var(--bg-elevated)]',
              'shadow-surface-raised'
            )}
          >
            <div className={cn('flex items-center gap-3', isCollapsed && 'justify-center')}>
              <UserAvatar
                image={userImage}
                name={userName}
                initial={userInitial}
                size={isCollapsed ? 'sm' : 'md'}
              />

              {!isCollapsed && (
                <>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-[var(--text-primary)]">{userName}</p>
                    <p className="truncate text-xs text-[var(--text-secondary)]">{userEmail}</p>
                  </div>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={handleSignOut}
                        className={cn(
                          'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl',
                          'bg-[var(--bg-elevated)] text-[var(--text-secondary)]',
                          'transition-all duration-300 ease-out',
                          'hover:shadow-surface-raised',
                          'hover:text-destructive hover:scale-105',
                          'active:shadow-surface-raised',
                          'active:scale-95'
                        )}
                      >
                        <LogOut className="h-4 w-4" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="bg-[var(--text-primary)] text-[var(--bg)] border-none">
                      Sign out
                    </TooltipContent>
                  </Tooltip>
                </>
              )}
            </div>

            {isCollapsed && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={handleSignOut}
                    className={cn(
                      'mt-3 flex h-8 w-full items-center justify-center rounded-xl',
                      'bg-[var(--bg-elevated)] text-[var(--text-secondary)]',
                      'transition-all duration-300 ease-out',
                      'hover:shadow-surface-raised',
                      'hover:text-destructive',
                      'active:shadow-surface-raised'
                    )}
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right" className="bg-[var(--text-primary)] text-[var(--bg)] border-none">
                  Sign out
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        </SidebarFooter>
      </Sidebar>
    </TooltipProvider>
  );
}

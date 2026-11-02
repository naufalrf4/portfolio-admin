'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  FolderKanban,
  BookOpen,
  User,
  Send,
  BarChart3,
  MoreHorizontal,
  X,
  FileText,
  Bell,
  ScrollText,
  Link as LinkIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSharedNotificationSummary } from '@/features/notifications';

interface NavItem {
  name: string;
  href: string;
  icon: typeof LayoutDashboard;
  badge?: number;
  primary?: boolean;
}

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [contactUpdatesCount, setContactUpdatesCount] = useState(0);
  const { unreadCount: unreadNotificationsCount } = useSharedNotificationSummary();
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const moreMenuRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    function handleClickOutside(event: MouseEvent | TouchEvent) {
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target as Node)) {
        setIsMoreOpen(false);
      }
    }

    if (isMoreOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isMoreOpen]);

  useEffect(() => {
    setIsMoreOpen(false);
  }, [pathname]);

  const allNavItems: NavItem[] = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, primary: true },
    { name: 'Contact', href: '/contacts', icon: Send, badge: contactUpdatesCount, primary: true },
    {
      name: 'Notifications',
      href: '/notifications',
      icon: Bell,
      badge: unreadNotificationsCount,
      primary: true,
    },
    { name: 'Projects', href: '/projects', icon: FolderKanban, primary: true },
    { name: 'About', href: '/about', icon: User },
    { name: 'AI Service', href: '/knowledge', icon: FileText },
    { name: 'Publications', href: '/publications', icon: BookOpen },
    { name: 'Links', href: '/links', icon: LinkIcon },
    { name: 'Analytics', href: '/analytics', icon: BarChart3 },
    { name: 'Logs', href: '/logs', icon: ScrollText },
  ];

  const primaryItems = allNavItems.filter((item) => item.primary);
  const moreItems = allNavItems.filter((item) => !item.primary);

  const isActiveInMoreMenu = moreItems.some(
    (item) => pathname === item.href || pathname.startsWith(item.href + '/')
  );

  const hasMoreBadges = moreItems.some((item) => item.badge !== undefined && item.badge > 0);

  const handleNavClick = useCallback(
    (href: string) => {
      router.push(href);
      setIsMoreOpen(false);
    },
    [router]
  );

  const toggleMoreMenu = useCallback(() => {
    setIsMoreOpen((prev) => !prev);
  }, []);

  function renderNavButton(item: NavItem, size: 'normal' | 'compact' = 'normal') {
    const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
    const Icon = item.icon;
    const showBadge = item.badge !== undefined && item.badge > 0;
    const isCompact = size === 'compact';

    return (
      <button
        key={item.name}
        type="button"
        onClick={() => handleNavClick(item.href)}
        onTouchEnd={(e) => {
          e.preventDefault();
          handleNavClick(item.href);
        }}
        className={cn(
          'relative flex items-center justify-center',
          isCompact ? 'h-11 w-11' : 'h-12 w-12',
          'rounded-full',
          'transition-all duration-300 ease-out',
          'touch-manipulation cursor-pointer',
          isActive
            ? cn(
                'bg-[var(--teal)]/10',
                'shadow-surface-raised'
              )
            : cn(
                'bg-transparent',
                'hover:bg-[var(--bg-elevated)]',
                'hover:shadow-surface-raised',
                'active:shadow-surface-raised'
              )
        )}
        aria-label={item.name}
        title={item.name}
      >
        <Icon
          className={cn(
            isCompact ? 'h-[18px] w-[18px]' : 'h-5 w-5',
            'transition-colors duration-300',
            isActive ? 'text-[var(--teal)]' : 'text-[var(--text-secondary)]'
          )}
        />
        {showBadge && (
          <span
            className={cn(
              'absolute -top-1 -right-1',
              'flex h-5 min-w-5 items-center justify-center',
              'rounded-full px-1.5',
              'text-[10px] font-bold text-accent-foreground',
              'bg-accent',
              'shadow-surface-raised',
              'animate-pulse'
            )}
          >
            {item.badge && item.badge > 99 ? '99+' : item.badge}
          </span>
        )}
      </button>
    );
  }

  function renderNavButtonWithLabel(item: NavItem) {
    const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
    const Icon = item.icon;
    const showBadge = item.badge !== undefined && item.badge > 0;

    return (
      <button
        key={item.name}
        type="button"
        onClick={() => handleNavClick(item.href)}
        onTouchEnd={(e) => {
          e.preventDefault();
          handleNavClick(item.href);
        }}
        className={cn(
          'relative flex flex-col items-center justify-center gap-1',
          'min-h-[56px] min-w-[72px] p-2',
          'rounded-xl',
          'transition-all duration-300 ease-out',
          'touch-manipulation cursor-pointer',
          isActive
            ? cn(
                'bg-[var(--teal)]/10',
                'shadow-surface-raised'
              )
            : cn(
                'bg-[var(--bg-elevated)]',
                'shadow-surface-raised',
                'hover:shadow-surface-raised',
                'active:shadow-surface-raised'
              )
        )}
        aria-label={item.name}
      >
        <div className="relative">
          <Icon
            className={cn(
              'h-5 w-5 transition-colors duration-300',
              isActive ? 'text-[var(--teal)]' : 'text-[var(--text-secondary)]'
            )}
          />
          {showBadge && (
            <span
              className={cn(
                'absolute -top-2 -right-2',
                'flex h-4 min-w-4 items-center justify-center',
                'rounded-full px-1',
                'text-[9px] font-bold text-accent-foreground',
                'bg-accent',
                'shadow-surface-raised'
              )}
            >
              {item.badge && item.badge > 99 ? '99+' : item.badge}
            </span>
          )}
        </div>
        <span
          className={cn(
            'text-[10px] font-medium transition-colors duration-300',
            isActive ? 'text-[var(--teal)]' : 'text-[var(--text-secondary)]'
          )}
        >
          {item.name}
        </span>
      </button>
    );
  }

  return (
    <div ref={moreMenuRef} className="md:hidden">
      <div
        className={cn(
          'fixed bottom-0 left-0 right-0 z-40',
          'transition-all duration-300 ease-out',
          isMoreOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
      >
        <div
          className="absolute inset-0 scrim"
          onClick={() => setIsMoreOpen(false)}
        />

        <div
          className={cn(
            'relative mx-4 mb-24',
            'p-4 rounded-2xl',
            'glass-bar border border-line-strong',
            'shadow-surface-raised',
            'transition-all duration-300 ease-out',
            isMoreOpen ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          )}
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-[var(--text-primary)] pl-1">More Options</h3>
            <button
              type="button"
              onClick={() => setIsMoreOpen(false)}
              className={cn(
                'flex items-center justify-center',
                'h-8 w-8 rounded-full',
                'transition-all duration-200',
                'bg-[var(--bg-elevated)] border border-line-strong',
                'shadow-surface-raised',
                'active:shadow-surface-raised'
              )}
              aria-label="Close menu"
            >
              <X className="h-4 w-4 text-[var(--text-secondary)]" />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {moreItems.map((item) => renderNavButtonWithLabel(item))}
          </div>
        </div>
      </div>

      <nav
        className={cn('fixed bottom-0 left-0 right-0 z-50', 'pb-[env(safe-area-inset-bottom,8px)]')}
      >
        <div
          className={cn(
            'mx-4 mb-2',
            'flex items-center justify-around gap-1',
            'px-2 py-2 rounded-full',
            'glass-bar border border-line-strong',
            'shadow-surface-raised'
          )}
        >
          {primaryItems.map((item) => renderNavButton(item))}

          <button
            type="button"
            onClick={toggleMoreMenu}
            onTouchEnd={(e) => {
              e.preventDefault();
              toggleMoreMenu();
            }}
            className={cn(
              'relative flex items-center justify-center',
              'h-12 w-12 rounded-full',
              'transition-all duration-300 ease-out',
              'touch-manipulation cursor-pointer',
              isMoreOpen || isActiveInMoreMenu
                ? cn(
                    'bg-[var(--teal)]/10',
                    'shadow-surface-raised'
                  )
                : cn(
                    'bg-transparent',
                    'hover:bg-[var(--bg-elevated)]',
                    'hover:shadow-surface-raised',
                    'active:shadow-surface-raised'
                  )
            )}
            aria-label="More options"
            aria-expanded={isMoreOpen}
          >
            <MoreHorizontal
              className={cn(
                'h-5 w-5 transition-all duration-300',
                isMoreOpen
                  ? 'text-[var(--teal)] rotate-90'
                  : isActiveInMoreMenu
                    ? 'text-[var(--teal)]'
                    : 'text-[var(--text-secondary)]'
              )}
            />
            {hasMoreBadges && !isMoreOpen && (
              <span
                className={cn(
                  'absolute top-0 right-0',
                  'h-3 w-3 rounded-full',
                  'bg-accent',
                  'shadow-surface-raised',
                  'animate-pulse'
                )}
              />
            )}
          </button>
        </div>
      </nav>
    </div>
  );
}

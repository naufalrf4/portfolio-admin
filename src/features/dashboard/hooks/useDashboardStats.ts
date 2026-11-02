import { useEffect, useState } from 'react';
import type { Stats } from '../types';

export function useDashboardStats() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    const fetchStats = async () => {
      try {
        const [statsResponse, contactsResponse, bookingsResponse] = await Promise.allSettled([
          fetch('/api/v1/admin/stats', { signal: controller.signal }),
          fetch('/api/v1/admin/contacts', { signal: controller.signal }),
          fetch('/api/v1/admin/bookings', { signal: controller.signal }),
        ]);

        let baseStats = {
          guestbook: { total: 0, visible: 0, hidden: 0 },
          messages: { total: 0, unread: 0, read: 0 },
          contacts: { total: 0, unread: 0, read: 0 },
          bookings: { total: 0, pending: 0, confirmed: 0 },
        };

        if (statsResponse.status === 'fulfilled') {
          const statsResult = await statsResponse.value.json();
          if (statsResult.success) {
            baseStats = { ...baseStats, ...statsResult.data };
          }
        }

        if (contactsResponse.status === 'fulfilled') {
          try {
            const contactsResult = await contactsResponse.value.json();
            if (contactsResult.success && Array.isArray(contactsResult.data)) {
              const contacts = contactsResult.data;
              baseStats.contacts = {
                total: contacts.length,
                unread: contacts.filter((c: { read: boolean }) => !c.read).length,
                read: contacts.filter((c: { read: boolean }) => c.read).length,
              };
            }
          } catch {
            return;
          }
        }

        if (bookingsResponse.status === 'fulfilled') {
          try {
            const bookingsResult = await bookingsResponse.value.json();
            if (bookingsResult.success && Array.isArray(bookingsResult.data)) {
              const bookings = bookingsResult.data;
              baseStats.bookings = {
                total: bookings.length,
                pending: bookings.filter((b: { status: string }) => b.status === 'PENDING').length,
                confirmed: bookings.filter((b: { status: string }) => b.status === 'CONFIRMED')
                  .length,
              };
            }
          } catch {
            return;
          }
        }

        setStats(baseStats);
      } catch (error) {
        if ((error as Error).name === 'AbortError') {
          return;
        }
      } finally {
        setLoading(false);
      }
    };

    fetchStats();

    return () => controller.abort();
  }, []);

  return { stats, loading };
}

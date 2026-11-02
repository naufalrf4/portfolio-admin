'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { getErrorMessage } from '@/lib/utils/api';
import type {
  Booking,
  BookingStatus,
  BookingsPagination,
  FilterType,
  UseBookingsOptions,
  UseBookingsResult,
} from '../types/bookings.types';

const BOOKINGS_ENDPOINT = '/api/v1/admin/bookings';

export function useBookings(options: UseBookingsOptions = {}): UseBookingsResult {
  const { enabled = true, initialPage = 1, initialLimit = 20, initialFilter = 'all' } = options;

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>(initialFilter);
  const [page, setPage] = useState(initialPage);
  const [pagination, setPagination] = useState<BookingsPagination>({
    page: initialPage,
    limit: initialLimit,
    total: 0,
    totalPages: 0,
  });
  const [pendingCount, setPendingCount] = useState(0);

  const fetchBookings = useCallback(async () => {
    if (!enabled) return;

    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: initialLimit.toString(),
      });

      if (filter !== 'all') {
        params.append('status', filter);
      }

      const response = await fetch(`${BOOKINGS_ENDPOINT}?${params}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to load bookings');
      }

      if (data.success && data.data?.bookings) {
        setBookings(data.data.bookings);
        setPagination({
          page: data.data.pagination.page,
          limit: data.data.pagination.limit,
          total: data.data.pagination.total,
          totalPages: data.data.pagination.totalPages,
        });

        const pending = data.data.bookings.filter((b: Booking) => b.status === 'PENDING').length;
        setPendingCount(pending);
      } else {
        setBookings([]);
        setPendingCount(0);
      }
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to load bookings'));
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, [enabled, filter, page, initialLimit]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const getBooking = useCallback(async (id: string): Promise<Booking | null> => {
    try {
      const response = await fetch(`${BOOKINGS_ENDPOINT}/${id}`);
      const data = await response.json();

      if (data.success) {
        return data.data;
      }
      return null;
    } catch {
      return null;
    }
  }, []);

  const updateStatus = useCallback(
    async (id: string, status: BookingStatus): Promise<boolean> => {
      try {
        const response = await fetch(`${BOOKINGS_ENDPOINT}/${id}/status`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status }),
        });

        const data = await response.json();

        if (data.success) {
          toast.success('Status updated successfully');
          await fetchBookings();
          return true;
        }
        const errorMsg =
          typeof data.error === 'string'
            ? data.error
            : data.error?.message || 'Failed to update status';
        toast.error(errorMsg);
        return false;
      } catch (err) {
        toast.error(getErrorMessage(err, 'Failed to update status'));
        return false;
      }
    },
    [fetchBookings]
  );

  const deleteBooking = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        const response = await fetch(`${BOOKINGS_ENDPOINT}/${id}`, {
          method: 'DELETE',
        });

        const data = await response.json();

        if (data.success) {
          toast.success('Booking deleted successfully');
          await fetchBookings();
          return true;
        }
        const errorMsg =
          typeof data.error === 'string'
            ? data.error
            : data.error?.message || 'Failed to delete booking';
        toast.error(errorMsg);
        return false;
      } catch (err) {
        toast.error(getErrorMessage(err, 'Failed to delete booking'));
        return false;
      }
    },
    [fetchBookings]
  );

  const handleSetFilter = useCallback((newFilter: FilterType) => {
    setFilter(newFilter);
    setPage(1);
  }, []);

  return {
    bookings,
    loading,
    pagination,
    pendingCount,
    filter,
    setFilter: handleSetFilter,
    setPage,
    refetch: fetchBookings,
    getBooking,
    updateStatus,
    deleteBooking,
  };
}

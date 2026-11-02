'use client';

import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  Calendar,
  Eye,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  CheckCircle,
  ExternalLink,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ResponsiveModal } from '@/components/ui/responsive-modal';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { formatDate } from '@/lib/utils/date';
import { getErrorMessage } from '@/lib/utils/api';
import type { Booking, FilterType } from '../types/bookings.types';
import { FILTER_BUTTONS } from '../constants';
import { ActionButton } from './ActionButton';
import { DetailField } from './DetailField';

interface BookingsTabProps {
  onPendingCountChange: (count: number) => void;
}

export function BookingsTab({ onPendingCountChange }: BookingsTabProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingBooking, setDeletingBooking] = useState<Booking | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const lastActionKeyRef = useRef<string | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const limit = 20;
  const requestedBookingId = searchParams.get('bookingId');
  const requestedAction = searchParams.get('action');
  const requestedStatus = useMemo<Booking['status'] | null>(() => {
    if (requestedAction === 'confirm') return 'CONFIRMED';
    if (requestedAction === 'cancel') return 'CANCELLED';
    return null;
  }, [requestedAction]);

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: limit.toString(),
      });

      if (filter !== 'all') {
        params.append('status', filter);
      }

      const response = await fetch(`/api/v1/admin/bookings?${params}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to load bookings');
      }

      if (data.success && data.data?.bookings) {
        setBookings(data.data.bookings);
        setTotalPages(data.data.pagination.totalPages);

        const pending = data.data.bookings.filter((b: Booking) => b.status === 'PENDING').length;
        onPendingCountChange(pending);
      } else {
        setBookings([]);
        setTotalPages(1);
        onPendingCountChange(0);
      }
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to load bookings'));
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, [filter, currentPage, onPendingCountChange]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  function openDeleteModal(booking: Booking) {
    setDeletingBooking(booking);
    setIsDeleteModalOpen(true);
  }

  function openDetailModal(booking: Booking) {
    setSelectedBooking(booking);
    setIsDetailModalOpen(true);
  }

  async function handleDelete() {
    if (!deletingBooking) return;

    setDeleting(true);
    try {
      const response = await fetch(`/api/v1/admin/bookings/${deletingBooking.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Booking deleted successfully');
        setIsDeleteModalOpen(false);
        fetchBookings();
      } else {
        const errorMsg =
          typeof data.error === 'string'
            ? data.error
            : data.error?.message || 'Failed to delete booking';
        toast.error(errorMsg);
      }
    } catch {
      toast.error('Failed to delete booking');
    } finally {
      setDeleting(false);
    }
  }

  const updateStatus = useCallback(
    async (id: string, status: Booking['status']): Promise<boolean> => {
      try {
        const response = await fetch(`/api/v1/admin/bookings/${id}/status`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status }),
        });

        const data = await response.json();

        if (data.success) {
          toast.success('Status updated successfully');
          fetchBookings();
          if (isDetailModalOpen) {
            setSelectedBooking(
              selectedBooking
                ? {
                    ...selectedBooking,
                    status,
                    calendarUrl: data.data.googleCalendarUrl ?? selectedBooking.calendarUrl,
                    meetUrl: data.data.googleMeetUrl ?? selectedBooking.meetUrl,
                  }
                : null
            );
          }
          return true;
        }

        const errorMsg =
          typeof data.error === 'string'
            ? data.error
            : data.error?.message || 'Failed to update status';
        toast.error(errorMsg);
        return false;
      } catch {
        toast.error('Failed to update status');
        return false;
      }
    },
    [fetchBookings, isDetailModalOpen, selectedBooking]
  );

  useEffect(() => {
    if (!requestedBookingId) {
      return;
    }

    const booking = bookings.find((item) => item.id === requestedBookingId);
    if (!booking) {
      return;
    }

    setSelectedBooking(booking);
    setIsDetailModalOpen(true);

    if (!requestedStatus) {
      return;
    }

    const actionKey = `${requestedBookingId}:${requestedStatus}`;
    if (lastActionKeyRef.current === actionKey) {
      return;
    }

    lastActionKeyRef.current = actionKey;

    if (booking.status === requestedStatus) {
      toast.success(`Booking already ${requestedStatus.toLowerCase()}`);
      const nextParams = new URLSearchParams(searchParams.toString());
      nextParams.delete('action');
      router.replace(nextParams.toString() ? `${pathname}?${nextParams}` : pathname, {
        scroll: false,
      });
      return;
    }

    void updateStatus(requestedBookingId, requestedStatus).then((success) => {
      if (!success) {
        lastActionKeyRef.current = null;
        return;
      }

      const nextParams = new URLSearchParams(searchParams.toString());
      nextParams.delete('action');
      router.replace(nextParams.toString() ? `${pathname}?${nextParams}` : pathname, {
        scroll: false,
      });
    });
  }, [bookings, pathname, requestedBookingId, requestedStatus, router, searchParams, updateStatus]);

  function getStatusBadgeVariant(
    status: Booking['status']
  ): 'default' | 'warning' | 'success' | 'destructive' | 'primary' {
    switch (status) {
      case 'PENDING':
        return 'warning';
      case 'CONFIRMED':
        return 'success';
      case 'CANCELLED':
        return 'destructive';
      case 'COMPLETED':
        return 'primary';
      default:
        return 'default';
    }
  }

  return (
    <>
      <div
        className="rounded-[var(--radius-base)] p-2 mb-8 inline-flex gap-2 flex-wrap"
        style={{
          background: 'var(--bg-elevated)',
          boxShadow: '0 2px 8px -2px rgba(0, 0, 0, 0.3)',
        }}
      >
        {FILTER_BUTTONS.map((btn) => (
          <button
            key={btn.key}
            onClick={() => {
              setFilter(btn.key as FilterType);
              setCurrentPage(1);
            }}
            className="px-6 py-3 rounded-[18px] font-medium transition-all duration-300"
            style={{
              background: filter === btn.key ? 'var(--bg-elevated)' : 'transparent',
              color: filter === btn.key ? 'var(--teal)' : 'var(--text-secondary)',
              boxShadow:
                filter === btn.key
                  ? '0 2px 8px -2px rgba(0, 0, 0, 0.3)'
                  : 'none',
            }}
          >
            {btn.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-[var(--text-secondary)]">Loading bookings...</div>
        </div>
      ) : bookings.length === 0 ? (
        <div
          className="rounded-[var(--radius-container)] p-12 text-center"
          style={{
            background: 'var(--bg-elevated)',
            boxShadow: '0 2px 8px -2px rgba(0, 0, 0, 0.3)',
          }}
        >
          <div
            className="w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center"
            style={{
              background: 'var(--bg-elevated)',
              boxShadow: '0 2px 8px -2px rgba(0, 0, 0, 0.3)',
            }}
          >
            <Calendar className="w-12 h-12 text-[var(--text-secondary)]" />
          </div>
          <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-2">No bookings found</h3>
          <p className="text-[var(--text-secondary)] max-w-md mx-auto">
            {filter === 'all'
              ? 'No bookings have been made yet.'
              : `No ${filter.toLowerCase()} bookings found.`}
          </p>
        </div>
      ) : (
        <>
          <div
            className="rounded-[var(--radius-container)] overflow-hidden bg-[var(--bg-elevated)] mb-6"
            style={{
              boxShadow:
                '0 2px 8px -2px rgba(0, 0, 0, 0.3)',
            }}
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-line/20">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--text-primary)]">
                      Name
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--text-primary)]">
                      Email
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--text-primary)]">
                      Date/Time
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-[var(--text-primary)]">
                      Status
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-[var(--text-primary)]">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((booking) => (
                    <tr
                      key={booking.id}
                      className="border-b border-line/10 last:border-0 hover:bg-bg-elevated/30 transition-colors cursor-pointer"
                      onClick={() => openDetailModal(booking)}
                    >
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-[var(--text-primary)]">{booking.name}</p>
                          {booking.phone && (
                            <p className="text-sm text-[var(--text-secondary)]">{booking.phone}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-[var(--text-secondary)]">{booking.email}</td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm text-[var(--text-primary)]">{formatDate(booking.date)}</p>
                          <p className="text-xs text-[var(--text-secondary)]">
                            {booking.time} ({booking.timezone})
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center">
                          <Badge variant={getStatusBadgeVariant(booking.status)}>
                            {booking.status}
                          </Badge>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div
                          className="flex items-center justify-center gap-2"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <ActionButton
                            icon={<Eye className="h-4 w-4" />}
                            tooltip="View"
                            onClick={() => openDetailModal(booking)}
                          />

                          {booking.status === 'PENDING' && (
                            <>
                              <ActionButton
                                icon={<Check className="h-4 w-4" />}
                                tooltip="Confirm"
                                onClick={() => updateStatus(booking.id, 'CONFIRMED')}
                                hoverColor="var(--teal)"
                              />
                              <ActionButton
                                icon={<X className="h-4 w-4" />}
                                tooltip="Cancel"
                                onClick={() => updateStatus(booking.id, 'CANCELLED')}
                                hoverColor="var(--error)"
                              />
                            </>
                          )}

                          {booking.status === 'CONFIRMED' && (
                            <ActionButton
                              icon={<CheckCircle className="h-4 w-4" />}
                              tooltip="Complete"
                              onClick={() => updateStatus(booking.id, 'COMPLETED')}
                              hoverColor="var(--teal)"
                            />
                          )}

                          <ActionButton
                            icon={<Trash2 className="h-4 w-4" />}
                            tooltip="Delete"
                            onClick={() => openDeleteModal(booking)}
                            hoverColor="var(--error)"
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-3 rounded-2xl bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--teal)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  boxShadow: '0 2px 8px -2px rgba(0, 0, 0, 0.3)',
                }}
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <span className="text-[var(--text-secondary)] font-medium">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-3 rounded-2xl bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--teal)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  boxShadow: '0 2px 8px -2px rgba(0, 0, 0, 0.3)',
                }}
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          )}
        </>
      )}

      <ResponsiveModal
        open={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        title="Delete Booking"
        description={`Are you sure you want to delete the booking for "${deletingBooking?.name}"? This action cannot be undone.`}
        footer={
          <>
            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? 'Deleting...' : 'Delete'}
            </Button>
          </>
        }
      >
        <div className="py-4">
          <p className="text-[var(--text-secondary)]">
            This will permanently delete the booking and all associated data.
          </p>
        </div>
      </ResponsiveModal>

      <ResponsiveModal
        open={isDetailModalOpen}
        onOpenChange={setIsDetailModalOpen}
        title="Booking Details"
        size="lg"
        footer={
          <div className="flex items-center gap-2 w-full justify-between">
            <div className="flex gap-2">
              {selectedBooking?.status === 'PENDING' && (
                <>
                  <Button
                    variant="outline"
                    onClick={() => updateStatus(selectedBooking.id, 'CONFIRMED')}
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Confirm
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => updateStatus(selectedBooking.id, 'CANCELLED')}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </>
              )}
              {selectedBooking?.status === 'CONFIRMED' && (
                <Button
                  variant="outline"
                  onClick={() => updateStatus(selectedBooking.id, 'COMPLETED')}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Mark Complete
                </Button>
              )}
            </div>
            <Button variant="primary" onClick={() => setIsDetailModalOpen(false)}>
              Close
            </Button>
          </div>
        }
      >
        {selectedBooking && (
          <div className="py-4 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[var(--text-secondary)]">Status</span>
              <Badge variant={getStatusBadgeVariant(selectedBooking.status)}>
                {selectedBooking.status}
              </Badge>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <DetailField label="Name" value={selectedBooking.name} />
              <DetailField label="Email" value={selectedBooking.email} />
              <DetailField label="Phone" value={selectedBooking.phone || 'N/A'} />
              <DetailField label="Date" value={formatDate(selectedBooking.date)} />
              <DetailField label="Time" value={selectedBooking.time} />
              <DetailField label="Timezone" value={selectedBooking.timezone} />
              <DetailField
                label="Google Meet"
                value={
                  selectedBooking.meetUrl ? (
                    <a
                      href={selectedBooking.meetUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-accent hover:text-accent"
                    >
                      Join meeting
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  ) : (
                    'Not created yet'
                  )
                }
              />
              <DetailField
                label="Calendar Event"
                value={
                  selectedBooking.calendarUrl ? (
                    <a
                      href={selectedBooking.calendarUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-accent hover:text-accent"
                    >
                      Open event
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  ) : (
                    'Not created yet'
                  )
                }
              />
            </div>
            {selectedBooking.notes && (
              <div
                className="rounded-2xl p-4 bg-[var(--bg-elevated)]"
                style={{
                  boxShadow: '0 2px 8px -2px rgba(0, 0, 0, 0.3)',
                }}
              >
                <label className="text-[var(--text-secondary)] text-xs mb-2 block">Notes</label>
                <p className="text-[var(--text-primary)] text-sm">{selectedBooking.notes}</p>
              </div>
            )}
          </div>
        )}
      </ResponsiveModal>
    </>
  );
}

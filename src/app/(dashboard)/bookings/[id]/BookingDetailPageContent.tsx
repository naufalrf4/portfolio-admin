'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, Mail, Phone, Clock, Globe, FileText, User } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ResponsiveModal } from '@/components/ui/responsive-modal';
import { toast } from 'sonner';
import { formatDate, formatDateTime } from '@/lib/utils/date';
import { getErrorMessage } from '@/lib/utils/api';

interface Booking {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  date: string;
  time: string;
  timezone: string;
  notes: string | null;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  createdAt: string;
  updatedAt: string;
}

interface BookingDetailPageContentProps {
  initialBooking: Booking;
}

export function BookingDetailPageContent({ initialBooking }: BookingDetailPageContentProps) {
  const router = useRouter();
  const [booking, setBooking] = useState<Booking>(initialBooking);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<Booking['status']>(initialBooking.status);
  const [statusNotes, setStatusNotes] = useState(initialBooking.notes || '');

  async function fetchBooking() {
    try {
      const response = await fetch(`/api/v1/admin/bookings/${booking.id}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to load booking');
      }

      if (data.success && data.data) {
        setBooking(data.data);
        setSelectedStatus(data.data.status);
        setStatusNotes(data.data.notes || '');
      }
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to load booking'));
    }
  }

  async function handleDelete() {
    if (!booking) return;

    setDeleting(true);
    try {
      const response = await fetch(`/api/v1/admin/bookings/${booking.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Booking deleted successfully');
        router.push('/bookings');
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

  async function handleUpdateStatus() {
    if (!booking) return;

    setUpdating(true);
    try {
      const response = await fetch(`/api/v1/admin/bookings/${booking.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: selectedStatus,
          notes: statusNotes || undefined,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Status updated successfully');
        setIsStatusModalOpen(false);
        fetchBooking();
      } else {
        const errorMsg =
          typeof data.error === 'string'
            ? data.error
            : data.error?.message || 'Failed to update status';
        toast.error(errorMsg);
      }
    } catch {
      toast.error('Failed to update status');
    } finally {
      setUpdating(false);
    }
  }

  function getStatusBadgeVariant(
    status: Booking['status']
  ): 'default' | 'warning' | 'success' | 'destructive' {
    switch (status) {
      case 'PENDING':
        return 'warning';
      case 'CONFIRMED':
        return 'success';
      case 'CANCELLED':
        return 'destructive';
      case 'COMPLETED':
        return 'default';
      default:
        return 'default';
    }
  }

  return (
    <PageWrapper>
      <PageHeader
        title="Booking Details"
        description="View and manage booking information"
        icon={<Calendar />}
        back={{ href: '/bookings', label: 'Back to Bookings' }}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsStatusModalOpen(true)}>
              Update Status
            </Button>
            <Button variant="destructive" onClick={() => setIsDeleteModalOpen(true)}>
              Delete
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-[var(--radius-container)] p-8 bg-[var(--bg-elevated)] shadow-surface-raised">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-2xl font-semibold text-[var(--text-primary)] mb-2">{booking.name}</h2>
              <Badge variant={getStatusBadgeVariant(booking.status)}>{booking.status}</Badge>
            </div>
            <div className="p-4 rounded-2xl bg-[var(--bg-elevated)] shadow-surface-raised-sm">
              <Calendar className="h-8 w-8 text-[var(--teal)]" />
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wide mb-4">
                Contact Information
              </h3>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-2xl bg-[var(--bg-elevated)] shadow-surface-raised-sm">
                    <User className="h-5 w-5 text-[var(--text-secondary)]" />
                  </div>
                  <div>
                    <p className="text-sm text-[var(--text-secondary)]">Name</p>
                    <p className="font-medium text-[var(--text-primary)]">{booking.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-2xl bg-[var(--bg-elevated)] shadow-surface-raised-sm">
                    <Mail className="h-5 w-5 text-[var(--text-secondary)]" />
                  </div>
                  <div>
                    <p className="text-sm text-[var(--text-secondary)]">Email</p>
                    <p className="font-medium text-[var(--text-primary)]">{booking.email}</p>
                  </div>
                </div>
                {booking.phone && (
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-2xl bg-[var(--bg-elevated)] shadow-surface-raised-sm">
                      <Phone className="h-5 w-5 text-[var(--text-secondary)]" />
                    </div>
                    <div>
                      <p className="text-sm text-[var(--text-secondary)]">Phone</p>
                      <p className="font-medium text-[var(--text-primary)]">{booking.phone}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wide mb-4">
                Appointment Details
              </h3>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-2xl bg-[var(--bg-elevated)] shadow-surface-raised-sm">
                    <Calendar className="h-5 w-5 text-[var(--text-secondary)]" />
                  </div>
                  <div>
                    <p className="text-sm text-[var(--text-secondary)]">Date</p>
                    <p className="font-medium text-[var(--text-primary)]">{formatDate(booking.date, 'long')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-2xl bg-[var(--bg-elevated)] shadow-surface-raised-sm">
                    <Clock className="h-5 w-5 text-[var(--text-secondary)]" />
                  </div>
                  <div>
                    <p className="text-sm text-[var(--text-secondary)]">Time</p>
                    <p className="font-medium text-[var(--text-primary)]">{booking.time}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-2xl bg-[var(--bg-elevated)] shadow-surface-raised-sm">
                    <Globe className="h-5 w-5 text-[var(--text-secondary)]" />
                  </div>
                  <div>
                    <p className="text-sm text-[var(--text-secondary)]">Timezone</p>
                    <p className="font-medium text-[var(--text-primary)]">{booking.timezone}</p>
                  </div>
                </div>
              </div>
            </div>

            {booking.notes && (
              <div>
                <h3 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wide mb-4">
                  Notes
                </h3>
                <div className="p-4 rounded-2xl bg-[var(--bg-elevated)] shadow-surface-raised-sm">
                  <div className="flex items-start gap-3">
                    <FileText className="h-5 w-5 text-[var(--text-secondary)] mt-0.5" />
                    <p className="text-[var(--text-primary)] leading-relaxed">{booking.notes}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="rounded-[var(--radius-container)] p-8 bg-[var(--bg-elevated)] h-fit shadow-surface-raised">
          <h3 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wide mb-4">
            Booking Metadata
          </h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-[var(--text-secondary)] mb-1">Created</p>
              <p className="text-sm font-medium text-[var(--text-primary)]">
                {formatDateTime(booking.createdAt)}
              </p>
            </div>
            <div>
              <p className="text-sm text-[var(--text-secondary)] mb-1">Last Updated</p>
              <p className="text-sm font-medium text-[var(--text-primary)]">
                {formatDateTime(booking.updatedAt)}
              </p>
            </div>
            <div>
              <p className="text-sm text-[var(--text-secondary)] mb-1">Booking ID</p>
              <p className="text-xs font-mono text-[var(--text-primary)] break-all">{booking.id}</p>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-line/20">
            <h3 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wide mb-3">
              Quick Actions
            </h3>
            <div className="space-y-2">
              {booking.status === 'PENDING' && (
                <>
<button
onClick={async () => {
setSelectedStatus('CONFIRMED');
await handleUpdateStatus();
}}
                    className="w-full py-2 px-4 rounded-2xl text-sm font-medium text-on-accent bg-[var(--teal)] hover:bg-accent transition-colors shadow-surface-raised-sm"
                  >
Confirm Booking
</button>
<button
onClick={async () => {
setSelectedStatus('CANCELLED');
await handleUpdateStatus();
}}
                    className="w-full py-2 px-4 rounded-2xl text-sm font-medium text-on-error bg-red-500 hover:bg-red-600 transition-colors shadow-surface-raised-sm"
                  >
Cancel Booking
</button>
                </>
              )}
              {booking.status === 'CONFIRMED' && (
<button
onClick={async () => {
setSelectedStatus('COMPLETED');
await handleUpdateStatus();
}}
                  className="w-full py-2 px-4 rounded-2xl text-sm font-medium text-on-accent bg-[var(--teal)] hover:bg-accent transition-colors shadow-surface-raised-sm"
                >
Mark as Completed
</button>
              )}
            </div>
          </div>
        </div>
      </div>

      <ResponsiveModal
        open={isStatusModalOpen}
        onOpenChange={setIsStatusModalOpen}
        title="Update Booking Status"
        description="Change the status of this booking and add optional notes"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsStatusModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateStatus} disabled={updating}>
              {updating ? 'Updating...' : 'Update Status'}
            </Button>
          </>
        }
      >
        <div className="space-y-4 py-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as Booking['status'])}
              className="w-full px-4 py-3 rounded-2xl bg-[var(--bg-elevated)] text-[var(--text-primary)] border-none focus:outline-none focus:ring-2 focus:ring-[var(--teal)] shadow-surface-raised-sm"
            >
              <option value="PENDING">Pending</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="CANCELLED">Cancelled</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
              Notes (Optional)
            </label>
            <textarea
              value={statusNotes}
              onChange={(e) => setStatusNotes(e.target.value)}
              rows={4}
              placeholder="Add any notes about this status change..."
              className="w-full px-4 py-3 rounded-2xl bg-[var(--bg-elevated)] text-[var(--text-primary)] border-none focus:outline-none focus:ring-2 focus:ring-[var(--teal)] resize-none shadow-surface-raised-sm"
            />
          </div>
        </div>
      </ResponsiveModal>

      <ResponsiveModal
        open={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        title="Delete Booking"
        description={`Are you sure you want to delete the booking for "${booking.name}"? This action cannot be undone.`}
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
    </PageWrapper>
  );
}

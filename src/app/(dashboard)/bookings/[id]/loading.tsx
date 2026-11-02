import { ArrowLeft, Calendar } from 'lucide-react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { Skeleton } from '@/components/ui/skeleton';

export default function BookingDetailLoading() {
  return (
    <PageWrapper>
      <div className="mb-6">
        <button className="inline-flex items-center gap-2 text-[var(--text-secondary)] mb-4 cursor-not-allowed opacity-50">
          <ArrowLeft className="h-4 w-4" />
          Back to Bookings
        </button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">Booking Details</h1>
            <p className="text-[var(--text-secondary)]">View and manage booking information</p>
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-24" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div
          className="lg:col-span-2 rounded-[var(--radius-container)] p-8 bg-[var(--bg-elevated)]"
          style={{
            boxShadow:
              '0 2px 8px -2px rgba(0, 0, 0, 0.3)',
          }}
        >
          <div className="flex items-start justify-between mb-6">
            <div>
              <Skeleton className="h-8 w-48 mb-2" />
              <Skeleton className="h-6 w-24" />
            </div>
            <div
              className="p-4 rounded-2xl bg-[var(--bg-elevated)]"
              style={{
                boxShadow: '0 2px 8px -2px rgba(0, 0, 0, 0.3)',
              }}
            >
              <Calendar className="h-8 w-8 text-[var(--teal)]" />
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wide mb-4">
                Contact Information
              </h3>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div
                      className="p-3 rounded-2xl bg-[var(--bg-elevated)]"
                      style={{
                        boxShadow: '0 2px 8px -2px rgba(0, 0, 0, 0.3)',
                      }}
                    >
                      <Skeleton className="h-5 w-5" />
                    </div>
                    <div className="space-y-1 flex-1">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-5 w-40" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wide mb-4">
                Appointment Details
              </h3>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div
                      className="p-3 rounded-2xl bg-[var(--bg-elevated)]"
                      style={{
                        boxShadow: '0 2px 8px -2px rgba(0, 0, 0, 0.3)',
                      }}
                    >
                      <Skeleton className="h-5 w-5" />
                    </div>
                    <div className="space-y-1 flex-1">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-5 w-32" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div
          className="rounded-[var(--radius-container)] p-8 bg-[var(--bg-elevated)] h-fit"
          style={{
            boxShadow:
              '0 2px 8px -2px rgba(0, 0, 0, 0.3)',
          }}
        >
          <h3 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wide mb-4">
            Booking Metadata
          </h3>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i}>
                <Skeleton className="h-4 w-20 mb-1" />
                <Skeleton className="h-5 w-full" />
              </div>
            ))}
          </div>

          <div className="mt-6 pt-6 border-t border-line/20">
            <h3 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wide mb-3">
              Quick Actions
            </h3>
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}

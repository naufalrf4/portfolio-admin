import { Calendar, Clock } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';

export default function BookingsLoading() {
  return (
    <PageWrapper>
      <PageHeader
        title="Booking Management"
        description="Manage appointments and availability slots"
        icon={<Calendar />}
        stats={[{ label: 'Pending', value: 0, variant: 'warning' }]}
      />

      <Tabs value="bookings" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="bookings" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Bookings
          </TabsTrigger>
          <TabsTrigger value="availability" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Availability
          </TabsTrigger>
        </TabsList>

        <TabsContent value="bookings">
          <div className="space-y-4">
            <div
              className="rounded-[var(--radius-container)] p-8 bg-[var(--bg-elevated)]"
              style={{
                boxShadow:
                  '0 2px 8px -2px rgba(0, 0, 0, 0.3)',
              }}
            >
              <div className="flex justify-between items-center mb-6">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-10 w-32" />
              </div>

              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="p-6 rounded-2xl bg-[var(--bg-elevated)]"
                    style={{
                      boxShadow: '0 2px 8px -2px rgba(0, 0, 0, 0.3)',
                    }}
                  >
                    <div className="flex justify-between items-start">
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-6 w-48" />
                        <Skeleton className="h-4 w-64" />
                        <Skeleton className="h-4 w-32" />
                      </div>
                      <Skeleton className="h-6 w-20" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </PageWrapper>
  );
}

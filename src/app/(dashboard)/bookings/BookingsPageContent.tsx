'use client';

import { useState } from 'react';
import { Calendar, Clock } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { BookingsTab, AvailabilityTab } from '@/features/bookings';

export function BookingsPageContent() {
  const [activeTab, setActiveTab] = useState('bookings');
  const [pendingCount, setPendingCount] = useState(0);

  return (
    <PageWrapper>
      <PageHeader
        title="Booking Management"
        description="Manage appointments and availability slots"
        icon={<Calendar />}
        stats={[{ label: 'Pending', value: pendingCount, variant: 'warning' }]}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="bookings" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Bookings
            {pendingCount > 0 && (
              <Badge variant="warning" className="ml-1 px-2 py-0.5 text-xs">
                {pendingCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="availability" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Availability
          </TabsTrigger>
        </TabsList>

        <TabsContent value="bookings">
          <BookingsTab onPendingCountChange={setPendingCount} />
        </TabsContent>

        <TabsContent value="availability">
          <AvailabilityTab />
        </TabsContent>
      </Tabs>
    </PageWrapper>
  );
}
